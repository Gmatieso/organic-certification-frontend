import React, { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Calendar, ArrowUpDown, Filter } from 'lucide-react';

interface Farm {
  id: number;
  name: string;
  location: string;
  areaHa: number;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  lastInspection: string;
  certificateStatus: 'valid' | 'expired' | 'pending';
}

const FarmListing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Farm>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const farms: Farm[] = [
    { id: 1, name: 'Green Valley Farm', location: 'Kiambu County', areaHa: 25.5, owner: 'John Kamau', status: 'active', lastInspection: '2024-01-15', certificateStatus: 'valid' },
    { id: 2, name: 'Sunrise Organic', location: 'Nakuru County', areaHa: 45.2, owner: 'Mary Wanjiku', status: 'active', lastInspection: '2024-01-20', certificateStatus: 'valid' },
    { id: 3, name: 'Highland Coffee Estate', location: 'Nyeri County', areaHa: 120.8, owner: 'David Mwangi', status: 'pending', lastInspection: '2023-12-10', certificateStatus: 'pending' },
    { id: 4, name: 'Fresh Herbs Kenya', location: 'Meru County', areaHa: 15.3, owner: 'Grace Njeri', status: 'active', lastInspection: '2024-01-05', certificateStatus: 'expired' },
    { id: 5, name: 'Organic Maize Fields', location: 'Uasin Gishu County', areaHa: 200.0, owner: 'Peter Kipchoge', status: 'active', lastInspection: '2024-01-12', certificateStatus: 'valid' },
    { id: 6, name: 'Tropical Fruits Co.', location: 'Machakos County', areaHa: 80.7, owner: 'Susan Mutua', status: 'suspended', lastInspection: '2023-11-30', certificateStatus: 'expired' },
  ];

  const handleSort = (field: keyof Farm) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedFarms = useMemo(() => {
    const filtered = farms.filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.owner.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || farm.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [farms, searchTerm, sortField, sortDirection, statusFilter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCertificateStatusBadge = (status: string) => {
    const styles = {
      valid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold pesiraGray900">Farm Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and monitor all registered organic farms</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pesiraGreen to-pesiraEmerald hover:from-pesiraGreen500 hover:to-pesiraEmerald700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pesiraGreen500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Farm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-pesiraWhite rounded-lg shadow-sm border border-pesiraGray200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pesiraGray400" />
              <input
                type="text"
                placeholder="Search farms, locations, or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-pesiraGray400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-pesiraGray300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farm Table */}
      <div className="bg-pesiraWhite rounded-lg shadow-sm border border-pesiraGray200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pesiraGray200">
            <thead className="bg-pesiraGray50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Farm Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Location</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('areaHa')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Area (Ha)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('owner')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Owner</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium pesiraGray500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium pesiraGray500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium pesiraGray500 uppercase tracking-wider">
                  Last Inspection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium pesiraGray500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFarms.map((farm) => (
                <tr key={farm.id} className="hover:bg-pesiraGray50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-r from-pesiraGreen to-pesiraEmerald rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium pesiraGray900">{farm.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.areaHa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(farm.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getCertificateStatusBadge(farm.certificateStatus)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 pesiraGray400 mr-1" />
                      {new Date(farm.lastInspection).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">View</button>
                      <button className="text-emerald-600 hover:text-emerald-900 transition-colors">Edit</button>
                      <button className="text-amber-600 hover:text-amber-900 transition-colors">Inspect</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedFarms.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 pesiraGray400" />
            <h3 className="mt-2 text-sm font-medium pesiraGray900">No farms found</h3>
            <p className="mt-1 text-sm pesiraGray500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmListing;