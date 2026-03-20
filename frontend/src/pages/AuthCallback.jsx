import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  
  // Prevent double-execution in StrictMode
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const profileCompleteHeader = searchParams.get('profileComplete');

    if (!token) {
      navigate('/?error=invalid_callback_token', { replace: true });
      return;
    }

    // Pass the token to context immediately 
    // We don't have the full userData yet, so we pass null and let ProtectedRoute fetch it, 
    // or we can just fetch it here. We'll set the token and force a reload to let AuthProvider handle it
    loginWithToken(token, null);

    // Give AuthContext a moment to mount the token
    setTimeout(() => {
      if (profileCompleteHeader === 'true') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/complete-profile', { replace: true });
      }
    }, 100);

  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium tracking-wide">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
