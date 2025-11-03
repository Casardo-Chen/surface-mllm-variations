from deprecated import deprecated
import json
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any

from openai import OpenAI
import os

import argparse
from prompts import alignment_system_prompt, group_system_prompt
from data_class import AtomicFact, GroupedResults, GroupedResult

import helper
import data_class

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@deprecated(reason="This function is deprecated. Use align_atomic_facts instead.")
def overall_align_descriptions(responses, user_propmt, presentationMode):
    # Extract just the response texts
    comparison_prompt = f"""Given these different descriptions of the same image from different AI models, analyze the key elements that are consistently mentioned across descriptions and identify any notable differences or unique observations. Please provide

1. Common Elements: Key features that appear consistently across multiple descriptions
2. Unique Observations: Notable details mentioned by only one or few descriptions
3. Potential Discrepancies: Any contradicting details between descriptions

The propmt that user uses is: {user_propmt}"""
    
    if presentationMode == "inter":
        context_prompt = f""" The following are answers of the same image from GPT, Gemini, and Claude respectively:
- GPT: {responses[0]}
- Gemini: {responses[1]}
- Claude: {responses[2]}"""
        
    if presentationMode == "intra":
        context_prompt = f""" The following are answers of the same image from the same model:
- {responses[0]}
- {responses[1]}
- {responses[2]}"""
        
    format_prompt = f"""Please structure your analysis in a clear, organized format."""

    final_prompt = f"""{context_prompt}
{comparison_prompt}
{format_prompt}"""
        


    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert at analyzing and comparing descriptions of images."},
            {"role": "user", "content": final_prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    
    print(completion.choices[0].message.content)    
    return completion.choices[0].message.content

def process_single_response(response: Dict[str, Any], atomic_fact: str) -> Dict[str, Any]:
    """Process a single response and return the result."""
    result = helper.gpt4o_wrapper(
        system_prompt=alignment_system_prompt, 
        user_prompt=f"Atomic fact: {atomic_fact}\nDescription: {response['response']}", 
        system_role=True
    )
    return {
        "id": response['id'], 
        "model": response['model'], 
        "atomic_fact": result
    }

def process_atomic_fact(atomic_fact: str, responses: list) -> list:
    """Process all responses for a single atomic fact in parallel."""
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(process_single_response, response, atomic_fact)
            for response in responses
        ]
        return [future.result() for future in futures]
    
def atomic_fact_alignment(data, output_path):
    """
    Align the answers from other models to the reference model atomic facts
    @param data: a dictionary of responses with sentences and atomic facts
    @return: a dictionary of aligned atomic facts
    """
    for curr_response in data.keys():
        curr_atomic_facts = data[curr_response]["atomic_facts"]
        other_responses = [{"id": key, "model": data[key]['model'], "response": data[key]['description']} for key in data if key != curr_response]

        overall_results= []
        for id, sentence in curr_atomic_facts.items():
            for a_f_id, question in enumerate(sentence):
                same_atomic_facts = process_atomic_fact(question, other_responses)
                overall_results.append({
                    "sentence_id": id,
                    "atomic_fact_id": a_f_id,
                    "atomic_fact": question,
                    "same_atomic_facts": same_atomic_facts
                })
        
        with open(f"{output_path}/alignment/alignment_{curr_response}.json", "w") as f:
            json.dump(overall_results, f, indent=4)

def atomic_fact_grouping(data, output_path, file_number):
    """
    Group the aligned atomic facts
    @param data: a dictionary of aligned atomic facts
    @return: a dictionary of grouped atomic facts
    """
    grouped_results = {}

    # Process each atomic fact
    for i, atomic_fact in enumerate(data):
        if atomic_fact['sentence_id'] not in grouped_results:
            grouped_results[atomic_fact['sentence_id']] = {}
        atomic_fact_id = atomic_fact['atomic_fact_id']
        all_atomic_facts = atomic_fact['same_atomic_facts']

        if int(file_number) % 3 == 0:
            model = "claude"
        elif int(file_number) % 3 == 1:
            model = "gemini"
        else:
            model = "gpt"
        
        # Add the reference atomic fact as another entry
        all_atomic_facts.append({
            "id": f"{file_number}",
            "model": model,
            "atomic_fact": atomic_fact['atomic_fact']
        })
        
        user_prompt = f'''
        {json.dumps(all_atomic_facts, indent=4)}
        '''
        # Get grouped results for this atomic fact
        result = helper.gpt4o_wrapper(system_prompt=group_system_prompt, user_prompt=user_prompt, system_role=True, json_format=True)
        # parse the result
        result = json.loads(result)
        # add the result to temp_data
        grouped_results[atomic_fact['sentence_id']][atomic_fact_id] = result
            
    # Save all grouped results to a new file
    with open(f"{output_path}/grouped/atomic_fact_grouped_{file_number}.json", "w") as f:
        json.dump(grouped_results, f, indent=4)
    print("Saved grouped results to: ", f"{output_path}/grouped/atomic_fact_grouped_{file_number}.json")

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input_path", type=str, help="The name of the folder which contains the alignment data", default="data/test")
args = parser.parse_args()
path = args.input_path

if __name__ == "__main__":
    # go through all alignment files
    with open(f"{path}/descriptions.json", "r") as f:
        data = json.load(f)
    atomic_fact_alignment(data, path)

    # group the atomic facts
    for file in os.listdir(f"{path}/alignment"):
        if file.startswith("alignment_"):
            print("Starting to process file: ", file)
            # get the number of the file
            file_number = file.split("_")[1].split(".")[0]
            with open(f"{path}/alignment/{file}", "r") as f:
                data = json.load(f)
            atomic_fact_grouping(data, path, file_number)

