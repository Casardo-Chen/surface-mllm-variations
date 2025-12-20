from openai import OpenAI
import os, sys
import base64
import uuid
import numpy as np
import torch

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# avoid segmentation fault
os.environ["OMP_NUM_THREADS"] = "1" 
torch.set_num_threads(1) 
np.set_printoptions(threshold=np.inf)


def uuid_gen():
    return str(uuid.uuid4())

def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

def gpt4o_wrapper(system_prompt, user_prompt, structure=None, system_role=False, structured=False, json_format=False, api_key=None):
    """
    Wrapper for GPT-4o API calls
    
    Args:
        system_prompt (str): System prompt
        user_prompt (str): User prompt
        structure: Structure for structured output
        system_role (bool): Whether to use system role
        structured (bool): Whether to use structured output
        json_format (bool): Whether to use JSON format
        api_key (str, optional): OpenAI API key. If not provided, uses env var.
    """
    key = api_key or os.getenv('OPENAI_API_KEY')
    client = OpenAI(api_key=key)
    
    if system_role:
        message = [
            {"role": "system", "content": f"{system_prompt}"},
            {"role": "user", "content": [{"type": "text", "text": f"{user_prompt}"}]}
        ]
    else:
        message = [
            {"role": "user", "content": [{"type": "text", "text": f"{user_prompt}"}]}
        ] 
    if structured:
        try:
            response = client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=message,
                response_format = structure
            )
            return response.choices[0].message.parsed
        except Exception as e:
            print(e)
    elif json_format:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=message,
            response_format = { "type": "json_object" }
        )
        return response.choices[0].message.content
    else:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=message,
        )
        return response.choices[0].message.content



