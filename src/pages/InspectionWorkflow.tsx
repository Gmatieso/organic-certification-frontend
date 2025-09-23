import React, { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    MapPin,
    ClipboardCheck,
    FileText,
} from "lucide-react";

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
    location?: string;
    farmerResponse: FarmerResponse;
}

interface ChecklistItem {
    id: string;
    question: string;
    answer: boolean | null;
}

const InspectionWorkflow: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [inspectionId, setInspectionId] = useState<string | null>(null);

    const [inspectorName, setInspectorName] = useState<string>("");
    const [inspectionDate, setInspectionDate] = useState<string>("");

    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    // load farms once
    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:8080/api/v1/farm")
            .then((res) => res.json())
            .then((json) => {
                if (json?.data?.content) {
                    setFarms(json.data.content);
                } else {
                    setFarms([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching farms:", err);
                setMessage("Failed to load farms.");
            })
            .finally(() => setLoading(false));
    }, []);

    // Step helpers
    const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));
    const initiateInspectionForSelectedFarm = async () => {
        if (!selectedFarm) return;
        setMessage(null);
        setCurrentStep(2);
    };


    const saveInspectorAndLoadChecklist = async () => {
        setMessage(null);

        if (!selectedFarm) {
            setMessage("Please select a farm first.");
            return;
        }
        if (!inspectorName || !inspectionDate) {
            setMessage("Please enter inspector name and date.");
            return;
        }

        setLoading(true);

        try {
            // 1) create inspection (POST)
            const createRes = await fetch("http://localhost:8080/api/v1/inspection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    farmId: selectedFarm.id,
                    inspectorName,
                    date: inspectionDate,
                }),
            });

            if (!createRes.ok) {
                const text = await createRes.text();
                console.warn("Create inspection failed:", text);
                setMessage("Failed to create inspection.");
                setLoading(false);
                return;
            }

            const createJson = await createRes.json();
            // backend returns created inspection in createJson.data (example you gave)
            // id might be createJson.data.id
            const createdId = createJson?.data?.id ?? createJson?.data?.inspectionId ?? null;
            if (!createdId) {
                console.warn("No inspection id returned:", createJson);
                setMessage("No inspection id returned by server.");
                setLoading(false);
                return;
            }

            setInspectionId(createdId);

            // 2) fetch checklist for created inspection id
            const checklistRes = await fetch(
                `http://localhost:8080/api/v1/checklists/inspection/${createdId}`
            );

            if (!checklistRes.ok) {
                const text = await checklistRes.text();
                console.warn("Fetch checklist failed:", text);
                setMessage("Failed to load checklist.");
                setLoading(false);
                return;
            }

            const checklistJson = await checklistRes.json();
            const items = Array.isArray(checklistJson.data)
                ? checklistJson.data
                : checklistJson?.data?.content ?? checklistJson?.data ?? [];

            const formatted: ChecklistItem[] = (items as any[]).map((it) => ({
                id: it.id,
                question: it.question ?? it.title ?? "Unknown question",
                answer: it.answer ?? null,
            }));

            setChecklist(formatted);

            // move to checklist step
            setCurrentStep(3);
        } catch (err) {
            console.error("saveInspectorAndLoadChecklist error:", err);
            setMessage("Network error while creating inspection or fetching checklist.");
        } finally {
            setLoading(false);
        }
    };


    const setAnswer = (checklistId: string, answer: boolean) => {
        setChecklist((prev) =>
            prev.map((item) => (item.id === checklistId ? { ...item, answer } : item))
        );
    };

    // Submit answers
    const submitAnswersAndComplete = async () => {
        if (!inspectionId) {
            setMessage("Missing inspection id.");
            return;
        }

        const unanswered = checklist.filter((c) => c.answer === null);
        if (unanswered.length > 0) {
            const confirmProceed = window.confirm(
                `There are ${unanswered.length} unanswered questions. Submit anyway?`
            );
            if (!confirmProceed) return;
        }

        const answersPayload = checklist.map((c) => ({
            checklistId: c.id,
            answer: !!c.answer,
        }));

        setLoading(true);
        setMessage(null);

        try {
            const resAnswers = await fetch("http://localhost:8080/api/v1/checklists/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(answersPayload),
            });

            if (!resAnswers.ok) {
                const text = await resAnswers.text();
                console.warn("Answers POST failed:", text);
                setMessage("Failed to submit answers.");
                setLoading(false);
                return;
            }

            // success response expected: { code: 200, message: "Checklist answers submitted successfully" }
            setMessage("Checklist answers submitted successfully.");
            setCurrentStep(4);
        } catch (err) {
            console.error("Failed submitting answers:", err);
            setMessage("Network error while submitting answers.");
        } finally {
            setLoading(false);
        }
    };

    // UI helpers
    const steps = [
        { id: 1, name: "Farm Selection", icon: MapPin },
        { id: 2, name: "Inspector Details", icon: ClipboardCheck },
        { id: 3, name: "Checklist", icon: Check },
        { id: 4, name: "Summary", icon: FileText },
    ];

    const renderStepIndicator = () => (
        <nav aria-label="Progress" className="mb-6">
            <ol className="flex items-center">
                {steps.map((s, idx) => (
                    <li key={s.id} className={`flex-1 relative ${idx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""}`}>
                        <div className="absolute inset-0 flex items-center">
                            <div className={`h-0.5 w-full ${s.id < currentStep ? "bg-pesiraGreen" : "bg-pesiraGray200"}`} />
                        </div>
                        <div
                            className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                                s.id < currentStep ? "bg-pesiraGreen border-pesiraGreen" : s.id === currentStep ? "border-pesiraGreen bg-white" : "border-pesiraGray300 bg-white"
                            }`}
                        >
                            {s.id < currentStep ? <Check className="h-4 w-4 text-white" /> : <s.icon className={`h-4 w-4 ${s.id === currentStep ? "text-pesiraGreen" : "text-pesiraGray400"}`} />}
                        </div>
                        <div className="mt-2">
                            <span className={`text-sm font-medium ${s.id <= currentStep ? "text-pesiraGreen" : "text-pesiraGray500"}`}>{s.name}</span>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );

    const renderFarmSelection = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-pesiraGray900">Select Farm for Inspection</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Choose the farm you want to inspect.</p>
            </div>

            {loading && <div className="text-sm text-pesiraGray600">Loading farms...</div>}
            {message && <div className="text-sm text-amber-700">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map((f) => (
                    <div
                        key={f.id}
                        onClick={() => setSelectedFarm(f)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${selectedFarm?.id === f.id ? "border-pesiraGreen bg-blue-50" : "border-pesiraGray200 hover:border-pesiraGray300"}`}
                    >
                        <div>
                            <h3 className="text-sm font-medium text-pesiraGray900">{f.farmName}</h3>
                            <p className="mt-1 text-sm text-pesiraGray500">{f.location}</p>
                            {f.farmerResponse && <p className="text-sm text-pesiraGray500">Owner: {f.farmerResponse.name}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInspectorDetails = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-pesiraGray900">Inspector Details</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Enter inspector name and the inspection date, then create inspection and load the checklist.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspector name</label>
                    <input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} placeholder="e.g. Judith Njeri" className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspection date</label>
                    <input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={() => setCurrentStep(1)} className="px-4 py-2 border rounded text-sm">Back</button>

                <button
                    onClick={saveInspectorAndLoadChecklist}
                    disabled={loading || !inspectorName || !inspectionDate}
                    className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}
                >
                    {loading ? "Loading..." : "Save & Load Checklist"}
                </button>
            </div>
        </div>
    );

    const renderChecklistUI = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-pesiraGray900">Inspection Checklist</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Answer Yes or No for each question.</p>
            </div>

            <div className="space-y-3">
                {checklist.map((it) => (
                    <div key={it.id} className="flex items-center justify-between border rounded p-3">
                        <div className="pr-4 text-sm text-pesiraGray800">{it.question}</div>
                        <div className="flex items-center gap-3">
                            <label className="inline-flex items-center">
                                <input type="radio" name={`chk-${it.id}`} checked={it.answer === true} onChange={() => setAnswer(it.id, true)} />
                                <span className="ml-2 text-sm">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="radio" name={`chk-${it.id}`} checked={it.answer === false} onChange={() => setAnswer(it.id, false)} />
                                <span className="ml-2 text-sm">No</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <button onClick={() => setCurrentStep(2)} className="px-4 py-2 border rounded text-sm">Back</button>

                <div className="flex items-center gap-3">
                    {message && <div className="text-sm text-amber-700">{message}</div>}
                    <button onClick={submitAnswersAndComplete} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}>
                        {loading ? "Submitting..." : "Submit Answers & Complete"}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-pesiraGray900">Done — Summary</h2>
                <p className="mt-1 text-sm text-pesiraGray600">Inspection has been submitted.</p>
            </div>

            <div className="bg-pesiraGray50 p-4 rounded">
                <p><strong>Farm:</strong> {selectedFarm?.farmName}</p>
                <p><strong>Inspection ID:</strong> {inspectionId ?? "—"}</p>
                <p><strong>Inspector:</strong> {inspectorName}</p>
                <p><strong>Date:</strong> {inspectionDate}</p>
                <p className="mt-2 text-sm text-pesiraGray700">{message ?? "Completed successfully."}</p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        // reset wizard
                        setSelectedFarm(null);
                        setInspectionId(null);
                        setInspectorName("");
                        setInspectionDate("");
                        setChecklist([]);
                        setMessage(null);
                        setCurrentStep(1);
                    }}
                    className="px-4 py-2 rounded border"
                >
                    New Inspection
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-pesiraGray900">Inspection Workflow</h1>
                <p className="mt-1 text-sm text-pesiraGray600">Conduct inspections — select farm, add inspector, answer checklist, submit.</p>
            </div>

            <div className="bg-pesiraWhite rounded-lg shadow-sm border p-6">
                {renderStepIndicator()}

                <div className="min-h-[240px]">
                    {currentStep === 1 && renderFarmSelection()}
                    {currentStep === 2 && renderInspectorDetails()}
                    {currentStep === 3 && renderChecklistUI()}
                    {currentStep === 4 && renderSummary()}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t">
                    <button onClick={goPrev} disabled={currentStep === 1} className="px-4 py-2 border rounded text-sm disabled:opacity-50">
                        <ChevronLeft className="inline-block h-4 w-4 mr-2" />
                        Previous
                    </button>

                    {currentStep === 1 ? (
                        <button onClick={initiateInspectionForSelectedFarm} disabled={!selectedFarm || loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}>
                            {loading ? "Initiating..." : "Next"}
                            <ChevronRight className="inline-block h-4 w-4 ml-2" />
                        </button>
                    ) : currentStep === 2 ? (
                        <button onClick={saveInspectorAndLoadChecklist} disabled={!inspectorName || !inspectionDate || loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}>
                            {loading ? "Loading..." : "Save & Load Checklist"}
                        </button>
                    ) : currentStep === 3 ? (
                        <button onClick={submitAnswersAndComplete} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}>
                            {loading ? "Submitting..." : "Submit Answers"}
                        </button>
                    ) : (
                        <div />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspectionWorkflow;
