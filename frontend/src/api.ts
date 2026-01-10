const BASE_URL = "http://localhost:8000";

export async function uploadVideo(file: File) {
  const form = new FormData();
  form.append("file", file); // 백엔드에서 File(...)로 받는 이름과 동일해야 함

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  return res.json();
}
