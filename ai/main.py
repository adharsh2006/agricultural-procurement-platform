from fastapi import FastAPI, Request, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import csv
from datetime import datetime
import google.generativeai as genai

# CONFIGURATION
os.environ["GOOGLE_API_KEY"] = "AIzaSyCPHZxV2xmKv5vwP2COuJ7GQ73HDDAo7o8"
GENAI_KEY = os.environ["GOOGLE_API_KEY"]

if GENAI_KEY:
    genai.configure(api_key=GENAI_KEY)

app = FastAPI(title="AgriPulse SmartTrade AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY DATA STORE ---
FARMER_STATE = {
    "FARMER_RK_001": {
        "name": "Ramesh Kumar",
        "crop": "Wheat",
        "batch_id": "102",
        "status": "BIDDING", 
        "verified_qty": 100,
        "verified_grade": "A",
        # AUDIT TRAIL DATA
        "ussd_timestamp": "2026-02-11T09:00:00Z",
        "ipfs_cid": "",
        "escrow_tx": "",
        "delivery_ts": ""
    }
}

# --- AGMARKNET DATA ---
MARKET_DATA = []
try:
    with open("agmarknet_data.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            MARKET_DATA.append(row)
except: pass

def get_latest_market_rate(commodity: str):
    matches = [row for row in MARKET_DATA if row['Commodity'].lower() == commodity.lower()]
    if matches: return float(matches[-1]['Modal_Price'])
    return 2200.0

# --- EXISTING ENDPOINTS (REST) ---
@app.get("/")
def read_root():
    return {"status": "Active", "service": "ProcureChain AI Voice Broker (Twilio Ready)"}

class PriceCheck(BaseModel):
    commodity: str
    bid_amount: float

@app.post("/check_fair_price")
async def check_price(check: PriceCheck):
    market_avg = get_latest_market_rate(check.commodity)
    diff_percent = ((check.bid_amount - market_avg) / market_avg) * 100
    status = "FAIR"
    if diff_percent > 25: status = "HIGH_ANOMALY"
    elif diff_percent < -25: status = "LOW_DISTRESS"
    return {
        "commodity": check.commodity,
        "market_avg": market_avg,
        "diff_percent": round(diff_percent, 2),
        "status": status
    }

class QRCheck(BaseModel):
    qr_data: str

@app.post("/verify_weight_qr")
async def verify_qr(check: QRCheck):
    is_valid = check.qr_data.startswith("W:")
    detected_weight = 0.0
    if is_valid:
        try: detected_weight = float(check.qr_data.split(":")[1])
        except: is_valid = False
    return {"verified": is_valid, "weight_detected": detected_weight, "device_id": "IOT-SCALE-774"}

# --- NEW: STATE SYNC ENDPOINT (WEB -> AI) ---

class StateUpdate(BaseModel):
    farmer_id: str = "FARMER_RK_001"
    status: str
    verified_qty: int = 0
    verified_grade: str = "A"
    ipfs_cid: str = ""
    escrow_tx: str = ""

@app.post("/update_farmer_state")
async def update_state(update: StateUpdate):
    """
    Called by Next.js Frontend (Officer/Vendor) to update the Voice AI's truth.
    """
    if update.farmer_id in FARMER_STATE:
        FARMER_STATE[update.farmer_id]["status"] = update.status
        
        # Update Verification Data
        if update.verified_qty > 0:
            FARMER_STATE[update.farmer_id]["verified_qty"] = update.verified_qty
            FARMER_STATE[update.farmer_id]["verified_grade"] = update.verified_grade
            
        # Update Audit Trail (Dynamic Fields)
        if hasattr(update, 'ipfs_cid') and update.ipfs_cid:
             FARMER_STATE[update.farmer_id]["ipfs_cid"] = update.ipfs_cid
             
        if hasattr(update, 'escrow_tx') and update.escrow_tx:
             FARMER_STATE[update.farmer_id]["escrow_tx"] = update.escrow_tx

        if update.status == "RELEASED" or update.status == "COMPLETED":
             FARMER_STATE[update.farmer_id]["delivery_ts"] = datetime.now().isoformat()
        
        print(f"State Updated: {update.status} (Qty: {update.verified_qty})")
    return {"success": False, "error": "Farmer not found"}

# --- NEW: POLLING ENDPOINT (AI -> WEB) ---
@app.get("/farmer_state")
def get_state(farmer_id: str = "FARMER_RK_001"):
    state = FARMER_STATE.get(farmer_id, {}).copy()
    if "crop" in state:
        state["market_rate"] = get_latest_market_rate(state["crop"])
    return state

# --- NEW: ANTI-GRAVITY IPFS SIMULATOR ---
import hashlib
import json

IPFS_STORAGE_PATH = "d:/blockchain/ipfs_storage/"
os.makedirs(IPFS_STORAGE_PATH, exist_ok=True)

@app.post("/accept_bid")
async def accept_bid(request: Request):
    """
    Called by USSD (Farmer) or AI wrapper to accept the highest bid.
    In real world, this signs a transaction. Here it updates state.
    """
    FARMER_STATE["FARMER_RK_001"]["status"] = "ACCEPTED"
    return {"status": "ACCEPTED"}

@app.post("/upload_ipfs")
async def upload_ipfs(request: Request):
    """
    Simulates IPFS Node.
    1. Receives Data (JSON/File).
    2. Calculates SHA-256 (Content-ID).
    3. Stores it permanently.
    4. Returns 'ipfs://<hash>'
    """
    try:
        data = await request.json()
        content_bytes = json.dumps(data, sort_keys=True).encode()
    except:
        # If not JSON, maybe raw bytes/form (simplified for hackathon as text)
        content_bytes = await request.body()

    # 1. GENERATE CID (CONTENT ID)
    sha256 = hashlib.sha256()
    sha256.update(content_bytes)
    cid = sha256.hexdigest()

    # 2. STORE IMMUTABLY
    with open(f"{IPFS_STORAGE_PATH}{cid}.json", "wb") as f:
        f.write(content_bytes)

    print(f"IPFS UPLOAD SUCCESS: {cid}")
    return {"cid": cid, "uri": f"ipfs://{cid}"}





# --- NEW: USSD INTERFACE (AFRICA'S TALKING STANDARD) ---

@app.post("/ussd")
async def ussd_callback(
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form("")
):
    """
    Handles USSD Session.
    Rules:
    - Start with empty text -> Show Menu.
    - Response starts with "CON" -> Continue Session (Ask Input).
    - Response starts with "END" -> End Session (Final Message).
    """
    print(f"USSD RECEIVED: sessionId={sessionId} text='{text}'") # DEBUG LOG
    text = text.strip()
    response = ""

    # LANGUAGE DICTIONARY
    LANG = {
        "en": {
            "menu": "CON Welcome to ProcureChain\n1. Check Status\n2. New Deposit\n3. View Wallet",
            "status": "END Your Status: {status}\nListing: {qty}kg {crop}",
            "crop": "CON Select Crop:\n1. Wheat\n2. Rice\n3. Turmeric",
            "weight": "CON Enter Weight in KG for {crop}:",
            "success": "END Deposit of {qty}kg {crop} Recorded.\nWait for Officer Verification.",
            "error_crop": "END Invalid Crop Selection",
            "error_weight": "END Invalid Weight",
            "wallet": "END Wallet Balance: INR 0.00\nNo active escrows.",
            "invalid": "END Invalid Input"
        },
        "ta": { # Tamil
            "menu": "CON ProcureChain-kau Varavetkirom\n1. Nilai Saribarka (நிலை சரிபார்க்க)\n2. Puthiya Vaippu (புதிய வைப்பு)\n3. Panappai (பணப்பை)",
            "status": "END Ungal Nilai (உங்கள் நிலை): {status}\nListing: {qty}kg {crop}",
            "crop": "CON Payirai Thernthedukavum (பயிரை தேர்ந்தெடுக்கவும்):\n1. Wheat (கோதுமை)\n2. Rice (அரிசி)\n3. Turmeric (மஞ்சள்)",
            "weight": "CON {crop}-kau Edai (kg) Ullidavum (எடை யிடவும்):",
            "success": "END {qty}kg {crop} Pathivu Seyyapatathu (பதிவு செய்யப்பட்டது).\nOfficer Saribarippu Kathirukkavum.",
            "error_crop": "END Thavarana Payir (தவறான பயிர்)",
            "error_weight": "END Thavarana Edai (தவறான எடை)",
            "wallet": "END Balance: INR 0.00",
            "invalid": "END Thavarana Ullidu (தவறான உள்ளீடு)"
        },
        "hi": { # Hindi
            "menu": "CON ProcureChain me Swagat Hai\n1. Sthiti Janche (स्थिति जांचें)\n2. Nai Jama (नई जमा)\n3. Wallet Dekhe (वॉलेट देखें)",
            "status": "END Apki Sthiti: {status}\nListing: {qty}kg {crop}",
            "crop": "CON Fasal Chunay (फसल चुनें):\n1. Gehun (गेहूं)\n2. Chawal (चावल)\n3. Haldi (हल्दी)",
            "weight": "CON {crop} ke liye wazan (kg) dalein (वजन डालें):",
            "success": "END {qty}kg {crop} Darj kiya gaya (दर्ज किया गया)।\nOfficer Satyaoan ka intezar karein.",
            "error_crop": "END Galat Fasal (गलत फसल)",
            "error_weight": "END Galat Wazan (गलत वजन)",
            "wallet": "END Balance: INR 0.00",
            "invalid": "END Galat Input (गलत इनपुट)"
        }
    }

    if text == "":
        # LEVEL 0: Language Selection
        response = "CON Select Language / Bhasha:\n1. English\n2. Tamil\n3. Hindi"

    else:
        parts = text.split("*")
        lang_code = parts[0]
        
        # Determine Language
        selected_lang = "en"
        if lang_code == "2": selected_lang = "ta"
        elif lang_code == "3": selected_lang = "hi"
        
        L = LANG[selected_lang]
        
        if len(parts) == 1:
            # LEVEL 1: Main Menu (User just selected language)
            response = L["menu"]
            
        else:
            # CORE LOGIC (Shifted by 1 index)
            action = parts[1] # This is the old 'text'
            
            if action == "1":
                # Status Check
                farmer = FARMER_STATE["FARMER_RK_001"]
                status_display = farmer['status'].replace("_", " ")
                response = L["status"].format(status=status_display, qty=farmer['verified_qty'], crop=farmer['crop'])

            elif action == "2" and len(parts) == 2:
                # Deposit Flow - Step 1
                response = L["crop"]

            elif action.startswith("2") and len(parts) >= 3:
                # Deposit Flow - Multi-step
                # parts[0]=Lang, parts[1]=Action(2), parts[2]=Crop, parts[3]=Weight
                
                # Check for Crop Selection
                if len(parts) == 3:
                    # User entered "Lang*2*Crop"
                    selection = parts[2]
                    crop_map = {"1": "Wheat", "2": "Rice", "3": "Turmeric"}
                    selected_crop = crop_map.get(selection, "Unknown")
                    
                    if selected_crop == "Unknown":
                        response = L["error_crop"]
                    else:
                        response = L["weight"].format(crop=selected_crop)
                        
                elif len(parts) == 4:
                     # User entered "Lang*2*Crop*Weight" -> Finalize
                    selection = parts[2]
                    crop_map = {"1": "Wheat", "2": "Rice", "3": "Turmeric"}
                    crop_name = crop_map.get(selection, "Unknown")
                    
                    try:
                        weight = int(parts[3])
                        
                        # TRIGGER "MAGIC POP" on Frontend
                        FARMER_STATE["FARMER_RK_001"]["status"] = "PENDING_VERIFICATION"
                        FARMER_STATE["FARMER_RK_001"]["verified_qty"] = weight
                        FARMER_STATE["FARMER_RK_001"]["crop"] = crop_name
                        FARMER_STATE["FARMER_RK_001"]["verified_grade"] = "Processing..."
                        FARMER_STATE["FARMER_RK_001"]["ussd_timestamp"] = datetime.now().isoformat()
                        
                        print(f"USSD DEPOSIT: {weight}kg {crop_name} -> Frontend Updated!")
                        
                        response = L["success"].format(qty=weight, crop=crop_name)
                    except:
                        response = L["error_weight"]
            
            elif action == "3":
                response = L["wallet"]
                
            else:
                response = L["invalid"]

    try:
        print(f"RESPONDING: {response}")
    except:
        print("RESPONDING: [Unicode Text]")
        
    return Response(content=response, media_type="text/plain")


