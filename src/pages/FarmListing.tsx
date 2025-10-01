import React, {useState, useMemo, useEffect} from 'react';
import { Search, Plus, MapPin, ArrowUpDown, Filter } from 'lucide-react';
import {toast} from 'react-toastify';


interface FarmerResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  county: string;
}

interface Farm {
  id: string;
  farmName: string;
  location: string;
  areaHa: number;
  farmerResponse: FarmerResponse;
}

const API_BASE = "http://localhost:8080/api/v1";


const FarmListing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Farm>('farmName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [farmers, setFarmers] = useState<FarmerResponse[]>([]);
  const [newFarm, setnewFarm] = useState({
      farmName:"",
      location:"",
      areaHa:"",
      farmerId:""
  })


    const [farms, setFarms] = useState<Farm[]>([]);

  useEffect(()=> {
      fetch(`${API_BASE}/farm`)
          .then(res => res.json())
          .then(json => {
              if(json.data && json.data.content) {
                  setFarms(json.data.content);
              }
          })
          .catch(err => toast.error('Error fetching farms:', err))
  }, [])

    useEffect(() => {
        fetch(`${API_BASE}/farmer`)
            .then(res => res.json())
            .then(json => {
                if(json.data?.content) {
                    setFarmers(json.data.content);
                }
            })
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setnewFarm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/farm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newFarm,
                    areaHa: parseInt(newFarm.areaHa),
                })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`${data.message}`)
                setnewFarm({farmName: '', location: '', areaHa: '', farmerId: ''});
                setShowForm(false);
                setFarms(prevFarms => [...prevFarms, data.data]);
            }
        }catch (error) {
            toast.error(`Network error: ${(error as Error).message}`);
        }
    }
  

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
      const matchesSearch = farm.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           farm.farmerResponse.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // const matchesStatus = statusFilter === 'all' || farm.status === statusFilter;
      
      return matchesSearch;
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
    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold pesiraGray900">Farm Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and monitor all registered organic farms</p>
        </div>
        <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pesiraGreen to-pesiraEmerald hover:from-pesiraGreen500 hover:to-pesiraEmerald700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pesiraGreen500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Farm
        </button>
      </div>

        {/* Add Farm Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-md space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">New Farm</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="farmName"
                        value={newFarm.farmName}
                        onChange={handleInputChange}
                        placeholder="Farm Name"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="text"
                        name="location"
                        value={newFarm.location}
                        onChange={handleInputChange}
                        placeholder="Location"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="areaHa"
                        value={newFarm.areaHa}
                        onChange={handleInputChange}
                        placeholder="Area (Ha)"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <select
                        name="farmerId"
                        value={newFarm.farmerId}
                        onChange={handleInputChange}
                        required
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">Select Farmer</option>
                        {farmers.map(farmer => (
                            <option key={farmer.id} value={farmer.id}>
                                {farmer.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-pesiraGreen text-white rounded-md hover:bg-pesiraEmerald"
                >
                    Submit
                </button>
            </form>
        )}


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
                  onClick={() => handleSort('farmName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Farm</span>
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
                  onClick={() => handleSort('farmerResponse')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Owner</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
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
                        <div className="text-sm font-medium pesiraGray900">{farm.farmName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.areaHa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm pesiraGray900">{farm.farmerResponse?.name}</td>
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