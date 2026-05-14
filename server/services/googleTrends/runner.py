import subprocess, re
from pathlib import Path
from utils.logger import logger


# GitHub repository URL
REPO_URL = "https://github.com/AlexBrown13/Final_Project.git"

# Where project will be stored on Windows
PROJECT_PATH = Path.home() / "Projects" / "NATAL"

# Git branch
BRANCH = "main" 

# Main script to run
SCRIPT_NAME = "google_trends.py"

# ==========================================
# Allows only alphanumeric characters, 
# dots, hyphens and underscores.
# Input:  Python file name or path string
# ==========================================

def validate_malicious(command):
    if not re.match(r"^[a-zA-Z0-9._-]+$", command):
        raise ValueError("Input contains illegal characters.")
        

# =======================================================
# run_command - Run external program or script
# Input1 (command): Python file name or path string
# Input2 (cwd): Directory path where the command executes
# ========================================================

def run_command(command, cwd=None):
    try:
        validate_malicious(command)

        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            text=True
        )

        if result.returncode != 0:
            logger.error(f"Command failed: {command}")
            raise Exception(f"Command failed: {command}")
    
    except Exception as e:
        logger.error("Security Violation: Input contains illegal characters")
        raise ValueError(f"Security Violation: {e}")


# ========================================================================
# Git Clone or Pull
# Download the project from the git first time.
# If the project already exists on the computer, it pulls newest changes.  
# ========================================================================
    
def clone_or_pull():
    try:
        if not PROJECT_PATH.exists():
            logger.info("Project not found locally - Cloning from GitHub...")
            
            PROJECT_PATH.parent.mkdir(parents=True, exist_ok=True)

            run_command(
                f"git clone {REPO_URL} {PROJECT_PATH}"
            )

        else:
            logger.info("Project already exists - Pulling latest changes...")
            
            run_command(
                f"git pull origin {BRANCH}",
                cwd=PROJECT_PATH
            )

    except Exception as e:
        logger.error("Git Clone or Pull failed")


#======================================================
# install requirements 
# installs the external libraries used in the project.
#======================================================

def install_requirements():
    requirements_file = PROJECT_PATH / "server" / "Requirements.txt"

    if requirements_file.exists():
        logger.info("Installing requirements")

        run_command(
            "pip3 install -r requirements.txt",
            cwd=PROJECT_PATH / "server" 
        )

    else:
        logger.error("requirements.txt not found")


#=======================================
# Run Google Trends Service
# Excutes the primary python script
#=======================================
        
def run_main_script():
    logger.info("Running Google Trends job")

    run_command(
        f"python3 {SCRIPT_NAME}",
        cwd=PROJECT_PATH / "server" / "services"
    )


# =========================
# MAIN
# =========================

def main():
    try:
        logger.info("Google Trends Automation Started")
    
        clone_or_pull()
        install_requirements()
        run_main_script()

        logger.info("Job completed")
        print("Job completed")

    except Exception as e:
        logger.error("Google Trends faild")


if __name__ == "__main__":
    main()