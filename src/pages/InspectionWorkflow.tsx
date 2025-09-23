import React, { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    MapPin,
    ClipboardCheck,
    FileText,
} from "lucide-react";

interface Farm {
    id: string; // UUID from API
    name: string;
    location: string;
    owner: string;
}

const InspectionWorkflow: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [inspectionId, setInspectionId] = useState<string | null>(null);
    const [isInitiating, setIsInitiating] = useState<boolean>(false);

    const [inspectionData, setInspectionData] = useState({
        inspector: "",
        date: "",
        soilQuality: "",
        cropHealth: "",
        pestManagement: "",
        waterManagement: "",
        recordKeeping: "",
        compliance: "",
        notes: "",
        recommendations: "",
    });

    useEffect(() => {
        fetch("https://organic-certification-production.up.railway.app/api/v1/farm")
            .then((res) => res.json())
            .then((json) => {
                if (json.data && json.data.content) {
                    setFarms(json.data.content);
                }
            })
            .catch((err) => console.log("Error fetching farms:", err));
    }, []);

    // wrapper for Next button
    const handleNext = async () => {
        if (currentStep === 1) {
            // Need a selected farm first
            if (!selectedFarm) return;

            // set loading
            setIsInitiating(true);

            try {
                // initiate inspection POST
                const res = await fetch(
                    "https://organic-certification-production.up.railway.app/api/v1/inspection",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ farmId: selectedFarm.id }),
                    }
                );

                const json = await res.json();
                // if backend returns inspection id, keep it
                if (json?.data?.inspectionId) {
                    setInspectionId(json.data.inspectionId);
                } else {
                    // optional: you may log or notify if backend didn't return id
                    console.warn("No inspectionId in response", json);
                }

                // advance to step 2 whether or not we got an id (so UX isn't blocked)
                setCurrentStep(2);
            } catch (err) {
                console.error("Failed to initiate inspection", err);
                // Advance anyway so user can fill details (adjust if you prefer blocking)
                setCurrentStep(2);
            } finally {
                setIsInitiating(false);
            }
        } else {
            // step 2 -> step 3 simply advance
            setCurrentStep((s) => Math.min(3, s + 1));
        }
    };

    const updateInspection = async () => {
        if (!inspectionId) {
            alert("No inspection created yet. Click Next to initiate an inspection first.");
            return;
        }

        try {
            const res = await fetch(
                `https://organic-certification-production.up.railway.app/api/v1/inspection/${inspectionId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(inspectionData),
                }
            );

            const json = await res.json();
            console.log("Updated inspection:", json);
            alert("Inspection details saved successfully!");
        } catch (err) {
            console.error("Failed to update inspection", err);
            alert("Failed to save draft.");
        }
    };

    const finalizeInspection = async () => {
        if (!inspectionId) {
            alert("No inspection created to finalize.");
            return;
        }

        try {
            const response = await fetch(
                `https://organic-certification-production.up.railway.app/api/v1/inspection/${inspectionId}/finalize`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to finalize inspection");
            }

            const result = await response.json();
            console.log("Inspection finalized:", result);

            alert("Inspection submitted successfully!");

            // Reset wizard
            setCurrentStep(1);
            setSelectedFarm(null);
            setInspectionId(null);
            setInspectionData({
                inspector: "",
                date: "",
                soilQuality: "",
                cropHealth: "",
                pestManagement: "",
                waterManagement: "",
                recordKeeping: "",
                compliance: "",
                notes: "",
                recommendations: "",
            });
        } catch (err) {
            console.error(err);
            alert("Error submitting inspection.");
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setInspectionData((prev) => ({ ...prev, [field]: value }));
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
    };

    const steps = [
        { id: 1, name: "Farm Selection", icon: MapPin },
        { id: 2, name: "Inspection Details", icon: ClipboardCheck },
        { id: 3, name: "Summary & Submit", icon: FileText },
    ];

    // ---- renderers ----
    const renderStepIndicator = () => (
        <div className="mb-8">
            <nav aria-label="Progress">
                <ol className="flex items-center">
                    {steps.map((step, stepIdx) => (
                        <li
                            key={step.id}
                            className={`relative ${
                                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                            } flex-1`}
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div
                                    className={`h-0.5 w-full ${
                                        step.id < currentStep ? "bg-pesiraGreen" : "bg-pesiraGray200"
                                    }`}
                                />
                            </div>
                            <div
                                className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                                    step.id < currentStep
                                        ? "bg-pesiraGreen border-pesiraGreen"
                                        : step.id === currentStep
                                            ? "border-pesiraGreen bg-white"
                                            : "border-pesiraGray300 bg-white"
                                }`}
                            >
                                {step.id < currentStep ? (
                                    <Check className="h-4 w-4 text-white" />
                                ) : (
                                    <step.icon
                                        className={`h-4 w-4 ${
                                            step.id === currentStep ? "text-pesiraGreen" : "text-pesiraGray400"
                                        }`}
                                    />
                                )}
                            </div>
                            <div className="mt-2">
                <span className={`text-sm font-medium ${step.id <= currentStep ? "text-pesiraGreen" : "text-pesiraGray500"}`}>
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
                <h2 className="text-xl font-semibold text-pesiraGray900">Select Farm for Inspection</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Choose the farm you want to conduct an inspection for.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map((farm) => (
                    <div
                        key={farm.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedFarm?.id === farm.id ? "border-pesiraGreen bg-blue-50" : "border-pesiraGray200 hover:border-pesiraGray300"
                        }`}
                        onClick={() => setSelectedFarm(farm)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-pesiraGray900">{farm.name}</h3>
                                <p className="mt-1 text-sm text-pesiraGray500">{farm.location}</p>
                                <p className="mt-1 text-sm text-pesiraGray500">Owner: {farm.owner}</p>
                            </div>
                            {selectedFarm?.id === farm.id && (
                                <div className="ml-4">
                                    <div className="w-5 h-5 bg-pesiraGreen rounded-full flex items-center justify-center">
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
                <h2 className="text-xl font-semibold text-pesiraGray900">Inspection Details</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Fill in the inspection details for {selectedFarm?.name}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspector Name</label>
                    <input
                        type="text"
                        value={inspectionData.inspector}
                        onChange={(e) => handleInputChange("inspector", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                        placeholder="Enter inspector name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspection Date</label>
                    <input
                        type="date"
                        value={inspectionData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Soil Quality</label>
                    <select
                        value={inspectionData.soilQuality}
                        onChange={(e) => handleInputChange("soilQuality", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    >
                        <option value="">Select rating</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Crop Health</label>
                    <select
                        value={inspectionData.cropHealth}
                        onChange={(e) => handleInputChange("cropHealth", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    >
                        <option value="">Select rating</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Pest Management</label>
                    <select
                        value={inspectionData.pestManagement}
                        onChange={(e) => handleInputChange("pestManagement", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    >
                        <option value="">Select compliance</option>
                        <option value="compliant">Compliant</option>
                        <option value="minor-issues">Minor Issues</option>
                        <option value="non-compliant">Non-Compliant</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Water Management</label>
                    <select
                        value={inspectionData.waterManagement}
                        onChange={(e) => handleInputChange("waterManagement", e.target.value)}
                        className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    >
                        <option value="">Select compliance</option>
                        <option value="compliant">Compliant</option>
                        <option value="minor-issues">Minor Issues</option>
                        <option value="non-compliant">Non-Compliant</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspection Notes</label>
                <textarea
                    value={inspectionData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    placeholder="Enter detailed inspection notes..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-pesiraGray700 mb-2">Recommendations</label>
                <textarea
                    value={inspectionData.recommendations}
                    onChange={(e) => handleInputChange("recommendations", e.target.value)}
                    rows={3}
                    className="w-full border border-pesiraGray300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pesiraGreen focus:border-transparent"
                    placeholder="Enter recommendations for improvement..."
                />
            </div>

            <div className="flex justify-end mt-6 space-x-3">
                <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-pesiraGray200 hover:bg-pesiraGray300"
                >
                    Skip Save (Preview)
                </button>

                <button
                    onClick={updateInspection}
                    disabled={!inspectionId}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                        inspectionId
                            ? "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald hover:from-pesiraGreen500 hover:to-emerald-700"
                            : "bg-pesiraGray400 cursor-not-allowed"
                    }`}
                >
                    Save Draft
                </button>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-pesiraGray900">Inspection Summary</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Review and submit the inspection details.</p>
            </div>

            <div className="bg-pesiraGray50 rounded-lg p-6 space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-pesiraGray900">Farm Information</h3>
                    <div className="mt-2 text-sm text-pesiraGray600">
                        <p><strong>Farm:</strong> {selectedFarm?.name}</p>
                        <p><strong>Location:</strong> {selectedFarm?.location}</p>
                        <p><strong>Owner:</strong> {selectedFarm?.owner}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-pesiraGray900">Inspection Details</h3>
                    <div className="mt-2 text-sm text-pesiraGray600 grid grid-cols-2 gap-4">
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
                        <h3 className="text-sm font-medium text-pesiraGray900">Notes</h3>
                        <p className="mt-2 text-sm text-pesiraGray600">{inspectionData.notes}</p>
                    </div>
                )}

                {inspectionData.recommendations && (
                    <div>
                        <h3 className="text-sm font-medium text-pesiraGray900">Recommendations</h3>
                        <p className="mt-2 text-sm text-pesiraGray600">{inspectionData.recommendations}</p>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <button
                        onClick={finalizeInspection}
                        disabled={!inspectionId}
                        className={`mt-2 px-6 py-2 rounded-md text-sm font-medium text-white ${
                            inspectionId ? "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald" : "bg-pesiraGray400 cursor-not-allowed"
                        }`}
                    >
                        Submit Inspection
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-pesiraGray900">Inspection Workflow</h1>
                <p className="mt-1 text-sm text-pesiraGray600">Conduct comprehensive farm inspections with guided workflow</p>
            </div>

            <div className="bg-pesiraWhite rounded-lg shadow-sm border border-pesiraGray200 p-8">
                {renderStepIndicator()}

                <div className="min-h-96">
                    {currentStep === 1 && renderFarmSelection()}
                    {currentStep === 2 && renderInspectionDetails()}
                    {currentStep === 3 && renderSummary()}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-pesiraGray200">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                            currentStep === 1 ? "border-pesiraGray300 text-pesiraGray400 cursor-not-allowed" : "border-pesiraGray300 text-pesiraGray700 bg-pesiraWhite hover:bg-pesiraGray50"
                        }`}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={isInitiating || (currentStep === 1 && !selectedFarm)}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-pesiraWhite transition-colors ${
                                isInitiating ? "bg-pesiraGray400 cursor-not-allowed" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald hover:from-pesiraGreen500 hover:to-emerald-700"
                            }`}
                        >
                            {isInitiating ? "Initiating..." : "Next"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                    ) : (
                        <button
                            onClick={() => finalizeInspection()}
                            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-pesiraWhite bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald hover:from-pesiraGreen500 hover:to-emerald-700 transition-colors"
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
