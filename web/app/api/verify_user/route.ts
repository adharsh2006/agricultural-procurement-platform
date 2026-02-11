import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userType, id } = body;

        // Simulate AI Processing Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Logic
        if (userType === 'farmer') {
            return NextResponse.json({
                verified: true,
                trust_score: 95,
                checks: ["Land Records Verified", "Identity Match: 99%"]
            });
        }

        if (userType === 'vendor') {
            return NextResponse.json({
                verified: true,
                credit_score: 850,
                checks: ["GST Compliant", "Bank Solvency Confirmed"]
            });
        }

        return NextResponse.json({ verified: false, message: "Unknown User Type" }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ verified: false }, { status: 500 });
    }
}
