# generative AI
from openai import OpenAI
import prompts
import time
import base64

import extraction

# sys
import requests
import os
import re
from concurrent.futures import ThreadPoolExecutor
import json
# environment
from dotenv import load_dotenv
load_dotenv()

def get_gemini_description(image_input, prompt, api_key=None, is_base64=False):
    """
    Args:
        image_input: The image URL or base64 data URL
        prompt (str): The prompt to generate a description
        api_key (str, optional): Gemini API key. If not provided, uses env var.
        is_base64 (bool): Whether the image_input is a base64 data URL
    Returns:
        str: The description of the image
    Note: Uses OpenAI SDK with Google's compatibility layer
    """
    key = api_key or os.getenv("GEMINI_API_KEY")
    
    # Use OpenAI SDK with Google's Gemini compatibility endpoint
    client = OpenAI(
        api_key=key,
        base_url="https://generativelanguage.googleapis.com/v1beta/"
    )
    
    # Prepare image content based on format
    if is_base64:
        # Use base64 data URL directly
        image_url = image_input
    else:
        # Use URL format
        image_url = image_input
    
    try:
        # Try using OpenAI SDK format (Gemini compatibility layer)
        response = client.chat.completions.create(
            model="gemini-3-flash-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            },
                        },
                    ],
                }
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to native Gemini SDK if OpenAI compatibility doesn't work
        from google import genai
        from google.genai import types
        
        gemini_client = genai.Client(api_key=key)
        
        # Handle image input - convert to bytes if needed
        if is_base64:
            # Extract base64 string from data URL
            base64_match = re.search(r'^data:image/(.+);base64,(.+)$', image_input)
            if base64_match:
                base64_data = base64_match.group(2)
                media_type = base64_match.group(1)
            else:
                base64_data = image_input
                media_type = "jpeg"
            image_bytes = base64.b64decode(base64_data)
        else:
            # Download image from URL
            image_bytes = requests.get(image_input).content
            media_type = "jpeg"
        
        response = gemini_client.models.generate_content(
            model="gemini-1.5-pro",
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=f"image/{media_type}")
            ],
        )
        return response.text.strip()

def get_gpt_description(image_input, prompt, api_key=None, is_base64=False):
    """
    Args:
        image_input (str): The URL of the image or base64 data URL
        prompt (str): The prompt to generate a description
        api_key (str, optional): OpenAI API key. If not provided, uses env var.
        is_base64 (bool): Whether the image_input is a base64 data URL
    Returns:
        str: The description of the image
    """
    key = api_key or os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)
    
    # Prepare image content based on format
    if is_base64:
        # If it's a base64 data URL, use it directly
        image_url = image_input
    else:
        # If it's a regular URL, use it as is
        image_url = image_input
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that describes images for blind and low vision"
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        },
                    },
                ],
            }
        ],
    )
    return response.choices[0].message.content

def get_claude_description(image_input, prompt, api_key=None, is_base64=False):
    """
    Args:
        image_input (str): The URL of the image or base64 data URL
        prompt (str): The prompt to generate a description
        api_key (str, optional): Anthropic API key. If not provided, uses env var.
        is_base64 (bool): Whether the image_input is a base64 data URL
    Returns:
        str: The description of the image
    Note: Uses OpenAI SDK with Anthropic's compatibility layer
    """
    key = api_key or os.getenv("CLAUDE_API_KEY")
    
    # Use OpenAI SDK with Anthropic's compatibility endpoint
    client = OpenAI(
        api_key=key,
        base_url="https://api.anthropic.com/v1/"
    )
    
    # Prepare image content based on format
    if is_base64:
        # Extract base64 string and media type from data URL
        base64_match = re.search(r'^data:image/(.+);base64,(.+)$', image_input)
        if base64_match:
            media_type = base64_match.group(1)
            base64_data = base64_match.group(2)
            # Use base64 format
            image_url = f"data:image/{media_type};base64,{base64_data}"
        else:
            # Assume it's already a base64 string without data URL prefix
            image_url = f"data:image/jpeg;base64,{image_input}"
    else:
        # Use URL format
        image_url = image_input
    
    try:
        # Try using OpenAI SDK format (Anthropic compatibility layer)
        response = client.chat.completions.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            },
                        },
                    ],
                }
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to native Anthropic SDK if OpenAI compatibility doesn't work
        from anthropic import Anthropic
        anthropic_client = Anthropic(api_key=key)
        
        if is_base64:
            # Extract base64 string from data URL
            base64_match = re.search(r'^data:image/(.+);base64,(.+)$', image_input)
            if base64_match:
                media_type = base64_match.group(1)
                base64_data = base64_match.group(2)
            else:
                base64_data = image_input
                media_type = "jpeg"
            
            response = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": f"image/{media_type}",
                                    "data": base64_data
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )
        else:
            response = anthropic_client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "url",
                                    "url": image_input
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )
        return response.content[0].text

def prompt_paraphrase(prompt, n=2, api_key=None):
    """
    Paraphrase a given prompt to n-1 different prompts
    Args:
        prompt (str): The input prompt to paraphrase
        n (int): The number of paraphrases to generate
        api_key (str, optional): OpenAI API key. If not provided, uses env var.
    Returns:
        list: A list of n paraphrased
    """
    n = max(1, n)
    key = api_key or os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)
    prompt = f'''Paraphrase {n} version of the following prompt: {prompt} \n\n
    Please return in following json format: 
    {{
        "1": "paraphrase prompt 1",
        "2": "paraphrase prompt 2",
        ...
    }}
    '''
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        response_format={"type": "json_object"}        
    )
    # change the response to json then get the value as a list
    prompts = json.loads(response.choices[0].message.content).values()
    # change to list 
    return list(prompts)

