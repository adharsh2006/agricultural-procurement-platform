import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("[API] Connecting to Backend at http://127.0.0.1:8001/check_fair_price...");
        console.log("[API] Payload:", JSON.stringify(body));

        // Server-Side Call to Python
        const res = await fetch('http://127.0.0.1:8001/check_fair_price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store'
        });

        console.log("[API] Backend Response Status:", res.status);

        if (!res.ok) {
            const errText = await res.text();
            console.error("[API] Backend Error Body:", errText);
            return NextResponse.json({ error: "Backend Error", details: errText }, { status: res.status });
        }

        const data = await res.json();
        console.log("[API] Success:", data);
        return NextResponse.json(data);

    } catch (error) {
        console.error("[API] CRITICAL FETCH ERROR:", error);
        return NextResponse.json(
            { error: "AI Service Unreachable", details: String(error) },
            { status: 503 }
        );
    }
}
