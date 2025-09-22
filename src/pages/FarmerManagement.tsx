import React, { useState, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, Edit, Eye, Filter, ArrowUpDown } from 'lucide-react';

interface Farmer {
  id: number;
  name: string;
  phone: string;
  email: string;
  county: string;
  farmCount: number;
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
  totalArea: number;
}

const FarmerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Farmer>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showForm, setShowForm] = useState(false);

  const [newFarmer, setNewFarmer] = useState({
    name: '',
    phone: '',
    email: '',
    county: ''
  });

  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const farmers: Farmer[] = [
    {
      id: 1,
      name: 'John Kamau',
      phone: '+254 712 345 678',
      email: 'john.kamau@email.com',
      county: 'Kiambu',
      farmCount: 2,
      status: 'active',
      registrationDate: '2023-01-15',
      totalArea: 45.5
    },
    {
      id: 2,
      name: 'Mary Wanjiku',
      phone: '+254 723 456 789',
      email: 'mary.wanjiku@email.com',
      county: 'Nakuru',
      farmCount: 1,
      status: 'active',
      registrationDate: '2023-02-20',
      totalArea: 35.2
    },
    {
      id: 3,
      name: 'David Mwangi',
      phone: '+254 734 567 890',
      email: 'david.mwangi@email.com',
      county: 'Nyeri',
      farmCount: 3,
      status: 'active',
      registrationDate: '2023-03-10',
      totalArea: 180.8
    },
    {
      id: 4,
      name: 'Grace Njeri',
      phone: '+254 745 678 901',
      email: 'grace.njeri@email.com',
      county: 'Meru',
      farmCount: 1,
      status: 'pending',
      registrationDate: '2024-01-05',
      totalArea: 25.3
    },
    {
      id: 5,
      name: 'Peter Kipchoge',
      phone: '+254 756 789 012',
      email: 'peter.kipchoge@email.com',
      county: 'Uasin Gishu',
      farmCount: 2,
      status: 'active',
      registrationDate: '2023-05-12',
      totalArea: 250.0
    },
    {
      id: 6,
      name: 'Susan Mutua',
      phone: '+254 767 890 123',
      email: 'susan.mutua@email.com',
      county: 'Machakos',
      farmCount: 1,
      status: 'inactive',
      registrationDate: '2023-08-30',
      totalArea: 80.7
    }
  ];

  const counties = [...new Set(farmers.map(farmer => farmer.county))].sort();

  const handleSort = (field: keyof Farmer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedFarmers = useMemo(() => {
    const  filtered = farmers.filter(farmer => {
      const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farmer.phone.includes(searchTerm) ||
                           farmer.county.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || farmer.status === statusFilter;
      const matchesCounty = countyFilter === 'all' || farmer.county === countyFilter;
      
      return matchesSearch && matchesStatus && matchesCounty;
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
  }, [farmers, searchTerm, sortField, sortDirection, statusFilter, countyFilter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-pesiraEmerald100 text-emerald-800 border-pesiraEmerald200',
      pending: 'bg-pesiraAmber100 text-amber-800 border-amber-200',
      inactive: 'bg-pesiraGray100 text-gray-800 border-pesiraGray200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewFarmer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('https://organic-certification-production.up.railway.app/api/v1/farmer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFarmer)
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMsg(`${data.message}`)
                setNewFarmer({ name: '', phone: '', email: '', county: '' });
                setShowForm(false);
            }else {
                setResponseMsg(`❌ Error: ${data.message}`);
            }
        }catch (error) {
            setResponseMsg(`❌ Network error: ${(error as Error).message}`);
        }
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pesiraGray900">Farmer Management</h1>
          <p className="mt-1 text-sm text-pesiraGray600">Manage registered farmers and their information</p>
        </div>
        <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pesiraGreen to-pesiraEmerald hover:from-pesiraGreen500 hover:to-pesiraEmerald700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pesiraGreen500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Farmer
        </button>
      </div>

        {/* Add Farmer Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-md space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">New Farmer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        value={newFarmer.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="text"
                        name="phone"
                        value={newFarmer.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="email"
                        name="email"
                        value={newFarmer.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="text"
                        name="county"
                        value={newFarmer.county}
                        onChange={handleInputChange}
                        placeholder="County"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-pesiraGreen text-white rounded-md hover:bg-pesiraEmerald"
                >
                    Submit
                </button>
            </form>
        )}

        {/* Response */}
        {responseMsg && (
            <div className="p-3 rounded-md bg-gray-100 text-sm text-gray-700">
                {responseMsg}
            </div>
        )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-pesiraWhite rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-pesiraBlue100 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Total Farmers</p>
              <p className="text-xl font-bold text-pesiraGray900">{farmers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-pesiraEmerald100 p-2 rounded-lg">
              <User className="h-5 w-5 text-pesiraEmerald600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Active Farmers</p>
              <p className="text-xl font-bold text-pesiraGray900">
                {farmers.filter(f => f.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-pesiraAmber100 p-2 rounded-lg">
              <User className="h-5 w-5 text-pesiraAmber600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Pending</p>
              <p className="text-xl font-bold text-pesiraGray900">
                {farmers.filter(f => f.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-pesiraPurple100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-pesiraPurple600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Counties</p>
              <p className="text-xl font-bold text-pesiraGray900">{counties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-pesiraGray200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pesiraGray400" />
              <input
                type="text"
                placeholder="Search farmers by name, email, phone, or county..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pesiraGray300 rounded-md focus:ring-2 focus:ring-pesiraGreen500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-pesiraGray400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-pesiraGray300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="border border-pesiraGray300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen500 focus:border-transparent"
            >
              <option value="all">All Counties</option>
              {counties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
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
                    <span>Farmer</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('county')}
                >
                  <div className="flex items-center space-x-1">
                    <span>County</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('farmCount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Farms</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-pesiraGray100 transition-colors"
                  onClick={() => handleSort('totalArea')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Area (Ha)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-pesiraWhite divide-y divide-pesiraGray200">
              {filteredAndSortedFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-pesiraGray50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-pesiraWhite" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-pesiraGray900">{farmer.name}</div>
                        <div className="text-sm text-pesiraGray500">
                          Registered: {new Date(farmer.registrationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-pesiraGray900 space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 text-pesiraGray400 mr-1" />
                        <span>{farmer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-pesiraGray400 mr-1" />
                        <span>{farmer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-pesiraGray900">
                      <MapPin className="h-3 w-3 text-pesiraGray400 mr-1" />
                      {farmer.county}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pesiraGray900">
                    {farmer.farmCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pesiraGray900">
                    {farmer.totalArea}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(farmer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-pesiraBlue600 bg-pesiraBlue100 hover:bg-pesiraBlue200 transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-pesiraEmerald600 bg-pesiraEmerald100 hover:bg-pesiraEmerald200 transition-colors">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedFarmers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-pesiraGray400" />
            <h3 className="mt-2 text-sm font-medium text-pesiraGray900">No farmers found</h3>
            <p className="mt-1 text-sm text-pesiraGray500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerManagement;