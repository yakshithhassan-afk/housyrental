'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, Database, Home, Users } from 'lucide-react';
import { propertiesData } from '@/data/properties';

export default function MigrateDemoData() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({
    propertiesSynced: 0,
    usersFound: 0
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    addLog('🚀 Starting demo data migration to Firebase...');

    try {
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc, Timestamp, collection, getDocs } = await import('firebase/firestore');

      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Migrate Properties
      addLog(`📊 Found ${propertiesData.length} demo properties to migrate...`);
      
      let propertiesCount = 0;
      for (const property of propertiesData) {
        try {
          const propertyRef = doc(db, 'properties', property.property_id);
          await setDoc(propertyRef, {
            name: property.name,
            title: property.name,
            description: property.description || `${property.type} in ${property.location}`,
            location: property.location,
            city: property.city,
            type: property.type.toUpperCase(),
            price: property.price,
            rentalType: property.rental_type === 'Rent' ? 'RENT' : 'SALE',
            status: 'Active',
            bedrooms: property.bedrooms.toString(),
            bathrooms: property.bathrooms.toString(),
            area: property.area,
            amenities: property.amenities || [],
            image: property.image,
            images: [{ url: property.image, alt: property.name }],
            ownerId: 'system',
            featured: true,
            views: Math.floor(Math.random() * 1000) + 500,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            migratedFrom: 'demo_data'
          });
          
          propertiesCount++;
          addLog(`✅ Migrated property: ${property.name} (${property.property_id})`);
        } catch (error: any) {
          addLog(`❌ Error migrating ${property.name}: ${error.message}`);
        }
      }

      setStats(prev => ({ ...prev, propertiesSynced: propertiesCount }));
      addLog(`✨ Successfully migrated ${propertiesCount} properties to Firestore`);

      // Check for existing users in Firestore
      addLog('🔍 Checking for existing users...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let usersCount = 0;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email !== 'admin@gmail.com' && userData.role !== 'ADMIN') {
          usersCount++;
          addLog(`👤 Found user: ${userData.email} (${userData.role})`);
        }
      });

      setStats(prev => ({ ...prev, usersFound: usersCount }));
      addLog(`📊 Total non-admin users in Firestore: ${usersCount}`);

      setCompleted(true);
      addLog('🎉 Migration completed successfully!');
      
    } catch (error: any) {
      addLog(`❌ Migration error: ${error.message}`);
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Database className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Demo Data Migration</h1>
              <p className="text-gray-600 mt-1">Import demo properties to Firebase Firestore</p>
            </div>
          </div>

          {!completed ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">This will import:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {propertiesData.length} demo properties from /data/properties.ts</li>
                      <li>• All property details, images, and amenities</li>
                      <li>• Mark as "featured" properties</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMigration}
                disabled={isMigrating}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                <Upload className="w-6 h-6" />
                {isMigrating ? 'Migrating...' : 'Start Migration'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <p className="text-xl font-bold text-green-900">Migration Complete!</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-indigo-600" />
                      <p className="text-sm font-medium text-gray-700">Properties Synced</p>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.propertiesSynced}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-700">Users Found</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.usersFound}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    View Home Page
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Migration Logs
            </h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
