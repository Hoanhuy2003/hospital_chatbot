import logging
import os
from pathlib import Path

import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("gemini_chat")

# Load .env cùng thư mục với main.py (tránh chạy từ folder khác thì không đọc được)
load_dotenv(Path(__file__).resolve().parent / ".env")

_raw_key = os.getenv("GEMINI_API_KEY") or ""
api_key = _raw_key.strip().strip("\ufeff").strip('"').strip("'")

if not api_key:
    print("❌ LỖI: Không tìm thấy GEMINI_API_KEY trong file .env (cùng thư mục main.py)!")
else:
    genai.configure(api_key=api_key)

app = FastAPI()

# Cho phép Spring Boot (8080) và React (3000) gọi vào
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ưu tiên model còn được Google mở cho key mới (1.5 đôi khi 404 / không còn list)
MODEL_CANDIDATES = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-flash-latest",
]


def _pick_working_model():
    if not api_key:
        return None
    try:
        listed = [
            m.name
            for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        ]
        if listed:
            for short in MODEL_CANDIDATES:
                full = f"models/{short}" if not short.startswith("models/") else short
                if full in listed:
                    log.info("Chọn model từ API list: %s", full)
                    return full
                match = next((x for x in listed if short in x), None)
                if match:
                    log.info("Chọn model từ API list (partial): %s", match)
                    return match
            pick = listed[0]
            log.info("Dùng model đầu tiên từ list: %s", pick)
            return pick
    except Exception as e:
        log.warning("Không list được model: %s — dùng model mặc định", e)

    # Key mới thường dùng được 2.0 Flash
    return "gemini-2.0-flash"


def _text_from_response(response) -> str | None:
    """Gemini đôi khi không có .text (chặn an toàn, lỗi) — đọc từ candidates."""
    try:
        t = response.text
        if t:
            return t.strip()
    except Exception:
        pass
    try:
        cands = getattr(response, "candidates", None) or []
        if not cands:
            return None
        parts = getattr(cands[0].content, "parts", None) or []
        chunks = []
        for p in parts:
            t = getattr(p, "text", None)
            if t:
                chunks.append(t)
        if chunks:
            return "".join(chunks).strip()
    except Exception:
        pass
    return None


def _build_model(model_name: str | None):
    if not model_name:
        return None
    safety = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
    ]
    try:
        return genai.GenerativeModel(model_name, safety_settings=safety)
    except Exception as e:
        log.warning("Không áp dụng safety_settings, dùng model mặc định: %s", e)
        return genai.GenerativeModel(model_name)


model = None
_resolved_name = _pick_working_model()
if _resolved_name:
    try:
        model = _build_model(_resolved_name)
        print(f"✅ Gemini sẵn sàng. Model: {_resolved_name}")
    except Exception as e:
        log.exception("Không khởi tạo GenerativeModel: %s", e)
        model = None
# Dữ liệu hỗ trợ tư vấn chuyên khoa
SYMPTOM_DATA = """
- Khoa Nhi: Sốt, ho, biếng ăn, quấy khóc, phát ban ở trẻ em.
- Khoa Tim Mạch: Đau ngực, khó thở, tim đập nhanh, hồi hộp, phù chân.
- Khoa Nội Tổng Hợp: Cảm cúm, mệt mỏi, đau bụng, buồn nôn, nhức đầu, sốt.
- Khoa Cơ Xương Khớp: Đau khớp, đau lưng, cứng khớp, chấn thương vận động.
- Khoa Tai Mũi Họng: Đau họng, ngạt mũi, viêm xoang, ù tai, chảy máu cam.
- Khoa Da Liễu: Nổi mẩn, ngứa da, mụn trứng cá, rụng tóc, viêm da.
- Khoa Tiêu Hóa: Đau dạ dày, tiêu chảy, táo bón, đầy hơi, ợ chua, vàng da.
- Khoa Thần Kinh: Đau đầu dữ dội, chóng mặt, tê bì tay chân, co giật, mất ngủ.
- Khoa Mắt: Mờ mắt, đau mắt, đỏ mắt, chảy nước mắt, nhìn đôi.
- Khoa Nội Tiết: Tiểu đường, béo phì, tuyến giáp, mệt mỏi kéo dài.
- Khoa Sản Phụ Khoa: Đau bụng kinh, rối loạn kinh nguyệt, khí hư bất thường.
- Khoa Tiết Niệu: Tiểu buốt, tiểu rắt, tiểu ra máu, đau vùng thắt lưng.
"""

SYSTEM_PROMPT = f"""Bạn là trợ lý AI của Bệnh viện Bạch Mai - một trong những bệnh viện hàng đầu Việt Nam.
Nhiệm vụ của bạn:
1. Tư vấn bệnh nhân nên khám tại khoa nào dựa trên triệu chứng họ mô tả.
2. Trả lời các câu hỏi về dịch vụ, thủ tục, giờ làm việc của bệnh viện.
3. Hướng dẫn đặt lịch khám trực tuyến qua hệ thống.

Thông tin các khoa và triệu chứng:
{SYMPTOM_DATA}

Thông tin bệnh viện:
- Địa chỉ: 78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội
- Giờ làm việc: Thứ 2 - Thứ 6: 7:00 - 17:00, Thứ 7: 7:00 - 12:00
- Hotline: 024 3869 3731
- Giá khám: từ 200.000đ tùy chuyên khoa
- Hỗ trợ bảo hiểm y tế theo quy định của Bộ Y tế.

Quy tắc trả lời:
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn (dưới 150 từ).
- Không chuẩn đoán bệnh, chỉ gợi ý khoa khám phù hợp.
- Nếu triệu chứng nghiêm trọng (đau ngực dữ dội, khó thở, bất tỉnh) hãy khuyên gọi cấp cứu 115 ngay.
- Kết thúc câu trả lời bằng lời mời đặt lịch khám nếu phù hợp.
"""

class ChatRequest(BaseModel):
    message: str

@app.post("/ai/chat")
async def chat(request: ChatRequest):
    if not api_key or model is None:
        return {
            "reply": "Chưa cấu hình GEMINI_API_KEY hoặc không khởi tạo được model. Kiểm tra file .env trong thư mục hospital-ai-python và restart python main.py."
        }
    try:
        prompt = f"{SYSTEM_PROMPT}\n\nBệnh nhân hỏi: {request.message}"
        response = model.generate_content(prompt)
        text = _text_from_response(response)
        if text:
            return {"reply": text}
        fb = getattr(response, "prompt_feedback", None)
        log.warning("Gemini không trả nội dung text. prompt_feedback=%s", fb)
        return {
            "reply": "Xin lỗi, phản hồi từ AI không có nội dung (có thể bị lọc an toàn). Hãy diễn đạt câu hỏi ngắn gọn hơn hoặc gọi hotline 024 3869 3731."
        }
    except Exception as e:
        log.exception("Lỗi gọi Gemini: %s", e)
        return {
            "reply": "Xin lỗi, hệ thống AI tạm thời gặp sự cố. Vui lòng thử lại hoặc gọi hotline 024 3869 3731."
        }

if __name__ == "__main__":
    import uvicorn
    # Chạy server tại port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)