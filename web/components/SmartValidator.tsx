"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Loader2, XCircle, Terminal } from "lucide-react";

interface Step {
    id: string;
    label: string;
    status: "pending" | "running" | "success" | "failed";
}

interface SmartValidatorProps {
    onComplete: () => void;
    steps?: Step[]; // Optional custom steps
    title?: string;
}

const DEFAULT_STEPS: Step[] = [
    { id: "1", label: "Checking Submission Deadline...", status: "pending" },
    { id: "2", label: "Verifying H1 (Highest Bidder) Status...", status: "pending" },
    { id: "3", label: "Analyzing Quality Grade (A+)...", status: "pending" },
];

export default function SmartValidator({ onComplete, steps: customSteps, title = "SMART CONTRACT AUTOMATION ENGINE v3.1" }: SmartValidatorProps) {
    const [steps, setSteps] = useState<Step[]>(customSteps || DEFAULT_STEPS);

    useEffect(() => {
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep >= steps.length) {
                clearInterval(interval);
                onComplete();
                return;
            }

            setSteps(prev => prev.map((s, idx) => {
                // Mark current as running
                if (idx === currentStep) return { ...s, status: "running" };
                // Mark previous as clean success (if any)
                if (idx < currentStep) return { ...s, status: "success" };
                return s;
            }));

            // Simulate "Work" finishing
            setTimeout(() => {
                setSteps(prev => prev.map((s, idx) => {
                    if (idx === currentStep) return { ...s, status: "success" };
                    return s;
                }));
                currentStep++;
            }, 1000);

        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs border border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold border-b border-slate-700 pb-2">
                <Terminal size={14} /> {title}
            </div>
            <div className="space-y-2">
                {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                        <div className="w-4">
                            {step.status === 'pending' && <span className="text-slate-600">○</span>}
                            {step.status === 'running' && <Loader2 size={14} className="animate-spin text-blue-400" />}
                            {step.status === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                        <span className={`${step.status === 'running' ? 'text-white font-bold' : step.status === 'success' ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {step.label}
                        </span>
                        {step.status === 'success' && <span className="ml-auto text-emerald-500">[PASS]</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
