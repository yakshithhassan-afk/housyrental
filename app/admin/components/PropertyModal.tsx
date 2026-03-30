"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: any) => void;
  property?: any;
}

export default function PropertyModal({ isOpen, onClose, onSave, property }: PropertyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    location: '',
    type: 'Apartment',
    price: 0,
    ownerId: '',
    status: 'Active',
    bedrooms: '1',
    bathrooms: '1',
    area: 0,
    // Enhanced amenities
    furnishingStatus: 'Unfurnished',
    availableFrom: new Date().toISOString().split('T')[0],
    floor: '',
    totalFloors: '',
    parking: 'None',
    facing: 'North',
    // Amenities
    amenities: {
      gym: false,
      swimmingPool: false,
      clubhouse: false,
      childrenPlayArea: false,
      spa: false,
      basketballCourt: false,
      yogaRoom: false,
      joggingTrack: false,
      security24_7: false,
      cctv: false,
      intercom: false,
      powerBackup: false,
      waterSupply: 'Municipal',
      rainwaterHarvesting: false,
      sewageTreatment: false,
      elevator: false,
      wasteManagement: false,
      petFriendly: false,
      seniorCitizenFriendly: false,
      wheelchairAccessible: false
    }
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || property.title || '',
        title: property.title || property.name || '',
        description: property.description || '',
        location: property.location || '',
        type: property.type || 'Apartment',
        price: typeof property.price === 'number' ? property.price : 0,
        ownerId: property.ownerId || '',
        status: property.status || 'Active',
        bedrooms: property.bedrooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1',
        area: typeof property.area === 'number' ? property.area : 0,
        furnishingStatus: property.furnishingStatus || 'Unfurnished',
        availableFrom: property.availableFrom || new Date().toISOString().split('T')[0],
        floor: property.floor?.toString() || '',
        totalFloors: property.totalFloors?.toString() || '',
        parking: property.parking || 'None',
        facing: property.facing || 'North',
        amenities: property.amenities && typeof property.amenities === 'object' && !Array.isArray(property.amenities)
          ? property.amenities
          : {
              gym: false,
              swimmingPool: false,
              clubhouse: false,
              childrenPlayArea: false,
              spa: false,
              basketballCourt: false,
              yogaRoom: false,
              joggingTrack: false,
              security24_7: false,
              cctv: false,
              intercom: false,
              powerBackup: false,
              waterSupply: 'Municipal',
              rainwaterHarvesting: false,
              sewageTreatment: false,
              elevator: false,
              wasteManagement: false,
              petFriendly: false,
              seniorCitizenFriendly: false,
              wheelchairAccessible: false
            }
      });
    } else {
      setFormData({
        name: '',
        title: '',
        description: '',
        location: '',
        type: 'Apartment',
        price: 0,
        ownerId: '',
        status: 'Active',
        bedrooms: '1',
        bathrooms: '1',
        area: 0,
        furnishingStatus: 'Unfurnished',
        availableFrom: new Date().toISOString().split('T')[0],
        floor: '',
        totalFloors: '',
        parking: 'None',
        facing: 'North',
        amenities: {
          gym: false,
          swimmingPool: false,
          clubhouse: false,
          childrenPlayArea: false,
          spa: false,
          basketballCourt: false,
          yogaRoom: false,
          joggingTrack: false,
          security24_7: false,
          cctv: false,
          intercom: false,
          powerBackup: false,
          waterSupply: 'Municipal',
          rainwaterHarvesting: false,
          sewageTreatment: false,
          elevator: false,
          wasteManagement: false,
          petFriendly: false,
          seniorCitizenFriendly: false,
          wheelchairAccessible: false
        }
      });
    }
  }, [property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: property?.id
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Name / Title
              </label>
              <input
                type="text"
                value={formData.name || formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Bangalore, India"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Property description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="PG">PG</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Rented">Rented</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={formData.bedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">Studio</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bathrooms
              </label>
              <select
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner ID
              </label>
              <input
                type="text"
                value={formData.ownerId}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Owner's UID"
              />
            </div>
          </div>

          {/* Amenities Section */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🏠 Amenities & Features</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Lifestyle Amenities */}
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.gym}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, gym: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">💪 Gym/Fitness Center</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.swimmingPool}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, swimmingPool: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🏊 Swimming Pool</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.clubhouse}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, clubhouse: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🎉 Clubhouse</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.childrenPlayArea}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, childrenPlayArea: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🎮 Children's Play Area</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.spa}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, spa: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">💆 Spa/Sauna</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.basketballCourt}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, basketballCourt: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🏀 Basketball Court</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.yogaRoom}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, yogaRoom: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🧘 Yoga/Meditation Room</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.joggingTrack}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, joggingTrack: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🏃 Jogging Track</span>
              </label>

              {/* Security & Safety */}
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.security24_7}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, security24_7: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🛡️ 24/7 Security</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.cctv}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, cctv: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">📹 CCTV Surveillance</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.intercom}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, intercom: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">📞 Intercom Facility</span>
              </label>

              {/* Utilities */}
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.powerBackup}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, powerBackup: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">⚡ Power Backup</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.rainwaterHarvesting}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, rainwaterHarvesting: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🌧️ Rainwater Harvesting</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.sewageTreatment}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, sewageTreatment: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">♻️ Sewage Treatment Plant</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.elevator}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, elevator: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🛗 Elevator/Lift</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.wasteManagement}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, wasteManagement: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🗑️ Waste Management</span>
              </label>

              {/* Accessibility */}
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.petFriendly}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, petFriendly: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">🐾 Pet Friendly</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.seniorCitizenFriendly}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, seniorCitizenFriendly: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">👴 Senior Citizen Friendly</span>
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-all">
                <input
                  type="checkbox"
                  checked={formData.amenities.wheelchairAccessible}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amenities: { ...prev.amenities, wheelchairAccessible: e.target.checked } 
                  }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">♿ Wheelchair Accessible</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Owner ID
              </label>
              <input
                type="text"
                value={formData.ownerId}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Owner's UID"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              {property ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
