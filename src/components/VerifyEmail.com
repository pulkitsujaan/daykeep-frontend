import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../api'; // Your axios instance

const VerifyEmail = () => {
  const { token } = useParams(); // 1. Get token from URL
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // 2. Send token to backend
        // Make sure your backend route matches this! 
        // Likely: router.get('/verify/:token', ...) in authRoutes
        await api.get(`/auth/verify/${token}`); 
        setStatus('success');
        
        // 3. Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    if (token) verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-bg p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-2 border-ink/10">
        
        {/* LOADING STATE */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-ink opacity-50" size={48} />
            <h2 className="text-xl font-bold text-ink">Verifying your email...</h2>
            <p className="text-ink/60">Just a moment</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in">
            <CheckCircle className="text-green-500" size={64} />
            <h2 className="text-2xl font-black text-ink">Verified!</h2>
            <p className="text-ink/60">Your account is now active. Redirecting you to login...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in">
            <XCircle className="text-rose-500" size={64} />
            <h2 className="text-2xl font-black text-ink">Verification Failed</h2>
            <p className="text-ink/60">This link might be invalid or expired.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-ink text-white font-bold rounded-xl"
            >
              Back to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;