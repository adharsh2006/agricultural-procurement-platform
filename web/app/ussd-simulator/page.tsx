"use client";
import { useState } from "react";
import { Phone, Hash, Delete } from "lucide-react";

export default function USSDSimulator() {
    const [screenText, setScreenText] = useState("Dial *384*105# to start");
    const [input, setInput] = useState("");
    const [sessionText, setSessionText] = useState(""); // Tracks the "history" for the backend (e.g., "2*Wheat")
    const [isSessionActive, setIsSessionActive] = useState(false);

    const handleDial = async () => {
        if (!isSessionActive) {
            // Start Session
            if (input === "*384*105#") {
                setIsSessionActive(true);
                setSessionText(""); // Reset
                await sendToBackend("");
            } else {
                setScreenText("Invalid Code.\nDial *384*105#");
            }
        } else {
            // Send Input
            const newSessionText = sessionText ? `${sessionText}*${input}` : input;
            setSessionText(newSessionText);
            await sendToBackend(newSessionText);
        }
        setInput("");
    };

    const sendToBackend = async (text: string) => {
        setScreenText("USSD Running...");
        try {
            const formData = new URLSearchParams();
            formData.append("sessionId", "12345");
            formData.append("serviceCode", "*384#");
            formData.append("phoneNumber", "+919999999999");
            formData.append("text", text);

            const res = await fetch("http://10.231.253.60:8001/ussd", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            });

            const rawText = await res.text();

            if (rawText.startsWith("CON ")) {
                setScreenText(rawText.replace("CON ", ""));
            } else if (rawText.startsWith("END ")) {
                setScreenText(rawText.replace("END ", ""));
                setIsSessionActive(false);
            }
        } catch (e) {
            setScreenText("Connection Error");
            setIsSessionActive(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
            {/* PHONE BODY */}
            <div className="bg-slate-900 w-[300px] h-[600px] rounded-[40px] p-6 shadow-2xl relative border-8 border-slate-800">
                {/* SCREEN */}
                <div className="bg-[#9ea792] w-full h-[250px] rounded-lg p-4 font-mono text-slate-900 border-4 border-slate-700 shadow-inner flex flex-col">
                    <div className="text-xs border-b border-slate-800/20 pb-1 mb-2 flex justify-between">
                        <span>📶 Jio 4G</span>
                        <span className={isSessionActive ? "text-green-800 font-bold" : "text-red-800"}>
                            {isSessionActive ? "🟢 LIVE" : "🔴 OFF"}
                        </span>
                        <span>🔋 100%</span>
                    </div>
                    <div className="whitespace-pre-wrap flex-1 overflow-y-auto text-sm font-bold leading-relaxed">
                        {screenText}
                        {/* DEBUG DATA */}
                        <div className="mt-4 pt-2 border-t border-slate-400/30 text-[10px] text-slate-600 font-normal">
                            DEBUG: History='{sessionText}'
                        </div>
                    </div>
                    <div className="mt-2 border-t border-slate-800/20 pt-1">
                        <span className="text-lg font-bold tracking-widest">{input}</span><span className="animate-pulse">_</span>
                    </div>
                </div>

                {/* KEYPAD */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                        <button
                            key={key}
                            onClick={() => setInput(prev => prev + key)}
                            className="bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-bold h-12 rounded-full shadow-lg transition-transform active:scale-95 text-xl"
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-6 flex justify-between px-4">
                    <button
                        onClick={() => { setInput(""); if (!isSessionActive) setScreenText("Ready"); setIsSessionActive(false); }}
                        className="text-red-500 hover:text-red-400 font-bold text-xs"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleDial}
                        className="bg-green-600 hover:bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-2 active:scale-95"
                    >
                        <Phone size={24} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => setInput(prev => prev.slice(0, -1))}
                        className="text-yellow-500 hover:text-yellow-400 font-bold text-xs"
                    >
                        BACK
                    </button>
                </div>
            </div>

            {/* INSTRUCTION CARD */}
            <div className="absolute right-10 top-10 bg-white p-6 rounded-xl shadow-xl max-w-xs animate-in slide-in-from-right">
                <h3 className="font-bold text-lg mb-2 text-indigo-900">Experience Automation</h3>
                <p className="text-sm text-slate-600 mb-4">
                    This simulator interacts with the <b>Live Blockchain Backend</b>.
                </p>
                <ol className="list-decimal pl-4 text-sm space-y-2 text-slate-700">
                    <li>Type <b>*384*105#</b> & Call.</li>
                    <li>Select <b>2</b> (Deposit).</li>
                    <li>Enter <b>Wheat</b>.</li>
                    <li>Enter <b>100</b> (Kg).</li>
                    <li>Watch your <b>Officer Dashboard</b> update instantly!</li>
                </ol>
            </div>
        </div>
    );
}
