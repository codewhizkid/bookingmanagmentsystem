import { BusinessHours } from '../types';

export interface TimeSlotConstraints {
  businessHours: BusinessHours[];
  stylistSchedule?: {
    start_time: string;
    end_time: string;
    break_start?: string;
    break_end?: string;
  };
  existingAppointments: Array<{
    start_time: string;
    end_time: string;
  }>;
}

export const generateAvailableTimeSlots = (
  date: Date,
  constraints: TimeSlotConstraints,
  serviceDuration: number = 60
): string[] => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Find business hours for this day
  const businessHour = constraints.businessHours.find(bh => bh.day_of_week === dayOfWeek);
  
  if (!businessHour || businessHour.is_closed || !businessHour.open_time || !businessHour.close_time) {
    return []; // Salon is closed
  }

  const slots: string[] = [];
  const slotInterval = 30; // 30-minute intervals
  
  // Parse business hours
  const [openHour, openMinute] = businessHour.open_time.split(':').map(Number);
  const [closeHour, closeMinute] = businessHour.close_time.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute; // Convert to minutes
  const closeTime = closeHour * 60 + closeMinute;
  
  // Use stylist schedule if available, otherwise use business hours
  let workStart = openTime;
  let workEnd = closeTime;
  
  if (constraints.stylistSchedule) {
    const [startHour, startMinute] = constraints.stylistSchedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = constraints.stylistSchedule.end_time.split(':').map(Number);
    
    workStart = Math.max(openTime, startHour * 60 + startMinute);
    workEnd = Math.min(closeTime, endHour * 60 + endMinute);
  }
  
  // Generate all possible slots
  for (let time = workStart; time < workEnd; time += slotInterval) {
    // Check if there's enough time for the service before closing
    if (time + serviceDuration > workEnd) {
      break;
    }
    
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check if slot conflicts with existing appointments
    const slotEnd = time + serviceDuration;
    const hasConflict = constraints.existingAppointments.some(apt => {
      const [aptStartHour, aptStartMinute] = apt.start_time.split(':').map(Number);
      const [aptEndHour, aptEndMinute] = apt.end_time.split(':').map(Number);
      
      const aptStart = aptStartHour * 60 + aptStartMinute;
      const aptEnd = aptEndHour * 60 + aptEndMinute;
      
      // Check for overlap
      return (time < aptEnd && slotEnd > aptStart);
    });
    
    // Check if slot conflicts with break time
    let hasBreakConflict = false;
    if (constraints.stylistSchedule?.break_start && constraints.stylistSchedule?.break_end) {
      const [breakStartHour, breakStartMinute] = constraints.stylistSchedule.break_start.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = constraints.stylistSchedule.break_end.split(':').map(Number);
      
      const breakStart = breakStartHour * 60 + breakStartMinute;
      const breakEnd = breakEndHour * 60 + breakEndMinute;
      
      hasBreakConflict = (time < breakEnd && slotEnd > breakStart);
    }
    
    if (!hasConflict && !hasBreakConflict) {
      slots.push(timeString);
    }
  }
  
  return slots;
};

export const isTimeSlotAvailable = (
  date: Date,
  time: string,
  constraints: TimeSlotConstraints,
  serviceDuration: number = 60
): boolean => {
  const availableSlots = generateAvailableTimeSlots(date, constraints, serviceDuration);
  return availableSlots.includes(time);
};

export const getNextAvailableSlot = (
  date: Date,
  constraints: TimeSlotConstraints,
  serviceDuration: number = 60
): string | null => {
  const availableSlots = generateAvailableTimeSlots(date, constraints, serviceDuration);
  return availableSlots.length > 0 ? availableSlots[0] : null;
};

export const formatBusinessHours = (businessHours: BusinessHours[]): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return businessHours
    .sort((a, b) => a.day_of_week - b.day_of_week)
    .map(bh => {
      const dayName = days[bh.day_of_week];
      if (bh.is_closed) {
        return `${dayName}: Closed`;
      }
      return `${dayName}: ${bh.open_time} - ${bh.close_time}`;
    })
    .join('\n');
};