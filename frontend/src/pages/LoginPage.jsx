import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', new URLSearchParams({
                username: email,
                password: password,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token, user_role } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user_role', user_role || 'GUEST');

            toast.success('Login successful!');
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            console.error('Login error:', error);
            const detail = error.response?.data?.detail || 'Login failed. Please check your credentials.';
            toast.error(detail);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-indigo-100 p-3 rounded-full mb-4">
                    <LogIn className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 text-sm">Log in to your Job Radar account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors mt-4"
                >
                    Log In
                </button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
