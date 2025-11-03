from dotenv import load_dotenv
load_dotenv()


import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)

import re
import argparse
import os
import json
from datetime import datetime
import helper
import prompts
from generation import get_all_descriptions
from concurrent.futures import ThreadPoolExecutor

def variation_generation(image, num_trials, models, variation_type, prompt=None, output_path=None, source=None):
    """
    Process an image to generate and break down descriptions into atomic facts.
    
    Args:
        image (str): URL or base64-encoded image
        prompt (str, optional): Custom prompt for description. Defaults to "Describe the image in detail."
        output_path (str, optional): Path to save the output JSON. Defaults to timestamp-based filename.
    
    Returns:
        dict: Processed results containing descriptions and atomic facts
    """
    # Set default prompt if None
    if prompt is None:
        prompt = "Describe the image in detail."

    # Generate and process descriptions
    output = get_all_descriptions(image, prompt, num_trials, models, variation_type, source)
    # logger.info(f"Descriptions generated")
    # intermediate_results = break_down_all_descriptions(res)
    # # combine the descriptive and inference into one list
    # for item in intermediate_results:
    #     item["descriptive"] = item["descriptive"] + item["inference"]
    # logger.info(f"Descriptions broken down")
    # output = {}
    # for item in intermediate_results:
    #     output[item["id"]] = item
    #     output[item["id"]]["atomic_facts"] = break_down_all_atomic_facts(item["descriptive"])
    # logger.info(f"Atomic facts broken down")    
    
    # Save the result to a json file
    if output_path is None:
        folder_name = helper.uuid_gen()
        output_path = f"./user_study/{folder_name}"
        if not os.path.exists(os.path.dirname(output_path+"/")):
            os.makedirs(os.path.dirname(output_path + "/"))
            logger.info(f"Created folder {output_path}")
    
    with open(f"{output_path}/descriptions.json", "w") as f:
        json.dump(output, f, indent=4)
    # extracted_atomic_facts = extract_atomic_facts(output)
    # with open(f"{output_path}/extracted_atomic_facts.json", "w") as f:
    #     json.dump(extracted_atomic_facts, f, indent=4)
    # return output, extracted_atomic_facts
    return output

def aggregated_description_generation(descs, output_path, num_trials, models):
    """
    Generate aggregated description from atomic facts.
    
    Args:
        desc_with_atomic_facts (dict): Processed results containing descriptions and atomic facts
        output_path (str): Path to save the output JSON
    Returns:
        dict: Processed results containing various aggregated descriptions
    """
    summary = {}
    # logger.info(f"Extracting atomic facts")
    # atomic_facts = extract_atomic_facts(desc_with_atomic_facts)
    # logger.info(f"Clustering atomic facts and generating variation-aware summary")
    # change the list of atomic facts to a string

    # remove the prompt field in the description
    descs = {k: v for k, v in descs.items() if k != "prompt"}

    desc_str = json.dumps(descs, indent=4)
    logger.info(f"Generating variation-aware summary")

    aggregated_output = extraction.gemini_thinking(desc_str, num_trials, models)
    logger.info(f"Calculating diff summary")

    # def process_aggregated_output():
    #     return generate_majority(aggregated_output)

    # def process_majority_output(majority_output):
    #     return generate_natural_language(majority_output)
    
    def process_uniqueness_output():
        result =  helper.gpt4o_wrapper(system_prompt=prompts.unique_point_prompt, user_prompt=aggregated_output, system_role=True, json_format=True)
        # change to json format
        result = json.loads(result)
        return result
        

    # def process_hide_variation():
    #     return re.sub(r"\(.*?\)", "", aggregated_output)


    with ThreadPoolExecutor() as executor:
    #     majority_future = executor.submit(process_aggregated_output)
    #     hide_variation_future = executor.submit(process_hide_variation)
        execute_uniqueness_future = executor.submit(process_uniqueness_output)

    #     majority_output = majority_future.result()
    #     natural_language_future = executor.submit(process_majority_output, majority_output)

    #     natural_language_output = natural_language_future.result()
    #     var_only_output = hide_variation_future.result()
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
            if num > 85:
                return "(well-supported)"
            elif num >= 60:
                return "(moderately supported)"
            elif num >= 25:
                return "(poorly supported)"
            else:
                return "(very little support)"
        return text

    summary["model_diff"] = aggregated_output
    # summary["var_only"] = var_only_output
    # summary["percentage"] = majority_output
    # summary["nl"] = natural_language_output
    summary["var_only"] = re.sub(r"\(.*?\)", "", aggregated_output)
    summary["percentage"] = replace_parentheses(aggregated_output)
    summary["nl"] = re.sub(r"\(.*?\)", percentage_to_nl, aggregated_output)
    summary["similarity"] = uniqueness_output["similarity"]
    summary["uniqueness"] = uniqueness_output["uniqueness"]
    summary["disagreement"] = uniqueness_output["disagreement"]

    with open(f"{output_path}/summary.json", "w") as f:
        json.dump(summary, f, indent=4)
    logger.info(f"Output saved to {output_path}/summary.json")
    return summary


if __name__ == "__main__":
    DATA_FOLDER = "./data/"

    start_time = datetime.now().strftime("%Y%m%d_%H%M%S")

    parser = argparse.ArgumentParser()
    parser.add_argument('-u', "--image_url", type=str, required=True)
    parser.add_argument('-p', "--prompt", type=str, required=False, default="Describe the image in detail.")
    parser.add_argument('-o', "--name", type=str, required=False, default="data/" + datetime.now().strftime("%Y%m%d_%H%M%S"))
    args = parser.parse_args()

    ''' Test pipeline '''
    # image_url = "https://media.istockphoto.com/id/117146077/photo/beauty-in-nature.jpg?s=612x612&w=0&k=20&c=vbuBIGb71hqFpMJOTThvx4mFw_JA18ORzxkV4IsBe9c="
    # prompt = "Describe the image in detail."
    # folder_name = "./"

    image_url = args.image_url
    prompt = args.prompt
    folder_name = args.name
    output_path = f"{DATA_FOLDER}{folder_name}"

    '''
    descriptions generation + sentences breakdown + atomic facts breakdown
    '''
    # if the path does not exist, create it
    if not os.path.exists(os.path.dirname(output_path+"/")):
        os.makedirs(os.path.dirname(output_path + "/"))
        logger.info(f"Created folder {output_path}")
    desc_with_atomic_facts = variation_generation(image_url, prompt, output_path)

    '''
    atomic fact extraction, aggregation, and summary generation
    '''
    aggregated_description_generation(desc_with_atomic_facts, output_path)

    end_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    logger.info(f"takes {end_time} - {start_time} = {datetime.strptime(end_time, '%Y%m%d_%H%M%S') - datetime.strptime(start_time, '%Y%m%d_%H%M%S')}")
    logger.info(f"Process completed")


    
    
