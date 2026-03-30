"use client";

import { useState, useEffect } from 'react';
import { X, Bell, Send, CheckCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentData: any) => void;
  payment?: any;
  users?: any[];
  onRefreshUserData?: (payment: any) => void;
}

export default function PaymentModal({ isOpen, onClose, onSave, payment, users, onRefreshUserData }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    amount: 0,
    type: 'Rent',
    status: 'Pending',
    dueDate: new Date().toISOString().split('T')[0],
    paidDate: '',
    propertyId: '',
    description: '',
    paymentMethod: 'Online'
  });

  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');

  useEffect(() => {
    if (payment) {
      setFormData({
        userId: payment.userId || '',
        userName: payment.userName || '',
        amount: payment.amount || 0,
        type: payment.type || 'Rent',
        status: payment.status || 'Pending',
        dueDate: payment.dueDate || new Date().toISOString().split('T')[0],
        paidDate: payment.paidDate || '',
        propertyId: payment.propertyId || '',
        description: payment.description || '',
        paymentMethod: payment.paymentMethod || 'Online'
      });
    } else {
      setFormData({
        userId: '',
        userName: '',
        amount: 0,
        type: 'Rent',
        status: 'Pending',
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: '',
        propertyId: '',
        description: '',
        paymentMethod: 'Online'
      });
    }
  }, [payment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: payment?.id
    });
  };

  const handleSendNotification = async () => {
    try {
      // Here you would integrate with email/SMS service
      // For now, we'll simulate it
      console.log('Sending notification to:', formData.userName, formData.userId);
      console.log('Message:', notifyMessage);
      
      // Save notification record
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc, Timestamp } = await import('firebase/firestore');
      
      if (db && formData.userId) {
        const notificationRef = doc(db, 'notifications', `notif_${Date.now()}`);
        await setDoc(notificationRef, {
          userId: formData.userId,
          userName: formData.userName,
          message: notifyMessage,
          type: 'payment_reminder',
          paymentId: payment?.id,
          sentAt: Timestamp.now(),
          status: 'sent',
          read: false
        });
        
        alert('✅ Notification sent successfully to ' + formData.userName);
        setShowNotifyForm(false);
        setNotifyMessage('');
      }
    } catch (error: any) {
      alert('❌ Failed to send notification: ' + error.message);
    }
  };

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.uid === userId);
    return user ? user.displayName || user.email : 'Unknown User';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-cyan-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {payment ? 'Edit Payment' : 'Create New Payment'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select User *
            </label>
            <select
              value={formData.userId}
              onChange={(e) => {
                const selectedUser = users?.find(u => u.uid === e.target.value);
                setFormData(prev => ({ 
                  ...prev, 
                  userId: e.target.value,
                  userName: selectedUser?.displayName || selectedUser?.email || ''
                }));
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a user...</option>
              {users?.filter(u => u.role !== 'ADMIN').map(user => (
                <option key={user.uid} value={user.uid}>
                  {user.displayName || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Rent">🏠 Rent</option>
                <option value="Security Deposit">🔒 Security Deposit</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Utilities">⚡ Utilities</option>
                <option value="Other">📝 Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pending">⏳ Pending</option>
                <option value="Paid">✅ Paid</option>
                <option value="Overdue">🔴 Overdue</option>
                <option value="Partial">💰 Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Online">💻 Online Transfer</option>
                <option value="Cash">💵 Cash</option>
                <option value="Check">📄 Check</option>
                <option value="UPI">📱 UPI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paid Date (if applicable)
              </label>
              <input
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paidDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property ID (Optional)
            </label>
            <input
              type="text"
              value={formData.propertyId}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Property reference"
            />
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
              placeholder="Payment details..."
            />
          </div>

          {/* Quick Actions Section */}
          {payment && (
            <div className="border-t pt-4 mt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Quick Actions
              </h4>
              
              <div className="space-y-3">
                {/* Notify User Button */}
                {!showNotifyForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifyForm(true);
                      setNotifyMessage(`Hi ${formData.userName}, this is a reminder that your payment of ₹${formData.amount} (${formData.type}) is ${formData.status.toLowerCase()}. Please pay by ${new Date(formData.dueDate).toLocaleDateString()}. Thank you!`);
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Payment Reminder to User
                  </button>
                ) : (
                  <div className="bg-blue-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <p className="text-sm font-medium text-blue-900">
                        Sending notification to: <strong>{formData.userName}</strong>
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        Message (Editable)
                      </label>
                      <textarea
                        value={notifyMessage}
                        onChange={(e) => setNotifyMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendNotification}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNotifyForm(false)}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Mark as Paid Button */}
                {formData.status !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] }));
                      alert('✅ Marked as paid! Don\'t forget to save.');
                    }}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Paid
                  </button>
                )}

                {/* Mark as Overdue Button */}
                {formData.status !== 'Overdue' && formData.status !== 'Paid' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: 'Overdue' }));
                      alert('⚠️ Marked as overdue! Don\'t forget to save.');
                    }}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Mark as Overdue
                  </button>
                )}
              </div>
            </div>
          )}

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
              {payment ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
