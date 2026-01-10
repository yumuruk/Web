from pathlib import Path
import os
from dotenv import load_dotenv
from supabase import create_client

# 1) env 로드
load_dotenv(Path(__file__).parent / ".env")

url = os.environ["SUPABASE_URL"].rstrip("/") + "/"
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"].strip().strip('"').strip("'")
bucket = os.environ["SUPABASE_BUCKET"]

supabase = create_client(url, key)

# 2) interviews row 생성
row = supabase.table("interviews").insert({
    "uuid": "test-user",
    "status": "created",
    "name": "storage upload test",
}).execute().data[0]

interview_id = row["id"]
print("Created interview_id:", interview_id)

# 3) 더미 파일 생성
dummy_file = Path(__file__).parent / "dummy.txt"
dummy_file.write_text("hello supabase storage\n", encoding="utf-8")

# 4) Storage 업로드
storage_path = f"interviews/{interview_id}/dummy.txt"

with open(dummy_file, "rb") as f:
    upload_res = supabase.storage.from_(bucket).upload(
        path=storage_path,
        file=f,
        file_options={"content-type": "text/plain", "upsert": "true"},
    )

print("Upload result:", upload_res)

# 5) interview_results INSERT (✅ update 아님)
result_res = supabase.table("interview_results").insert({
    "interview_id": interview_id,
    "executed_at": None,  # 자동 now() 쓰고 싶으면 생략 가능
    "score": None,        # 아직 AI 점수 없음
    "extra": {
        "storage_path": storage_path
    }
}).execute()

print("Interview result inserted:", result_res.data)

# 6) 최종 검증
final = supabase.table("interview_results") \
    .select("*") \
    .eq("interview_id", interview_id) \
    .execute()

print("Final interview_results:", final.data)
