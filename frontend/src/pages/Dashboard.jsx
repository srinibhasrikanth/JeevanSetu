import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, User, HeartPulse } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSOS = () => {
    // Navigate straight to the Active Emergency screen
    navigate('/emergency', { state: { trigger: 'SOS_BUTTON' } });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col p-6 items-center border border-gray-100 relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-red-50 to-orange-50 -z-10 rounded-b-[4rem]" />

      <header className="w-full flex justify-between items-center mb-10 pt-4">
        <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">JeevanSetu</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-5 h-5 text-red-600" />
        </div>
      </header>

      <section className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-12 relative z-10">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">User Profile</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-semibold text-gray-700">Name:</span> John Doe</p>
          <p><span className="font-semibold text-gray-700">Blood Group:</span> O-Negative</p>
          <p><span className="font-semibold text-gray-700">Allergies:</span> Penicillin, Peanuts</p>
        </div>
      </section>

      <div className="flex-1 flex flex-col justify-center w-full items-center relative z-10">
        <p className="text-center text-gray-500 mb-6 font-medium">In case of extreme medical emergency, tap the button below</p>
        
        {/* Massive SOS Button */}
        <button 
          onClick={handleSOS}
          className="relative group w-64 h-64 rounded-full bg-gradient-to-b from-red-500 to-red-600 shadow-[0_20px_50px_rgba(239,68,68,0.5)] flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
        >
          <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-0 group-hover:animate-ping" />
          <div className="flex flex-col items-center">
            <AlertCircle className="w-20 h-20 text-white mb-2" />
            <span className="text-4xl font-black text-white tracking-widest">SOS</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
