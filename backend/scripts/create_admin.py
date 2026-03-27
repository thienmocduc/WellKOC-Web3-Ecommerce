"""
Create WellKOC admin account in Supabase.

Usage:
    python backend/scripts/create_admin.py
"""

import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://pvhfzqopcorzaoghbywo.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMjI0OSwiZXhwIjoyMDg3Njk4MjQ5fQ.myDydxIIYMpdSjPusxNp1rP4OvTAWnWLk5Q7pURDa2s"

ADMIN_EMAIL = "admin@wellkoc.com"
ADMIN_PASSWORD = "WellKOC@2026"
ADMIN_METADATA = {
    "role": "admin",
    "name": "WellKOC Admin",
    "is_super_admin": True,
}


def api_request(method: str, path: str, body: dict | None = None) -> dict:
    """Make an authenticated request to Supabase."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"HTTP {e.code}: {error_body}")
        raise


def main():
    print("=== Creating WellKOC Admin Account ===\n")

    # Step 1: Create user via Supabase Auth Admin API
    print(f"1. Creating auth user: {ADMIN_EMAIL}")
    try:
        user_data = api_request("POST", "/auth/v1/admin/users", {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": ADMIN_METADATA,
        })
        user_id = user_data.get("id")
        print(f"   Auth user created: {user_id}")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print("   User may already exist. Trying to find existing user...")
            # List users and find by email
            users_resp = api_request("GET", f"/auth/v1/admin/users?page=1&per_page=50")
            users = users_resp.get("users", [])
            user_id = None
            for u in users:
                if u.get("email") == ADMIN_EMAIL:
                    user_id = u["id"]
                    break
            if user_id:
                print(f"   Found existing user: {user_id}")
                # Update metadata
                api_request("PUT", f"/auth/v1/admin/users/{user_id}", {
                    "password": ADMIN_PASSWORD,
                    "email_confirm": True,
                    "user_metadata": ADMIN_METADATA,
                })
                print("   Updated user metadata and password.")
            else:
                print("   ERROR: Could not find or create admin user.")
                return
        else:
            raise

    # Step 2: Insert into public.users table
    print(f"\n2. Inserting into public.users table...")
    try:
        row = {
            "id": user_id,
            "email": ADMIN_EMAIL,
            "name": "WellKOC Admin",
            "role": "admin",
        }
        # Use upsert to handle existing rows
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/users",
            data=json.dumps(row).encode(),
            method="POST",
        )
        req.add_header("apikey", SERVICE_ROLE_KEY)
        req.add_header("Authorization", f"Bearer {SERVICE_ROLE_KEY}")
        req.add_header("Content-Type", "application/json")
        req.add_header("Prefer", "resolution=merge-duplicates,return=representation")

        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            print(f"   Inserted/updated users row: {result}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        # If table doesn't exist or columns differ, log but don't fail
        print(f"   Note: Could not insert into users table ({e.code}): {error_body}")
        print("   This is OK if the users table has a different schema or doesn't exist yet.")

    print("\n=== Admin account ready ===")
    print(f"   Email:    {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print(f"   Role:     admin")
    print(f"   User ID:  {user_id}")


if __name__ == "__main__":
    main()
