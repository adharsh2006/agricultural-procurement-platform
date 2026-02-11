"use client";
import { useState, useEffect } from "react";
import { Mic, Plus, Gavel, Wallet, Bell, ShieldCheck, Menu, LogOut } from "lucide-react";
import SellModal from "../../../components/SellModal";
import { useLanguage } from "../../../context/LanguageContext";

export default function FarmerDashboard() {
    const { speak } = useLanguage();
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);

    // --- POLLING STATE ---
    const [farmerState, setFarmerState] = useState<any>({
        verified_qty: 0,
        crop: "Wheat",
        status: "NO_ACTION"
    });

    // Mock Data for "Active Bids" and "Waiting for Payment"
    const activeBidsCount = 2;
    const paymentPendingAmount = "₹ 45,000";

    // --- POLL BACKEND ---
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('http://10.231.253.60:8001/farmer_state');
                const data = await res.json();
                setFarmerState(data);
            } catch (e) { }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

            {/* 1. Header & Notification Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-green-600" size={24} />
                        <span className="font-bold text-lg text-slate-800">AgriProcure</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">RK</div>
                        <LogOut size={20} className="text-slate-400" />
                    </div>
                </div>

                {/* Critical Notification Bar (DYNAMIC) */}
                {farmerState.status !== "NO_ACTION" && (
                    <div className="bg-blue-600 text-white px-4 py-3 flex items-start gap-3 shadow-md">
                        <Bell className="shrink-0 mt-0.5 animate-bounce" size={20} />
                        <div>
                            <p className="font-bold text-sm">Status Update</p>
                            <p className="text-sm opacity-90">
                                Your <span className="font-bold text-yellow-300">{farmerState.verified_qty}kg {farmerState.crop}</span> is currently: <span className="underline">{farmerState.status}</span>.
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* 2. Main Action Area - THE 3 BIG CARDS */}
            <main className="p-4 space-y-4 max-w-md mx-auto mt-2">

                {/* Card 1: LIST NEW CROP (Green) */}
                <button
                    onClick={() => setIsSellModalOpen(true)}
                    className="w-full bg-gradient-to-br from-green-500 to-green-600 active:scale-95 transition-transform rounded-2xl p-6 shadow-lg shadow-green-900/20 text-left relative overflow-hidden group"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Plus size={100} />
                    </div>
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Plus className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">List New Crop</h2>
                    <p className="text-green-100 text-sm">Sell Wheat, Rice, Corn...</p>
                </button>

                <div className="grid grid-cols-2 gap-4">
                    {/* Card 2: ACTIVE BIDS (Blue) */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
                        <Gavel className="text-blue-600 mb-3" size={28} />
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Bids</h3>
                        <div className="text-3xl font-bold text-slate-800">{activeBidsCount}</div>
                        <p className="text-xs text-slate-400 mt-1">Live Auctions</p>
                    </div>

                    {/* Card 3: PAYMENT STATUS (Purple) */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-8 -mt-8"></div>
                        <Wallet className="text-purple-600 mb-3" size={28} />
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Escrow</h3>
                        <div className="text-xl font-bold text-slate-800 truncate">{paymentPendingAmount}</div>
                        <p className="text-xs text-slate-400 mt-1">Waiting for delivery</p>
                    </div>
                </div>

                {/* Recent Items List (Simplified) */}
                <div className="pt-4">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Recent Activity</h3>
                    <div className="space-y-3">
                        {/* DYNAMIC ITEM FROM USSD */}
                        {farmerState.verified_qty > 0 && (
                            <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm border-l-4 border-l-yellow-400">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">🌾</div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{farmerState.crop} ({farmerState.verified_qty}Kg)</div>
                                        <div className="text-xs text-slate-500">Listed via USSD</div>
                                    </div>
                                </div>
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md">{farmerState.status}</span>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">🌾</div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">Historical Batch</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Paid</span>
                        </div>
                    </div>
                </div>

            </main>

            {/* Modal Injection */}
            <SellModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />
        </div>
    );
}
