import subprocess
from pathlib import Path


# GitHub repository URL
REPO_URL = "https://github.com/AlexBrown13/Final_Project.git"

# Where project will be stored on Windows
# PROJECT_PATH = Path(r"D:\Projects\google-trends")
PROJECT_PATH = Path.home() / "Projects" / "NATAL"

# Git branch
# TODO main
BRANCH = "main" 

# Main script
SCRIPT_NAME = "google_trends.py"

# =========================
# HELPERS
# =========================

def run_command(command, cwd=None):
    print(f"\nRunning: {command}")
    
    result = subprocess.run(
        command,
        cwd=cwd,
        shell=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception(f"Command failed: {command}")


# =========================
# CLONE OR PULL
# =========================

def clone_or_pull():
    if not PROJECT_PATH.exists():

        print("\nProject not found locally")
        print("Cloning from GitHub...")

        PROJECT_PATH.parent.mkdir(parents=True, exist_ok=True)

        run_command(
            f"git clone {REPO_URL} {PROJECT_PATH}"
        )

    else:
        print("\nProject already exists")
        print("Pulling latest changes...")

        run_command(
            f"git pull origin {BRANCH}",
            cwd=PROJECT_PATH
        )

# =========================
# INSTALL REQUIREMENTS
# =========================

def install_requirements():
    requirements_file = PROJECT_PATH / "server" / "Requirements.txt"

    if requirements_file.exists():
        print("\nInstalling requirements...")

        run_command(
            "pip install -r requirements.txt",
            cwd=PROJECT_PATH / "server" 
        )

    else:
        print("\nrequirements.txt not found")


# =========================
# RUN MAIN SCRIPT
# =========================

def run_main_script():
    print("\nRunning Google Trends job...")

    run_command(
        f"python3 {SCRIPT_NAME}",
        cwd=PROJECT_PATH / "server" / "services"
    )

# =========================
# MAIN
# =========================

def main():
    try:
        print("=" * 50)
        print("Google Trends Automation Started")
        print("=" * 50)

        clone_or_pull()
        install_requirements()
        run_main_script()

        print("\nJob completed")

    except Exception as e:
        print(f"\nError: {e}")


if __name__ == "__main__":
    main()