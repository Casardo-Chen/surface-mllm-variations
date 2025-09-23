from openai import OpenAI
import google.generativeai as Gemini
import os, sys
import base64
import csv
import uuid
import prompts 
import numpy as np
import torch

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OUTPUT_DIR = "./output/"
INPUT_DIR = "./img/"

openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
Gemini.configure(api_key=os.environ["GEMINI_API_KEY"])
gemini_model = Gemini.GenerativeModel('gemini-1.5-flash')

# avoid segmentation fault
os.environ["OMP_NUM_THREADS"] = "1" 
torch.set_num_threads(1) 
np.set_printoptions(threshold=np.inf)


def uuid_gen():
    return str(uuid.uuid4())

def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

def gpt4o_wrapper(system_prompt, user_prompt, structure=None, system_role=False, structured=False, json_format=False):
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
            response = openai_client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=message,
                response_format = structure
            )
            return response.choices[0].message.parsed
        except Exception as e:
            print(e)
    elif json_format:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=message,
            response_format = { "type": "json_object" }
        )
        return response.choices[0].message.content
    else:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=message,

        )
        return response.choices[0].message.content



