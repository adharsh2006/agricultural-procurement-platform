"use client";
import { useState } from "react";
import { Lock, Unlock, CheckCircle, ShieldCheck, Search, Eye } from "lucide-react";

interface Bid {
    id: string;
    bidder: string;
    encryptedAmount: string; // "**********"
    hash: string;
    timestamp: string;
    status: "SEALED" | "REVEALED";
    verified: boolean;
}

export default function BidLogViewer({ tenderId, onClose }: { tenderId: string, onClose: () => void }) {
    const [bids, setBids] = useState<Bid[]>([
        { id: "B-101", bidder: "AgriCorp Ltd (0x7A...99)", encryptedAmount: "**********", hash: "0x882...a1", timestamp: "10:00 AM", status: "SEALED", verified: false },
        { id: "B-102", bidder: "GrainExports Inc (0x4B...22)", encryptedAmount: "**********", hash: "0x11c...b2", timestamp: "10:15 AM", status: "SEALED", verified: false },
        { id: "B-103", bidder: "Local Mandi Assn (0x9C...11)", encryptedAmount: "**********", hash: "0x33d...f4", timestamp: "10:30 AM", status: "SEALED", verified: false },
    ]);

    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const [revealed, setRevealed] = useState(false);

    const handleVerify = (id: string) => {
        setVerifyingId(id);
        setTimeout(() => {
            setBids(prev => prev.map(b => b.id === id ? { ...b, verified: true } : b));
            setVerifyingId(null);
        }, 1500);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="text-blue-400" /> Audit Logs: Tender {tenderId}
                    </h3>
                    <p className="text-xs text-slate-400">Cryptographic Proof of Sealed Bids</p>
                </div>
                <div className="flex items-center gap-4">
                    {!revealed && (
                        <button onClick={() => setRevealed(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                            <Unlock size={12} /> Simulate Deadline End
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-sm hover:underline">
                        Close Viewer
                    </button>
                </div>
            </div>

            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Bidder Identity (Anon)</th>
                            <th className="px-6 py-3">Bid Amount</th>
                            <th className="px-6 py-3">Merkle Hash</th>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3 text-right">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bids.map((bid) => (
                            <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-700">{revealed ? bid.bidder : "Anon (Hidden)"}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded w-fit border ${revealed ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "text-slate-400 bg-slate-100 border-slate-200"}`}>
                                        {revealed ? <Unlock size={12} /> : <Lock size={12} />}
                                        {revealed ? (bid.id === 'B-101' ? '₹ 22,00,000' : bid.id === 'B-102' ? '₹ 21,50,000' : '₹ 23,00,000') : bid.encryptedAmount}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-600">{bid.hash}</td>
                                <td className="px-6 py-4 text-slate-500">{bid.timestamp}</td>
                                <td className="px-6 py-4 text-right">
                                    {bid.verified ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-xs">
                                            <CheckCircle size={14} /> Verified on Chain
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleVerify(bid.id)}
                                            disabled={!!verifyingId}
                                            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                                        >
                                            {verifyingId === bid.id ? (
                                                <>Scanning...</>
                                            ) : (
                                                <><Search size={12} /> Verify Hash</>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>* Bids are encrypted using AES-256 until the Tender Deadline expires.</span>
                <span className="flex items-center gap-1"><Lock size={10} /> Zero-Knowledge Proof Active</span>
            </div>
        </div>
    );
}
