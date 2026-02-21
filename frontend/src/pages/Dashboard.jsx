import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, Building2, Map as MapIcon, User,
    TrendingUp, Clock, CheckCircle, ChevronRight,
    Search, Plus, X, Navigation, Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        seeker: { applied: 0, matching: 0, interviews: 0 },
        employer: { activeJobs: 0, totalApplicants: 0, newMatches: 0 }
    });
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [appLoading, setAppLoading] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    const navigate = useNavigate();
    const role = localStorage.getItem('user_role')?.toLowerCase();

    const fetchEmployerData = async () => {
        setLoading(true);
        try {
            const jobsRes = await api.get('/jobs/me');
            setJobs(jobsRes.data);
            setStats(prev => ({
                ...prev,
                employer: {
                    activeJobs: jobsRes.data.length,
                    totalApplicants: jobsRes.data.reduce((acc, job) => acc + (job.applicants_count || 0), 0),
                    newMatches: jobsRes.data.filter(j => j.match_score > 80).length
                }
            }));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (jobId) => {
        setAppLoading(true);
        try {
            const response = await api.get(`/applications/job/${jobId}`);
            setApplicants(response.data);
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
            toast.error('Could not load applicants');
        } finally {
            setAppLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'employer') fetchEmployerData();
    }, [role]);

    const SeekerDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Applied Jobs', value: stats.seeker.applied, icon: Briefcase, color: 'bg-blue-500' },
                    { label: 'AI Matches', value: stats.seeker.matching, icon: Search, color: 'bg-green-500' },
                    { label: 'Interviews', value: stats.seeker.interviews, icon: CheckCircle, color: 'bg-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className={`${stat.color} p-3 rounded-xl text-white`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recommended Jobs</h3>
                        <button onClick={() => navigate('/')} className="text-sm text-indigo-600 font-semibold hover:underline flex items-center">
                            Open Map <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        <div className="p-10 text-center text-slate-400">
                            Search on the map to see real-time AI matches!
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Complete Your Profile</h3>
                        <p className="text-indigo-100 text-sm mb-6">Users with complete profiles are 2.5x more likely to be hired.</p>
                        <div className="w-full bg-indigo-900/40 rounded-full h-2 mb-4">
                            <div className="bg-white h-full rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <p className="text-xs font-medium text-indigo-200">65% Completed</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-white text-indigo-600 w-full py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors mt-6"
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        </div>
    );

    const EmployerDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Jobs', value: stats.employer.activeJobs, icon: Briefcase, color: 'bg-indigo-500' },
                    { label: 'Total Applicants', value: stats.employer.totalApplicants, icon: User, color: 'bg-orange-500' },
                    { label: 'Top Matches', value: stats.employer.newMatches, icon: TrendingUp, color: 'bg-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                        <div className={`${stat.color} p-3 rounded-xl text-white`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-bold text-slate-900">Active Job Postings</h3>
                        <button
                            onClick={() => setShowPostModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors active:scale-95 shadow-lg shadow-indigo-100"
                        >
                            <Plus className="w-4 h-4" /> Post Job
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" /></div>
                        ) : jobs.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">No jobs posted yet. Click "Post Job" to start.</div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id}
                                    className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${selectedJob?.id === job.id ? 'bg-indigo-50/30 border-l-4 border-indigo-600' : ''}`}
                                    onClick={() => {
                                        setSelectedJob(job);
                                        fetchApplicants(job.id);
                                    }}
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-900">{job.title}</h4>
                                        <p className="text-sm text-slate-500">
                                            {job.job_type} • Posted {new Date(job.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900">{job.applicants_count || 0}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">Applicants</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                            {selectedJob ? `Applicants: ${selectedJob.title}` : 'Selected Job'}
                        </h3>
                        {selectedJob && (
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-black">
                                {applicants.length} Total
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {!selectedJob ? (
                            <div className="text-center py-24 text-slate-400">
                                <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-bold">Select a job from the list to view applicants and AI match scores</p>
                            </div>
                        ) : appLoading ? (
                            <div className="py-24 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" />
                                <p className="text-xs text-slate-400 mt-2">Loading Candidates...</p>
                            </div>
                        ) : applicants.length === 0 ? (
                            <div className="text-center py-24 text-slate-400">No applications yet</div>
                        ) : (
                            applicants.sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).map(app => (
                                <div key={app.id} className="p-4 border border-slate-100 rounded-2xl bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm">{app.applicant_name}</h5>
                                            <p className="text-[10px] text-slate-400 font-medium">{app.applicant_email}</p>
                                        </div>
                                        {app.match_score > 0 && (
                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${app.match_score > 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {Math.round(app.match_score)}% Match
                                            </div>
                                        )}
                                    </div>

                                    {app.applicant_skills && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {app.applicant_skills.slice(0, 4).map((s, i) => (
                                                <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 items-center pt-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Shortlist</button>
                                        <button className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Profile</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your activities and real-time AI matches.</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-full border border-slate-200/50">
                        {role} Access
                    </span>
                </div>
            </header>

            {role === 'employer' ? <EmployerDashboard /> : <SeekerDashboard />}

            {showPostModal && <PostJobModal onClose={() => setShowPostModal(false)} onSuccess={() => {
                setShowPostModal(false);
                fetchEmployerData();
            }} />}
        </div>
    );
};

const PostJobModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        job_type: 'local',
        latitude: null,
        longitude: null,
        is_urgent: false
    });
    const [aiAnalysis, setAiAnalysis] = useState({ skills: [], experience: 0 });
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    const handleLocate = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setLocating(false);
                toast.success('Location captured!');
            },
            () => {
                toast.error('Location failed');
                setLocating(false);
            }
        );
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!formData.latitude) return toast.error('Set job location first');
        setLoading(true);
        try {
            const res = await api.post('/jobs/analyze', { description: formData.description });
            setAiAnalysis(res.data);
            setStep(2);
        } catch (error) {
            toast.error('AI Analysis failed, proceeding to manual edit');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.post('/jobs/', {
                ...formData,
                required_skills: aiAnalysis.skills,
                experience_years: aiAnalysis.experience
            });
            toast.success('Job published successfully!');
            onSuccess();
        } catch (error) {
            toast.error('Failed to publish job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                        {step === 1 ? 'New Project' : 'AI Analysis'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleAnalyze} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Job Title</label>
                                <input required className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-900 transition-all"
                                    placeholder="e.g. Lead Product Designer" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <button type="button" onClick={handleLocate} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed font-black text-sm transition-all active:scale-95 ${formData.latitude ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-lg shadow-emerald-500/5' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white'}`}>
                                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                {formData.latitude ? 'Location Captured' : 'Tag Job Location'}
                            </button>
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Mission Details</label>
                                <textarea required rows="4" className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-900 transition-all min-h-[160px] resize-none"
                                    placeholder="Describe the role... AI will extract skills from this." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 mt-4 active:scale-95 flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Analyze with AI <ChevronRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                ) : (
                    <div className="p-8 space-y-8">
                        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
                            <h4 className="font-black text-sm uppercase tracking-widest mb-1 opacity-60">AI Extraction</h4>
                            <p className="text-xl font-black leading-tight italic">We've identified these core requirements. Confirm or modify below.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Skills</label>
                                <div className="flex flex-wrap gap-2">
                                    {(aiAnalysis.skills || []).map((s, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-700 flex items-center gap-3 border border-slate-200/50">
                                            {s}
                                            <button onClick={() => setAiAnalysis({ ...aiAnalysis, skills: aiAnalysis.skills.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-500 transition-colors">×</button>
                                        </span>
                                    ))}
                                    <button className="px-4 py-2 bg-white border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:border-indigo-400 hover:text-indigo-600 transition-all">Add Skill</button>
                                </div>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Min. Experience</label>
                                <div className="flex items-center gap-4 bg-slate-100 rounded-2xl px-6 py-4">
                                    <input type="number" className="w-full bg-transparent border-none focus:ring-0 font-black text-2xl text-slate-900"
                                        value={aiAnalysis.experience} onChange={e => setAiAnalysis({ ...aiAnalysis, experience: e.target.value })} />
                                    <span className="text-xs font-black text-slate-400 uppercase">Years</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Back</button>
                            <button onClick={handleConfirm} disabled={loading} className="flex-[2] py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-300 active:scale-95 transition-all flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Publish'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
