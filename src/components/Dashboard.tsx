import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import { 
  Calendar,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, salon } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    thisWeekRevenue: 0,
    totalCustomers: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salon?.id) {
      fetchDashboardData();
    }
  }, [salon]);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:users!customer_id(*),
          stylist:stylists!stylist_id(*, user:users(*)),
          service:services(*)
        `)
        .eq('salon_id', salon?.id)
        .eq('appointment_date', today)
        .order('start_time', { ascending: true });

      if (todayAppointments) {
        setAppointments(todayAppointments);
        setStats(prev => ({ ...prev, todayAppointments: todayAppointments.length }));
      }

      // Fetch more stats (this would be more complex queries in a real app)
      setStats(prev => ({
        ...prev,
        thisWeekRevenue: 2450,
        totalCustomers: 156,
        pendingAppointments: 8
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'This Week Revenue',
      value: `$${stats.thisWeekRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Pending Bookings',
      value: stats.pendingAppointments,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening at {salon?.name} today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
        </div>
        <div className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.customer?.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.service?.name} with {appointment.stylist?.user?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {appointment.start_time} - {appointment.end_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${appointment.total_amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">New Appointment</h3>
          <p className="text-sm text-blue-100">Schedule a new booking</p>
        </button>

        <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <Users className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">Add Customer</h3>
          <p className="text-sm text-purple-100">Register new client</p>
        </button>

        <button className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <TrendingUp className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">View Reports</h3>
          <p className="text-sm text-teal-100">Check analytics</p>
        </button>
      </div>
    </div>
  );
};