"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  user?: any;
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'USER',
    photoURL: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        displayName: user.displayName || '',
        role: user.role || 'USER',
        photoURL: user.photoURL || ''
      });
    } else {
      setFormData({
        email: '',
        displayName: '',
        role: 'USER',
        photoURL: ''
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      uid: user?.uid
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USER">👤 User</option>
              <option value="OWNER">🏢 Owner</option>
              <option value="ADMIN">🛡️ Admin</option>
            </select>
          </div>

          {user && (
            <div className="bg-blue-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">⚡ Quick Actions</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onSave({ ...formData, role: 'USER' });
                    onClose();
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>👤</span>
                  Convert to User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSave({ ...formData, role: 'OWNER' });
                    onClose();
                  }}
                  className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🏢</span>
                  Convert to Owner
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
