"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, FileCheck, Users, Activity, Lock, Unlock, Key, Menu, Bell, CheckCircle } from "lucide-react";

import VerificationModal from "../../../components/VerificationModal";

export default function OfficerDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    // --- MOCK DATA STATE ---
    const [pendingItems, setPendingItems] = useState([
        { id: "LST-2026-001", farmer: "Ramesh Kumar", crop: "Sharbati Wheat", qty: "Wait...", status: "PENDING" },
        { id: "LST-2026-002", farmer: "Suresh Patel", crop: "Turmeric", qty: "50 Kg", status: "PENDING" }
    ]);

    const openVerifyModal = (item: any) => {
        setSelectedItem(item);
        setIsVerifyModalOpen(true);
    };

    // --- POLLING FOR VOICE AI UPDATES (THE "MAGIC") ---
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://10.231.253.60:8001/farmer_state');
                const data = await res.json();

                // If the Voice AI says "PENDING_VERIFICATION", show it!
                // We check if verified_qty > 0 to confirm data entry.
                if (data.status === "PENDING_VERIFICATION" && data.verified_qty > 0) {
                    setPendingItems(prev => prev.map(item =>
                        item.id === "LST-2026-001" ? {
                            ...item,
                            qty: `${data.verified_qty} Kg`,
                            status: "READY_TO_VERIFY",
                            crop: "Wheat (Voice Entry)"
                        } : item
                    ));
                }

                // NEW: Handle Completed Verification
                if (data.status === "BIDDING" || data.status === "MINTED") {
                    setPendingItems(prev => prev.map(item =>
                        item.id === "LST-2026-001" ? {
                            ...item,
                            qty: `${data.verified_qty} Kg`,
                            status: "VERIFIED"
                        } : item
                    ));
                }
            } catch (e) {
                // Silent fail for demo
            }
        }, 1000); // 1 Second Poll

        return () => clearInterval(interval);
    }, []);

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
                        <NavLink icon={<FileCheck size={20} />} label="Pending Verification" active />
                        <NavLink icon={<Users size={20} />} label="Farmer Registry" />
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">PO</div>
                            <div>
                                <div className="text-sm font-medium">Rajesh Verma</div>
                                <div className="text-xs text-slate-400">Chief Officer</div>
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
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                            <Key size={12} /> Notary Access Level
                        </span>
                    </div>
                </header>

                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Pending Verification</h1>
                        <p className="text-slate-500">Physically verify produce and sign to open bidding.</p>
                    </div>

                    {/* Pending Actions Table */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Listing ID</th>
                                    <th className="px-6 py-3">Farmer</th>
                                    <th className="px-6 py-3">Crop</th>
                                    <th className="px-6 py-3">Expected Qty</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingItems.map((item) => (
                                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${item.status === "READY_TO_VERIFY" ? "bg-green-50/60" : ""}`}>
                                        <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{item.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.farmer}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.crop}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{item.qty}</td>
                                        <td className="px-6 py-4">
                                            {item.status === "VERIFIED" ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-green-100 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                                    Pending Verification
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status === "VERIFIED" ? (
                                                <button disabled className="text-slate-400 text-xs font-medium cursor-not-allowed">
                                                    Signed & Minted
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openVerifyModal(item)}
                                                    className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto"
                                                >
                                                    <FileCheck size={12} /> Verify & Sign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Injection */}
            {selectedItem && (
                <VerificationModal
                    isOpen={isVerifyModalOpen}
                    onClose={() => setIsVerifyModalOpen(false)}
                    listing={selectedItem}
                />
            )}
        </div>
    );
}

import SmartValidator from "../../../components/SmartValidator";



function NavLink({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? "bg-slate-800 text-white border-l-4 border-indigo-500" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </a>
    );
}
