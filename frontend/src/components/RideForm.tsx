import { useState } from 'react';
import { Location, RideTier } from '../types';
import { mockService } from '../services/mockService';

interface RideFormProps {
  onSubmit: (pickup: Location, destination: Location, tier: RideTier) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function RideForm({ onSubmit, onCancel, loading = false }: RideFormProps) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [tier, setTier] = useState<RideTier>(RideTier.BASIC);
  const [errors, setErrors] = useState<{ pickup?: string; destination?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!pickupAddress.trim()) {
      setErrors({ pickup: 'Pickup location is required' });
      return;
    }

    if (!destinationAddress.trim()) {
      setErrors({ destination: 'Destination is required' });
      return;
    }

    if (pickupAddress.trim() === destinationAddress.trim()) {
      setErrors({ destination: 'Destination must be different from pickup' });
      return;
    }

    try {
      // In production, this would use a real geocoding service
      const pickupLocation = await mockService.geocodeAddress(pickupAddress);
      const destinationLocation = await mockService.geocodeAddress(destinationAddress);

      onSubmit(pickupLocation, destinationLocation, tier);
    } catch (error) {
      setErrors({ pickup: 'Failed to geocode locations' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Ride</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <input
            id="pickup"
            type="text"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="Enter pickup address"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.pickup ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.pickup && (
            <p className="mt-1 text-sm text-red-600">{errors.pickup}</p>
          )}
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Enter destination address"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.destination ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
          )}
        </div>

        <div>
          <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-1">
            Ride Tier
          </label>
          <select
            id="tier"
            value={tier}
            onChange={(e) => setTier(e.target.value as RideTier)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={RideTier.BASIC}>Basic</option>
            <option value={RideTier.PREMIUM}>Premium</option>
            <option value={RideTier.LUXURY}>Luxury</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Requesting...' : 'Request Ride'}
          </button>
        </div>
      </form>
    </div>
  );
}