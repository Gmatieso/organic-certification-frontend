import React, { useState } from 'react';
import { Search, Download, Calendar, Award, Filter, AlertCircle, CheckCircle } from 'lucide-react';

interface Certificate {
  id: number;
  farmName: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired' | 'pending';
  owner: string;
  location: string;
}

const CertificateManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const certificates: Certificate[] = [
    {
      id: 1,
      farmName: 'Green Valley Farm',
      certificateNumber: 'ORG-2024-001',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-14',
      status: 'valid',
      owner: 'John Kamau',
      location: 'Kiambu County'
    },
    {
      id: 2,
      farmName: 'Sunrise Organic',
      certificateNumber: 'ORG-2024-002',
      issueDate: '2024-01-20',
      expiryDate: '2025-01-19',
      status: 'valid',
      owner: 'Mary Wanjiku',
      location: 'Nakuru County'
    },
    {
      id: 3,
      farmName: 'Highland Coffee Estate',
      certificateNumber: 'ORG-2023-045',
      issueDate: '2023-12-10',
      expiryDate: '2024-12-09',
      status: 'expiring-soon',
      owner: 'David Mwangi',
      location: 'Nyeri County'
    },
    {
      id: 4,
      farmName: 'Fresh Herbs Kenya',
      certificateNumber: 'ORG-2023-032',
      issueDate: '2023-08-15',
      expiryDate: '2024-08-14',
      status: 'expired',
      owner: 'Grace Njeri',
      location: 'Meru County'
    },
    {
      id: 5,
      farmName: 'Organic Maize Fields',
      certificateNumber: 'ORG-2024-003',
      issueDate: '2024-01-25',
      expiryDate: '2025-01-24',
      status: 'valid',
      owner: 'Peter Kipchoge',
      location: 'Uasin Gishu County'
    },
    {
      id: 6,
      farmName: 'Tropical Fruits Co.',
      certificateNumber: 'PENDING',
      issueDate: '',
      expiryDate: '',
      status: 'pending',
      owner: 'Susan Mutua',
      location: 'Machakos County'
    }
  ];

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'valid': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'expiring-soon': 'bg-amber-100 text-amber-800 border-amber-200',
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    const icons = {
      'valid': CheckCircle,
      'expiring-soon': AlertCircle,
      'expired': AlertCircle,
      'pending': Calendar
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Simulate PDF download
    alert(`Downloading certificate for ${certificate.farmName}`);
  };

  const handleGenerateCertificate = (certificate: Certificate) => {
    // Simulate certificate generation
    alert(`Generating certificate for ${certificate.farmName}`);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage and track organic certification status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Valid Certificates</p>
              <p className="text-xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'valid').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'expiring-soon').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'expired').length}
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates, farms, or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCertificates.map((certificate) => {
          const daysUntilExpiry = getDaysUntilExpiry(certificate.expiryDate);
          
          return (
            <div key={certificate.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{certificate.farmName}</h3>
                    <p className="text-sm text-gray-600">{certificate.owner}</p>
                  </div>
                </div>
                {getStatusBadge(certificate.status)}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Certificate #:</span>
                  <span className="font-medium text-gray-900">{certificate.certificateNumber}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-900">{certificate.location}</span>
                </div>
                
                {certificate.issueDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="text-gray-900">{new Date(certificate.issueDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {certificate.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="text-gray-900">{new Date(certificate.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}

                {daysUntilExpiry !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days Until Expiry:</span>
                    <span className={`font-medium ${
                      daysUntilExpiry < 30 ? 'text-red-600' : 
                      daysUntilExpiry < 90 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                {certificate.status === 'pending' ? (
                  <button
                    onClick={() => handleGenerateCertificate(certificate)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadCertificate(certificate)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                )}
                
                <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;