#!/usr/bin/env python3
"""
Setup script for the Vision-Language Model Variation Analysis Gradio Frontend
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"✗ Python {version.major}.{version.minor} is not supported. Please use Python 3.8 or higher.")
        return False
    print(f"✓ Python {version.major}.{version.minor} is compatible")
    return True

def install_requirements():
    """Install required packages"""
    print("\nInstalling requirements...")
    return run_command("pip install -r requirements.txt", "Installing Python packages")

def create_virtual_environment():
    """Create a virtual environment"""
    print("\nCreating virtual environment...")
    if os.path.exists("venv"):
        print("✓ Virtual environment already exists")
        return True
    
    return run_command("python -m venv venv", "Creating virtual environment")

def activate_virtual_environment():
    """Activate virtual environment and install packages"""
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print(f"\nActivating virtual environment...")
    print(f"To activate manually, run: {activate_cmd}")
    
    # Install packages in virtual environment
    return run_command(f"{pip_cmd} install -r requirements.txt", "Installing packages in virtual environment")

def check_backend_connection():
    """Check if backend is accessible"""
    print("\nChecking backend connection...")
    try:
        import requests
        response = requests.get("http://127.0.0.1:8000", timeout=5)
        print("✓ Backend is accessible")
        return True
    except ImportError:
        print("! requests package not available, skipping backend check")
        return True
    except Exception as e:
        print(f"! Backend not accessible: {e}")
        print("  Please start the backend server before using the frontend")
        return False

def main():
    """Main setup function"""
    print("Vision-Language Model Variation Analysis - Gradio Frontend Setup")
    print("=" * 70)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create virtual environment
    if not create_virtual_environment():
        print("Failed to create virtual environment")
        sys.exit(1)
    
    # Install packages
    if not install_requirements():
        print("Failed to install requirements")
        sys.exit(1)
    
    # Check backend
    check_backend_connection()
    
    print("\n" + "=" * 70)
    print("Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the backend server:")
    print("   cd ../backend && python main.py")
    print("\n2. Start the Gradio frontend:")
    print("   python app.py")
    print("   OR")
    print("   ./run.sh")
    print("\n3. Open your browser and go to: http://localhost:7860")
    print("\n4. Run the demo to see sample data:")
    print("   python demo.py")

if __name__ == "__main__":
    main()

