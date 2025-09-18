import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, MapPin, ClipboardCheck, FileText } from 'lucide-react';

interface Farm {
  id: number;
  name: string;
  location: string;
  owner: string;
}

const InspectionWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [inspectionData, setInspectionData] = useState({
    inspector: '',
    date: '',
    soilQuality: '',
    cropHealth: '',
    pestManagement: '',
    waterManagement: '',
    recordKeeping: '',
    compliance: '',
    notes: '',
    recommendations: ''
  });

  const farms: Farm[] = [
    { id: 1, name: 'Green Valley Farm', location: 'Kiambu County', owner: 'John Kamau' },
    { id: 2, name: 'Sunrise Organic', location: 'Nakuru County', owner: 'Mary Wanjiku' },
    { id: 3, name: 'Highland Coffee Estate', location: 'Nyeri County', owner: 'David Mwangi' },
    { id: 4, name: 'Fresh Herbs Kenya', location: 'Meru County', owner: 'Grace Njeri' },
  ];

  const steps = [
    { id: 1, name: 'Farm Selection', icon: MapPin },
    { id: 2, name: 'Inspection Details', icon: ClipboardCheck },
    { id: 3, name: 'Summary & Submit', icon: FileText },
  ];

  const handleInputChange = (field: string, value: string) => {
    setInspectionData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Submitting inspection:', { selectedFarm, inspectionData });
    alert('Inspection submitted successfully!');
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
              <div className="absolute inset-0 flex items-center">
                <div className={`h-0.5 w-full ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
              <div className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                step.id < currentStep
                  ? 'bg-blue-600 border-blue-600'
                  : step.id === currentStep
                  ? 'border-blue-600 bg-white'
                  : 'border-gray-300 bg-white'
              }`}>
                {step.id < currentStep ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <step.icon className={`h-4 w-4 ${step.id === currentStep ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="mt-2">
                <span className={`text-sm font-medium ${
                  step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );

  const renderFarmSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Farm for Inspection</h2>
        <p className="mt-1 text-sm text-gray-600">Choose the farm you want to conduct an inspection for.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map((farm) => (
          <div
            key={farm.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedFarm?.id === farm.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedFarm(farm)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{farm.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{farm.location}</p>
                <p className="mt-1 text-sm text-gray-500">Owner: {farm.owner}</p>
              </div>
              {selectedFarm?.id === farm.id && (
                <div className="ml-4">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInspectionDetails = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Inspection Details</h2>
        <p className="mt-1 text-sm text-gray-600">Fill in the inspection details for {selectedFarm?.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Name</label>
          <input
            type="text"
            value={inspectionData.inspector}
            onChange={(e) => handleInputChange('inspector', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter inspector name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Date</label>
          <input
            type="date"
            value={inspectionData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Soil Quality</label>
          <select
            value={inspectionData.soilQuality}
            onChange={(e) => handleInputChange('soilQuality', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select rating</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Crop Health</label>
          <select
            value={inspectionData.cropHealth}
            onChange={(e) => handleInputChange('cropHealth', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select rating</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pest Management</label>
          <select
            value={inspectionData.pestManagement}
            onChange={(e) => handleInputChange('pestManagement', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select compliance</option>
            <option value="compliant">Compliant</option>
            <option value="minor-issues">Minor Issues</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Water Management</label>
          <select
            value={inspectionData.waterManagement}
            onChange={(e) => handleInputChange('waterManagement', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select compliance</option>
            <option value="compliant">Compliant</option>
            <option value="minor-issues">Minor Issues</option>
            <option value="non-compliant">Non-Compliant</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Notes</label>
        <textarea
          value={inspectionData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter detailed inspection notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
        <textarea
          value={inspectionData.recommendations}
          onChange={(e) => handleInputChange('recommendations', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter recommendations for improvement..."
        />
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Inspection Summary</h2>
        <p className="mt-1 text-sm text-gray-600">Review and submit the inspection details.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Farm Information</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p><strong>Farm:</strong> {selectedFarm?.name}</p>
            <p><strong>Location:</strong> {selectedFarm?.location}</p>
            <p><strong>Owner:</strong> {selectedFarm?.owner}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900">Inspection Details</h3>
          <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-4">
            <p><strong>Inspector:</strong> {inspectionData.inspector}</p>
            <p><strong>Date:</strong> {inspectionData.date}</p>
            <p><strong>Soil Quality:</strong> {inspectionData.soilQuality}</p>
            <p><strong>Crop Health:</strong> {inspectionData.cropHealth}</p>
            <p><strong>Pest Management:</strong> {inspectionData.pestManagement}</p>
            <p><strong>Water Management:</strong> {inspectionData.waterManagement}</p>
          </div>
        </div>

        {inspectionData.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-900">Notes</h3>
            <p className="mt-2 text-sm text-gray-600">{inspectionData.notes}</p>
          </div>
        )}

        {inspectionData.recommendations && (
          <div>
            <h3 className="text-sm font-medium text-gray-900">Recommendations</h3>
            <p className="mt-2 text-sm text-gray-600">{inspectionData.recommendations}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inspection Workflow</h1>
        <p className="mt-1 text-sm text-gray-600">Conduct comprehensive farm inspections with guided workflow</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {renderStepIndicator()}

        <div className="min-h-96">
          {currentStep === 1 && renderFarmSelection()}
          {currentStep === 2 && renderInspectionDetails()}
          {currentStep === 3 && renderSummary()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !selectedFarm}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                (currentStep === 1 && !selectedFarm)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-colors"
            >
              Submit Inspection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionWorkflow;