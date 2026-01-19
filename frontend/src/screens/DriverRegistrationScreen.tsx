import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DriverRegistrationScreen() {
  const navigate = useNavigate();
  const { user, registerDriver } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    licenseNumber: '',
    vehicleModel: '',
    vehiclePlateNumber: '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (
        !formData.phoneNumber.trim() ||
        !formData.licenseNumber.trim() ||
        !formData.vehicleModel.trim() ||
        !formData.vehiclePlateNumber.trim()
      ) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Use a default tenant ID (in production, this would be the user's tenant)
      const tenantId = user.tenantId || 1;

      await registerDriver(
        tenantId,
        formData.phoneNumber,
        formData.licenseNumber,
        formData.vehicleModel,
        formData.vehiclePlateNumber
      );

      // Navigate based on role
      if (user.role === 'BOTH') {
        navigate('/role-selection');
      } else {
        navigate('/driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Driver registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // For BOTH role, go to role selection to choose passenger mode
    if (user.role === 'BOTH') {
      navigate('/role-selection');
    } else {
      navigate('/rider');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Become a Driver</h1>
            <p className="text-gray-600">Register your vehicle to start earning</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Driver License Number
              </label>
              <input
                id="licenseNumber"
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="DL123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model
              </label>
              <input
                id="vehicleModel"
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="e.g., Toyota Prius 2022"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="vehiclePlateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle License Plate
              </label>
              <input
                id="vehiclePlateNumber"
                type="text"
                name="vehiclePlateNumber"
                value={formData.vehiclePlateNumber}
                onChange={handleChange}
                placeholder="ABC123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Skip for Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
