import React, {useEffect, useState} from "react";
import {AlertCircle, Award, Calendar, CheckCircle, Download, Filter, Search,} from "lucide-react";
import {toast} from "react-toastify";

interface Certificate {
    id: string;
    certificateNumber: string;
    issueDate: string;
    expiryDate: string;
    pdfUrl: string;
    status?: "valid" | "expiring-soon" | "expired" | "pending";
    complianceScore: number;
    farmResponse: FarmResponse;
}

interface FarmResponse {
    id: string;
    farmName: string;
    location: string;
    areaHa: number;
    farmerResponse: FarmerResponse;
}

interface FarmerResponse {
    id: string;
    name: string;
    phone: string;
    email: string;
    county: string;
}
const API_BASE = "http://localhost:8080/api/v1";

const CertificateManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/certificate`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCertificates(data?.data?.content || []);
        } catch (err) {
            toast.error("Error fetching certificates. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCertificates = certificates.filter((cert) => {
        const matchesSearch = cert?.farmResponse?.farmName?.toLowerCase().includes(searchTerm.toLowerCase()) || cert?.certificateNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) || cert?.farmResponse?.farmerResponse?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || cert?.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status?: string) => {
        if (!status) {
            return (<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
          UNKNOWN
        </span>);
        }

        const styles: Record<string, string> = {
            valid: "bg-pesiraEmerald100 text-emerald-800 border-emerald-200",
            "expiring-soon": "bg-pesiraAmber100 text-amber-800 border-amber-200",
            expired: "bg-pesiraRed100 text-red-800 border-pesiraRed200",
            pending: "bg-pesiraBlue100 text-blue-800 border-blue-200",
        };

        const icons = {
            valid: CheckCircle, "expiring-soon": AlertCircle, expired: AlertCircle, pending: Calendar,
        };

        const Icon = icons[status as keyof typeof icons];

        return (<span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}
        >
        <Icon className="h-3 w-3 mr-1"/>
            {status
                .split("-")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}
      </span>);
    };

    const handleDownloadCertificate = async (certificateId: string, certificateNumber: string) => {
        try {
            const res = await fetch(`${API_BASE}/certificate/${certificateId}/download`, {
                method: "GET",
                headers: {
                    "Accept": "application/pdf",
                },
            });

            if (!res.ok) {
                throw new Error("Failed to download certificate");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${certificateNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Error downloading certificate. Please try again.");
            console.error(err);
        }
    };


    const getDaysUntilExpiry = (expiryDate: string) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (<div className="space-y-6">
        {/* Header */}
        <div>
            <h1 className="text-2xl font-bold text-pesiraGray900">
                Certificate Management
            </h1>
            <p className="mt-1 text-sm text-pesiraGray600">
                Manage and track organic certification status
            </p>
        </div>

        {/* Filters */}
        <div className="bg-pesiraWhite rounded-lg shadow-sm border border-pesiraGray200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pesiraGray400"/>
                        <input
                            type="text"
                            placeholder="Search certificates, farms, or owners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-pesiraGray300 rounded-md focus:ring-2 focus:ring-pesiraGreen100 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Filter className="h-4 w-4 text-pesiraGray400"/>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-pesiraGray300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pesiraGreen100 focus:border-transparent"
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
        {loading ? (<div className="text-center py-12 text-sm text-pesiraGray500">
            Loading certificates...
        </div>) : error ? (<div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
                onClick={fetchCertificates}
                className="mt-4 bg-pesiraGreen600 text-white px-4 py-2 rounded-lg hover:bg-pesiraGreen700"
            >
                Retry
            </button>
        </div>) : filteredCertificates.length === 0 ? (<div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-pesiraGray400"/>
            <h3 className="mt-2 text-sm font-medium text-pesiraGray900">
                No certificates found
            </h3>
            <p className="mt-1 text-sm text-pesiraGray500">
                Try adjusting your search criteria
            </p>
        </div>) : (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate) => {
                const daysUntilExpiry = getDaysUntilExpiry(certificate.expiryDate);
                return (<div
                    key={certificate.id}
                    className="bg-pesiraWhite rounded-lg border border-pesiraGray200 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div
                                className="bg-gradient-to-r from-pesiraGreen100 to-emerald-500 p-2 rounded-lg">
                                <Award className="h-5 w-5 text-pesiraWhite"/>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-pesiraGray900">
                                    {certificate?.farmResponse?.farmName}
                                </h3>
                                <p className="text-sm text-pesiraGray600">
                                    {certificate?.farmResponse?.farmerResponse?.name}
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(certificate?.status)}
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-pesiraGray600">Certificate #:</span>
                            <span className="font-medium text-pesiraGray900">{certificate?.certificateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-pesiraGray600">Farmer:</span>
                            <span className="text-pesiraGray900">{certificate?.farmResponse?.farmerResponse?.name}</span>
                        </div>
                        {certificate?.issueDate && (<div className="flex justify-between">
                            <span className="text-pesiraGray600">Issue Date:</span>
                            <span className="text-pesiraGray900">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                        </span>
                        </div>)}
                        {certificate.expiryDate && (<div className="flex justify-between">
                            <span className="text-pesiraGray600">Expiry Date:</span>
                            <span className="text-pesiraGray900">
                        {new Date(certificate.expiryDate).toLocaleDateString()}
                      </span>
                        </div>)}

                        {daysUntilExpiry !== null && (<div className="flex justify-between">
                      <span className="text-pesiraGray600">
                        Compliance Score:
                      </span>
                            <span className="text-pesiraGray900">{certificate?.complianceScore}</span>
                        </div>)}
                    </div>

                    <div className="flex space-x-3 mt-6 pt-4 border-t border-pesiraGray200">
                        {certificate?.status === "pending" ? (<button
                            onClick={() => handleDownloadCertificate(certificate?.id, certificate?.certificateNumber)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald hover:from-pesiraGreen500 hover:to-emerald-700"
                        >
                            <Award className="h-4 w-4 mr-2"/>
                            Generate Certificate
                        </button>) : (<button
                            onClick={() => handleDownloadCertificate(certificate?.id, certificate?.certificateNumber)}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-pesiraGray700 border border-pesiraGray300 bg-pesiraWhite hover:bg-pesiraGray50"
                        >
                            <Download className="h-4 w-4 mr-2"/>
                            Download PDF
                        </button>)}
                        <button
                            className="px-4 py-2 text-sm font-medium rounded-md text-pesiraGray700 border border-pesiraGray300 bg-pesiraWhite hover:bg-pesiraGray50">
                            View Details
                        </button>
                    </div>
                </div>);
            })}
        </div>)}
    </div>);
};

export default CertificateManagement;
