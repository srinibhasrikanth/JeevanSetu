import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Loader2,
  AlertTriangle,
  MapPin,
  Stethoscope,
  Info,
  Car
} from 'lucide-react';
import { getEmergency, resolveEmergency } from '../api';

const statusColors = {
  Active:   'text-red-700 bg-white border border-red-200 shadow-sm',
  Resolved: 'text-slate-600 bg-white border border-slate-200 shadow-sm',
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEmergency(id);
        setEvent(res.data);
      } catch (err) {
        setError(err.message || 'Could not load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await resolveEmergency(id);
      setEvent(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-slate-50 relative border-x border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-8 text-center border-x border-slate-200 shadow-sm">
        <AlertTriangle className="w-14 h-14 text-blue-500 mb-4" />
        <p className="text-slate-700 font-semibold mb-6">{error || 'Event not found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const analysis = event.aiAnalysis || {};
  const severity = analysis.severity || 'CRITICAL';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans pb-12 shadow-sm border-x border-slate-200 relative">
      {/* Header Area */}
      <div className="bg-blue-600 px-6 pt-12 pb-8 text-white rounded-b-3xl shadow-sm mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Back"
          className="mb-4 w-10 h-10 rounded-full border border-blue-400 bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-2xl font-black leading-tight mb-2 tracking-tight">
          {analysis.emergency_type || analysis.emergencyType || 'Event Detail'}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-widest ${statusColors[event.status] || 'bg-white text-slate-700 border-slate-200'}`}>
            {event.status}
          </span>
          <span className="text-blue-100 font-medium text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {new Date(event.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      <div className="px-6 space-y-5">
        
        {/* Severity Badge */}
        <div className="flex items-center gap-4 rounded-2xl p-4 shadow-sm bg-blue-50 border border-blue-200">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">Severity: {severity}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5 text-slate-600">Triggered via: {event.triggerMethod?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* User Input Context */}
        {event.messyData?.userInput && (
          <section aria-label="Incident context" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
             <h2 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-2">Original Report</h2>
             <p className="text-slate-800 text-sm font-medium italic">"{event.messyData.userInput}"</p>
          </section>
        )}

        {/* AI Explanation / Reasoning */}
        {(analysis.reasoning || analysis.explanation) && (
          <section aria-label="AI explanation" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-800 text-lg">AI Assessment</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{analysis.reasoning || analysis.explanation}</p>
          </section>
        )}

        {/* Immediate Actions */}
        {(analysis.actions || analysis.immediateActions)?.length > 0 && (
          <section aria-label="Recommended actions" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg mb-4 pb-3 border-b border-slate-100">
              Prescribed Actions
            </h2>
            <ol className="space-y-4">
              {(analysis.actions || analysis.immediateActions).map((action, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-700 font-medium leading-relaxed pt-1">{action}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Hospital Details */}
        {analysis.recommended_hospital?.name && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
               <div className="bg-blue-50 p-2 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
               </div>
               <h2 className="font-bold text-slate-800 text-lg">Target Facility</h2>
            </div>
            <p className="font-bold text-slate-900 mb-1">{analysis.recommended_hospital.name}</p>
            <p className="text-xs text-blue-600 font-bold mb-3 uppercase tracking-wide">MATCH: {analysis.recommended_hospital.specialty_match}</p>
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" /> {analysis.recommended_hospital.reason}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {analysis.recommended_hospital.distance}
            </p>
          </section>
        )}

        {/* Actions Menu */}
        <div className="pt-2 flex flex-col gap-3">
          {event.status === 'Active' && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="w-full bg-blue-600 border border-blue-700 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-center transition flex justify-center items-center gap-2 shadow-sm"
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {resolving ? 'Archiving...' : 'Mark as Resolved'}
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl text-center shadow-sm transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
