import json
import time
from dataclasses import dataclass, asdict
from typing import Any

import requests

BASE_URL = "https://floralink-gt6iyhpc.manus.space"
TRPC_BASE = f"{BASE_URL}/api/trpc"
TIMEOUT = 20


@dataclass
class CaseResult:
    test_id: str
    category: str
    endpoint: str
    description: str
    payload: dict[str, Any] | None
    status_code: int | None
    ok: bool
    observed: str
    conclusion: str


session = requests.Session()
headers = {"content-type": "application/json"}


def short(obj: Any, limit: int = 500) -> str:
    text = obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False)
    return text[:limit] + ("..." if len(text) > limit else "")


def trpc_post(path: str, payload: dict[str, Any]):
    return session.post(
        f"{TRPC_BASE}/{path}",
        headers=headers,
        data=json.dumps({"json": payload}),
        timeout=TIMEOUT,
    )


results: list[CaseResult] = []

# 1) Basic reachability / disclosure check
resp = session.get(f"{TRPC_BASE}/auth.me", timeout=TIMEOUT)
results.append(
    CaseResult(
        test_id="PT-01",
        category="penetration-oriented",
        endpoint="GET /api/trpc/auth.me",
        description="Check unauthenticated exposure of current-user endpoint.",
        payload=None,
        status_code=resp.status_code,
        ok=resp.status_code == 200 and '"json":null' in resp.text,
        observed=short(resp.text),
        conclusion="Endpoint returns null when unauthenticated and does not disclose sensitive account data.",
    )
)

# 2) Fuzz malformed registration input
payload = {
    "fullName": "A",
    "email": "not-an-email",
    "phone": "123",
    "password": "x",
    "captchaToken": "test",
}
resp = trpc_post("auth.register", payload)
results.append(
    CaseResult(
        test_id="FZ-01",
        category="fuzz",
        endpoint="POST /api/trpc/auth.register",
        description="Submit clearly malformed registration fields.",
        payload=payload,
        status_code=resp.status_code,
        ok=resp.status_code == 400 and "Invalid email address" in resp.text and "Too small" in resp.text,
        observed=short(resp.text),
        conclusion="Server-side schema validation rejects malformed registration input before business logic.",
    )
)

# 3) Fuzz oversized registration fields
payload = {
    "fullName": "A" * 161,
    "email": "valid@example.com",
    "phone": "+966501234567",
    "password": "A" * 129 + "1!",
    "captchaToken": "test",
}
resp = trpc_post("auth.register", payload)
results.append(
    CaseResult(
        test_id="FZ-02",
        category="fuzz",
        endpoint="POST /api/trpc/auth.register",
        description="Submit oversized registration fields to probe boundary handling.",
        payload={**payload, "password": "<129+ chars omitted>"},
        status_code=resp.status_code,
        ok=resp.status_code == 400 and "Too big" in resp.text,
        observed=short(resp.text),
        conclusion="Length limits are enforced and the endpoint fails safely instead of crashing.",
    )
)

# 4) SQLi-style payload in email field
payload = {
    "email": "' OR 1=1 --",
    "password": "Anything123!",
    "captchaToken": "test",
}
resp = trpc_post("auth.login", payload)
results.append(
    CaseResult(
        test_id="SQL-01",
        category="sql-injection",
        endpoint="POST /api/trpc/auth.login",
        description="Inject classic SQLi pattern in email field.",
        payload=payload,
        status_code=resp.status_code,
        ok=resp.status_code == 400 and "Invalid email address" in resp.text,
        observed=short(resp.text),
        conclusion="The email parser rejects a classic SQLi string before any authentication logic proceeds.",
    )
)

# 5) SQLi-style payload in password field with syntactically valid email
payload = {
    "email": "safe@example.com",
    "password": "' OR 1=1 --A1!",
    "captchaToken": "test",
}
resp = trpc_post("auth.login", payload)
results.append(
    CaseResult(
        test_id="SQL-02",
        category="sql-injection",
        endpoint="POST /api/trpc/auth.login",
        description="Inject SQLi-like content into password while keeping other fields valid.",
        payload=payload,
        status_code=resp.status_code,
        ok=resp.status_code == 200 and '"reason":"invalid"' in resp.text,
        observed=short(resp.text),
        conclusion="The backend treats the SQLi-like password as ordinary data and returns a normal invalid-credentials response without SQL error leakage.",
    )
)

