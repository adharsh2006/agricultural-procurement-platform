"use client";
import { useState } from "react";
import { Eye, Check, Truck, Clock, MoreHorizontal } from "lucide-react";

interface Bid {
    bidder: string;
    amount: number;
    time: string;
}

interface Listing {
    id: string;
    commodity: string;
    quantity: string;
    minPrice: number;
    status: "PENDING" | "OFFICER_VERIFIED" | "LOCKED_IN_ESCROW" | "COMPLETED";
    highestBid?: Bid;
    bidsCount: number;
    date: string;
}

const MOCK_LISTINGS: Listing[] = [
    {
        id: "TDR-2026-005",
        commodity: "Soybean",
        quantity: "200 Kg",
        minPrice: 3500,
        status: "PENDING", // Initial state
        bidsCount: 0,
        date: "Just Now"
    },
    {
        id: "TDR-2026-001",
        commodity: "Sharbati Wheat",
        quantity: "100 Kg",
        minPrice: 2200,
        status: "OFFICER_VERIFIED", // Ready for bidding
        highestBid: { bidder: "ITC Agrotech", amount: 2350, time: "2 mins ago" },
        bidsCount: 3,
        date: "Today, 10:30 AM"
    },
    {
        id: "TDR-2025-892",
        commodity: "Basmati Rice",
        quantity: "500 Kg",
        minPrice: 4000,
        status: "LOCKED_IN_ESCROW", // Funds locked
        highestBid: { bidder: "BigBasket Sourcing", amount: 4100, time: "2 days ago" },
        bidsCount: 5,
        date: "Feb 1, 2026"
    }
];

export default function FarmerListings() {
    // In a real app, this would fetch from the Blockchain
    const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
    const [approving, setApproving] = useState<string | null>(null);

    // Removed handleApprove as it's not part of P2P flow (Automatic/Buyer driven)
    const handleAction = () => { };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-700">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">My Listings</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">Refernce ID</th>
                            <th className="px-6 py-3">Commodity</th>
                            <th className="px-6 py-3">Ask Price</th>
                            <th className="px-6 py-3">Highest Bid</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {listings.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 has-tooltip">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{item.commodity}</div>
                                    <div className="text-xs text-slate-500">{item.quantity} • {item.date}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    ₹{item.minPrice}
                                </td>
                                <td className="px-6 py-4">
                                    {item.highestBid ? (
                                        <div>
                                            <div className="font-bold text-green-700">₹{item.highestBid.amount}</div>
                                            <div className="text-xs text-slate-500">by {item.highestBid.bidder}</div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">No bids yet</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {item.status === 'PENDING' && (
                                        <span className="text-slate-400 text-xs italic">Waiting for Officer...</span>
                                    )}
                                    {item.status === 'OFFICER_VERIFIED' && (
                                        <span className="text-blue-500 text-xs font-bold">Bidding Live</span>
                                    )}
                                    {item.status === 'LOCKED_IN_ESCROW' && (
                                        <span className="text-purple-500 text-xs font-bold flex items-center gap-1">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                            Funds Locked
                                        </span>
                                    )}
                                    {item.status === 'COMPLETED' && (
                                        <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                            <Check size={14} /> Paid
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        "PENDING": "bg-slate-100 text-slate-600 border-slate-200",
        "OFFICER_VERIFIED": "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
        "LOCKED_IN_ESCROW": "bg-purple-50 text-purple-700 border-purple-200",
        "COMPLETED": "bg-green-50 text-green-700 border-green-200"
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || "bg-slate-100 text-slate-600"}`}>
            {status}
        </span>
    );
}
