import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/supabase';
import { Stylist } from '../../types';
import { UserCheck, Plus, Search, Mail, Phone, Star, DollarSign, Calendar, Edit3, Eye } from 'lucide-react';

export const Staff: React.FC = () => {
  const { salon, user } = useAuth();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (salon?.id) {
      fetchStylists();
    }
  }, [salon]);

  const fetchStylists = async () => {
    try {
      const stylistsData = await dbHelpers.getSalonStylists(salon!.id);
      setStylists(stylistsData || []);
    } catch (error) {
      console.error('Error fetching stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStylists = stylists.filter(stylist =>
    stylist.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stylist.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'salon_owner') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">Access Restricted</p>
        <p className="text-gray-400 text-sm">Only salon owners can manage staff</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage your salon team and schedules</p>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStylists.map((stylist) => (
          <div key={stylist.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {stylist.user?.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{stylist.user?.full_name}</h3>
                  <p className="text-sm text-gray-600">Stylist</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-purple-600 rounded">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{stylist.user?.email}</span>
              </div>
              {stylist.user?.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{stylist.user.phone}</span>
                </div>
              )}
            </div>

            {stylist.specialties && stylist.specialties.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {stylist.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {specialty}
                    </span>
                  ))}
                  {stylist.specialties.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{stylist.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    ${stylist.hourly_rate || 0}
                  </div>
                  <div className="text-xs text-gray-500">Hourly Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {stylist.commission_rate}%
                  </div>
                  <div className="text-xs text-gray-500">Commission</div>
                </div>
              </div>
            </div>

            {stylist.bio && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 line-clamp-2">{stylist.bio}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStylists.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No staff members found</p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first staff member to get started'}
          </p>
        </div>
      )}
    </div>
  );
};