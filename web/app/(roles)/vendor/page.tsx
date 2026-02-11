"use client";
import { useState, useEffect } from "react";
import { Truck, Search, FileText, Lock, Bell, ShieldCheck, Menu, Filter, ArrowRight, CheckCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import BidModal from "../../../components/BidModal";

export default function VendorDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedTender, setSelectedTender] = useState<any>(null);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [liveTenders, setLiveTenders] = useState<any[]>([
        { id: "GOV-TN-2026-003", title: "Public Distribution Wheat", qty: "5000 MT", due: "12 Hours", status: "BIDDING_OPEN" },
        { id: "GOV-TN-2026-004", title: "Mid-Day Meal Rice", qty: "2000 MT", due: "2 Days", status: "WON_PENDING_ESCROW" },
    ]);

    // POLL FOR LIVE UPDATES FROM OFFICER/FARMER
    useEffect(() => {
        const fetchState = async () => {
            try {
                const res = await fetch('http://10.231.253.60:8001/farmer_state');
                const data = await res.json();

                // MAP BACKEND STATE TO VENDOR UI
                // IF Farmer is "OFFICER_VERIFIED" -> It should appear as "WON_PENDING_ESCROW" for the vendor to deposit.

                // NEW LOGIC: MINTED/BIDDING -> BIDDING_OPEN
                if (data.status === "BIDDING" || data.status === "MINTED" || data.status === "OFFICER_VERIFIED") {
                    setLiveTenders(prev => {
                        const exists = prev.find(t => t.id === "FARMER_RK_001");
                        const newTender = {
                            id: "FARMER_RK_001",
                            title: `${data.crop} (Verified Grade ${data.verified_grade})`,
                            qty: `${data.verified_qty} KG`,
                            due: "Active",
                            status: "BIDDING_OPEN",
                            market_rate: data.market_rate, // Price Anchor
                            audit: { ussd_ts: data.ussd_timestamp, ipfs: data.ipfs_cid } // Transparency
                        };

                        if (exists) return prev.map(t => t.id === "FARMER_RK_001" ? newTender : t);
                        return [newTender, ...prev];
                    });
                }

                if (data.status === "ACCEPTED") {
                    setLiveTenders(prev => prev.map(t =>
                        t.id === "FARMER_RK_001" ? { ...t, status: "PENDING_ESCROW" } : t
                    ));
                }

                if (data.status === "ESCROWED" || data.status === "ESCROW_DEPOSITED") {
                    setLiveTenders(prev => prev.map(t =>
                        t.id === "FARMER_RK_001" ? { ...t, status: "LOCKED_IN_ESCROW" } : t
                    ));
                }

                if (data.status === "RELEASED" || data.status === "COMPLETED") {
                    setLiveTenders(prev => prev.map(t =>
                        t.id === "FARMER_RK_001" ? { ...t, status: "COMPLETED" } : t
                    ));
                }

            } catch (e) {
                console.error("Sync Error:", e);
            }
        };

        const interval = setInterval(fetchState, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    const openBidModal = (tender: any) => {
        setSelectedTender(tender);
        setIsBidModalOpen(true);
    };

    // Placeholder for new actions
    const handleAction = async (actionType: string, tenderId: string) => {
        setLoadingAction(tenderId);
        console.log(`Performing ${actionType} for tender ${tenderId}`);
        // 1. UPLOAD PROOF TO IPFS
        if (actionType === "confirm") {
            try {
                const ipfsRes = await fetch('http://10.231.253.60:8001/upload_ipfs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: "PROOF_OF_DELIVERY",
                        batch_id: "BATCH_102",
                        buyer_id: "BUYER_001",
                        status: "DELIVERED",
                        timestamp: new Date().toISOString()
                    })
                });
                const ipfsData = await ipfsRes.json();
                console.log("🌌 IPFS Proof Uploaded:", ipfsData.cid);
            } catch (e) { console.error("IPFS Upload Failed", e); }
        }

        // 2. Simulate Blockchain Transaction
        await new Promise(resolve => setTimeout(resolve, 1000));

        // SYNC WITH MOBILE SIMULATOR
        let newStatus = "";
        if (actionType === "deposit") newStatus = "ESCROWED";
        if (actionType === "confirm") newStatus = "RELEASED";

        if (newStatus) {
            try {
                await fetch('http://10.231.253.60:8001/update_farmer_state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmer_id: "FARMER_RK_001",
                        status: newStatus
                    })
                });
            } catch (e) { console.warn("Mobile Simulator Sync Failed", e); }
        }

        setLoadingAction(null);
        // In a real app, you'd update tender status or trigger a blockchain transaction
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
                        <NavLink icon={<FileText size={20} />} label="Active Tenders" active />
                        <NavLink icon={<Lock size={20} />} label="My Sealed Bids" />
                        <NavLink icon={<Truck size={20} />} label="Logistics" />
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">VL</div>
                            <div>
                                <div className="text-sm font-medium">Venkatesh Logistics</div>
                                <div className="text-xs text-slate-400">Class-A Contractor</div>
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
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                            <Lock size={12} /> Secure Bidding Channel
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Bell size={20} className="text-slate-500" />
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-500">Escrow Balance</div>
                            <div className="font-bold font-mono text-slate-900">₹ 25,00,000</div>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Active Government Tenders</h1>
                        <p className="text-slate-500">Securely submit sealed bids. All inputs are encrypted before chain submission.</p>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Search by Commodity or Tender ID..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
                            <Filter size={18} /> Filter
                        </button>
                    </div>

                    {/* Tender Listing */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Tender ID</th>
                                    <th className="px-6 py-3">Commodity</th>
                                    <th className="px-6 py-3">Bid Type</th>
                                    <th className="px-6 py-3">Deadline</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {liveTenders.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.title}</div>
                                            <div className="text-xs text-slate-500">{item.qty}</div>
                                            {item.market_rate && (
                                                <div className="mt-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                                                    Market: ₹{item.market_rate}/q
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-slate-600 font-medium">
                                                <Lock size={14} className="text-slate-400" /> Sealed Bid
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                4 Bids Placed. <span className="text-indigo-600 font-medium">High Bid Hidden</span>
                                            </div>
                                            {/* AUDIT TRAIL MINI-VIEW */}
                                            {item.audit && (
                                                <div className="mt-2 pl-2 border-l-2 border-blue-100 text-[10px] space-y-1">
                                                    {item.audit.ussd_ts && <div className="text-slate-500">📞 USSD: {new Date(item.audit.ussd_ts).toLocaleTimeString()}</div>}
                                                    {item.audit.ipfs && <div className="text-purple-600 font-mono">🌌 IPFS: {item.audit.ipfs.substring(0, 6)}...</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-orange-600 font-bold flex items-center gap-1"><ClockIcon /> {item.due}</td>
                                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status === 'BIDDING_OPEN' && (
                                                <button
                                                    onClick={() => openBidModal(item)}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto"
                                                >
                                                    <FileText size={12} /> Place Sealed Bid
                                                </button>
                                            )}
                                            {item.status === 'PENDING_ESCROW' && (
                                                <button
                                                    onClick={() => handleAction("deposit", item.id)}
                                                    disabled={loadingAction === item.id}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm flex items-center gap-1 ml-auto animate-pulse"
                                                >
                                                    {loadingAction === item.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Wallet size={14} />}
                                                    Deposit Escrow
                                                </button>
                                            )}
                                            {item.status === 'LOCKED_IN_ESCROW' && (
                                                <button
                                                    onClick={() => handleAction("confirm", item.id)}
                                                    disabled={loadingAction === item.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm flex items-center gap-1 ml-auto"
                                                >
                                                    {loadingAction === item.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <CheckCircle size={14} />}
                                                    Confirm Receipt & Release
                                                </button>
                                            )}
                                            {item.status === 'Evaluating' && ( // Original 'Closed' status mapped to 'Evaluating'
                                                <button disabled className="text-slate-400 text-xs font-medium cursor-not-allowed">
                                                    Locked
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
            {selectedTender && (
                <BidModal
                    isOpen={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                    tenderId={selectedTender.id}
                    commodity={selectedTender.title}
                    currentL1={selectedTender.l1}
                />
            )}
        </div>
    );
}

function NavLink({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? "bg-slate-800 text-white border-l-4 border-blue-500" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </a>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        "BIDDING_OPEN": "bg-green-100 text-green-800 border-green-200 font-bold",
        "PENDING_ESCROW": "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse",
        "LOCKED_IN_ESCROW": "bg-orange-50 text-orange-700 border-orange-200",
        "COMPLETED": "bg-blue-50 text-blue-700 border-blue-200",
        "Open": "bg-green-50 text-green-700 border-green-200",
        "Evaluating": "bg-purple-50 text-purple-700 border-purple-200"
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || "bg-slate-100"}`}>{status}</span>;
}

function ClockIcon() { return <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
