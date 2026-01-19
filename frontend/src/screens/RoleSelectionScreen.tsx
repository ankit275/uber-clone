import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleSelectionScreen() {
  const navigate = useNavigate();
  const { user, setUserRole } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleRoleSelect = (role: 'RIDER' | 'DRIVER' | 'BOTH') => {
    setUserRole(role);

    if (role === 'DRIVER' || role === 'BOTH') {
      // Go to driver registration
      navigate('/register-driver');
    } else if (role === 'RIDER') {
      // Go to rider app
      navigate('/rider');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h1>
            <p className="text-gray-600">What would you like to do today?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rider Only */}
            <div
              onClick={() => handleRoleSelect('RIDER')}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-3">🚗</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Passenger</h3>
                <p className="text-gray-600 mb-4">Book rides and travel</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Continue as Passenger
                </button>
              </div>
            </div>

            {/* Driver Only */}
            <div
              onClick={() => handleRoleSelect('DRIVER')}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-3">🚙</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Driver</h3>
                <p className="text-gray-600 mb-4">Earn money driving</p>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                  Register as Driver
                </button>
              </div>
            </div>

            {/* Both */}
            <div
              onClick={() => handleRoleSelect('BOTH')}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-center">
                <div className="text-5xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Both</h3>
                <p className="text-gray-600 mb-4">Be both driver & passenger</p>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
