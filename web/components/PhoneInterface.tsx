"use client";
import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, Grip, Delete } from "lucide-react";

interface PhoneInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PhoneInterface({ isOpen, onClose }: PhoneInterfaceProps) {
    const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");
    const [callDuration, setCallDuration] = useState(0);
    const [aiMessage, setAiMessage] = useState("Namaste! Welcome to AgriProcure Helpline. \n\nPress 1 to Check Crop Status.\nPress 2 to Start Auction.");
    const [inputBuffer, setInputBuffer] = useState("");

    // Auto-scroll to bottom of chat
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setCallStatus("connecting");
            setCallDuration(0);
            setAiMessage("Namaste! Welcome to AgriProcure Helpline. \n\nPress 1 to Check Crop Status.\nPress 2 to Start Auction.");
            setInputBuffer("");

            const timer = setTimeout(() => {
                setCallStatus("connected");
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStatus === "connected") {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleKeyPress = async (key: string) => {
        if (callStatus !== "connected") return;

        setInputBuffer(prev => prev + key);

        // IVR LOGIC MAP
        if (key === "1") {
            setAiMessage("Checking your status... Please wait.");
            try {
                const res = await fetch("http://localhost:8001/voice/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ farmer_id: "FARMER_RK_001" }) // Mock ID
                });
                const data = await res.json();
                setAiMessage(data.message);
            } catch (e) {
                setAiMessage("Error connecting to Mandi Server.");
            }
        }
        else if (key === "2") {
            setAiMessage("Processing auction request...");
            try {
                const res = await fetch("http://localhost:8001/voice/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ farmer_id: "FARMER_RK_001", command: "Start Auction" })
                });
                const data = await res.json();
                setAiMessage(data.message);
            } catch (e) {
                setAiMessage("Error connecting to Mandi Server.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
            <div className="bg-slate-900 w-80 h-[600px] rounded-[3rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">

                {/* Status Bar */}
                <div className="h-8 bg-black/20 flex items-center justify-between px-6">
                    <span className="text-xs text-white/50">12:30</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                    </div>
                </div>

                {/* Call Info */}
                <div className="flex-1 flex flex-col items-center pt-8 px-4 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/30">
                        🤖
                    </div>
                    <h2 className="text-white text-xl font-medium mb-1">Kisan AI Helpline</h2>
                    <p className="text-slate-400 text-sm mb-2">1800-KISAN-AI</p>
                    <p className="text-green-400 font-mono text-sm">
                        {callStatus === "connecting" ? "Connecting..." : formatTime(callDuration)}
                    </p>

                    {/* AI Transcript Box */}
                    <div className="mt-6 bg-slate-800/50 p-4 rounded-xl w-full text-left min-h-[120px] max-h-[150px] overflow-y-auto border border-white/5">
                        <p className="text-blue-300 text-sm whitespace-pre-wrap leading-relaxed animate-in fade-in">
                            {aiMessage}
                        </p>
                    </div>
                </div>

                {/* Keypad */}
                <div className="bg-slate-800/80 p-6 pb-12 rounded-t-[2rem] backdrop-blur-md">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleKeyPress(key)}
                                className="w-14 h-14 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full flex items-center justify-center text-white text-xl font-medium transition-all"
                            >
                                {key}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center gap-6">
                        <button onClick={onClose} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 active:scale-90 transition-all">
                            <PhoneOff size={28} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
