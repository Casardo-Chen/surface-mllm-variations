#!/usr/bin/env python3
"""
Demo script for the Vision-Language Model Variation Analysis Gradio Frontend
This script demonstrates how to use the interface with sample data
"""

import json
import os
from typing import Dict, List

def create_sample_data():
    """Create sample data for demonstration purposes"""
    sample_descriptions = {
        "1": {
            "id": 1,
            "model": "gpt",
            "description": "The image shows a dragonfly perched on a wire against a backdrop of an overcast sky. In the background, there are palm trees and some buildings, giving a tropical or suburban feel. The composition is serene and has a natural beauty to it. The contrast between the dragonfly and the muted sky creates a nice focal point. The presence of greenery adds a sense of calmness. Overall, it's a visually pleasant and peaceful image."
        },
        "2": {
            "id": 2,
            "model": "claude",
            "description": "The image shows a striking orange dragonfly perched on a thin wire or cable. The dragonfly's vibrant color stands out clearly against a soft, cloudy sky background. In the lower part of the frame, there are palm trees visible, giving the scene a tropical ambiance. In the distance, you can spot what appears to be a water tower structure. This is indeed a pretty image with several appealing elements. The contrast between the small, bright orange dragonfly and the expansive sky creates a compelling focal point."
        },
        "3": {
            "id": 3,
            "model": "gemini",
            "description": "A dragonfly, with a rusty orange body and delicate, translucent wings, perches on a thin wire against a muted, overcast sky. Several other wires crisscross the upper portion of the frame. In the background, the fronds of a palm tree are slightly blurred, suggesting a gentle breeze. Buildings and a water tower are visible in the distance, adding a touch of urban context. The overall palette is subdued, with soft grays and muted greens."
        }
    }
    
    sample_summary = {
        "model_diff": "**Primary Subject**: The image features a dragonfly with full agreement (100%). **Positioning**: The dragonfly is perched on a thin wire, supported by 56% of the models. **Appearance**: The dragonfly has a rust/rusty-colored body, supported by 33%, with delicate and translucent wings, fully agreed (100%).",
        "var_only": "**Primary Subject**: The image features a dragonfly. **Positioning**: It is perched on a thin wire, cable, or power line. **Appearance**: The dragonfly has a vibrant orange, striking orange, vibrant red, orange-red, or rust/rusty-colored body, featuring delicate and translucent wings.",
        "percentage": "**Primary Subject**: The image features a dragonfly with full agreement (100%). **Positioning**: The dragonfly is perched on a thin wire, supported by 56% of the models. **Appearance**: The dragonfly has a rust/rusty-colored body, supported by 33%, with delicate and translucent wings, fully agreed (100%).",
        "nl": "**Primary Subject**: The image features a dragonfly with absolute certainty. **Positioning**: The dragonfly is perched on a thin wire, possibly supported by the models. **Appearance**: The dragonfly has a potentially rusty-colored body, with delicate and translucent wings, agreed upon definitely.",
        "similarity": "The image prominently features a dragonfly, noted by all models. The dragonfly is characterized by its delicate and translucent wings. The backdrop of the scene is a cloudy or overcast sky, contributing to a muted color palette.",
        "uniqueness": "Gemini uniquely describes the scene as having a sense of scale, making the dragonfly appear small within the frame. Claude mentions the image conveys a dreamy or gentle mood, which is not noted by the other models.",
        "disagreement": "GPT and Gemini disagree on the positioning, describing it as a wire or a power line, whereas Claude mentions a cable. Gemini focuses on the dragonfly's coloration as rust or rusty, while Claude suggests various shades like orange, striking orange, or vibrant red."
    }
    
    return sample_descriptions, sample_summary

def format_descriptions(descriptions: Dict) -> str:
    """Format individual model descriptions for display"""
    if not descriptions:
        return "No descriptions available"
    
    formatted = []
    for key, desc in descriptions.items():
        if key == "prompt":
            continue
        model = desc.get("model", "Unknown")
        description = desc.get("description", "No description")
        formatted.append(f"**{model.upper()} (Trial {desc.get('id', '?')}):**\n{description}\n")
    
    return "\n".join(formatted)

def main():
    """Demonstrate the interface functionality"""
    print("Vision-Language Model Variation Analysis - Demo")
    print("=" * 50)
    
    # Create sample data
    descriptions, summary = create_sample_data()
    
    print("\nSample Descriptions:")
    print("-" * 30)
    formatted_descriptions = format_descriptions(descriptions)
    print(formatted_descriptions)
    
    print("\nSample Analysis Results:")
    print("-" * 30)
    
    print("\n1. Model Differences:")
    print(summary["model_diff"])
    
    print("\n2. Variation Only:")
    print(summary["var_only"])
    
    print("\n3. Similarity Analysis:")
    print(summary["similarity"])
    
    print("\n4. Uniqueness Analysis:")
    print(summary["uniqueness"])
    
    print("\n5. Disagreement Analysis:")
    print(summary["disagreement"])
    
    print("\n" + "=" * 50)
    print("This is a sample of what the Gradio interface will display.")
    print("To run the full interface, use: python app.py")
    print("Make sure the backend is running first!")

if __name__ == "__main__":
    main()

