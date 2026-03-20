import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Phone,
  Navigation,
  Activity,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  MapPin,
  Send,
  Stethoscope,
  Info,
  Car
} from 'lucide-react';
import { triggerEmergency, resolveEmergency } from '../api';

// ─── Input Phase (Chat UI) ──────────────────────────────────────────────────

const ChatInputScreen = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const navigate = useNavigate();

  const handleSend = () => {
    if (text.trim().length === 0) return;
    onSubmit(text.trim());
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-blue-600 px-6 py-5 flex items-center gap-4 text-white shadow-sm z-10 w-full rounded-b-3xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-blue-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-lg leading-tight">Emergency Chatbot</h2>
          <p className="text-blue-100 text-xs shadow-sm">AI Responder Online</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-end">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 w-11/12 self-start rounded-tl-sm relative">
          <p className="text-slate-700 text-sm leading-relaxed">
            Please describe your emergency clearly. Include symptoms, location context, or what caused the accident.
          </p>
          <p className="text-xs text-blue-500 font-bold mt-2 uppercase tracking-wide">
             GPS & MEDICAL PROFILE AUTO-ATTACHED
          </p>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-sm"
            placeholder="Type your symptoms here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl p-3.5 shadow-md transition flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Analysing Screen ─────────────────────────────────────────────────────────

const AnalysingScreen = () => (
  <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center px-8 font-sans">
    <div className="relative mb-8 bg-white p-6 rounded-full shadow-lg border border-slate-100">
      <Activity className="w-16 h-16 text-blue-600" />
    </div>
    <h2 className="text-2xl font-black mb-3 text-slate-800 text-center tracking-tight">AI Assessment in Progress</h2>
    <p className="text-slate-600 text-center leading-relaxed text-sm max-w-xs">
      Processing your medical history, text context, and location data to determine the optimal response.
    </p>
    <div className="mt-8 flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      Powered by Google Gemini
    </div>
  </div>
);

// ─── Error Screen ─────────────────────────────────────────────────────────────

const ErrorScreen = ({ message, onRetry, onBack }) => (
  <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center px-8 font-sans">
    <AlertTriangle className="w-20 h-20 text-blue-500 mb-6" />
    <h2 className="text-xl font-bold mb-3 text-center text-slate-800 tracking-tight">Analysis Failed</h2>
    <p className="text-slate-600 text-center text-sm mb-8 leading-relaxed max-w-xs">{message}</p>
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={onRetry}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-colors border border-blue-700"
      >
        Try Again
      </button>
      <button
        onClick={onBack}
        className="w-full bg-white hover:bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-xl shadow-sm border border-slate-200 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ActiveEmergency = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const triggerMethod = location.state?.trigger || 'CHATBOT';

  // State
  const [status, setStatus] = useState('input'); // 'input' | 'analyzing' | 'ready' | 'error'
  const [data, setData] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolving, setResolving] = useState(false);
  const [userInput, setUserInput] = useState('');

  const runAnalysis = useCallback(async (inputText) => {
    setStatus('analyzing');
    setErrorMsg('');
    setUserInput(inputText);

    try {
      const messyData = { userInput: inputText };

      // Try to get geolocation (non-blocking)
      await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve();
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            messyData.gpsLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            resolve();
          },
          () => resolve(), // Ignore permission denied
          { timeout: 3000 },
        );
      });

      messyData.timeContext = new Date().toISOString();

      const body = {
        triggerMethod,
        messyData,
      };

      const res = await triggerEmergency(body);
      
      // The new returned structure is inside res.data.analysis
      setData(res.data.analysis);
      setEventId(res.data.eventId);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err.message || 'Could not reach the server. Please check your connection.');
      setStatus('error');
    }
  }, [triggerMethod]);

  const handleResolve = async () => {
    if (!eventId) return navigate('/dashboard');
    setResolving(true);
    try {
      await resolveEmergency(eventId);
    } catch {
      // Non-blocking
    } finally {
      setResolving(false);
      navigate('/dashboard');
    }
  };

  if (status === 'input')     return <ChatInputScreen triggerMethod={triggerMethod} onSubmit={runAnalysis} />;
  if (status === 'analyzing') return <AnalysingScreen />;
  if (status === 'error') {
    return <ErrorScreen message={errorMsg} onRetry={() => runAnalysis(userInput)} onBack={() => navigate('/dashboard')} />;
  }

  // Pure White and Blue UI requested
  const severityValue = data?.severity || 'CRITICAL';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans relative">

      {/* ── Top Banner Area ── */}
      <div className="bg-blue-600 text-white rounded-b-3xl shadow-md pb-6 relative z-10 w-full rounded-none px-6 pt-12">
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors mb-4 border border-blue-500"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-2xl border border-blue-400">
            <ShieldAlert className="w-8 h-8 flex-shrink-0 text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
              Assessment Ready
            </p>
            <h1 className="text-2xl font-black leading-tight tracking-tight mb-2">
              {data?.emergency_type || 'Unknown Emergency'}
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-block text-[10px] font-bold px-3 py-1 rounded bg-white text-blue-700 uppercase tracking-widest shadow-sm">
                {severityValue} Severity
              </span>
              <span className="inline-block text-[10px] font-bold px-3 py-1 rounded bg-blue-800 text-blue-100 uppercase tracking-widest border border-blue-500">
                {data?.confidence || 'HIGH'} Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="px-5 pb-40 flex flex-col gap-6 overflow-y-auto -mt-4 relative z-0 py-10">
        
        {/* Alerts Matrix */}
        {(data?.alerts?.send_ambulance || data?.alerts?.notify_contacts) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase text-red-700 tracking-widest flex gap-1 items-center">
              <AlertTriangle className="w-4 h-4" /> System Alerts Dispatched
            </h3>
            {data.alerts.send_ambulance && <p className="text-sm font-medium text-red-800">• 🚑 Ambulance requested</p>}
            {data.alerts.notify_contacts && <p className="text-sm font-medium text-red-800">• 📧 Emergency contacts notified</p>}
          </div>
        )}

        {/* AI Assessment / Reasoning */}
        <section
          aria-label="AI assessment"
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
             <div className="bg-blue-50 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
             </div>
             <h2 className="font-bold text-slate-800 text-lg">AI Reasoning</h2>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{data?.reasoning}</p>
        </section>

        {/* Immediate Steps */}
        <section
          aria-label="Immediate steps"
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h2 className="font-bold text-slate-800 text-lg mb-4 pb-3 border-b border-slate-100">
            Immediate Actions
          </h2>
          <ol className="space-y-4">
            {data?.actions?.map((action, idx) => (
              <li key={idx} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {idx + 1}
                </div>
                <span className="text-slate-700 font-medium text-sm pt-1 leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Hospital Recommendation */}
        {data?.recommended_hospital?.name && (
          <section
            aria-label="Recommended route"
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
               <div className="bg-blue-50 p-2 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
               </div>
               <h2 className="font-bold text-slate-800 text-lg">Designated Hospital</h2>
            </div>
            
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-900">{data.recommended_hospital.name}</span>
            </div>
            <p className="text-xs text-blue-600 font-bold mb-3 uppercase tracking-wide">MATCH: {data.recommended_hospital.specialty_match}</p>
            
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {data.recommended_hospital.reason}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {data.recommended_hospital.distance} away
            </p>

            {data?.route && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex flex-col gap-2">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Car className="w-4 h-4 text-blue-600" /> Route Info ETA: {data.route.eta}</p>
                <p className="text-xs text-slate-600"><span className="font-semibold">Best Route:</span> {data.route.best_route}</p>
                <p className="text-xs text-red-600"><span className="font-semibold">Avoid:</span> {data.route.avoid_routes} ({data.route.traffic_reason})</p>
              </div>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.recommended_hospital.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition"
            >
              <Navigation className="w-5 h-5" />
              Open in Maps
            </a>
          </section>
        )}

        {/* Resolve Button */}
        <button
          onClick={handleResolve}
          disabled={resolving}
          className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-60 text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {resolving ? 'Archiving...' : 'Dismiss & Return'}
        </button>
      </div>

      {/* ── Call Ambulance Footer ── */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-slate-200 z-20 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          <a
            href="tel:112"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 font-black py-4.5 rounded-xl shadow-md flex items-center justify-center gap-3 text-lg transition-transform active:scale-95"
            style={{ padding: '1.25rem' }}
          >
            <Phone className="w-6 h-6 fill-current" />
            CONTACT EMERGENCY (112)
          </a>
        </div>
      </div>
    </div>
  );
};

export default ActiveEmergency;
