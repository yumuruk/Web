from pathlib import Path
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client

load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/") + "/"
SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"].strip().strip('"').strip("'")

supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

app = FastAPI()

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/auth/signup")
def signup(req: SignUpRequest):
    # 비밀번호 최소 길이 방어(원하면 강화)
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    try:
        # ✅ Admin API: service_role로 유저 생성
        # email_confirm은 테스트 편의용 (실서비스는 False + 이메일 인증 흐름 권장)
        res = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True
        })

        # res.user 가 있으면 생성 성공
        user = getattr(res, "user", None)
        if not user:
            # supabase-py 버전에 따라 구조가 다를 수 있어 안전 처리
            return {"ok": True, "message": "User created (check dashboard if needed)."}
        return {"ok": True, "user_id": user.id, "email": user.email}

    except Exception as e:
        msg = str(e)

        # 흔한 에러 메시지 정리 (이미 가입된 이메일 등)
        if "User already registered" in msg or "already registered" in msg:
            raise HTTPException(status_code=409, detail="Email already registered.")
        raise HTTPException(status_code=500, detail=msg)
