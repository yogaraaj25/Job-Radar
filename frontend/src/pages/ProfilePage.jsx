import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    User, Mail, Briefcase, Plus, X, Save,
    Loader2, MapPin, Phone, Building2,
    Globe, Award, Type as TypeIcon
} from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('user_role')?.toLowerCase() || 'job_seeker');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Unified state for both seeker and employer
    const [formData, setFormData] = useState({
        fullName: '',
        // Seeker fields
        bio: '',
        skills: [],
        seekerLocation: '',
        experienceLevel: 'Fresher',
        preferredJobType: 'Local',
        resumeText: '',
        // Employer fields
        companyName: '',
        businessType: 'Shop',
        employerLocation: '',
        contactNumber: '',
        companyDescription: '',
        website: ''
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await api.get('/profile/');
                const data = response.data;
                setUser(data);

                // Prefill form
                setFormData(prev => ({
                    ...prev,
                    fullName: data.full_name || '',
                    // Seeker prefill
                    bio: data.seeker_profile?.bio || '',
                    skills: data.seeker_profile?.skills || [],
                    seekerLocation: data.seeker_profile?.location || '',
                    experienceLevel: data.seeker_profile?.experience_level || 'Fresher',
                    preferredJobType: data.seeker_profile?.preferred_job_type || 'Local',
                    resumeText: data.seeker_profile?.resume_text || '',
                    // Employer prefill
                    companyName: data.employer_profile?.company_name || '',
                    businessType: data.employer_profile?.business_type || 'Shop',
                    employerLocation: data.employer_profile?.location || '',
                    contactNumber: data.employer_profile?.contact_number || '',
                    companyDescription: data.employer_profile?.company_description || '',
                    website: data.employer_profile?.website || ''
                }));
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Could not load profile data');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                full_name: formData.fullName,
                job_seeker: role === 'job_seeker' ? {
                    bio: formData.bio,
                    skills: formData.skills,
                    location: formData.seekerLocation,
                    experience_level: formData.experienceLevel,
                    preferred_job_type: formData.preferredJobType,
                    resume_text: formData.resumeText
                } : null,
                employer: role === 'employer' ? {
                    company_name: formData.companyName,
                    business_type: formData.businessType,
                    location: formData.employerLocation,
                    contact_number: formData.contactNumber,
                    company_description: formData.companyDescription,
                    website: formData.website
                } : null
            };

            await api.patch('/profile/update', payload);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to save profile changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Header Banner */}
                <div className={`h-40 px-10 flex items-end ${role === 'employer' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                    <div className="translate-y-12 flex items-end space-x-6">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <div className="bg-slate-100 w-28 h-28 rounded-full flex items-center justify-center overflow-hidden">
                                <User className="w-14 h-14 text-slate-300" />
                            </div>
                        </div>
                        <div className="pb-4">
                            <h1 className="text-3xl font-black text-white drop-shadow-md">{formData.fullName || 'New User'}</h1>
                            <p className="text-white/80 font-medium uppercase tracking-widest text-sm">{role.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-12 px-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
                            <p className="text-slate-500">Keep your information up to date for better results.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 ${role === 'employer' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save All Changes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                        <input name="fullName" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Email (Read-only)</label>
                                        <input type="text" disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed" value={user?.email || ''} />
                                    </div>
                                </div>
                            </section>

                            {role === 'job_seeker' ? (
                                <>
                                    <section>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Professional Profile
                                        </h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                                <textarea name="bio" rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe your career goals..." value={formData.bio} onChange={handleChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                                        <input name="seekerLocation" type="text" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50" value={formData.seekerLocation} onChange={handleChange} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Job Type</label>
                                                    <div className="relative">
                                                        <TypeIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                                        <select name="preferredJobType" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50" value={formData.preferredJobType} onChange={handleChange}>
                                                            <option value="Local">Local</option>
                                                            <option value="IT">IT</option>
                                                            <option value="Remote">Remote</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Deep Match Data</h3>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Resume Text (for AI analysis)</label>
                                        <textarea name="resumeText" rows="10" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm" placeholder="Paste your resume content..." value={formData.resumeText} onChange={handleChange} />
                                    </section>
                                </>
                            ) : (
                                <section>
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Company Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
                                            <input name="companyName" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5" value={formData.companyName} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Business Type</label>
                                            <select name="businessType" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5" value={formData.businessType} onChange={handleChange}>
                                                <option value="Shop">Retail / Shop</option>
                                                <option value="Startup">Tech Startup</option>
                                                <option value="IT Company">IT Services</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                                            <input name="employerLocation" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5" value={formData.employerLocation} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                                <input name="contactNumber" type="tel" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50" value={formData.contactNumber} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Website</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                                <input name="website" type="url" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50" value={formData.website} onChange={handleChange} placeholder="https://company.com" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {role === 'job_seeker' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-4">Skill Cloud</h3>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Docker"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        />
                                        <button onClick={addSkill} className="bg-slate-900 text-white p-2 rounded-lg"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map(s => (
                                            <span key={s} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1">
                                                {s} <X onClick={() => removeSkill(s)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2">Profile Tip</h4>
                                <p className="text-sm text-indigo-700 leading-relaxed italic">
                                    "A complete profile improves your matching score by up to 85%. Make sure to include specific technologies you've used in the last 2 years."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
