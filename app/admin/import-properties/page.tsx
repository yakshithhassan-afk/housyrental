'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import propertiesData from '@/data/properties';

export default function ImportPropertiesPage() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState({ total: 0, imported: 0 });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const handleImport = async () => {
    if (!confirm('This will import all properties from /data/properties.ts to Firebase. Continue?')) return;
    
    setIsImporting(true);
    setLogs([]);
    addLog('🚀 Starting property import...');
    addLog(`📦 Total properties to import: ${propertiesData.length}`);

    try {
      const { db } = await import('@/lib/firebase');
      
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      let imported = 0;
      let failed = 0;

      for (const property of propertiesData) {
        try {
          // Convert property to admin dashboard format
          const propertyData = {
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
            source: 'homepage_data_import'
          };

          // Save to Firestore
          const propertyRef = doc(db, 'properties', property.property_id);
          await setDoc(propertyRef, propertyData, { merge: true });

          imported++;
          setProgress({ total: propertiesData.length, imported });
          addLog(`✅ Imported: ${property.name} (${property.property_id})`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          failed++;
          addLog(`❌ Failed to import ${property.name}: ${error.message}`);
        }
      }

      addLog('');
      addLog('🎉 Import completed!');
      addLog(`✅ Successfully imported: ${imported} properties`);
      if (failed > 0) {
        addLog(`❌ Failed: ${failed} properties`);
      }
      addLog('');
      addLog('👉 Go to Admin Dashboard → Properties tab to view all properties!');

    } catch (error: any) {
      addLog(`❌ Critical error: ${error.message}`);
    }

    setIsImporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Import Properties to Firebase</h1>
              <p className="text-gray-600">Move all homepage properties to Firebase Firestore</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-indigo-100 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">📋 What will be imported:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• All {propertiesData.length} properties from /data/properties.ts</li>
              <li>• Property details (name, location, price, type)</li>
              <li>• Amenities and descriptions</li>
              <li>• Images and metadata</li>
              <li>• Ready to appear in Admin Dashboard → Properties tab</li>
            </ul>
          </div>

          {/* Progress */}
          {progress.total > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-green-900">Import Progress</span>
                <span className="text-green-700 font-bold">{progress.imported} / {progress.total}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.imported / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isImporting ? '⏳ Importing Properties...' : '🚀 Import All Properties to Firebase'}
          </button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              📝 Import Log
              <button
                onClick={() => setLogs([])}
                className="text-sm text-indigo-600 hover:underline ml-2"
              >
                Clear
              </button>
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-1">
              {logs.map((log, index) => (
                <div key={index} className={`${
                  log.startsWith('✅') ? 'text-green-600' :
                  log.startsWith('❌') ? 'text-red-600' :
                  log.startsWith('🎉') ? 'text-indigo-600 font-bold' :
                  log.startsWith('👉') ? 'text-indigo-600 font-bold' :
                  'text-gray-700'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-4">📖 How It Works:</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">1.</span>
              Click "Import All Properties to Firebase" button
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">2.</span>
              Script reads all properties from /data/properties.ts
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">3.</span>
              Each property is converted to Firestore format
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">4.</span>
              Properties are saved with their original property_id
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-indigo-600">5.</span>
              Visit Admin Dashboard → Properties tab to see all imported properties
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
