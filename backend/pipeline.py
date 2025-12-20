from dotenv import load_dotenv
load_dotenv()


import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)

import re
import json
import helper
import prompts
from generation import get_all_descriptions
import extraction
from concurrent.futures import ThreadPoolExecutor

def variation_generation(image, num_trials, models, variation_type, prompt=None, output_path=None, source=None, api_keys=None):
    """
    Process an image to generate and break down descriptions into atomic facts.
    
    Args:
        image (str): URL or base64-encoded image
        prompt (str, optional): Custom prompt for description. Defaults to "Describe the image in detail."
        output_path (str, optional): Path to save the output JSON. Defaults to timestamp-based filename.
        source (str, optional): Source type of the image ('url' or 'base64')
        api_keys (dict, optional): Dictionary with API keys {'openai': str, 'gemini': str, 'claude': str}
    
    Returns:
        dict: Processed results containing descriptions and atomic facts
    """
    # Set default prompt if None
    if prompt is None:
        prompt = "Describe the image in detail."

    # Generate and process descriptions
    output = get_all_descriptions(image, prompt, num_trials, models, variation_type, source, api_keys)

    # Save the result to a json file
    # if output_path is None:
    #     folder_name = helper.uuid_gen()
    #     output_path = f"./user_study/{folder_name}"
    #     if not os.path.exists(os.path.dirname(output_path+"/")):
    #         os.makedirs(os.path.dirname(output_path + "/"))
    #         logger.info(f"Created folder {output_path}")
    
    # with open(f"{output_path}/descriptions.json", "w") as f:
    #     json.dump(output, f, indent=4)
    return output

def aggregated_description_generation(descs, output_path, num_trials, models, api_keys=None):
    """
    Generate aggregated description from atomic facts.
    
    Args:
        desc_with_atomic_facts (dict): Processed results containing descriptions and atomic facts
        output_path (str): Path to save the output JSON
        num_trials (int): Number of trials
        models (list): List of models used
        api_keys (dict, optional): Dictionary with API keys {'openai': str, 'gemini': str, 'claude': str}
    Returns:
        dict: Processed results containing various aggregated descriptions
    """
    summary = {}

    # remove the prompt field in the description
    descs = {k: v for k, v in descs.items() if k != "prompt"}

    desc_str = json.dumps(descs, indent=4)
    logger.info(f"Generating variation-aware summary")

    aggregated_output = extraction.gemini_thinking(desc_str, num_trials, models, api_keys)
    logger.info(f"Calculating diff summary")

    
    def process_uniqueness_output():
        result =  helper.gpt4o_wrapper(
            system_prompt=prompts.unique_point_prompt, 
            user_prompt=aggregated_output, 
            system_role=True, 
            json_format=True,
            api_key=api_keys.get("openai") if api_keys else None
        )
        # change to json format
        result = json.loads(result)
        return result
    

    with ThreadPoolExecutor() as executor:
        execute_uniqueness_future = executor.submit(process_uniqueness_output)
        uniqueness_output = execute_uniqueness_future.result()
    
    def convert_percentage(text):
        models = ['gpt', 'claude', 'gemini']
        total_mentions = 0
        total_possible = len(models) * num_trials
        
        for model in models:
            # Look for patterns like "3 of 3 GPT" and extract the first number
            matches = re.findall(rf'(\d+) of {num_trials} *', text)
            for match in matches:
                total_mentions += int(match)
        
        if total_possible > 0:
            percentage = (total_mentions / total_possible) * 100
            return f"({percentage:.0f}%)"
        return ""

    def replace_parentheses(text):
        def process_match(match):
            inner_text = match.group(1)
            return convert_percentage(inner_text)
        
        # Replace parenthesized content with percentage
        return re.sub(r'\((.*?)\)', lambda m: process_match(m), text)

    def percentage_to_nl(match):
        text = match.group(0)
        num = re.findall(r'\d+', text)
        if num:
            num = int(num[0])
            if num >= 75:
                return "(well-supported)"
            elif num >= 50:
                return "(moderately supported)"
            elif num >= 25:
                return "(weakly supported)"
            else:
                return "(very little support)"
        return text

    summary["model_diff"] = aggregated_output
    summary["var_only"] = re.sub(r"\(.*?\)", "", aggregated_output)
    summary["percentage"] = replace_parentheses(aggregated_output)
    summary["nl"] = re.sub(r"\(.*?\)", percentage_to_nl, aggregated_output)
    summary["similarity"] = uniqueness_output["similarity"]
    summary["uniqueness"] = uniqueness_output["uniqueness"]
    summary["disagreement"] = uniqueness_output["disagreement"]

    # with open(f"{output_path}/summary.json", "w") as f:
    #     json.dump(summary, f, indent=4)
    # logger.info(f"Output saved to {output_path}/summary.json")
    return summary