import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  UserCircle,
  ActivitySquare,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Phone,
  LogOut,
  Loader2,
  ScanLine
} from 'lucide-react';
import { getHealthTip, getMyEmergencies } from '../api';
import { useAuth } from '../context/AuthContext';

const severityColor = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // User is available from AuthContext

  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthTip, setHealthTip] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingTip, setLoadingTip] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const error = null;

  // Load Gemini health tip
  const fetchHealthTip = useCallback(async () => {
    setLoadingTip(true);
    try {
      const res = await getHealthTip();
      setHealthTip(res.data.tip);
    } catch {
      setHealthTip('Stay hydrated and keep your emergency contacts updated.');
    } finally {
      setLoadingTip(false);
    }
  }, []);

  // Load emergency history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getMyEmergencies();
      setHistory(res.data.slice(0, 3)); // Show last 3
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthTip();
    fetchHistory();
  }, [fetchHealthTip, fetchHistory]);

  const handleSOS = () => {
    navigate('/emergency', {
      state: { trigger: 'SOS_BUTTON' },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const qrUrl = `${window.location.origin}/qr/${user?.qrCodeId || 'unknown'}`;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans flex flex-col relative">

      {/* ── Header Area (Navbar with Tabs) ── */}
      <div className="bg-blue-600 rounded-b-3xl shadow-sm relative z-10 w-full rounded-none">
        <header className="flex justify-between items-center px-6 pt-12 pb-2">
          <div className="flex items-center gap-2">
            <ActivitySquare className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-black text-white tracking-tight">JeevanSetu</h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border-2 border-blue-400 bg-white shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center border-2 border-blue-400 shadow-sm">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-blue-100" />
            </button>
          </div>
        </header>

        {/* ── Navbar Tabs ── */}
        <div className="flex px-4 pt-1 pb-4 gap-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-shrink-0 px-4 py-2 ${activeTab === 'dashboard' ? 'bg-white text-blue-600' : 'bg-blue-700/50 text-white'} rounded-full font-bold text-xs shadow-sm transition`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex-shrink-0 px-4 py-2 ${activeTab === 'qr' ? 'bg-white text-blue-600' : 'bg-blue-700/50 text-white'} rounded-full font-bold text-xs shadow-sm transition`}
          >
            Emergency QR
          </button>
          <button 
            onClick={() => navigate('/emergency')}
            className="flex-shrink-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
             <AlertCircle className="w-4 h-4" /> SOS Chatbot
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* ── Sub-header Greeting ── */}
          <div className="px-6 pt-5">
            <p className="text-slate-500 font-medium text-lg">
              Hello, <span className="font-bold text-slate-800">{user?.name?.split(' ')[0] || 'User'}</span> 👋
            </p>
          </div>

          {/* ── Main scrollable area ── */}
          <div className="flex-1 flex flex-col gap-6 px-6 pt-4 pb-40 overflow-y-auto">

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium shadow-sm"
              >
                ⚠️ {error}
              </div>
            )}

            {/* ── Medical ID Card ── */}
            <section
              aria-label="Medical ID card"
              className="bg-white rounded-2xl shadow border border-slate-100 p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Medical Profile
                </h2>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">VERIFIED</span>
              </div>

              <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex flex-col gap-1">
                  <dt className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Blood Group</dt>
                  <dd className="font-bold text-blue-700 text-lg">
                    {user?.bloodGroup || 'N/A'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Allergies</dt>
                  <dd className="font-medium text-slate-800">
                    {user?.allergies?.length ? user.allergies.join(', ') : 'None'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <dt className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Conditions</dt>
                  <dd className="font-medium text-slate-800">
                    {user?.medicalConditions?.length ? user.medicalConditions.join(', ') : 'None'}
                  </dd>
                </div>
              </dl>

              {user?.emergencyContacts?.[0] && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 flex items-center gap-3">
                  <div className="bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Emergency Contact</p>
                    <p className="text-sm font-bold text-slate-800">{user.emergencyContacts[0].name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{user.emergencyContacts[0].phone}</p>
                  </div>
                </div>
              )}
            </section>

            {/* ── Gemini Health Tip ── */}
            <section
              aria-label="AI health tip"
              className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                  <Sparkles className="w-4 h-4" />
                  AI Daily Tip
                </h2>
                <button
                  onClick={fetchHealthTip}
                  disabled={loadingTip}
                  className="mt-0 flex items-center gap-1 text-blue-500 text-xs font-semibold hover:text-blue-700 disabled:opacity-50 transition bg-white px-2 py-1 rounded shadow-sm border border-blue-100"
                >
                  <Sparkles className="w-3 h-3" /> Refresh
                </button>
              </div>

              {loadingTip ? (
                <div className="flex justify-center p-4">
                   <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : (
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{healthTip || 'Loading your personalised tip…'}</p>
              )}
            </section>

            {/* ── Recent Emergency History ── */}
            {(loadingHistory || history.length > 0) && (
              <section aria-label="Recent emergencies">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                  Recent Alerts
                </h2>
                
                {loadingHistory ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {history.map((event) => (
                      <li key={event._id}>
                        <button
                          onClick={() => navigate(`/event/${event._id}`)}
                          className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-left flex items-center justify-between hover:shadow transition group"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                              {event.aiAnalysis?.emergency_type || event.aiAnalysis?.emergencyType || 'Emergency'}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              {new Date(event.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                                severityColor[event.aiAnalysis?.severity] || severityColor[event.aiAnalysis?.severityLevel] || 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {event.aiAnalysis?.severity || event.aiAnalysis?.severityLevel || 'Critical'}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </>
      ) : (
        /* ── Emergency QR Tab Content ── */
        <div className="flex-1 flex flex-col px-6 pt-10 pb-40 overflow-y-auto items-center">
          <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 max-w-xs w-full mb-8">
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100">
               {user?.qrCodeId ? (
                 <img 
                    src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(qrUrl)}&choe=UTF-8`}
                    alt="Emergency QR Code"
                    className="w-full h-auto rounded-xl shadow-sm border border-slate-200"
                 />
               ) : (
                 <div className="w-48 h-48 bg-slate-200 rounded-xl flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                 </div>
               )}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-3 text-center">Your Medical QR</h2>
          <p className="text-slate-500 text-center leading-relaxed text-sm max-w-[260px] mx-auto mb-6">
             In case of emergency, anyone can scan this code to access your medical profile and instantly alert your family.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 w-full">
            <ScanLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-bold text-sm mb-1">Set as Lock Screen</p>
              <p className="text-blue-600/80 text-xs">Take a screenshot of this QR code and set it as your lock screen wallpaper so first responders can access it without unlocking.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed SOS Button Footer ── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 pb-8 pt-4 z-20">
        <div className="max-w-md mx-auto flex justify-center">
          <button
            onClick={handleSOS}
            aria-label="Trigger SOS emergency alert"
            className="w-11/12 bg-red-600 text-white shadow-lg shadow-red-600/30 rounded-2xl py-5 flex items-center justify-center gap-3 hover:bg-red-700 active:scale-[0.98] transition-all border border-red-500"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="text-xl font-bold tracking-wide">REQUEST SOS CHATBOT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
