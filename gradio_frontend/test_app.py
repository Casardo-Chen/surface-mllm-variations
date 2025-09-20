#!/usr/bin/env python3
"""
Test script for the Gradio Vision-Language Model Variation Analysis app
"""

import requests
import json
import time

def test_backend_connection():
    """Test if the backend is running and accessible"""
    try:
        response = requests.get("http://127.0.0.1:8000", timeout=5)
        print("✓ Backend is accessible")
        return True
    except requests.exceptions.ConnectionError:
        print("✗ Backend is not accessible at http://127.0.0.1:8000")
        print("Please start the backend server first:")
        print("cd ../backend && python main.py")
        return False
    except Exception as e:
        print(f"✗ Error testing backend connection: {e}")
        return False

def test_gradio_imports():
    """Test if all required packages can be imported"""
    try:
        import gradio as gr
        import requests
        import json
        import os
        import base64
        print("✓ All required packages are available")
        return True
    except ImportError as e:
        print(f"✗ Missing required package: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def test_app_creation():
    """Test if the app can be created without errors"""
    try:
        from app import create_interface
        demo = create_interface()
        print("✓ Gradio app can be created successfully")
        return True
    except Exception as e:
        print(f"✗ Error creating Gradio app: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Vision-Language Model Variation Analysis - Gradio Frontend")
    print("=" * 70)
    
    tests = [
        ("Package Imports", test_gradio_imports),
        ("Backend Connection", test_backend_connection),
        ("App Creation", test_app_creation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        time.sleep(1)
    
    print("\n" + "=" * 70)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✓ All tests passed! The app is ready to run.")
        print("\nTo start the app, run:")
        print("python app.py")
        print("\nOr use the launcher script:")
        print("./run.sh")
    else:
        print("✗ Some tests failed. Please fix the issues before running the app.")

if __name__ == "__main__":
    main()

