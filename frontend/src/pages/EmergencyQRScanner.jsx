import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert, AlertCircle, Phone, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { getUserByQR, triggerEmergencyByQR } from '../api';

const EmergencyQRScanner = () => {
  const { qrCodeId } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [triggering, setTriggering] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await getUserByQR(qrCodeId);
        setPatient(res.data);
      } catch {
        setError('Could not verify QR code. The user may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [qrCodeId]);

  const handleTriggerSOS = async () => {
    if (!window.confirm(`Trigger an emergency alert for ${patient.name}?`)) return;
    
    setTriggering(true);
    try {
      // Simulate grabbing the bystander's location
      const messyData = { userInput: 'Emergency triggered by bystander scanning QR code.' };
      
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
          () => resolve(), 
          { timeout: 3000 },
        );
      });

      await triggerEmergencyByQR({
        qrCodeId,
        messyData
      });
      setTriggerSuccess(true);
    } catch {
      alert('Failed to trigger SOS. Please call 112 instead.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-slate-50 relative border-x border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-8 text-center border-x border-slate-200 shadow-sm">
        <AlertTriangle className="w-14 h-14 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid QR Code</h2>
        <p className="text-slate-600 font-medium mb-6">This medical profile could not be found or has been disabled.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans pb-12 shadow-sm border-x border-slate-200 relative">
      
      {/* ── Red Header Area ── */}
      <div className="bg-red-600 px-6 pt-12 pb-8 text-white rounded-b-3xl shadow-sm mb-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-full mb-4 shadow-lg border-4 border-red-500">
          <ShieldAlert className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-center">
          MEDICAL EMERGENCY PROFILE
        </h1>
        <p className="text-red-100 font-bold tracking-widest text-xs uppercase mt-2">Verified Patient</p>
      </div>

      <div className="px-6 space-y-5">
        
        {/* Basic Info */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <h2 className="text-slate-500 font-semibold text-xs tracking-widest uppercase mb-1">Patient Name</h2>
          <p className="text-2xl font-black text-slate-800">{patient.name}</p>
        </section>

        {/* Medical Stats */}
        <dl className="grid grid-cols-2 gap-y-4 gap-x-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <dt className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Blood Group</dt>
            <dd className="font-black text-red-600 text-2xl">
              {patient.bloodGroup || 'N/A'}
            </dd>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <dt className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Allergies</dt>
            <dd className="font-bold text-slate-800 text-sm">
              {patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
            </dd>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 col-span-2">
            <dt className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Medical Conditions</dt>
            <dd className="font-bold text-slate-800 text-sm">
              {patient.medicalConditions?.length ? patient.medicalConditions.join(', ') : 'None documented'}
            </dd>
          </div>
        </dl>

        {/* Emergency Contacts */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Emergency Contacts</h2>
          {patient.emergencyContacts?.length > 0 ? (
            <div className="space-y-4">
              {patient.emergencyContacts.map((contact, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
                    <p className="text-xs text-slate-500">{contact.relationship || 'Emergency Contact'}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">No emergency contacts explicitly provided.</p>
          )}
        </section>

        {/* Action Trigger */}
        <div className="pt-4">
          {triggerSuccess ? (
             <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center flex flex-col items-center">
               <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
               <h3 className="text-green-800 font-bold text-lg mb-1">Emergency Notified!</h3>
               <p className="text-green-700 text-sm font-medium">Their emergency contacts and rescue services have been pinged.</p>
             </div>
          ) : (
            <button
              onClick={handleTriggerSOS}
              disabled={triggering}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-red-600/30 transition flex justify-center items-center gap-3 border-2 border-red-500"
            >
              {triggering ? <Loader2 className="w-6 h-6 animate-spin" /> : <AlertCircle className="w-7 h-7" />}
              {triggering ? 'TRIGGERING...' : 'TRIGGER SOS FOR PATIENT'}
            </button>
          )}
          <p className="text-center text-slate-400 text-xs font-semibold mt-3">
            Pressing this will notify their family with your current GPS location.
          </p>
        </div>

      </div>
    </div>
  );
};

export default EmergencyQRScanner;
