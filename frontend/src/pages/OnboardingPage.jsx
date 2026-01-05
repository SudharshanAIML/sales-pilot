import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployeeOnboardingForm from '../components/forms/EmployeeOnboardingForm';
import { completeEmployeeProfile } from '../services/authService';

const OnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login, isAdmin } = useAuth();

  const handleProfileSubmit = async (profileData) => {
    setLoading(true);
    setError('');

    try {
      // Submit the complete profile data
      const response = await completeEmployeeProfile(profileData);
      
      // Update the user context with complete profile
      const updatedUser = {
        ...user,
        ...response.user,
        profileComplete: true,
      };
      
      // Use the new token from the response (contains updated companyId)
      const newToken = response.token || localStorage.getItem('token');
      
      // Update auth context with new user data and token
      login(updatedUser, newToken);
      
      // Navigate based on role - admins go to admin dashboard
      if (profileData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to complete profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If no user data, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <EmployeeOnboardingForm
        initialData={{
          name: user.name,
          email: user.email,
        }}
        onSubmit={handleProfileSubmit}
        loading={loading}
      />
    </div>
  );
};

export default OnboardingPage;