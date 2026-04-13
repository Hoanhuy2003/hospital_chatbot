import os
import google.generativeai as genai
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Tải các biến môi trường từ file .env
load_dotenv()

# 2. Lấy API Key từ biến môi trường
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ LỖI: Không tìm thấy GEMINI_API_KEY trong file .env!")
else:
    genai.configure(api_key=api_key)

app = FastAPI()

# 3. Tự động tìm model khả dụng để tránh lỗi 404
AVAILABLE_MODEL = 'gemini-1.5-flash'
try:
    # Liệt kê các model mà Key này có quyền sử dụng
    models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    if models:
        # Nếu có gemini-1.5-flash thì dùng, không thì lấy cái đầu tiên có sẵn
        AVAILABLE_MODEL = next((m for m in models if '1.5-flash' in m), models[0])
    print(f"✅ Đã kết nối! Đang sử dụng model: {AVAILABLE_MODEL}")
except Exception as e:
    print(f"⚠️ Cảnh báo: Không thể liệt kê model, dùng mặc định. Lỗi: {e}")

model = genai.GenerativeModel(AVAILABLE_MODEL)

# Dữ liệu hỗ trợ tư vấn
SYMPTOM_DATA = """
- Khoa Nhi: Sốt, ho, biếng ăn ở trẻ em.
- Khoa Tim Mạch: Đau ngực, khó thở, tim đập nhanh.
- Khoa Nội: Cảm cúm, đau bụng, nhức đầu.
- Khoa Cơ Xương Khớp: Đau khớp, chấn thương vận động.
- Khoa Tai Mũi Họng: Đau họng, viêm xoang, ù tai.
"""

class ChatRequest(BaseModel):
    message: str

@app.post("/ai/chat")
async def chat(request: ChatRequest):
    try:
        prompt = f"Bạn là trợ lý BV UTC. Tư vấn khoa khám dựa trên: {SYMPTOM_DATA}. Câu hỏi: {request.message}"
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Hệ thống gặp sự cố: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    # Chạy server tại port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)