def prompt_persona_variation(prompt, n=2, api_key=None):
    """
    Generate persona-based variations of a given prompt
    Args:
        prompt (str): The input prompt to create persona variations for
        n (int): The number of persona variations to generate
        api_key (str, optional): OpenAI API key. If not provided, uses env var.
    Returns:
        list: A list of n prompts with different personas applied
    """
    n = max(1, n)
    key = api_key or os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=key)
    persona_prompt = f'''Generate {n} different persona-based variations of the following image description prompt. Each variation should maintain the core instruction but adapt it to a different persona or perspective (e.g., casual observer, accessibility advocate, art critic, etc.). Each persona should naturally influence how the description is framed while keeping the essential task the same.

Original prompt: {prompt}

Please return in the following JSON format:
{{
    "1": "prompt variation 1 with persona context",
    "2": "prompt variation 2 with persona context",
    ...
}}

Each variation should:
- Maintain the core instruction from the original prompt
- Incorporate a distinct persona that would naturally describe images differently
- Be clear and actionable
- Vary in style, focus, or perspective based on the persona

Example Input: "Describe this image in detail"

Example Output:
{{
    "1": "As a casual observer, describe this image in detail for someone who cannot see it, focusing on what you naturally notice first.",
    "2": "As an accessibility advocate, describe this image in detail for someone who cannot see it, emphasizing functional elements and navigation cues.",
    "3": "As an art critic, describe this image in detail for someone who cannot see it, highlighting composition, style, and aesthetic qualities."
}}
'''
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": persona_prompt},
                ],
            }
        ],
        response_format={"type": "json_object"}        
    )
    # change the response to json then get the value as a list
    prompts = json.loads(response.choices[0].message.content).values()
    # change to list 
    return list(prompts)


def get_all_descriptions(image, prompt, num_descriptions=3, models=["gemini", "gpt", "claude"], variation_type="original", source="url", api_keys=None):
    """
    Args:
        image (str): The URL of the image or the base64 encoded image
        prompt (str): The prompt to generate a description
        num_descriptions (int): The number of descriptions to generate for each model
    Returns:
        dict: A dictionary containing the descriptions generated by each model
            {
            "1": {
                "id": "gemini",
                "description": "description of the image"
            },
            "2": {
                "id": "gpt",
                "description": "description of the image"
            },
            ...
    """

    descriptions = {}

    # decide if need to modify the prompt
    prompts = [prompt] * num_descriptions
    print(len(prompts))
    if variation_type == "paraphrased":
        openai_key = api_keys.get("openai") if api_keys else None
        paraphrased = prompt_paraphrase(prompt, max(1, num_descriptions-1), openai_key)
        prompts = [prompt] + paraphrased
    elif variation_type == "various": # persona variation
        openai_key = api_keys.get("openai") if api_keys else None
        persona_variations = prompt_persona_variation(prompt, max(1, num_descriptions-1), openai_key)
        prompts = [prompt] + persona_variations

    
    def fetch_description(p, func, *args):
        try:
            return func(*args), p
        except Exception as e:
            return f"Error: {str(e)}"
    
    tasks = []
    if source == "url":
        with ThreadPoolExecutor() as executor:
            # for all the prompt in the list, generate the description
            for i, p in enumerate(prompts, 1):
                # for each model, generate the description
                for m in models:
                    if m == "gemini":
                        gemini_key = api_keys.get("gemini") if api_keys else None
                        # Gemini can use URL directly with OpenAI SDK compatibility
                        tasks.append(executor.submit(fetch_description, p, get_gemini_description, image, p, gemini_key, False))
                    elif m == "gpt":
                        openai_key = api_keys.get("openai") if api_keys else None
                        # GPT can use URL directly
                        tasks.append(executor.submit(fetch_description, p, get_gpt_description, image, p, openai_key, False))
                    elif m == "claude":
                        claude_key = api_keys.get("claude") if api_keys else None
                        # Claude can use URL directly
                        tasks.append(executor.submit(fetch_description, p, get_claude_description, image, p, claude_key, False))
            for i, future in enumerate(tasks, 1):
                m = models[(i-1) % len(models)]
                
                descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0], "prompt": future.result()[1]}
                # descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0],}

            return descriptions
    else:
        # base64 source - all models can use base64 data URL with OpenAI SDK compatibility
        with ThreadPoolExecutor() as executor:
            # for all the prompt in the list, generate the description
            for i, p in enumerate(prompts, 1):
                # for each model, generate the description
                for m in models:
                    if m == "gemini":
                        gemini_key = api_keys.get("gemini") if api_keys else None
                        # Gemini can use base64 data URL directly with OpenAI SDK compatibility
                        tasks.append(executor.submit(fetch_description, p, get_gemini_description, image, p, gemini_key, True))
                    elif m == "gpt":
                        openai_key = api_keys.get("openai") if api_keys else None
                        # GPT can use base64 data URL directly
                        tasks.append(executor.submit(fetch_description, p, get_gpt_description, image, p, openai_key, True))
                    elif m == "claude":
                        claude_key = api_keys.get("claude") if api_keys else None
                        # Claude can use base64 data URL directly
                        tasks.append(executor.submit(fetch_description, p, get_claude_description, image, p, claude_key, True))
            for i, future in enumerate(tasks, 1):
                m = models[(i-1) % len(models)]
                
                descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0], "prompt": future.result()[1]}
            return descriptions


