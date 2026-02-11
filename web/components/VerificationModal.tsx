"use client";
import { useState } from "react";
import { X, CheckCircle, Scale, Award } from "lucide-react";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: any;
}

export default function VerificationModal({ isOpen, onClose, listing }: VerificationModalProps) {
    const [weight, setWeight] = useState(listing?.qty?.replace(/\D/g, '') || "");
    const [grade, setGrade] = useState("A");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // 1. UPLOAD TO IPFS (Simulated)
        let ipfsCid = "QmHash...";
        try {
            const ipfsRes = await fetch('http://10.231.253.60:8001/upload_ipfs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "VERIFICATION_CERT",
                    farmer_id: "FARMER_RK_001",
                    weight: weight,
                    grade: grade,
                    officer_id: "OFFICER_001",
                    timestamp: new Date().toISOString()
                })
            });
            const ipfsData = await ipfsRes.json();
            ipfsCid = ipfsData.cid;
            console.log("🌌 IPFS CID Generated:", ipfsCid);
        } catch (e) {
            console.error("IPFS Upload Failed", e);
        }

        // 2. Simulate Blockchain Transaction (verifyProduce) with CID
        // HASHING ANIMATION
        await new Promise(resolve => setTimeout(resolve, 800)); // Hashing...

        // SYNC WITH MOBILE SIMULATOR
        // This updates the 'FARMER_STATE' so the Phone Simulator sees the new status.
        try {
            await fetch('http://10.231.253.60:8001/update_farmer_state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmer_id: "FARMER_RK_001",
                    status: "BIDDING", // NEW STATUS: Direct to Bidding
                    verified_qty: parseInt(weight) || 0,
                    verified_grade: grade,
                    ipfs_cid: ipfsCid // Attach Audit Data
                })
            });
        } catch (e) {
            console.warn("Mobile Simulator Sync Failed (Is the backend running?)", e);
        }

        setIsSubmitting(false);
        setSuccess(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">

                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>

                {!success ? (
                    <>
                        <div className="bg-slate-50 border-b border-slate-100 p-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <CheckCircle className="text-indigo-600" />
                                Verify Produce
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Physical verification for <span className="font-semibold">{listing.id}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Scale size={16} /> Verified Weight (Kg)
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Award size={16} /> Assign Grade
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['A+', 'A', 'B', 'C'].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setGrade(g)}
                                            className={`py-2 rounded-lg border text-sm font-bold transition-all ${grade === g ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 transition-all mt-4"
                            >
                                {isSubmitting ? "Signing Transaction..." : "Digitally Sign & Verify"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 animate-in zoom-in">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Verification Complete</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Listing is now <strong>OPEN FOR BIDDING</strong>.
                            <br />Transaction Hash: <span className="font-mono bg-slate-100 px-1">0x7d...a92</span>
                        </p>
                        <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
