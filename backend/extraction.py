# extract all atomic facts from the description.json
import json
import os
from openai import OpenAI
from google import genai
from google.genai import types
import prompts

from dotenv import load_dotenv
load_dotenv()


def gemini_thinking(text, num_trials, models, api_keys=None):
    """
    Args:
        text (str): The text to process
        num_trials (int): Number of trials
        models (list): List of models
        api_keys (dict, optional): Dictionary with API keys {'openai': str, 'gemini': str, 'claude': str}
    Returns:
        str: The description of the image
    """
    gemini_key = api_keys.get("gemini") if api_keys else None
    key = gemini_key or os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=key)

    num_responses = int(num_trials) * len(models)

    num_model_specific_responses = [f"{num_trials} from {model}" for model in models]
    num_model_specific_responses = ", ".join(num_model_specific_responses)
    x_vals = [f"{i}" for i in range(num_trials+1)]
    x_vals = " or ".join(x_vals)


    system_instruction = \
f'''Reformat and combine the input descriptions into coherent paragraphs that show detail level differences across models. 

- **Group Facts**: Each description contains multiple atomic facts. Atomic facts are defined as self-contained facts. Combine atomic facts discussing the same subject into a single, coherent sentence. If different variations of the same fact exist, concatenate them using "or".
- **Paragraph Formation**: Merge the grouped facts into comprehensive paragraphs while ensuring all single and unique claims are included.
- **Model Differences**: Annotate differences between model-generated facts using this format: (specific number of atomic facts from model A of total from model A, specific number from model B of total from model B). Example: (2 of 3 GPT, 3 of 3 Gemini) If a model doesn't support it, there is no need to mention it here.

# Input Format
- The input is a list of descriptions. Each description contains a lot of atomic facts, a response ID, and the model that generated it.
- There are {num_responses} responses in total: {num_model_specific_responses}. When grouping facts from one response, do not double count. Use a source indicator format like x of {num_trials}, where x = {x_vals}.

# Output Format
- Indicate model differences clearly with the specified format and example below
- Never mention the model's name in the sentences in the final paragraph; only show it in the parenthesis.
- Highlight unique and single claims where applicable.
- Directly return the revised description; DO NOT say "below is the revised description" or similar first paragraph. DO NOT include "PARAGRAPH:" or similar headings.
- Please return the response in hierarchical paragraphs, each starting with a short bullet-pointed phrase summarizing the content. Use at least 2 layers of hierarchy.
- Start from high-level information and then go into details. 

# Example Output:
## Map Overview\n- The map illustrates the number of US Americans reporting ancestry from various European countries (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini), based on self-reported data from the 2019 American Community Survey (3 of 3 Claude).\n\n## Highest Ancestry Group\n- Germany is most frequently identified as the country with the highest number of US Americans claiming ancestry, reported at 45,000,000 (3 of 3 GPT, 2 of 3 Claude, 3 of 3 Gemini). However, Ireland was also cited as the highest source, with figures of 31,000,000 (1 of 3 GPT) or 54,000,000 (1 of 3 Claude).\n\n## Reported Ancestry Numbers\n- **Germany**: 45,000,000 (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini)\n- **Ireland**: 31,000,000 (2 of 3 GPT), 34,000,000 (1 of 3 GPT, 1 of 3 Claude, 3 of 3 Gemini), 54,000,000 (1 of 3 Claude)\n- **England/UK**: 24,000,000 (1 of 3 GPT), 34,000,000 (2 of 3 Claude), 54,000,000 (3 of 3 Gemini); additionally, the UK is noted as the second highest source at 34,000,000 (1 of 3 Claude)\n- **Italy**: 16,000,000 (3 of 3 Claude, 3 of 3 Gemini), 17,000,000 (2 of 3 GPT), 18,000,000 (1 of 3 GPT)\n- **Poland**: 9,000,000 (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini)\n- **France**: 8,000,000 (2 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini), 10,000,000 (1 of 3 GPT)\n- **Russia**: 2,000,000 (3 of 3 GPT, 2 of 3 Gemini)\n- **Norway**: 3,400,000 (2 of 3 Claude), 4,500,000 (2 of 3 GPT)\n- **Sweden**: 3,400,000 (1 of 3 Claude), 3,800,000 (2 of 3 GPT, 1 of 3 Claude), 3,900,000 (1 of 3 Claude)\n- **Greece**: 1,200,000 (3 of 3 GPT, 1 of 3 Claude, 3 of 3 Gemini)\n- **Spain**: 1,000,000 (3 of 3 Gemini), 1,300,000 (1 of 3 Claude)\n- **Ukraine**: 1,100,000 (1 of 3 GPT, 2 of 3 Claude)\n- **Iceland**: 54,000 (1 of 3 Claude, 1 of 3 Gemini)\n- **Portugal**: 1,300,000 (2 of 3 Gemini)\n- **Denmark**: 1,200,000 (1 of 3 Claude)\n- **Netherlands**: 3,200,000 (1 of 3 Claude), 5,000,000 (1 of 3 GPT)\n- **Romania**: 1,100,000 (1 of 3 Gemini)
'''


    response = client.models.generate_content(
        model="gemini-2.5-pro",
        config=types.GenerateContentConfig(
        system_instruction= system_instruction,),
        contents=[
            text,
        ],
    )
    return response.text.strip()
    """
    Generate a summary of the given text using OpenAI's GPT-3 API.
    
    Args:
        text (str): The input text to summarize
        api_key (str, optional): OpenAI API key. If not provided, uses env var.
        
    Returns:
        str: The summary generated by the API
    """
    key = api_key or os.getenv('OPENAI_API_KEY')
    client = OpenAI(api_key=key)
    response = client.chat.completions.create(
        model="gpt-4o",
        # reasoning_effort="medium",
        messages=[
            {
                "role": "system",
                "content": prompts.o1_majority_prompt
            },
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": text},
                ]
            },
            
            ]
        )
    return response.choices[0].message.content
    """
    Remove certain
        
    Args:
        data (dict): The parsed JSON data containing descriptions
        
    Returns:
        dict: A filtered dictionary containing only the atomic facts
    """
    filtered_data = {}
    
    # Iterate through each response in the descriptions
    for response_id, response_data in data.items():
        # Skip entries without atomic facts
        if not response_data.get('atomic_facts'):
            continue
            
        filtered_data[response_id] = {
            'model': response_data.get('model', 'unknown'),
            'atomic_facts': response_data['atomic_facts']
        }
    
    return filtered_data