# 6) Fuzz reset-password with invalid password policy
payload = {
    "email": "safe@example.com",
    "newPassword": "password",
    "captchaToken": "test",
}
resp = trpc_post("auth.resetPassword", payload)
results.append(
    CaseResult(
        test_id="FZ-03",
        category="fuzz",
        endpoint="POST /api/trpc/auth.resetPassword",
        description="Probe password-policy enforcement with a weak common password.",
        payload=payload,
        status_code=resp.status_code,
        ok=resp.status_code == 400 and (
            "uppercase" in resp.text.lower() or "common" in resp.text.lower() or "special character" in resp.text.lower()
        ),
        observed=short(resp.text),
        conclusion="Weak/common-password reset attempts are rejected at schema level.",
    )
)

# 7) Oversized CAPTCHA token boundary
payload = {
    "email": "safe@example.com",
    "password": "ValidPass1!",
    "captchaToken": "x" * 5000,
}
resp = trpc_post("auth.login", payload)
results.append(
    CaseResult(
        test_id="FZ-04",
        category="fuzz",
        endpoint="POST /api/trpc/auth.login",
        description="Submit an oversized CAPTCHA token to test defensive length checks.",
        payload={**payload, "captchaToken": "<5000 chars>"},
        status_code=resp.status_code,
        ok=resp.status_code == 200 and '"reason":"invalid"' in resp.text,
        observed=short(resp.text),
        conclusion="The published endpoint did not reject the oversized CAPTCHA token at validation level and still returned a normal invalid-credentials response, which suggests CAPTCHA enforcement may be absent or bypassed on this live version.",
    )
)

# 8) CAPTCHA enforcement check on reset-password with a non-existent account
payload = {
    "email": "nobody@example.com",
    "newPassword": "ValidPass1!",
    "captchaToken": "bogus-token",
}
resp = trpc_post("auth.resetPassword", payload)
results.append(
    CaseResult(
        test_id="PT-02",
        category="penetration-oriented",
        endpoint="POST /api/trpc/auth.resetPassword",
        description="Check whether a clearly bogus CAPTCHA token blocks reset-password processing.",
        payload=payload,
        status_code=resp.status_code,
        ok=resp.status_code == 200 and '"reason":"missing"' in resp.text,
        observed=short(resp.text),
        conclusion="The request proceeds to account lookup and returns a normal missing-account result even with a bogus CAPTCHA token, which strongly suggests CAPTCHA is not enforced on the published endpoint.",
    )
)

# 9) Malformed JSON structure
resp = session.post(
    f"{TRPC_BASE}/auth.login",
    headers=headers,
    data='{"json": "not-an-object"}',
    timeout=TIMEOUT,
)
results.append(
    CaseResult(
        test_id="PT-03",
        category="penetration-oriented",
        endpoint="POST /api/trpc/auth.login",
        description="Send malformed JSON structure instead of the expected object body.",
        payload={"json": "not-an-object"},
        status_code=resp.status_code,
        ok=resp.status_code == 400,
        observed=short(resp.text),
        conclusion="The endpoint returns a controlled client error for malformed bodies rather than crashing.",
    )
)

# 10) Probe homepage headers
resp = session.get(BASE_URL, timeout=TIMEOUT)
results.append(
    CaseResult(
        test_id="PT-04",
        category="penetration-oriented",
        endpoint="GET /",
        description="Check basic transport/security headers on the published site.",
        payload=None,
        status_code=resp.status_code,
        ok=resp.status_code == 200 and resp.headers.get("Strict-Transport-Security") is not None,
        observed=short(dict(resp.headers)),
        conclusion="Published site enforces HSTS at the edge, which is a positive transport-security signal.",
    )
)

output = {
    "timestamp": int(time.time()),
    "base_url": BASE_URL,
    "results": [asdict(r) for r in results],
}

out_path = "/home/ubuntu/floralink-sec545-site/security_live_test_results.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(out_path)
print(json.dumps(output, ensure_ascii=False, indent=2))
