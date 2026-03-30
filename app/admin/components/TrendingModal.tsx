import { useState, useEffect } from 'react';
import { X, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface TrendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Property {
  property_id: string;
  name: string;
  location: string;
  price: number;
  type: string;
  image: string;
}

export default function TrendingModal({ isOpen, onClose }: TrendingModalProps) {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedTrending, setSelectedTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchTrending();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const snapshot = await getDocs(collection(db, 'properties'));
      const props: Property[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        props.push({
          property_id: doc.id,
          name: data.name || data.title || '',
          location: data.location || '',
          price: data.price || 0,
          type: data.type || 'Apartment',
          image: data.image || ''
        });
      });
      setAllProperties(props);
      console.log('📊 Loaded properties:', props.length);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      if (!db) throw new Error('Firestore not initialized');
      const snapshot = await getDocs(collection(db, 'trending-properties'));
      const trendingIds: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.propertyId) {
          trendingIds.push(data.propertyId);
        }
      });
      setSelectedTrending(trendingIds);
      console.log('🔥 Current trending:', trendingIds.length);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const handleToggleTrending = async (propertyId: string) => {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const isAlreadyTrending = selectedTrending.includes(propertyId);

      if (isAlreadyTrending) {
        // Remove from trending
        await deleteDoc(doc(db, 'trending-properties', propertyId));
        setSelectedTrending(prev => prev.filter(id => id !== propertyId));
        toast.success('✅ Removed from trending properties');
      } else {
        // Add to trending (max 3)
        if (selectedTrending.length >= 3) {
          toast.error('❌ Can only have maximum 3 trending properties. Remove one first.');
          return;
        }

        await setDoc(doc(db, 'trending-properties', propertyId), {
          propertyId,
          addedAt: new Date().toISOString(),
          order: selectedTrending.length + 1
        });
        setSelectedTrending(prev => [...prev, propertyId]);
        toast.success('✅ Added to trending properties!');
      }

      // Notify all pages to refresh
      window.dispatchEvent(new CustomEvent('properties-updated'));
    } catch (error: any) {
      console.error('Error updating trending:', error);
      toast.error('Failed to update: ' + error.message);
    }
  };

  if (!isOpen) return null;

  const availableProperties = allProperties.filter(p => !selectedTrending.includes(p.property_id));

  return (
    <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manage Trending Properties</h3>
              <p className="text-sm text-gray-500">Select up to 3 properties to feature as trending</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Current Trending */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔥 Currently Trending ({selectedTrending.length}/3)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedTrending.map((propertyId) => {
              const property = allProperties.find(p => p.property_id === propertyId);
              if (!property) return null;

              return (
                <div key={propertyId} className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 border-2 border-orange-200 rounded-xl p-4">
                  <button
                    onClick={() => handleToggleTrending(propertyId)}
                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h5 className="font-bold text-gray-900 text-sm mb-1">{property.name}</h5>
                  <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                  <div className="text-orange-600 font-bold text-sm">₹{property.price.toLocaleString()}</div>
                </div>
              );
            })}
            {selectedTrending.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No trending properties selected. Choose from available properties below.
              </div>
            )}
          </div>
        </div>

        {/* Available Properties */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Available Properties ({availableProperties.length})
          </h4>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading properties...</div>
          ) : availableProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {allProperties.length === 0 
                ? 'No properties in database. Add some properties first!'
                : 'All properties are already trending!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableProperties.map((property) => (
                <div
                  key={property.property_id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg transition-all"
                >
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h5 className="font-bold text-gray-900 text-sm mb-1">{property.name}</h5>
                  <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700 font-bold text-sm">₹{property.price.toLocaleString()}</div>
                    <button
                      onClick={() => handleToggleTrending(property.property_id)}
                      disabled={selectedTrending.length >= 3}
                      className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {selectedTrending.length >= 3 ? 'Max Reached' : '+ Add to Trending'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-indigo-100 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ How it works:</strong> Trending properties appear at the top of the homepage and user dashboard. 
            You can have a maximum of 3 trending properties at any time. Remove a property to add a new one.
            Changes reflect automatically on all pages.
          </p>
        </div>
      </div>
    </div>
  );
}
