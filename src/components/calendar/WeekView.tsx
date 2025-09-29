import React from 'react';
import { Appointment, TimeSlot } from '../../types';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  weekDays: Date[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  onTimeSlotClick: (time: string, available: boolean, date?: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  getStatusColor: (status: string) => string;
  selectedStylist: string;
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDays,
  timeSlots,
  appointments,
  onTimeSlotClick,
  onAppointmentClick,
  getStatusColor,
  selectedStylist
}) => {
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filteredAppointments = selectedStylist === 'all' 
      ? appointments 
      : appointments.filter(apt => apt.stylist_id === selectedStylist);
    return filteredAppointments.filter(apt => apt.appointment_date === dateStr);
  };

  const isBusinessHour = (time: string, date: Date) => {
    // Basic business hours logic - 9 AM to 6 PM, Monday to Saturday
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return false; // Sunday closed
    
    const [hours] = time.split(':').map(Number);
    return hours >= 9 && hours < 18;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-white p-4 font-medium text-gray-900">Time</div>
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={index} className={`bg-white p-4 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                <div className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                  {day.getDate()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {getAppointmentsForDate(day).length} apt{getAppointmentsForDate(day).length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Grid */}
        <div className="space-y-1">
          {timeSlots.map((slot) => (
            <div key={slot.time} className="grid grid-cols-8 gap-px bg-gray-200 rounded">
              <div className="bg-white p-3 text-sm font-medium text-gray-600 flex items-center justify-center">
                {slot.time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(day);
                const slotAppointment = dayAppointments.find(apt => apt.start_time === slot.time);
                const isAvailable = isBusinessHour(slot.time, day) && !slotAppointment;
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => isAvailable && onTimeSlotClick(slot.time, true, day)}
                    className={`bg-white p-2 min-h-[60px] transition-all duration-200 border-l-2 ${
                      isToday ? 'border-l-blue-300 bg-blue-50/30' : 'border-l-transparent'
                    } ${
                      slotAppointment 
                        ? 'cursor-pointer hover:bg-gray-50' 
                        : isAvailable
                        ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-200'
                        : 'bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    {slotAppointment ? (
                      <div
                        onClick={(e) => { e.stopPropagation(); onAppointmentClick(slotAppointment); }}
                        className={`p-2 rounded text-xs text-white hover:shadow-sm transition-all duration-200 cursor-pointer ${getStatusColor(slotAppointment.status)}`}
                        style={{ minHeight: '44px' }}
                      >
                        <div className="font-medium truncate text-xs">
                          {slotAppointment.customer?.full_name}
                        </div>
                        <div className="truncate opacity-90 text-xs mt-1">
                          {slotAppointment.service?.name}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          ${slotAppointment.total_amount}
                        </div>
                      </div>
                    ) : isAvailable ? (
                      <div className="flex items-center justify-center h-full text-gray-400 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <Plus className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
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
  );
};