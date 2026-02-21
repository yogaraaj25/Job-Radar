import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Briefcase, MapPin, Navigation, Loader2, AlertCircle, X, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// Fix for default marker icons in Leaflet with Vite
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const JobCard = ({ job, onClick, isMatch }) => {
    const score = job.match_score || 0;
    const skills = job.required_skills || [];
    const exp = job.experience_years;

    return (
        <div
            onClick={onClick}
            className={`p-4 border rounded-2xl transition-all cursor-pointer group relative overflow-hidden ${score > 70 ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50' : isMatch ? 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}
        >
            {score > 0 && (
                <div className={`absolute top-0 right-0 ${score > 70 ? 'bg-emerald-600' : 'bg-indigo-600'} text-white text-[9px] font-black px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.round(score)}% Match</span>
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 truncate pr-12">{job.title}</h3>
                {job.is_urgent && (
                    <span className="animate-pulse bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">Urgent</span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                    {job.job_type.replace('_', ' ')}
                </span>
                {exp !== null && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>{exp}yr exp</span>
                    </div>
                )}
            </div>

            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                            {skill}
                        </span>
                    ))}
                    {skills.length > 3 && <span className="text-[9px] text-slate-400">+{skills.length - 3}</span>}
                </div>
            )}

            <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Nearby</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    View & Apply
                </button>
            </div>
        </div>
    );
};

// Custom hook to fly to location and handle resizing
const MapEventHandler = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);

    // Fix for "grey tiles" or incorrect sizing on load
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
};

