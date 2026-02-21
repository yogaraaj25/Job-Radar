import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, XCircle, CheckCircle, Users, Activity, Briefcase } from 'lucide-react';
import api from '../services/api';

const AdminPortal = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        pendingReports: 3 // Mocked for UI richness
    });

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const response = await api.get('/admin/jobs');
                setJobs(response.data);
                setStats({
                    totalJobs: response.data.length,
                    activeJobs: response.data.filter(j => j.is_active).length,
                    pendingReports: 3
                });
            } catch (error) {
                console.error('Failed to fetch admin jobs:', error);
                toast.error('Portal access denied or server error');
            } finally {
                setLoading(false);
            }
        };
        fetchAllJobs();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.patch(`/admin/jobs/${id}/${action}`);
            toast.success(`Job ${action}ed successfully`);
            setJobs(jobs.map(j => j.id === id ? { ...j, is_active: action === 'approve' } : j));
        } catch (error) {
            toast.error(`Action failed`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Admin Command Center</h1>
                    <p className="text-slate-500 font-medium">Platform-wide moderation and insights</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listings</p>
                        <p className="text-2xl font-black text-slate-900">{stats.totalJobs}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Now</p>
                        <p className="text-2xl font-black text-slate-900">{stats.activeJobs}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Health</p>
                        <p className="text-2xl font-black text-slate-900">Optimal</p>
                    </div>
                </div>
            </div>

            {/* Job Table */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-slate-800">Recent Postings</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Urgent</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{job.title}</div>
                                        <div className="text-xs text-slate-400 truncate max-w-md">{job.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {job.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase">
                                                <XCircle className="w-3 h-3" /> Blocked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {job.is_urgent ? '🔥' : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {job.is_active ? (
                                                <button
                                                    onClick={() => handleAction(job.id, 'block')}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Block Post"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(job.id, 'approve')}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Approve Post"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPortal;
