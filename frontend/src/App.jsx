import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import './App.css';

// Lazy load components for performance
const MapPage = lazy(() => import('./pages/MapPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="text-slate-500 font-medium animate-pulse">Loading amazing things...</p>
    </div>
  </div>
);

function App() {
  const userRole = localStorage.getItem('user_role')?.toUpperCase();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {userRole === 'ADMIN' && (
                <Route path="/admin" element={<AdminPortal />} />
              )}
            </Routes>
          </Suspense>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
