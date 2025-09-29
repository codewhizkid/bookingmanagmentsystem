import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/supabase';
import { generateAvailableTimeSlots } from '../../lib/businessHours';
import { Service, Stylist, User, TimeSlot } from '../../types';
import { 
  X, 
  Search, 
  Clock, 
  User as UserIcon, 
  Scissors, 
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  onAppointmentCreated: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate = new Date(),
  selectedTime,
  onAppointmentCreated
}) => {
  const { salon } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    serviceId: '',
    stylistId: '',
    customerId: '',
    date: selectedDate.toISOString().split('T')[0],
    time: selectedTime || '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && salon?.id) {
      fetchInitialData();
    }
  }, [isOpen, salon]);

  useEffect(() => {
    if (formData.stylistId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.stylistId, formData.date]);

  const fetchInitialData = async () => {
    try {
      const [servicesData, stylistsData] = await Promise.all([
        dbHelpers.getSalonServices(salon!.id),
        dbHelpers.getSalonStylists(salon!.id)
      ]);

      setServices(servicesData || []);
      setStylists(stylistsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // Get business hours and existing appointments
      const selectedDate = new Date(formData.date);
      const [businessHours, existingAppointments] = await Promise.all([
        // In a real implementation, fetch business hours from salon
        Promise.resolve(salon?.business_hours || []),
        dbHelpers.getAppointments(salon!.id, formData.date, formData.date)
      ]);
      
      // Filter appointments for selected stylist
      const stylistAppointments = existingAppointments?.filter(apt => 
        apt.stylist_id === formData.stylistId
      ) || [];
      
      // Get selected service duration
      const selectedService = services.find(s => s.id === formData.serviceId);
      const serviceDuration = selectedService?.duration_minutes || 60;
      
      // Generate available slots using business logic
      const availableTimeStrings = generateAvailableTimeSlots(
        selectedDate,
        {
          businessHours: businessHours || [],
          existingAppointments: stylistAppointments.map(apt => ({
            start_time: apt.start_time,
            end_time: apt.end_time
          }))
        },
        serviceDuration
      );
      
      const slots: TimeSlot[] = availableTimeStrings.map(time => ({
        time,
        available: true
      }));
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const searchCustomers = async (term: string) => {
    if (!term.trim()) {
      setCustomers([]);
      return;
    }

    try {
      // In a real implementation, this would search the customers table
      // For now, we'll simulate with sample data
      const mockCustomers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          full_name: 'John Doe',
          phone: '(555) 123-4567',
          role: 'customer',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          full_name: 'Jane Smith',
          phone: '(555) 987-6543',
          role: 'customer',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const filtered = mockCustomers.filter(customer =>
        customer.full_name.toLowerCase().includes(term.toLowerCase()) ||
        customer.email.toLowerCase().includes(term.toLowerCase())
      );

      setCustomers(filtered);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchCustomers(term);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceId) newErrors.serviceId = 'Service is required';
    if (!formData.stylistId) newErrors.stylistId = 'Stylist is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedService = services.find(s => s.id === formData.serviceId);
      if (!selectedService) throw new Error('Service not found');

      const startTime = formData.time;
      const [hours, minutes] = startTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + selectedService.duration_minutes);
      const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

      const appointmentData = {
        salon_id: salon!.id,
        customer_id: formData.customerId,
        stylist_id: formData.stylistId,
        service_id: formData.serviceId,
        appointment_date: formData.date,
        start_time: startTime,
        end_time: endTimeStr,
        total_amount: selectedService.price,
        notes: formData.notes,
        status: 'pending'
      };

      await dbHelpers.createAppointment(appointmentData);
      onAppointmentCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrors({ submit: 'Failed to create appointment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceId: '',
      stylistId: '',
      customerId: '',
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime || '',
      notes: ''
    });
    setSearchTerm('');
    setCustomers([]);
    setErrors({});
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a new booking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{errors.submit}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Scissors className="w-4 h-4 inline mr-1" />
                  Service
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.serviceId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration_minutes}min)
                    </option>
                  ))}
                </select>
                {errors.serviceId && <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>}
              </div>

              {/* Stylist Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Stylist
                </label>
                <select
                  value={formData.stylistId}
                  onChange={(e) => setFormData(prev => ({ ...prev, stylistId: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.stylistId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a stylist</option>
                  {stylists.map((stylist) => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.user?.full_name}
                    </option>
                  ))}
                </select>
                {errors.stylistId && <p className="mt-1 text-xs text-red-600">{errors.stylistId}</p>}
              </div>
            </div>

            {/* Customer Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Customer
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search customers by name or email..."
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              
              {customers.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, customerId: customer.id }));
                        setSearchTerm(customer.full_name);
                        setCustomers([]);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{customer.full_name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    </button>
                  ))}
                </div>
              )}
              {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.time ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.time} value={slot.time} disabled={!slot.available}>
                      {slot.time} {!slot.available && '(Unavailable)'}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Any special requests or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Summary */}
            {selectedService && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Appointment Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedService.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${selectedService.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};