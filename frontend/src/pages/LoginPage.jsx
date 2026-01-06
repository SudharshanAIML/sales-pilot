import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';
import { 
  Mail,
  AlertCircle,
  ArrowLeft,
  Apple,
  Linkedin,
  Eye,
  EyeOff,
  Building2,
  Shield
} from 'lucide-react';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mode states: 'default' | 'admin-register' | 'invite'
  const [mode, setMode] = useState('default');
  
  // Get invite token from URL if present
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (inviteToken) {
      setMode('invite');
    }
  }, [inviteToken]);

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => {
              setMode('default');
              setError('');
            }}
            className="mb-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all inline-flex"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
             {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white-100 rounded-2xl mb-6">
              <img src="/vite.png" alt="Logo" className="w-12 h-12" />
            </div>
    
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Organization
              </h1>
              <p className="text-gray-500 text-sm">
                Set up your CRM account and start managing your team
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

             {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="col-span-3 w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="100%"
                useOneTap={false}
              />
            </div>
          </div>

          {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>




            {/* Steps Dialog Boxes */}
            <div className="mb-8 flex flex-col gap-4">
              {/* Step 1 */}
              <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-lg mr-4">
                  <Building2 className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">Create your company</h3>
                  <p className="text-sm text-gray-700">Set up your organization profile</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-lg mr-4">
                  <Mail className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">Invite your team</h3>
                  <p className="text-sm text-gray-700">Add employees via email invitations</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">Full admin access</h3>
                  <p className="text-sm text-gray-700">Manage team, leads, and analytics</p>
                </div>
              </div>
            </div>
            
            

            {/* Footer */}
            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white-100 rounded-2xl mb-6">
              <img src="/vite.png" alt="Logo" className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to your Sales Pilot account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}


          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="col-span-3 w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                width="100%"
                useOneTap={false}
              />
            </div>
          </div>


           {/* Invitation Required Dialog */}
              <div className="mb-6 w-full">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                  <h2 className="text-lg font-semibold text-yellow-900 mb-2">Invitation Required</h2>
                  <p className="text-sm text-yellow-800">Only invited team members can access this platform. Contact your administrator if you need access.</p>
                </div>
            </div>




          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          
          {/* Create Organization Button */}
          <button
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mb-6 flex items-center justify-center gap-2"
            onClick={() => {
              setMode('admin-register');
              setError('');
            }}
          >
            {loading ? (
              'loading...'
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-7a2 2 0 0 1 2-2h3V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5h3a2 2 0 0 1 2 2v7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
                </svg>
                Create Organization
              </>
            )}
          </button>

          

          {/* Footer */}
            <p className="text-center text-xs text-gray-500">
              By signing in, you agree to our Terms and Privacy Policy
            </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;