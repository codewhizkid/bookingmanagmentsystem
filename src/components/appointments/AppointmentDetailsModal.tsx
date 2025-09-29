import React, { useState } from 'react';
import { Appointment } from '../../types';
import { dbHelpers } from '../../lib/supabase';
import { 
  X, 
  Clock, 
  User, 
  Scissors, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen || !appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await dbHelpers.updateAppointmentStatus(appointment.id, newStatus);
      onAppointmentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await dbHelpers.updateAppointmentStatus(appointment.id, 'cancelled', cancelReason);
      onAppointmentUpdated();
      onClose();
      setShowCancelConfirm(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = ['pending', 'confirmed'].includes(appointment.status);
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);
  const canComplete = ['confirmed', 'in_progress'].includes(appointment.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                <span className="text-sm font-medium capitalize">
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {appointment.start_time} - {appointment.end_time}
                </p>
                <p className="text-sm text-gray-600">
                  {appointment.service?.duration_minutes} minutes
                </p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{appointment.customer?.full_name}</p>
                {appointment.customer?.email && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">{appointment.customer.email}</p>
                  </div>
                )}
                {appointment.customer?.phone && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">{appointment.customer.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start space-x-3">
              <Scissors className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{appointment.service?.name}</p>
                <p className="text-sm text-gray-600">{appointment.service?.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">with {appointment.stylist?.user?.full_name}</span>
                  <span className="font-semibold text-green-600">${appointment.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}

            {/* Internal Notes */}
            {appointment.internal_notes && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Internal Notes</h4>
                <p className="text-sm text-blue-800">{appointment.internal_notes}</p>
              </div>
            )}

            {/* Payment Status */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Payment Status</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                appointment.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : appointment.payment_status === 'partial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {appointment.payment_status.toUpperCase()}
              </span>
            </div>

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Cancel Appointment</h4>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (optional)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-2">
              {canEdit && (
                <button
                  onClick={() => {/* TODO: Open edit modal */}}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                >
                  Confirm
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                >
                  Start Service
                </button>
              )}
              {canComplete && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};