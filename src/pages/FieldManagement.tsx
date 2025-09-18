import React, { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Wheat, Calendar, Filter, ArrowUpDown, Eye, Edit, History } from 'lucide-react';

interface Field {
  id: number;
  fieldName: string;
  farmName: string;
  crop: string;
  areaHa: number;
  farmer: string;
  county: string;
  status: 'active' | 'fallow' | 'preparing';
  lastInspection: string;
  nextInspection: string;
  certificationStatus: 'certified' | 'in-progress' | 'not-certified';
}

const FieldManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Field>('fieldName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fields: Field[] = [
    {
      id: 1,
      fieldName: 'North Field A',
      farmName: 'Green Valley Farm',
      crop: 'Coffee',
      areaHa: 12.5,
      farmer: 'John Kamau',
      county: 'Kiambu',
      status: 'active',
      lastInspection: '2024-01-15',
      nextInspection: '2024-04-15',
      certificationStatus: 'certified'
    },
    {
      id: 2,
      fieldName: 'South Field B',
      farmName: 'Green Valley Farm',
      crop: 'Maize',
      areaHa: 13.0,
      farmer: 'John Kamau',
      county: 'Kiambu',
      status: 'active',
      lastInspection: '2024-01-15',
      nextInspection: '2024-04-15',
      certificationStatus: 'certified'
    },
    {
      id: 3,
      fieldName: 'Organic Plot 1',
      farmName: 'Sunrise Organic',
      crop: 'Vegetables',
      areaHa: 25.2,
      farmer: 'Mary Wanjiku',
      county: 'Nakuru',
      status: 'active',
      lastInspection: '2024-01-20',
      nextInspection: '2024-04-20',
      certificationStatus: 'certified'
    },
    {
      id: 4,
      fieldName: 'Coffee Estate Main',
      farmName: 'Highland Coffee Estate',
      crop: 'Coffee',
      areaHa: 80.0,
      farmer: 'David Mwangi',
      county: 'Nyeri',
      status: 'active',
      lastInspection: '2023-12-10',
      nextInspection: '2024-03-10',
      certificationStatus: 'in-progress'
    },
    {
      id: 5,
      fieldName: 'Coffee Estate North',
      farmName: 'Highland Coffee Estate',
      crop: 'Coffee',
      areaHa: 40.8,
      farmer: 'David Mwangi',
      county: 'Nyeri',
      status: 'preparing',
      lastInspection: '2023-12-10',
      nextInspection: '2024-03-10',
      certificationStatus: 'not-certified'
    },
    {
      id: 6,
      fieldName: 'Herb Garden 1',
      farmName: 'Fresh Herbs Kenya',
      crop: 'Herbs',
      areaHa: 8.3,
      farmer: 'Grace Njeri',
      county: 'Meru',
      status: 'active',
      lastInspection: '2024-01-05',
      nextInspection: '2024-04-05',
      certificationStatus: 'certified'
    },
    {
      id: 7,
      fieldName: 'Herb Garden 2',
      farmName: 'Fresh Herbs Kenya',
      crop: 'Herbs',
      areaHa: 7.0,
      farmer: 'Grace Njeri',
      county: 'Meru',
      status: 'fallow',
      lastInspection: '2024-01-05',
      nextInspection: '2024-04-05',
      certificationStatus: 'not-certified'
    },
    {
      id: 8,
      fieldName: 'Main Field',
      farmName: 'Organic Maize Fields',
      crop: 'Maize',
      areaHa: 120.0,
      farmer: 'Peter Kipchoge',
      county: 'Uasin Gishu',
      status: 'active',
      lastInspection: '2024-01-12',
      nextInspection: '2024-04-12',
      certificationStatus: 'certified'
    },
    {
      id: 9,
      fieldName: 'Extension Field',
      farmName: 'Organic Maize Fields',
      crop: 'Sorghum',
      areaHa: 80.0,
      farmer: 'Peter Kipchoge',
      county: 'Uasin Gishu',
      status: 'active',
      lastInspection: '2024-01-12',
      nextInspection: '2024-04-12',
      certificationStatus: 'certified'
    },
    {
      id: 10,
      fieldName: 'Tropical Garden',
      farmName: 'Tropical Fruits Co.',
      crop: 'Mixed Fruits',
      areaHa: 80.7,
      farmer: 'Susan Mutua',
      county: 'Machakos',
      status: 'fallow',
      lastInspection: '2023-11-30',
      nextInspection: '2024-02-28',
      certificationStatus: 'not-certified'
    }
  ];

  const farms = [...new Set(fields.map(field => field.farmName))].sort();
  const crops = [...new Set(fields.map(field => field.crop))].sort();

  const handleSort = (field: keyof Field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedFields = useMemo(() => {
    let filtered = fields.filter(field => {
      const matchesSearch = field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.farmer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFarm = farmFilter === 'all' || field.farmName === farmFilter;
      const matchesCrop = cropFilter === 'all' || field.crop === cropFilter;
      const matchesStatus = statusFilter === 'all' || field.status === statusFilter;
      
      return matchesSearch && matchesFarm && matchesCrop && matchesStatus;
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
  }, [fields, searchTerm, sortField, sortDirection, farmFilter, cropFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fallow: 'bg-amber-100 text-amber-800 border-amber-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCertificationBadge = (status: string) => {
    const styles = {
      certified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'in-progress': 'bg-amber-100 text-amber-800 border-amber-200',
      'not-certified': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      certified: 'Certified',
      'in-progress': 'In Progress',
      'not-certified': 'Not Certified'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage agricultural fields and their cultivation details</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Field
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-xl font-bold text-gray-900">{fields.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Wheat className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Fields</p>
              <p className="text-xl font-bold text-gray-900">
                {fields.filter(f => f.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Certified</p>
              <p className="text-xl font-bold text-gray-900">
                {fields.filter(f => f.certificationStatus === 'certified').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Area</p>
              <p className="text-xl font-bold text-gray-900">
                {fields.reduce((sum, field) => sum + field.areaHa, 0).toFixed(1)} Ha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fields, farms, crops, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Farms</option>
              {farms.map(farm => (
                <option key={farm} value={farm}>{farm}</option>
              ))}
            </select>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Crops</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="fallow">Fallow</option>
              <option value="preparing">Preparing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fields Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('fieldName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Field Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('farmName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Farm</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('crop')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Crop</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('areaHa')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Area (Ha)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Inspection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{field.fieldName}</div>
                        <div className="text-sm text-gray-500">{field.farmer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{field.farmName}</div>
                    <div className="text-sm text-gray-500">{field.county}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Wheat className="h-3 w-3 text-gray-400 mr-1" />
                      {field.crop}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {field.areaHa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(field.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCertificationBadge(field.certificationStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      {new Date(field.lastInspection).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-colors">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-600 bg-purple-100 hover:bg-purple-200 transition-colors">
                        <History className="h-3 w-3 mr-1" />
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedFields.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldManagement;