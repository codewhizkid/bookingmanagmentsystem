import React from 'react';
import { Appointment, TimeSlot, Salon, Stylist } from '../../types';
import { generateAvailableTimeSlots } from '../../lib/businessHours';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  weekDays: Date[];
  timeSlots: { time: string; available: boolean }[];
  appointments: Appointment[];
  onTimeSlotClick: (time: string, available: boolean) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  getStatusColor: (status: string) => string;
  selectedStylist: string;
  salon: Salon | null;
  stylists: Stylist[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDays,
  timeSlots,
  appointments,
  onTimeSlotClick,
  onAppointmentClick,
  getStatusColor,
  selectedStylist,
  salon,
  stylists
}) => {
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const filteredAppointments = selectedStylist === 'all' 
      ? appointments 
      : appointments.filter(apt => apt.stylist_id === selectedStylist);
    return filteredAppointments.filter(apt => apt.appointment_date === dateStr);
  };

  const isTimeSlotAvailable = (time: string, date: Date) => {
    if (!salon?.business_hours) return false;
    
    const dayAppointments = getAppointmentsForDate(date);
    const stylistAppointments = selectedStylist === 'all' 
      ? dayAppointments 
      : dayAppointments.filter(apt => apt.stylist_id === selectedStylist);
    
    // Generate available time slots using business logic
    const availableTimeStrings = generateAvailableTimeSlots(
      date,
      {
        businessHours: salon.business_hours || [],
        existingAppointments: stylistAppointments.map(apt => ({
          start_time: apt.start_time,
          end_time: apt.end_time
        }))
      },
      60 // Default service duration
    );
    
    return availableTimeStrings.includes(time);
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
                const isAvailable = isTimeSlotAvailable(slot.time, day) && !slotAppointment;
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={dayIndex}
                    onClick={() => isAvailable && onTimeSlotClick(slot.time, true)}
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