import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Activity, Navigation, ExternalLink, ActivitySquare } from 'lucide-react';

const Landing = () => {
  const [searchParams] = useSearchParams();
  const authError = searchParams.get('error');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authed
  useEffect(() => {
    if (user) {
      if (!user.profileComplete) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    // Redirect browser to backend Google auth route
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center">
      {/* ── Navbar Options ── */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-700">
          <ActivitySquare className="w-8 h-8" />
          <h1 className="text-2xl font-black tracking-tight">JeevanSetu</h1>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors border border-transparent"
        >
          Sign In
        </button>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          {authError && (
            <div className="inline-block bg-red-100 text-red-700 font-medium px-4 py-2 rounded-lg mb-6 border border-red-200">
              Authentication failed: {authError.replace(/_/g, ' ')}
            </div>
          )}

          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Intelligent Emergency Response <br />
            <span className="text-blue-600">at Your Fingertips</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
            JeevanSetu is an AI-powered safety platform that instantly analyzes emergencies, guides you with essential medical steps, and helps navigate to the nearest facility in crisis.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="group bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 px-8 rounded-xl shadow border border-slate-200 flex items-center justify-center gap-4 mx-auto lg:mx-0 transition-colors w-full sm:w-80"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="text-lg">Continue with Google</span>
          </button>
          <p className="text-xs text-slate-500 mt-4">
            By signing in, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>

        {/* ── Features Deck ── */}
        <div className="flex-1 w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg border border-blue-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold mb-1">Instant SOS Triggers</h3>
              <p className="text-slate-600 text-sm">One tap trigger combining your location and medical history for first responders.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg border border-blue-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold mb-1">AI Medical Assessment</h3>
              <p className="text-slate-600 text-sm">Real-time Gemini AI analysis provides actionable steps and severity classification.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg border border-blue-200">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold mb-1">Smart Hospital Routing</h3>
              <p className="text-slate-600 text-sm">Direct navigation to the nearest emergency room based on dynamic geolocation mapping.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
