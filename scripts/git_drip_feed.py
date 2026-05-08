import subprocess
import time
import os
import sys

# Configuration
FILES_PER_PUSH = 2
INTERVAL_SECONDS = 180  # 3 minutes
BRANCH = "mobile-integration"
EXCLUDE_FILES = [".flutter-plugins"]

def run_command(cmd):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    return result.stdout.strip()

def get_git_status():
    output = run_command(["git", "status", "--porcelain"])
    if not output:
        return []
    
    raw_files = []
    for line in output.split("\n"):
        if not line:
            continue
        
        # Split into status and path
        parts = line.split(maxsplit=1)
        if len(parts) < 2:
            continue
            
        status = parts[0]
        filename = parts[1]
        
        # Handle quoted filenames
        if filename.startswith('"') and filename.endswith('"'):
            try:
                filename = filename[1:-1].encode('utf-8').decode('unicode_escape')
            except:
                filename = filename[1:-1]
        
        filename = filename.strip()
        
        if not filename or any(exc in filename for exc in EXCLUDE_FILES):
            continue
            
        raw_files.append((status, filename))
    
    # Expand directories for untracked files
    expanded_files = []
    for status, path in raw_files:
        if status == "??" and os.path.isdir(path):
            for root, dirs, files in os.walk(path):
                for f in files:
                    full_path = os.path.join(root, f)
                    if not any(exc in full_path for exc in EXCLUDE_FILES):
                        expanded_files.append(("??", full_path))
        else:
            expanded_files.append((status, path))
            
    return expanded_files

def generate_commit_message(files):
    if not files:
        return "Minor updates"
    
    msgs = []
    for status, f in files:
        action = "Update"
        if status == "??" or status == "A":
            action = "Add"
        elif status == "D":
            action = "Remove"
        elif status == "M":
            action = "Modify"
            
        # Try to be a bit more descriptive based on path
        if "Backend" in f:
            area = "backend"
        elif "Frontend" in f:
            area = "frontend"
        elif "Mobile" in f:
            area = "mobile"
        else:
            area = "project"
            
        msgs.append(f"{action} {area}: {os.path.basename(f)}")
    
    return " & ".join(msgs)

def main():
    while True:
        all_files = get_git_status()
        if not all_files:
            print("No more files to commit.")
            break
            
        to_commit = all_files[:FILES_PER_PUSH]
        commit_files = [f for s, f in to_commit]
        
        # Stage files
        staged = []
        for f in commit_files:
            res = subprocess.run(["git", "add", f], capture_output=True, text=True)
            if res.returncode == 0:
                staged.append(f)
            else:
                print(f"Failed to add {f}: {res.stderr}")
        
        if not staged:
            print("No files were staged. Skipping this iteration.")
            time.sleep(10)
            continue

        # Commit
        msg = generate_commit_message([(s, f) for s, f in to_commit if f in staged])
        res = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Failed to commit: {res.stderr}")
            time.sleep(10)
            continue
            
        # Push
        print(f"Pushing {len(staged)} files to {BRANCH}...")
        res = subprocess.run(["git", "push", "origin", BRANCH], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Failed to push: {res.stderr}")
            # We don't exit here, but we'll wait and try next time or manually fix
        
        print(f"Committed and pushed: {', '.join(staged)}")
        
        remaining = len(all_files) - len(to_commit)
        if remaining > 0:
            print(f"{remaining} files remaining. Waiting {INTERVAL_SECONDS} seconds...")
            time.sleep(INTERVAL_SECONDS)
        else:
            print("All files pushed.")
            break

if __name__ == "__main__":
    main()
