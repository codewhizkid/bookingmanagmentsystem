import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabase';
import { Appointment, Service, Stylist, TimeSlot } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Filter,
  Search
} from 'lucide-react';

export const Calendar: React.FC = () => {
  const { salon } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salon?.id) {
      fetchCalendarData();
    }
  }, [salon, currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const [appointmentsData, servicesData, stylistsData] = await Promise.all([
        dbHelpers.getAppointments(salon!.id, dateStr, dateStr),
        dbHelpers.getSalonServices(salon!.id),
        dbHelpers.getSalonStylists(salon!.id)
      ]);

      setAppointments(appointmentsData || []);
      setServices(servicesData || []);
      setStylists(stylistsData || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = appointments.find(apt => apt.start_time === time);
        
        slots.push({
          time,
          available: !appointment,
          appointment
        });
      }
    }
    
    return slots;
  };

  const filteredAppointments = selectedStylist === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.stylist_id === selectedStylist);

  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">Manage appointments and schedules</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewMode === 'day' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  viewMode === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
            </div>

            {/* New Appointment Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentDate.getDate()}
              </div>
              <div className="text-sm text-gray-600">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stylist
                </label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stylists</option>
                  {stylists.map((stylist) => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.user?.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Appointments</span>
                <span className="font-semibold text-gray-900">{filteredAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">
                  ${filteredAppointments.reduce((sum, apt) => sum + apt.total_amount, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Slots</span>
                <span className="font-semibold text-blue-600">
                  {timeSlots.filter(slot => slot.available).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(currentDate)}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{filteredAppointments.length} appointments</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {viewMode === 'day' ? (
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                        slot.available 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {slot.time}
                      </div>
                      
                      {slot.appointment ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(slot.appointment.status)}`} />
                            <div>
                              <p className="font-medium text-gray-900">
                                {slot.appointment.customer?.full_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {slot.appointment.service?.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${slot.appointment.total_amount}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.appointment.stylist?.user?.full_name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="text-sm">Available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Week view coming soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};