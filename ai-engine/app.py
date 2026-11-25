from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="KRISHI AI Advisory Engine")

class AdvisoryRequest(BaseModel):
    question: str
    language: str = "en"
    crop: str = ""
    district: str = ""

KNOWLEDGE = {
    "en": {
        "rain": "Check the local weather forecast before irrigation. Ensure drainage is clear during heavy-rain periods.",
        "yellow": "Yellowing leaves can have multiple causes, including nutrient imbalance, water stress, pests or disease. Inspect the plant and soil before treatment.",
        "pest": "Inspect the underside of leaves and nearby plants. Use only crop- and pest-specific recommendations from an approved agricultural source.",
        "default": "Please provide the crop, district, crop stage and a clear description or image of the problem. This helps produce a safer advisory."
    },
    "ml": {
        "rain": "ജലസേചനത്തിന് മുമ്പ് പ്രാദേശിക കാലാവസ്ഥ പരിശോധിക്കുക. കനത്ത മഴയുള്ള സമയത്ത് വെള്ളം ഒഴുകിപ്പോകാനുള്ള സൗകര്യം ഉറപ്പാക്കുക.",
        "yellow": "ഇല മഞ്ഞയാകാൻ പോഷക അസന്തുലിതാവസ്ഥ, ജല സമ്മർദ്ദം, കീടങ്ങൾ അല്ലെങ്കിൽ രോഗങ്ങൾ തുടങ്ങിയ പല കാരണങ്ങളുണ്ടാകാം. ചികിത്സയ്ക്ക് മുമ്പ് ചെടിയും മണ്ണും പരിശോധിക്കുക.",
        "pest": "ഇലയുടെ അടിഭാഗവും സമീപത്തെ ചെടികളും പരിശോധിക്കുക. അംഗീകൃത കാർഷിക ഉറവിടങ്ങളിൽ നിന്നുള്ള വിള-കീട നിർദ്ദേശങ്ങൾ മാത്രം ഉപയോഗിക്കുക.",
        "default": "കൂടുതൽ സുരക്ഷിതമായ ഉപദേശം നൽകാൻ വിള, ജില്ല, വിളയുടെ ഘട്ടം, പ്രശ്നത്തിന്റെ വ്യക്തമായ വിവരണം അല്ലെങ്കിൽ ചിത്രം നൽകുക."
    },
    "kn": {
        "rain": "ನೀರಾವರಿ ಮಾಡುವ ಮೊದಲು ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ. ಭಾರಿ ಮಳೆಯ ಸಮಯದಲ್ಲಿ ನೀರು ಹೊರಹೋಗುವ ವ್ಯವಸ್ಥೆ ಸರಿಯಾಗಿದೆಯೇ ನೋಡಿ.",
        "yellow": "ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಪೋಷಕಾಂಶಗಳ ಅಸಮತೋಲನ, ನೀರಿನ ಒತ್ತಡ, ಕೀಟಗಳು ಅಥವಾ ರೋಗಗಳು ಕಾರಣವಾಗಬಹುದು. ಚಿಕಿತ್ಸೆಗೂ ಮೊದಲು ಸಸ್ಯ ಮತ್ತು ಮಣ್ಣನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "pest": "ಎಲೆಗಳ ಕೆಳಭಾಗ ಮತ್ತು ಹತ್ತಿರದ ಸಸ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಅನುಮೋದಿತ ಕೃಷಿ ಮೂಲಗಳಿಂದ ದೊರೆಯುವ ಬೆಳೆ-ಕೀಟ ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.",
        "default": "ಸುರಕ್ಷಿತ ಸಲಹೆಗಾಗಿ ಬೆಳೆ, ಜಿಲ್ಲೆ, ಬೆಳೆಯ ಹಂತ ಮತ್ತು ಸಮಸ್ಯೆಯ ಸ್ಪಷ್ಟ ವಿವರಣೆ ಅಥವಾ ಚಿತ್ರ ನೀಡಿ."
    }
}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/advisory")
def advisory(req: AdvisoryRequest):
    text = req.question.lower()
    lang = req.language if req.language in KNOWLEDGE else "en"
    k = KNOWLEDGE[lang]

    if any(w in text for w in ["rain", "rainfall", "മഴ", "ಮಳೆ"]):
        answer = k["rain"]
        confidence = 76
    elif any(w in text for w in ["yellow", "yellowing", "മഞ്ഞ", "ಹಳದಿ"]):
        answer = k["yellow"]
        confidence = 68
    elif any(w in text for w in ["pest", "insect", "കീട", "കീടം", "ಕೀಟ"]):
        answer = k["pest"]
        confidence = 70
    else:
        answer = k["default"]
        confidence = 45

    return {
        "answer": answer,
        "confidence": confidence,
        "needsOfficer": confidence < 60,
        "sources": [
            "Replace this demo source with verified Kerala Agriculture Department / Kerala Agricultural University material."
        ]
    }
