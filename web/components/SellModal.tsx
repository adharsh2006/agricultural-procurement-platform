"use client";
import { Upload, X, MapPin } from "lucide-react";
import SmartValidator from "./SmartValidator";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function SellModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { speak } = useLanguage();
    const [step, setStep] = useState(0); // 0: Validation, 1: Form
    const [formData, setFormData] = useState({
        commodity: "",
        quantity: "",
        minPrice: "",
        location: ""
    });

    const handleValidationComplete = () => {
        setTimeout(() => setStep(1), 800);
    };

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setFormData({ commodity: "", quantity: "", minPrice: "", location: "" });
        }
    }, [isOpen]);

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

                <h2 className="text-xl font-bold text-slate-800 mb-6">List New Crop</h2>

                {step === 0 && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 mb-4">
                            Verifying Farmer Identity & Land Records...
                        </p>
                        <SmartValidator
                            onComplete={handleValidationComplete}
                            title="IDENTITY VERIFICATION SYSTEM"
                            steps={[
                                { id: "1", label: "Connecting to Digilocker...", status: "pending" },
                                { id: "2", label: "Verifying Land Ownership (Khasra No)...", status: "pending" },
                                { id: "3", label: "Checking Bank Account Status...", status: "pending" }
                            ]}
                        />
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Commodity</label>
                            <select
                                className="w-full border border-slate-200 rounded-lg p-2"
                                value={formData.commodity}
                                onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                            >
                                <option value="">Select Crop</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Rice">Rice</option>
                                <option value="Corn">Corn</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Kg)</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-200 rounded-lg p-2"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Price (₹)</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-200 rounded-lg p-2"
                                    value={formData.minPrice}
                                    onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/10 transition-colors"
                            onClick={() => {
                                alert("Listing Created! Waiting for Officer Verification.");
                                onClose();
                            }}
                        >
                            Submit Listing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
