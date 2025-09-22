import React, {useState, useMemo, useEffect} from 'react';
import { Search, Plus, MapPin, Wheat, Calendar, Filter, ArrowUpDown, Eye, Edit, History } from 'lucide-react';



interface FarmerResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  county: string;
}

interface FarmResponse {
  id: string;
  farmName: string;
  location: string;
  areaHa: number;
  farmerResponse: FarmerResponse;
}

interface Field {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  farmResponse: FarmResponse;
}

const FieldManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Field>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [farms, setFarms] = useState<FarmResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newField, setnewField] = useState({
    name: '',
    crop: '',
    areaHa: 0,
    farmId: ''
  })

    const [responseMsg, setResponseMsg] = useState<string | null>(null);
    const [fields, setFields] = useState<Field[]>([]);


    useEffect(()=> {
        fetch('https://organic-certification-production.up.railway.app/api/v1/fields')
            .then(res => res.json())
            .then(json => {
                if(json.data && json.data.content) {
                    setFields(json.data.content);
                }
            })
            .catch(err => console.log('Error fetching fields:', err))
    }, [])

    useEffect(() => {
        fetch('https://organic-certification-production.up.railway.app/api/v1/farm')
            .then(res => res.json())
            .then(json => {
                if (json.data?.content) {
                    setFarms(json.data.content);
                }
            })
            .catch(err => console.error("Error fetching farms:", err));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setnewField(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async(e:React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('https://organic-certification-production.up.railway.app/api/v1/fields', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newField,
                    areaHa: newField.areaHa,
                })
            });
            const data = await response.json();
            setResponseMsg(`${data.message}`)
            if (response.ok) {
                setFields(prev => [...prev, data.data]);
                setnewField({name: '', crop: '', areaHa: 0, farmId: ''})
                setShowForm(false);
            }
        }catch(error){
            setResponseMsg(`❌ Network error: ${(error as Error).message}`);
        }
    }

  // const farms = [...new Set(fields.map(field => fields.))].sort();
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
    const filtered = fields.filter(field => {
      const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           field.farmResponse.farmerResponse.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFarm = farmFilter === 'all' || field.name === farmFilter;
      const matchesCrop = cropFilter === 'all' || field.crop === cropFilter;
      // const matchesStatus = statusFilter === 'all' || field.status === statusFilter;
      
      return matchesSearch && matchesFarm && matchesCrop ;
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
    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pesiraGray900">Field Management</h1>
          <p className="mt-1 text-sm text-pesiraGray600">Manage agricultural fields and their cultivation details</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-pesiraWhite bg-gradient-to-r from-pesiraGreen to-pesiraEmerald hover:from-pesiraGreen500 hover:to-pesiraEmerald700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pesiraGreen500 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Field
        </button>
      </div>

        {/* Add Field Form */}
        {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-md space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">New Field</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        value={newField.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="text"
                        name="crop"
                        value={newField.crop}
                        onChange={handleInputChange}
                        placeholder="Crop"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="areaHa"
                        value={newField.areaHa}
                        onChange={handleInputChange}
                        placeholder="Area (Ha)"
                        required
                        className="border rounded-md px-3 py-2"
                    />
                    <select
                        name="farmId"
                        value={newField.farmId}
                        onChange={handleInputChange}
                        required
                        className="border rounded-md px-3 py-2"
                    >
                        <option value="">Select Farm</option>
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>
                                {farm.farmName} ({farm.location})
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
            <div className="bg-pesiraGreen100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-pesiraGreen600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Total Fields</p>
              <p className="text-xl font-bold text-pesiraGray900">{fields.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Wheat className="h-5 w-5 text-pesiraEmerald600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Active Fields</p>
              <p className="text-xl font-bold text-pesiraGray900">
                {/*{fields.filter(f => f.status === 'active').length}*/}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-pesiraGray200 p-4">
          <div className="flex items-center">
            <div className="bg-pesiraBlue100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-pesiraBlue600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-pesiraGray600">Certified</p>
              <p className="text-xl font-bold text-pesiraGray900">
                {/*{fields.filter(f => f.certificationStatus === 'certified').length}*/}
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
              <p className="text-sm font-medium text-pesiraGray600">Total Area</p>
              <p className="text-xl font-bold text-pesiraGray900">
                {fields.reduce((sum, field) => sum + field.areaHa, 0).toFixed(1)} Ha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-pesiraGray200 p-4">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pesiraGray400" />
              <input
                type="text"
                placeholder="Search fields, farms, crops, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-4 w-4 text-pesiraGray400" />
            <select
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
            >
              <option value="all">All Farms</option>
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>{farm.farmName}</option>
              ))}
            </select>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
            >
              <option value="all">All Crops</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen200 focus:border-transparent"
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
      <div className="bg-white rounded-lg shadow-sm border border-pesiraGray200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pesiraGray200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Field Name</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('namefi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Farm</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('crop')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Crop</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('areaHa')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Area (Ha)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                  <th
                      className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('farmResponse')}
                  >
                      <div className="flex items-center space-x-1">
                          <span>Location</span>
                          <ArrowUpDown className="h-3 w-3" />
                      </div>
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pesiraGray500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pesiraGray200">
              {filteredAndSortedFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-pesiraGray900">{field.name}</div>
                        <div className="text-sm text-pesiraGray500">{field.farmResponse?.farmerResponse?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-pesiraGray900">{field.farmResponse?.farmName}</div>
                    <div className="text-sm text-pesiraGray500">{field.farmResponse?.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-pesiraGray900">
                      <Wheat className="h-3 w-3 text-pesiraGray400 mr-1" />
                      {field.crop}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pesiraGray900">
                    {field.areaHa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-pesiraBlue600 bg-pesiraBlue100 hover:bg-blue-200 transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-pesiraEmerald600 bg-emerald-100 hover:bg-emerald-200 transition-colors">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-pesiraPurple600 bg-pesiraPurple100 hover:bg-pesiraPurple200 transition-colors">
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
            <MapPin className="mx-auto h-12 w-12 text-pesiraGray400" />
            <h3 className="mt-2 text-sm font-medium text-pesiraGray900">No fields found</h3>
            <p className="mt-1 text-sm text-pesiraGray500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldManagement;