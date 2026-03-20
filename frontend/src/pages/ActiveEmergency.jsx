import React, { useState, useEffect } from 'react';
import { Phone, Navigation, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ActiveEmergency = () => {
  const [analyzing, setAnalyzing] = useState(true);
  const [data, setData] = useState(null);

  // Mock API call to Gemini Service
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        emergencyType: "Cardiac Arrest Suspected",
        severityLevel: "Critical",
        explanation: "Patient reported sharp chest pain radiating to the left arm along with shortness of breath. History of hypertension indicates a high risk of Myocardial Infarction.",
        immediateActions: [
          "Initiate Hands-Only CPR immediately",
          "Locate nearest AED",
          "Keep patient calm and seated if conscious"
        ],
        hospital: {
          name: "City Heart Institute",
          distance: "2.4 km",
          eta: "6 mins",
          traffic: "Light"
        }
      });
      setAnalyzing(false);
    }, 3000); // 3-second fake processing delay
    
    return () => clearTimeout(timer);
  }, []);

  if (analyzing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6">
        <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2 animate-pulse">Gemini AI Analyzing...</h2>
        <p className="text-gray-400 text-center">Processing voice context, medical history, and location data to determine the best response.</p>
      </div>
    );
  }

  const isCritical = data?.severityLevel === 'Critical';

  return (
    <div className={`max-w-md mx-auto min-h-screen p-6 font-sans relative ${isCritical ? 'bg-red-50' : 'bg-orange-50'}`}>
      {/* Header Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-4 text-white shadow-lg mb-6 ${isCritical ? 'bg-red-600 animate-pulse' : 'bg-orange-500'}`}>
        <ShieldAlert className="w-10 h-10 flex-shrink-0" />
        <div>
          <h1 className="text-xl font-black uppercase tracking-wide leading-tight">{data?.emergencyType}</h1>
          <p className="opacity-90 font-medium">Severity: {data?.severityLevel}</p>
        </div>
      </div>

      {/* AI Explanation Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-2">
          <Activity className="w-5 h-5 text-blue-500" /> AI Assessment
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">{data?.explanation}</p>
      </div>

      {/* Immediate Actions Checklist */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Immediate Steps</h3>
        <ul className="space-y-3">
          {data?.immediateActions.map((action, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 font-medium text-sm">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-28">
         <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Recommended Hospital</h3>
         <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg text-gray-900">{data?.hospital.name}</span>
            <span className="text-sm font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-md">{data?.hospital.eta}</span>
         </div>
         <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
           <Navigation className="w-4 h-4" /> {data?.hospital.distance} • {data?.hospital.traffic} traffic
         </p>
         <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition">
           <Navigation className="w-5 h-5" /> Start Navigation
         </button>
      </div>

      {/* Sticky Call Ambulance Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg transition-transform active:scale-95">
            <Phone className="w-6 h-6 fill-current" /> CALL AMBULANCE NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveEmergency;
