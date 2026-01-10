from pathlib import Path
import os
from dotenv import load_dotenv
from supabase import create_client

# 1) .env 로드
load_dotenv(Path(__file__).parent / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

assert url, "SUPABASE_URL is missing"
assert key, "SUPABASE_SERVICE_ROLE_KEY is missing"

supabase = create_client(url, key)

# 2) insert
payload = {
    "uuid": "test-user",     # 지금 text면 이렇게 OK
    "status": "created",
    "name": "backend smoke test",
}
ins = supabase.table("interviews").insert(payload).execute()

print("INSERT RESULT:", ins.data)
interview_id = ins.data[0]["id"]

# 3) select
sel = supabase.table("interviews").select("*").eq("id", interview_id).single().execute()
print("SELECT RESULT:", sel.data)
