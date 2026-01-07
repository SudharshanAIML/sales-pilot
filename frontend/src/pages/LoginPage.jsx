import { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';
import gsap from 'gsap';
import { 
  Mail,
  AlertCircle,
  ArrowLeft,
  Building2,
  Shield,
  Users,
  Zap
} from 'lucide-react';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const backgroundRef = useRef(null);

  // Mode states: 'default' | 'admin-register' | 'invite'
  const [mode, setMode] = useState('default');
  
  // Get invite token from URL if present
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (inviteToken) {
      setMode('invite');
    }
  }, [inviteToken]);

  // Animated background text effect with GSAP
  useEffect(() => {
    const words = [
      'SALES', 'AI', 'AUTOMATION', 'REVENUE', 'GROWTH', 
      'PROSPECTS', 'LEADS', 'CONVERSION', 'ANALYTICS', 'CRM',
      'OUTREACH', 'ENGAGEMENT', 'PIPELINE', 'FORECAST', 'DEALS'
    ];
    
    if (backgroundRef.current) {
      const container = backgroundRef.current;
      container.innerHTML = '';
      
      // Create floating words
      const wordElements = [];
      for (let i = 0; i < 20; i++) {
        const word = document.createElement('div');
        word.textContent = words[Math.floor(Math.random() * words.length)];
        word.style.position = 'absolute';
        word.style.fontSize = `${Math.random() * 80 + 40}px`;
        word.style.fontWeight = '900';
        word.style.color = 'rgba(14, 165, 233, 0.08)';
        word.style.left = `${Math.random() * 100}%`;
        word.style.top = `${Math.random() * 100}%`;
        word.style.transform = 'translate(-50%, -50%)';
        word.style.userSelect = 'none';
        word.style.pointerEvents = 'none';
        word.style.fontFamily = '"Inter", sans-serif';
        word.style.letterSpacing = '-0.05em';
        container.appendChild(word);
        wordElements.push(word);
      }

      // GSAP animations
      wordElements.forEach((word, index) => {
        // Random floating animation
        gsap.to(word, {
          y: `${Math.random() * 100 - 50}px`,
          x: `${Math.random() * 100 - 50}px`,
          rotation: Math.random() * 20 - 10,
          duration: 10 + Math.random() * 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 2
        });

        // Fade in/out animation
        gsap.to(word, {
          opacity: 0.05 + Math.random() * 0.1,
          duration: 3 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: Math.random() * 3
        });
      });
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const isAdminRegistration = mode === 'admin-register';
      const data = await googleLogin(
        credentialResponse.credential, 
        mode === 'invite' ? inviteToken : null,
        isAdminRegistration
      );
      
      login(data.user, data.token);
      
      if (data.isNewAdmin) {
        navigate('/onboarding');
      }
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message;
      
      if (errorCode === 'NOT_INVITED') {
        setError('You haven\'t been invited to this platform yet. Please ask your administrator for an invitation.');
      } else if (errorCode === 'EMAIL_MISMATCH') {
        setError(errorMessage);
      } else if (errorCode === 'INVALID_INVITE') {
        setError('This invitation link is invalid or has expired. Please ask your administrator for a new invitation.');
      } else if (errorCode === 'PENDING_INVITATION') {
        setError('Please use the invitation link sent to your email to complete your registration.');
      } else if (errorCode === 'ACCOUNT_DISABLED') {
        setError('Your account has been disabled. Please contact your administrator.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  // Admin Registration Mode UI
  if (mode === 'admin-register') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated Background */}
        <div ref={backgroundRef} className="absolute inset-0 overflow-hidden" />
        
        {/* Large SalesPilot Text Behind Card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="text-[180px] font-black text-black/5 tracking-tighter leading-none">
            SalesPilot
          </div>
        </div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* Back Button */}
          <button
            onClick={() => {
              setMode('default');
              setError('');
            }}
            className="mb-6 p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all inline-flex"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Card */}
          <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-500/10 p-10 border-2 border-sky-100">
             {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl mb-6 shadow-lg shadow-sky-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
    
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Create Organization
              </h1>
              <p className="text-slate-600 text-base">
                Set up your AI-powered sales workspace
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

             {/* Google Login Button */}
          <div className="mb-8 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="350"
                useOneTap={false}
                theme="outline"
                size="large"
              />
          </div>

            {/* Steps */}
            <div className="mb-8 flex flex-col gap-3">
              {/* Step 1 */}
              <div className="flex items-center bg-gradient-to-r from-sky-50 to-sky-100/50 border-2 border-sky-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sky-500 rounded-xl mr-4 shadow-lg shadow-sky-500/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Create your company</h3>
                  <p className="text-xs text-slate-600">Set up your organization profile</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-center bg-gradient-to-r from-sky-50 to-sky-100/50 border-2 border-sky-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sky-500 rounded-xl mr-4 shadow-lg shadow-sky-500/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Invite your team</h3>
                  <p className="text-xs text-slate-600">Add employees via email invitations</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-center bg-gradient-to-r from-sky-50 to-sky-100/50 border-2 border-sky-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sky-500 rounded-xl mr-4 shadow-lg shadow-sky-500/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5">Full admin access</h3>
                  <p className="text-xs text-slate-600">Manage team, leads, and analytics</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <p className="text-center text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-sky-600 hover:text-sky-700 font-semibold">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-sky-600 hover:text-sky-700 font-semibold">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  

  // Default Login UI
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div ref={backgroundRef} className="absolute inset-0 overflow-hidden" />
      
      {/* Large SalesPilot Text Behind Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="text-[180px] font-black text-black/5 tracking-tighter leading-none">
          SalesPilot
        </div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-500/10 p-10 border-2 border-sky-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl mb-6 shadow-2xl shadow-sky-500/40">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              Welcome back
            </h1>
            <p className="text-slate-600 text-base">
              Sign in to your SalesPilot workspace
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}


          {/* Google Login Button */}
          <div className="mb-8 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="350"
                useOneTap={false}
                theme="outline"
                size="large"
              />
          </div>


           {/* Invitation Notice */}
              <div className="mb-6 w-full">
                <div className="bg-gradient-to-r from-sky-50 to-sky-100/50 border-2 border-sky-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
                  <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-sky-500/30">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Invitation Required</h2>
                  <p className="text-sm text-slate-600">Only invited team members can access this platform. Contact your administrator for an invite.</p>
                </div>
            </div>




          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          
          {/* Create Organization Button */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-4 px-4 rounded-2xl transition-all disabled:opacity-50 mb-6 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-100"
            onClick={() => {
              setMode('admin-register');
              setError('');
            }}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                Create Organization
              </>
            )}
          </button>

          

          {/* Footer */}
            <p className="text-center text-xs text-slate-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-sky-600 hover:text-sky-700 font-semibold">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-sky-600 hover:text-sky-700 font-semibold">Privacy Policy</a>
            </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;