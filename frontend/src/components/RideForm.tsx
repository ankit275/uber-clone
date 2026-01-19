import { useState } from 'react';
import { Location, RideTier } from '../types';

interface RideFormProps {
  onSubmit: (pickup: Location, destination: Location, tier: RideTier) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function RideForm({ onSubmit, onCancel, loading = false }: RideFormProps) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupLat, setPickupLat] = useState('');
  const [pickupLng, setPickupLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
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

    if (!pickupLat || !pickupLng) {
      setErrors({ pickup: 'Pickup coordinates required' });
      return;
    }

    if (!destLat || !destLng) {
      setErrors({ destination: 'Destination coordinates required' });
      return;
    }

    const pickupLocation: Location = {
      latitude: parseFloat(pickupLat),
      longitude: parseFloat(pickupLng),
      address: pickupAddress,
    };

    const destinationLocation: Location = {
      latitude: parseFloat(destLat),
      longitude: parseFloat(destLng),
      address: destinationAddress,
    };

    onSubmit(pickupLocation, destinationLocation, tier);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Ride</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Address
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupLat" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Latitude
              </label>
              <input
                id="pickupLat"
                type="number"
                step="0.0001"
                value={pickupLat}
                onChange={(e) => setPickupLat(e.target.value)}
                placeholder="e.g., 37.7749"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="pickupLng" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Longitude
              </label>
              <input
                id="pickupLng"
                type="number"
                step="0.0001"
                value={pickupLng}
                onChange={(e) => setPickupLng(e.target.value)}
                placeholder="e.g., -122.4194"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination Address
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="destLat" className="block text-sm font-medium text-gray-700 mb-1">
                Destination Latitude
              </label>
              <input
                id="destLat"
                type="number"
                step="0.0001"
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                placeholder="e.g., 37.8044"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="destLng" className="block text-sm font-medium text-gray-700 mb-1">
                Destination Longitude
              </label>
              <input
                id="destLng"
                type="number"
                step="0.0001"
                value={destLng}
                onChange={(e) => setDestLng(e.target.value)}
                placeholder="e.g., -122.2712"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
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