import React, { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    MapPin,
    ClipboardCheck,
    FileText,
} from "lucide-react";

/**
 * InspectionWorkflow
 *
 * Steps:
 * 1. Select Farm -> POST /api/v1/inspection  (creates inspection and returns inspectionId)
 * 2. Inspector details (inspectorName + date) -> PATCH /api/v1/inspection/{inspectionId}
 *    then GET checklist -> GET /api/v1/checklists/inspection/{inspectionId}
 * 3. Answer checklist -> POST /api/v1/checklists/answers  (array of { checklistId, answer })
 *    then complete inspection -> POST /api/v1/inspection/{inspectionId}/complete
 * 4. Summary / success
 */

type Farm = {
    id: string;
    name: string;
    location?: string;
    owner?: string;
};

type ChecklistItem = {
    id: string;
    question: string;
    answer: boolean | null; // true = yes, false = no, null = unanswered
};

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

    // fetch farms on mount
    useEffect(() => {
        setLoading(true);
        fetch("https://organic-certification-production.up.railway.app/api/v1/farm")
            .then((res) => res.json())
            .then((json) => {
                if (json?.data?.content) {
                    // adapt shape if necessary
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
    const goTo = (step: number) => setCurrentStep(step);

    // 1) Create inspection when pressing Next on farm selection
    const initiateInspectionForSelectedFarm = async () => {
        if (!selectedFarm) return;
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(
                "https://organic-certification-production.up.railway.app/api/v1/inspection",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ farmId: selectedFarm.id }),
                }
            );

            const json = await res.json();
            // backend might return inspectionId under json.data.inspectonId or similar - we use json.data.inspectionId as you described earlier
            const id = json?.data?.inspectionId ?? json?.data?.id ?? null;
            if (!id) {
                console.warn("No inspectionId returned from create inspection:", json);
            } else {
                setInspectionId(id);
            }

            // advance to inspector details step (step 2)
            setCurrentStep(2);
        } catch (err) {
            console.error("Failed to create inspection:", err);
            setMessage("Failed to initiate inspection — try again.");
            // still allow moving to step 2 so user can fill details (optional)
            setCurrentStep(2);
        } finally {
            setLoading(false);
        }
    };

    // 2) Save inspector details and fetch checklist
    const saveInspectorAndLoadChecklist = async () => {
        setMessage(null);

        if (!inspectionId) {
            // If for any reason inspectionId wasn't created, attempt to create one now:
            if (!selectedFarm) {
                setMessage("No farm selected");
                return;
            }
            await initiateInspectionForSelectedFarm();
            if (!inspectionId) {
                // try reading again after create (it might have been set by create call)
                // but avoid infinite loop; if still missing, warn user and continue
                console.warn("inspectionId missing after create");
            }
        }

        // PATCH inspection with inspector details (if inspectionId exists)
        if (inspectionId) {
            setLoading(true);
            try {
                const payload = {
                    inspectorName: inspectorName,
                    date: inspectionDate,
                };

                const res = await fetch(
                    `https://organic-certification-production.up.railway.app/api/v1/inspection/${inspectionId}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) {
                    console.warn("PATCH inspection returned non-OK", await res.text());
                }
            } catch (err) {
                console.error("Failed to patch inspection:", err);
                setMessage("Failed to save inspector details (saved locally).");
            } finally {
                setLoading(false);
            }
        }

        // fetch checklist for this inspection
        try {
            setLoading(true);
            const res = await fetch(
                `https://organic-certification-production.up.railway.app/api/v1/checklists/inspection/${inspectionId}`
            );
            const json = await res.json();
            // Expecting json.data to be an array as in your sample. Fallback if different.
            const items = Array.isArray(json.data)
                ? json.data
                : json?.data?.content ?? json?.data ?? [];

            const formatted: ChecklistItem[] = (items as any[]).map((it) => ({
                id: it.id,
                question: it.question ?? it.title ?? "Unknown question",
                answer: null,
            }));
            setChecklist(formatted);

            // advance to checklist step
            setCurrentStep(3);
        } catch (err) {
            console.error("Failed to fetch checklist:", err);
            setMessage("Failed to load checklist. You can try again.");
        } finally {
            setLoading(false);
        }
    };

    // Answer change
    const setAnswer = (checklistId: string, answer: boolean) => {
        setChecklist((prev) =>
            prev.map((item) => (item.id === checklistId ? { ...item, answer } : item))
        );
    };

    // 3) Submit answers and complete inspection
    const submitAnswersAndComplete = async () => {
        if (!inspectionId) {
            setMessage("Missing inspection id.");
            return;
        }

        // ensure all answered (optional)
        const unanswered = checklist.filter((c) => c.answer === null);
        if (unanswered.length > 0) {
            const confirmProceed = window.confirm(
                `There are ${unanswered.length} unanswered questions. Submit anyway?`
            );
            if (!confirmProceed) return;
        }

        // build answers payload expected by your API: array of { checklistId, answer }
        const answersPayload = checklist.map((c) => ({
            checklistId: c.id,
            answer: !!c.answer,
        }));

        setLoading(true);
        setMessage(null);

        try {
            // post answers
            const resAnswers = await fetch(
                "https://organic-certification-production.up.railway.app/api/v1/checklists/answers",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(answersPayload),
                }
            );

            if (!resAnswers.ok) {
                const text = await resAnswers.text();
                console.warn("Answers POST failed:", text);
                setMessage("Failed to submit answers.");
                setLoading(false);
                return;
            }

            // then complete inspection (endpoint you gave earlier was ..../complete)
            const resComplete = await fetch(
                `https://organic-certification-production.up.railway.app/api/v1/inspection/${inspectionId}/complete`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // some backends expect answers in complete call too; sending same payload (safe)
                    body: JSON.stringify(answersPayload),
                }
            );

            if (!resComplete.ok) {
                const text = await resComplete.text();
                console.warn("Complete inspection failed:", text);
                setMessage("Answers saved but failed to complete inspection.");
                setLoading(false);
                return;
            }

            // success
            setMessage("Inspection submitted successfully.");
            setCurrentStep(4);
        } catch (err) {
            console.error("Failed submitting answers / completing inspection:", err);
            setMessage("Network error while submitting answers.");
        } finally {
            setLoading(false);
        }
    };

    // UI render pieces
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
                        <div className={`relative w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                            s.id < currentStep ? "bg-pesiraGreen border-pesiraGreen" : s.id === currentStep ? "border-pesiraGreen bg-white" : "border-pesiraGray300 bg-white"
                        }`}>
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
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedFarm?.id === f.id ? "border-pesiraGreen bg-blue-50" : "border-pesiraGray200 hover:border-pesiraGray300"
                        }`}
                    >
                        <div>
                            <h3 className="text-sm font-medium text-pesiraGray900">{f.name}</h3>
                            <p className="mt-1 text-sm text-pesiraGray500">{f.location}</p>
                            {f.owner && <p className="text-sm text-pesiraGray500">Owner: {f.owner}</p>}
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
                <p className="mt-1 text-sm text-pesiraGray600">Enter inspector name and the inspection date, then load the checklist.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspector name</label>
                    <input
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                        placeholder="e.g. Judith Njeri"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-pesiraGray700 mb-2">Inspection date</label>
                    <input
                        type="date"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 border rounded text-sm"
                >
                    Back
                </button>

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
                    <button
                        onClick={submitAnswersAndComplete}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}
                    >
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
                <p><strong>Farm:</strong> {selectedFarm?.name}</p>
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
                    <button
                        onClick={goPrev}
                        disabled={currentStep === 1}
                        className="px-4 py-2 border rounded text-sm disabled:opacity-50"
                    >
                        <ChevronLeft className="inline-block h-4 w-4 mr-2" />
                        Previous
                    </button>

                    {currentStep === 1 ? (
                        <button
                            onClick={initiateInspectionForSelectedFarm}
                            disabled={!selectedFarm || loading}
                            className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}
                        >
                            {loading ? "Initiating..." : "Next"}
                            <ChevronRight className="inline-block h-4 w-4 ml-2" />
                        </button>
                    ) : currentStep === 2 ? (
                        <button
                            onClick={saveInspectorAndLoadChecklist}
                            disabled={!inspectorName || !inspectionDate || loading}
                            className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}
                        >
                            {loading ? "Loading..." : "Save & Load Checklist"}
                        </button>
                    ) : currentStep === 3 ? (
                        <button
                            onClick={submitAnswersAndComplete}
                            disabled={loading}
                            className={`px-4 py-2 rounded text-white ${loading ? "bg-pesiraGray400" : "bg-gradient-to-r from-pesiraGreen500 to-pesiraEmerald"}`}
                        >
                            {loading ? "Submitting..." : "Submit Answers"}
                        </button>
                    ) : (
                        <div /> /* step 4 - no right action here, summary shows New Inspection button */
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspectionWorkflow;
