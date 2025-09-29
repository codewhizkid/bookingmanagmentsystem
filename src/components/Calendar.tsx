import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabase';
import { NewAppointmentModal } from './appointments/NewAppointmentModal';
import { AppointmentDetailsModal } from './appointments/AppointmentDetailsModal';
import { Appointment, Service, Stylist, TimeSlot } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Calendar as CalendarIcon,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
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
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    if (salon?.id) {
      fetchCalendarData();
    }
  }, [salon, currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      if (viewMode === 'week') {
        // Calculate week start (Sunday) and end (Saturday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
      } else {
        const dateStr = currentDate.toISOString().split('T')[0];
        startDate = dateStr;
        endDate = dateStr;
      }
      
      const [appointmentsData, servicesData, stylistsData] = await Promise.all([
        dbHelpers.getAppointments(salon!.id, startDate, endDate),
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

  const generateWeekDays = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredAppointments.filter(apt => apt.appointment_date === dateStr);
  };

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointment = filteredAppointments.find(apt => apt.start_time === time);
        
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
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
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

  const handleTimeSlotClick = (time: string, available: boolean) => {
    if (available) {
      setSelectedTimeSlot(time);
      setShowNewAppointmentModal(true);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleAppointmentUpdated = () => {
    fetchCalendarData();
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200" onClick={() => setShowNewAppointmentModal(true)}>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewMode === 'day' ? formatDate(currentDate) : 'Week View'}
              </h2>
            </div>

            <div className="p-6">
              {viewMode === 'day' ? (
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      onClick={() => handleTimeSlotClick(slot.time, slot.available)}
                      className={`flex items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        slot.available 
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' 
                          : 'border-gray-300 bg-gray-50 cursor-default'
                      }`}
                    >
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {slot.time}
                      </div>
                      
                      {slot.appointment ? (
                        <div 
                          className="flex-1 flex items-center justify-between"
                          onClick={(e) => { e.stopPropagation(); handleAppointmentClick(slot.appointment!); }}
                        >
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
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <div className="bg-white p-4 font-medium text-gray-900">Time</div>
                      {generateWeekDays().map((day, index) => (
                        <div key={index} className="bg-white p-4 text-center">
                          <div className="font-medium text-gray-900">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {day.getDate()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Week Grid */}
                    <div className="space-y-1">
                      {timeSlots.map((slot) => (
                        <div key={slot.time} className="grid grid-cols-8 gap-px bg-gray-200 rounded">
                          <div className="bg-white p-3 text-sm font-medium text-gray-600 flex items-center">
                            {slot.time}
                          </div>
                          {generateWeekDays().map((day, dayIndex) => {
                            const dayAppointments = getAppointmentsForDate(day);
                            const slotAppointment = dayAppointments.find(apt => apt.start_time === slot.time);
                            
                            return (
                              <div
                                key={dayIndex}
                                onClick={() => !slotAppointment && handleTimeSlotClick(slot.time, true)}
                                className={`bg-white p-2 min-h-[60px] transition-all duration-200 ${
                                  slotAppointment 
                                    ? 'cursor-pointer hover:bg-gray-50' 
                                    : 'cursor-pointer hover:bg-blue-50 hover:border-blue-200'
                                }`}
                              >
                                {slotAppointment && (
                                  <div
                                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(slotAppointment); }}
                                    className={`p-2 rounded text-xs ${getStatusColor(slotAppointment.status)} hover:shadow-sm transition-shadow duration-200`}
                                  >
                                    <div className="font-medium truncate">
                                      {slotAppointment.customer?.full_name}
                                    </div>
                                    <div className="truncate opacity-75">
                                      {slotAppointment.service?.name}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => {
          setShowNewAppointmentModal(false);
          setSelectedTimeSlot('');
        }}
        selectedDate={currentDate}
        selectedTime={selectedTimeSlot}
        onAppointmentCreated={handleAppointmentUpdated}
      />

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
};