const MapPage = () => {
    const [center, setCenter] = useState([51.505, -0.09]);
    const [zoom, setZoom] = useState(13);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(5.0);
    const [userLoc, setUserLoc] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const fetchJobs = useCallback(async (lat, lon, rad) => {
        if (!lat || !lon) return;
        setLoading(true);
        try {
            const response = await api.get('/jobs/nearby', {
                params: { lat, lon, radius_km: rad, limit: 50 }
            });
            setJobs(response.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Could not load nearby jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLocateUser = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const successCallback = (position) => {
            const { latitude, longitude } = position.coords;
            console.log('GEOLOCATION SUCCESS:', latitude, longitude);
            const newPos = [latitude, longitude];
            setCenter(newPos);
            setUserLoc(newPos);
            setZoom(15);
            setIsLocating(false);
            toast.success('Found your location!');
        };

        const errorCallback = (error) => {
            console.warn('GEOLOCATION ERROR (RETRYING):', error);

            // Fallback: If high accuracy failed, try regular accuracy
            if (options.enableHighAccuracy) {
                console.log('Retrying without high accuracy...');
                options.enableHighAccuracy = false;
                navigator.geolocation.getCurrentPosition(successCallback, finalErrorCallback, options);
                return;
            }
            finalErrorCallback(error);
        };

        const finalErrorCallback = (error) => {
            setIsLocating(false);
            let msg = 'Unable to retrieve your location';
            console.error('GEOLOCATION FINAL ERROR:', error.code, error.message);

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = 'Location permission denied. Please enable it in browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    msg = 'Location request timed out.';
                    break;
            }

            toast.error(msg);
            setLocationError(msg);
            console.error(`Geolocation error (${error.code}): ${error.message}`);
        };

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    }, []);

    // Auto-locate on mount
    useEffect(() => {
        handleLocateUser();
    }, [handleLocateUser]);

    useEffect(() => {
        fetchJobs(center[0], center[1], radius);
    }, [center, radius, fetchJobs]);

    // WebSocket listener for new jobs
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/api/v1/ws`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_JOB') {
                toast(`New job posted nearby: ${data.job.title}`, {
                    icon: '📢',
                    duration: 4000
                });
                fetchJobs(center[0], center[1], radius);
            }
        };
        return () => ws.close();
    }, [center, radius, fetchJobs]);

    const [activeTab, setActiveTab] = useState('nearby');
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [recLoading, setRecLoading] = useState(false);

    const fetchRecommended = useCallback(async () => {
        setRecLoading(true);
        try {
            const response = await api.get('/jobs/recommend');
            setRecommendedJobs(response.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setRecLoading(false);
        }
    }, []);

    const [applying, setApplying] = useState(null);

    const handleApply = async (jobId) => {
        setApplying(jobId);
        try {
            await api.post('/applications/', { job_id: jobId });
            toast.success('Application submitted successfully!');
            // Refresh jobs to maybe show apply status if we added that, 
            // but for now just a success message is fine.
        } catch (error) {
            console.error('Application failed:', error);
            const msg = error.response?.data?.detail || 'Failed to submit application';
            toast.error(msg);
        } finally {
            setApplying(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'recommended') fetchRecommended();
    }, [activeTab, fetchRecommended]);

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Sidebar */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('nearby')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'nearby' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Nearby
                        </button>
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'recommended' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            AI Recommended
                        </button>
                    </div>

                    {activeTab === 'nearby' && (
                        <div className="flex justify-between items-center">
                            <span className="italic text-slate-500 text-xs font-medium">Radius filtering</span>
                            <select
                                className="text-[10px] bg-slate-50 border border-slate-100 rounded p-1 outline-none font-bold text-slate-600"
                                value={radius}
                                onChange={(e) => setRadius(parseFloat(e.target.value))}
                            >
                                <option value="3">3 km</option>
                                <option value="5">5 km</option>
                                <option value="10">10 km</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'nearby' ? (
                        loading ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">Scanning for jobs...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-10">
                                <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm font-medium">No jobs found in this area</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <JobCard key={job.id} job={job} onClick={() => setCenter([job.latitude, job.longitude])} />
                            ))
                        )
                    ) : (
                        recLoading ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">Analyzing skills...</p>
                            </div>
                        ) : recommendedJobs.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Briefcase className="w-6 h-6 text-indigo-400" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium mb-2">No skill-based matches</p>
                                <p className="text-[10px] text-slate-400">Update your profile skills to get personalized matches!</p>
                            </div>
                        ) : (
                            recommendedJobs.map((job) => (
                                <JobCard key={job.id} job={job} isMatch onClick={() => setCenter([job.latitude, job.longitude])} />
                            ))
                        )
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={() => activeTab === 'nearby' ? fetchJobs(center[0], center[1], radius) : fetchRecommended()}
                        className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        <span>{activeTab === 'nearby' ? 'Rescan This Area' : 'Refresh Recommendations'}</span>
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-slate-100">
                {locationError && (
                    <div className="absolute top-4 left-4 right-16 z-[2000] animate-in slide-in-from-top duration-500">
                        <div className="bg-white border-l-4 border-red-500 shadow-xl rounded-r-xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-50 p-2 rounded-full">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Location Access Required</p>
                                    <p className="text-xs text-slate-500">{locationError}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setLocationError(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full" style={{ background: '#f8fafc' }}>
                    <MapEventHandler center={center} zoom={zoom} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {jobs.map((job) => (
                        <Marker key={job.id} position={[job.latitude, job.longitude]}>
                            <Popup className="job-popup">
                                <div className="min-w-[200px] p-1">
                                    <div className="flex justify-between items-start mb-2 pt-1 border-b border-slate-100 pb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-900 m-0 leading-tight">{job.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium">Employer ID: {job.employer_id}</p>
                                        </div>
                                        {job.match_score > 0 && (
                                            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                                <TrendingUp className="w-3 h-3" />
                                                {Math.round(job.match_score)}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        {job.experience_years !== null && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{job.experience_years} years experience required</span>
                                            </div>
                                        )}

                                        {job.required_skills?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {job.required_skills.map((skill, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-600 line-clamp-3 italic leading-relaxed">
                                            "{job.description}"
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleApply(job.id)}
                                        disabled={applying === job.id}
                                        className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98]"
                                    >
                                        {applying === job.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        )}
                                        <span>{applying === job.id ? 'Applying...' : 'Apply Now'}</span>
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {userLoc && (
                        <Marker position={userLoc} icon={L.divIcon({
                            className: 'user-marker',
                            html: `
                                <div class="relative flex items-center justify-center">
                                    <div class="absolute w-8 h-8 bg-blue-500 rounded-full animate-ripple"></div>
                                    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-xl"></div>
                                </div>
                            `
                        })}>
                            <Popup>
                                <div className="text-center font-bold text-slate-700">You are here</div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Floating Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    <button
                        onClick={handleLocateUser}
                        disabled={isLocating}
                        className={`bg-white p-2.5 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 ${isLocating ? 'text-indigo-600' : 'text-slate-600'}`}
                        title="My Location"
                    >
                        {isLocating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Navigation className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
