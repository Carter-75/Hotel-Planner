import os
import subprocess
from pathlib import Path

def sync_vercel_env():
    """Reads the root .env.local and syncs each variable to the Vercel Production vault."""
    # Check candidates for environment file
    candidates = [Path('.env.local'), Path('.env')]
    env_path = next((c for c in candidates if c.exists()), None)
    
    if not env_path:
        print(">> No .env or .env.local file found in the root. Skipping sync.")
        return

    print(f">> Vercel Watcher: Syncing {env_path.name} to Production Vault...")
    
    # Define project slug
    project_slug = "hotel-planner-black" # Match your Vercel project name

    try:
        with open(env_path, "r", encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'") # Remove literal quotes
                
                if key and val:
                    # Sync to Vercel
                    result = subprocess.run(
                        ["npx", "vercel", "env", "add", key, "production", "--value", val, "--yes"],
                        shell=True,
                        capture_output=True,
                        text=True
                    )
                    if result.returncode != 0:
                        # Attempt to replace if already exists
                        subprocess.run(
                            ["npx", "vercel", "env", "rm", key, "production", "--yes"],
                            shell=True, capture_output=True
                        )
                        subprocess.run(
                            ["npx", "vercel", "env", "add", key, "production", "--value", val, "--yes"],
                            shell=True, capture_output=True
                        )
                        print(f"   Updated: {key}")
                    else:
                        print(f"   Synced: {key}")

        print("OK: Vercel Vault is now up to date.")

    except Exception as e:
        print(f"Error during Vercel sync: {e}")

if __name__ == "__main__":
    sync_vercel_env()

