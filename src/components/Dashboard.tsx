import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabase';
import { Appointment, Service, Stylist } from '../types';
import { Calendar, Clock, Users, DollarSign, TrendingUp, CheckCircle, AlertCircle, XCircle, Plus, Eye, CreditCard as Edit, Star, MapPin, Phone } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, salon } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
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
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's appointments
      const todayAppointments = await dbHelpers.getAppointments(salon!.id, today, today);
      setAppointments(todayAppointments || []);

      // Fetch services and stylists
      const [servicesData, stylistsData] = await Promise.all([
        dbHelpers.getSalonServices(salon!.id),
        dbHelpers.getSalonStylists(salon!.id)
      ]);

      setServices(servicesData || []);
      setStylists(stylistsData || []);

      // Calculate stats
      const pendingCount = todayAppointments?.filter(apt => apt.status === 'pending').length || 0;
      const todayRevenue = todayAppointments?.reduce((sum, apt) => sum + apt.total_amount, 0) || 0;

      setStats({
        todayAppointments: todayAppointments?.length || 0,
        thisWeekRevenue: todayRevenue * 7, // Simplified calculation
        totalCustomers: 156, // This would come from a proper query
        pendingAppointments: pendingCount
      });

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
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'This Week Revenue',
      value: `$${stats.thisWeekRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+23',
      changeType: 'positive'
    },
    {
      name: 'Pending Bookings',
      value: stats.pendingAppointments,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-2',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening at {salon?.name} today.
            </p>
          </div>
          <div className="mt-6 lg:mt-0 lg:ml-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{salon?.city}, {salon?.state}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm mt-2">
                <Phone className="w-4 h-4" />
                <span>{salon?.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                  <span>New Booking</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No appointments scheduled for today</p>
                  <p className="text-gray-400 text-sm">Your schedule is clear - time to relax or catch up on other tasks!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="font-semibold text-gray-900">
                              {appointment.customer?.full_name}
                            </p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {appointment.service?.name} with {appointment.stylist?.user?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.service?.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 mb-1">
                          {appointment.start_time} - {appointment.end_time}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ${appointment.total_amount}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-purple-600 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Top Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
            <div className="space-y-3">
              {services.slice(0, 4).map((service, index) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.duration_minutes} min</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${service.price}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
            <div className="space-y-4">
              {stylists.map((stylist) => (
                <div key={stylist.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {stylist.user?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {stylist.user?.full_name}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${Math.floor(Math.random() * 500 + 200)}
                    </p>
                    <p className="text-xs text-gray-500">today</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
          <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="font-semibold mb-1">New Appointment</h3>
          <p className="text-sm text-blue-100">Schedule a new booking</p>
        </button>

        <button className="group bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
          <Users className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="font-semibold mb-1">Add Customer</h3>
          <p className="text-sm text-purple-100">Register new client</p>
        </button>

        <button className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
          <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="font-semibold mb-1">View Reports</h3>
          <p className="text-sm text-teal-100">Check analytics</p>
        </button>
      </div>
    </div>
  );
};