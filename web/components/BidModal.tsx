"use client";
import { useState } from "react";
import { X, DollarSign, ShieldCheck, Lock } from "lucide-react";
import SmartValidator from "./SmartValidator";

interface BidModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenderId: string;
    currentL1: number;
    commodity: string;
}

export default function BidModal({ isOpen, onClose, tenderId, currentL1, commodity }: BidModalProps) {
    const [bidAmount, setBidAmount] = useState<string>("");
    const [step, setStep] = useState(0); // 0: Form, 1: Validation, 2: Success

    const handlePlaceBid = () => {
        setStep(1);
    };

    const handleValidationComplete = async () => {
        // Simulate API call to place bid after validation
        setTimeout(async () => {
            // SYNC WITH MOBILE SIMULATOR
            try {
                await fetch('http://10.231.253.60:8001/update_farmer_state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmer_id: "FARMER_RK_001",
                        status: "BIDDING_OPEN"
                    })
                });
            } catch (e) {
                console.warn("Mobile Simulator Sync Failed", e);
            }
            setStep(2);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-800 mb-2">Place Bid</h2>
                <div className="text-sm text-slate-500 mb-6">
                    For <span className="font-semibold text-slate-900">{commodity}</span> (ID: {tenderId})
                </div>

                {step === 0 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                            <div className="text-sm text-blue-800">
                                <strong>Secure Escrow:</strong> Your funds will be locked in the smart contract until delivery is confirmed.
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Your Bid Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Min Bid: ${currentL1}`}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceBid}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Verify & Place Bid
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 mb-4">
                            Verifying Financial Capacity & History...
                        </p>
                        <SmartValidator
                            onComplete={handleValidationComplete}
                            title="FINANCIAL AUDIT ENGINE"
                            steps={[
                                { id: "1", label: "Checking Bank Solvency...", status: "pending" },
                                { id: "2", label: "Verifying Tax Compliance...", status: "pending" },
                                { id: "3", label: "Checking Credit Score...", status: "pending" }
                            ]}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Bid Placed Successfully!</h3>
                        <p className="text-sm text-slate-500 mb-6">Your bid is now recorded on-chain.</p>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
