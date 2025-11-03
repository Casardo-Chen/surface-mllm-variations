from generation import get_claude_description, get_gemini_description, get_gpt_description
import requests

def cross_model_atomic_fact_verification(image_url, atomic_fact, current_model):
    """
    ask other models to verify the atomic fact of one image
    """
    # get all verifications from other models
    # if the url does not start with http, it is a base64 encoded image
    # then we need to tell gpt and claude that it is a base64 encoded image


    verifications = []
    image_content = requests.get(image_url).content
    verification_prompt = f"Is the following claim correct? {atomic_fact} Answer with either 'yes' or 'no' or 'unanswerable' and a short explanation."

    if current_model == "gemini":
        verifications.append({
            "model": "claude",
            "verification": get_claude_description(image_url, verification_prompt)
        })
        verifications.append({
            "model": "gpt", 
            "verification": get_gpt_description(image_url, verification_prompt)
        })
    elif current_model == "gpt":
        verifications.append({
            "model": "gemini",
            "verification": get_gemini_description(image_content, verification_prompt)
        })
        verifications.append({
            "model": "claude",
            "verification": get_claude_description(image_url, verification_prompt)
        })
    elif current_model == "claude":
        verifications.append({
            "model": "gemini",
            "verification": get_gemini_description(image_content, verification_prompt)
        })
        verifications.append({
            "model": "gpt",
            "verification": get_gpt_description(image_url, verification_prompt)
        })
    else:
        raise ValueError("Invalid model")
    # get the verification from the current model
    return verifications

def within_model_atomic_fact_verification(image_url, atomic_fact, current_model):
    """
    ask the same model to verify the atomic fact of one image
    """
    # get all verifications from other models
    verifications = []
    image_content = requests.get(image_url).content
    verification_prompt = f"Is the following claim correct? {atomic_fact} Answer with either 'yes' or 'no' or 'unanswerable' and a short explanation."

    if current_model == "gemini":
        verifications.append({
            "model": "gemini",
            "verification": get_gemini_description(image_content, verification_prompt)
        })
    elif current_model == "gpt":
        verifications.append({
            "model": "gpt",
            "verification": get_gpt_description(image_url, verification_prompt)
        })
    elif current_model == "claude":
        verifications.append({
            "model": "claude",
            "verification": get_claude_description(image_url, verification_prompt)
        })
    else:
        raise ValueError("Invalid model")
    # get the verification from the current model
    return verifications