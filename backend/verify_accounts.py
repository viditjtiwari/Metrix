import urllib.request
import json

creds = [
    ("admin@metrix.gov.in", "Admin@123456", "ADMIN"),
    ("lmo@metrix.gov.in", "Officer@123456", "LMO"),
    ("gatc@metrix.gov.in", "Lab@123456", "GATC"),
    ("owner@example.com", "Owner@123456", "INSTRUMENT_OWNER")
]

print("=== VERIFYING 4 SEEDED ACCOUNTS ===")
for email, password, expected_role in creds:
    payload = json.dumps({"email": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(
        "http://localhost:8000/api/v1/auth/login",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        res = urllib.request.urlopen(req, timeout=5)
        body = json.loads(res.read().decode("utf-8"))
        role = body["user"]["role"]
        print(f"[+] {email} [{role}]: LOGIN SUCCESSFUL (HTTP {res.status})")
    except Exception as e:
        print(f"[!] {email} FAILED: {e}")
