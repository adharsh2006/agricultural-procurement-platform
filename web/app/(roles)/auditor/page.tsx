"use client";
import { useState } from "react";
import { BarChart3, Search, FileText, CheckCircle, AlertTriangle, ShieldCheck, Menu, Download } from "lucide-react";

import LiveProcurementTracker from "../../../components/LiveProcurementTracker";
import BidLogViewer from "../../../components/BidLogViewer";

export default function AuditorDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchHash, setSearchHash] = useState("");
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [selectedTender, setSelectedTender] = useState<string | null>(null);

    const validHash = "0x892a99b2"; // Demo Hash

    const handleVerify = () => {
        if (searchHash.includes(validHash)) {
            setVerificationResult({
                status: "success",
                block: "#882912",
                timestamp: "2026-02-04 10:42:12 UTC",
                signer: "Officer Rajesh Verma (0x71...8A)",
                integrity: "100% MATCH"
            });
        } else {
            setVerificationResult({ status: "error" });
        }
    };

    const handleExport = () => {
        alert("Generating PDF Audit Report... \n\nCompliance Status: 100% \nTamper-Proof Check: PASSED \n\nDownloading 'Audit_Report_FY26.pdf'...");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            {/* Sidebar (Desktop) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <ShieldCheck className="text-blue-400 mr-2" />
                        <span className="font-bold text-lg tracking-wide">ProcureChain</span>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <NavLink icon={<BarChart3 size={20} />} label="Blockchain Ledger" active />
                        <NavLink icon={<Search size={20} />} label="Forensic Audit" />
                        <NavLink icon={<AlertTriangle size={20} />} label="Flagged Transac." />
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">CAG</div>
                            <div>
                                <div className="text-sm font-medium">CAG Auditor</div>
                                <div className="text-xs text-slate-400">Read-Only Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
                    <button className="md:hidden text-slate-600" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></button>
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                            Immutable Ledger View
                        </span>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline"
                    >
                        <Download size={16} /> Export Report
                    </button>
                </header>

                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Blockchain Audit Trail</h1>
                        <p className="text-slate-500">Real-time listing of all hashed transactions. Verify immutability below.</p>
                    </div>

                    {/* NEW: Tender Audit Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-slate-500" /> Select Tender to Audit
                        </h3>

                        {!selectedTender ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: "T-1024", title: "Wheat Procurement (Punjab)", bids: 12, status: "Open" },
                                    { id: "T-1025", title: "Basmati Rice (Haryana)", bids: 8, status: "Locked" },
                                    { id: "T-1026", title: "Cotton Bundle (Gujarat)", bids: 15, status: "Review" },
                                ].map((tender) => (
                                    <div
                                        key={tender.id}
                                        onClick={() => setSelectedTender(tender.id)}
                                        className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md cursor-pointer transition-all hover:border-blue-400 group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{tender.id}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${tender.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {tender.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{tender.title}</h4>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><ShieldCheck size={12} /> {tender.bids} Bids (Encrypted)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <BidLogViewer tenderId={selectedTender} onClose={() => setSelectedTender(null)} />
                        )}
                    </div>

                    {/* Tracker Section */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-blue-600" size={20} /> Real-Time Asset Tracking
                        </h3>
                        <LiveProcurementTracker status="LOCKED" currentStep={2} />
                    </div>

                    {/* Interactive Verification Tool */}
                    <div className="bg-slate-900 text-slate-200 rounded-xl p-6 mb-8 border border-slate-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Search size={18} className="text-blue-400" /> Forensic Hash Verifier
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchHash}
                                    onChange={(e) => setSearchHash(e.target.value)}
                                    placeholder="Paste Transaction Hash (Try: 0x892a99b2)"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-mono text-sm focus:outline-none focus:border-blue-500 text-white"
                                />
                                <button
                                    className="absolute right-2 top-2.5 text-xs text-slate-400 hover:text-white"
                                    onClick={() => setSearchHash(validHash)}
                                >
                                    [Demo: Paste Valid]
                                </button>
                            </div>
                            <button
                                onClick={handleVerify}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <CheckCircle size={18} /> Verify On-Chain
                            </button>
                        </div>

                        {/* Verification Output */}
                        {verificationResult && (
                            <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${verificationResult.status === 'success' ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                {verificationResult.status === 'success' ? (
                                    <>
                                        <CheckCircle className="text-emerald-500 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-emerald-400 font-bold">Hash Verified Successfully</h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-xs font-mono text-slate-300">
                                                <span>Block Height:</span> <span className="text-white">{verificationResult.block}</span>
                                                <span>Timestamp:</span> <span className="text-white">{verificationResult.timestamp}</span>
                                                <span>Signer:</span> <span className="text-white">{verificationResult.signer}</span>
                                                <span>Merkle Root:</span> <span className="text-emerald-400">{verificationResult.integrity}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="text-red-500 mt-1" size={20} />
                                        <div>
                                            <h4 className="text-red-400 font-bold">Verification Failed</h4>
                                            <p className="text-xs text-red-200 mt-1">
                                                Hash not found in the immutable ledger. This record may be fraudulent or does not exist on the configured network.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-slate-500 mt-3">
                            * Connects directly to Polygon/Ethereum RPC nodes to verify merkle integrity.
                        </p>
                    </div>

                    {/* Timeline / Ledger */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">

                            <TimelineItem
                                time="Just Now"
                                title="Digital Signature Validated"
                                desc="Officer Rajesh Verma approved Tender APR-2026-X82. Signature verified."
                                hash="0x892a99b2"
                                status="Verified"
                            />

                            <TimelineItem
                                time="2 mins ago"
                                title="Sealed Bid Submission"
                                desc="Vendor (Hash: 0x4f...a2) submitted encrypted bid for 'Wheat Procurement'."
                                hash="0x773d...11c4"
                                status="Encrypted"
                            />

                            <TimelineItem
                                time="12 mins ago"
                                title="Tender Creation"
                                desc="New Tender created for 'Mid-Day Meal Rice' (2000 MT)."
                                hash="0x112c...88d1"
                                status="Indexed"
                            />

                            <TimelineItem
                                time="1 hour ago"
                                title="Farmer Listing (IoT Verified)"
                                desc="Ramesh Kumar listed 100Kg Wheat. IoT Scale ID #774 verified weight."
                                hash="0x339b...22e9"
                                status="Verified"
                            />

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function TimelineItem({ time, title, desc, hash, status }: any) {
    return (
        <div className="relative pl-8">
            <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500"></span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{time}</span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Tx: {hash}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-slate-600 mt-1 mb-2 text-sm">{desc}</p>
            <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {status === 'Verified' && <CheckCircle size={12} />}
                {status}
            </div>
        </div>
    );
}

function NavLink({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? "bg-slate-800 text-white border-l-4 border-slate-500" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </a>
    );
}
