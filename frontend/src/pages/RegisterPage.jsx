import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, Briefcase, Building2, User, Mail, Lock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('job_seeker');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Seeker profile
        skills: '',
        seekerLocation: '',
        experienceLevel: 'Fresher',
        preferredJobType: 'Local',
        // Employer profile
        companyName: '',
        businessType: 'Shop',
        employerLocation: '',
        contactNumber: '',
        companyDescription: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 2) {
            if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
                toast.error('Please fill all fields');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                role: role,
                job_seeker_profile: role === 'job_seeker' ? {
                    skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                    location: formData.seekerLocation,
                    experience_level: formData.experienceLevel,
                    preferred_job_type: formData.preferredJobType
                } : null,
                employer_profile: role === 'employer' ? {
                    company_name: formData.companyName,
                    business_type: formData.businessType,
                    location: formData.employerLocation,
                    contact_number: formData.contactNumber,
                    company_description: formData.companyDescription
                } : null
            };

            await api.post('/auth/register', payload);
            toast.success('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            console.error('Registration error:', error);
            const detail = error.response?.data?.detail || 'Registration failed.';
            toast.error(detail);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                    <UserPlus className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Create {role === 'employer' ? 'Employer' : 'Job Seeker'} Account</h2>
                <div className="flex items-center space-x-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-green-600' : 'bg-slate-200'} transition-all duration-300`} />
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <button
                            type="button"
                            onClick={() => { setRole('job_seeker'); nextStep(); }}
                            className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all ${role === 'job_seeker' ? 'border-green-600 bg-green-50' : 'border-slate-100 hover:border-green-200'}`}
                        >
                            <Briefcase className="w-10 h-10 text-green-600" />
                            <span className="font-bold text-slate-900">Job Seeker</span>
                            <p className="text-xs text-slate-500 text-center">I want to find my dream job</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole('employer'); nextStep(); }}
                            className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all ${role === 'employer' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                        >
                            <Building2 className="w-10 h-10 text-indigo-600" />
                            <span className="font-bold text-slate-900">Employer</span>
                            <p className="text-xs text-slate-500 text-center">I want to hire great talent</p>
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input type="text" name="fullName" required className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input type="email" name="email" required className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                    <input type="password" name="password" required className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.password} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                    <input type="password" name="confirmPassword" required className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
                            </button>
                            <button type="button" onClick={nextStep} className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                                <span>Next Step</span> <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && role === 'job_seeker' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Key Skills (comma separated)</label>
                            <input type="text" name="skills" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.skills} onChange={handleChange} placeholder="React, Python, SQL" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                                <input type="text" name="seekerLocation" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={formData.seekerLocation} onChange={handleChange} placeholder="e.g. New York" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                                <select name="experienceLevel" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white" value={formData.experienceLevel} onChange={handleChange}>
                                    <option value="Fresher">Entry Level / Fresher</option>
                                    <option value="1-3">Intermediate (1-3 yrs)</option>
                                    <option value="3-5">Mid-Senior (3-5 yrs)</option>
                                    <option value="5+">Senior / Expert (5+ yrs)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Job Type</label>
                            <div className="flex space-x-6">
                                {['Local', 'IT', 'Remote'].map(type => (
                                    <label key={type} className="flex items-center space-x-3 cursor-pointer group">
                                        <input type="radio" name="preferredJobType" value={type} checked={formData.preferredJobType === type} onChange={handleChange} className="w-5 h-5 text-green-600 border-slate-300 focus:ring-green-500" />
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-green-600 transition-colors">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
                            </button>
                            <button type="submit" className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md transform active:scale-95">
                                Complete Signup
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && role === 'employer' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                <input type="text" name="companyName" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.companyName} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                                <select name="businessType" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white" value={formData.businessType} onChange={handleChange}>
                                    <option value="Shop">Retail / Shop</option>
                                    <option value="Startup">Tech Startup</option>
                                    <option value="IT Company">IT Services</option>
                                    <option value="Other">Other Business</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Headquarters Location</label>
                                <input type="text" name="employerLocation" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.employerLocation} onChange={handleChange} placeholder="City, Country" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                                <input type="tel" name="contactNumber" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.contactNumber} onChange={handleChange} placeholder="+1 234 567 890" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brief Company Bio</label>
                            <textarea name="companyDescription" rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.companyDescription} onChange={handleChange} placeholder="Tell us about your mission and workplace culture..." />
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={prevStep} className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
                            </button>
                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md transform active:scale-95">
                                Create Employer Profile
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <p className="text-center text-sm text-slate-600 mt-8">
                Already part of Job Radar?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                    Sign in here
                </Link>
            </p>
        </div>
    );
};

export default RegisterPage;
