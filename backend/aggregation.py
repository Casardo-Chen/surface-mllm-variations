from prompts import aggregation_prompt, add_inference_prompt
import helper
import json
import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input_path", type=str, help="The name of the folder which contains the alignment data", default="data/test")
args = parser.parse_args()

def num_to_natural(num):
    """Convert a numerical value to a natural language indicator."""
    if num > 0.99:
        return "certainly"
    elif num > 0.7:
        return "likely"
    elif num > 0.5:
        return "maybe"
    elif num > 0.3:
        return "has a chance"
    return "unlikely"

def get_model_differences(source):
    """Count occurrences of each model in the source data."""
    model_counts = {"gpt": 0, "claude": 0, "gemini": 0}

    for model in source:
        model_name = model[1]
        if model_name in model_counts:
            model_counts[model_name] += 1

    result = []
    for model, count in model_counts.items():
        if count > 0:
            result.append(f"{model.capitalize()}: {count}/3")

    return f"({' '.join(result)})" if result else ""

def show_indicator(source, representation_type="percentage"):
    """Show confidence indicator based on the number of sources."""
    total_possible = 9  # Assuming 9 as the total count based on your example
    count = len(source)

    if representation_type == "percentage":
        return f"{round(count / total_possible * 100)}%"
    elif representation_type == "natural":
        return num_to_natural(count / total_possible)
    return ""

if __name__ == "__main__":
    path = args.input_path
    with open(f"{path}/descriptions.json", "r") as f:
        descriptions = json.load(f)

    output_json = {}

    for file in os.listdir(f"{path}/grouped"):
        if file.startswith("atomic_fact_grouped_"):
            response_idx = file.split("_")[3].split(".")[0]
            with open(f"{path}/grouped/{file}", "r") as f:
                grouped_data = json.load(f)
            prompts = []
            for sentence_idx, sentence in enumerate(descriptions[str(response_idx)]["descriptive"]):
                final_prompt = ""
                    # Skip if the sentence doesn't have atomic facts
                if str(sentence_idx) not in descriptions[str(response_idx)]['atomic_facts']:
                    continue
                
                # Get atomic facts for this sentence
                a_f = descriptions[str(response_idx)]['atomic_facts'][str(sentence_idx)]
                
                # Skip if the sentence doesn't have grouped atomic facts
                if str(sentence_idx) not in grouped_data:
                    continue
                    
                atomic_fact = grouped_data[str(sentence_idx)]
                final_prompt += f"Sentence: {sentence}\n"
                
                prompt_atomic_fact = ""
                for key, value in atomic_fact.items():
                    # Skip if the atomic fact doesn't exist in the original data
                    if int(key) >= len(a_f):
                        continue
                        
                    prompt_atomic_fact += f"Atomic Fact {key}: {a_f[int(key)]}\n"
                    prompt_atomic_fact += f"Possible values: "
                    for i, v in value.items():
                        if i == '1':
                            prompt_atomic_fact += f"{v['value']}"
                        else:
                            prompt_atomic_fact += f" | {v['value']}"
                    prompt_atomic_fact += "\n"
                final_prompt += prompt_atomic_fact
                print(final_prompt)
                print("-" * 50)
                prompts.append(final_prompt)
            results = []
            for prompt in prompts:
                result = helper.gpt4o_wrapper(system_prompt=aggregation_prompt, user_prompt=prompt, system_role=True)
                results.append(result)
            # Aggregate all descriptions into one
            aggregated_result = "Description:" + " ".join(results)
            # Add infernece sentences to the aggregated result
            inference_sentences = descriptions[str(response_idx)]["inference"]
            aggregated_result += "\n\nInference:" +  " ".join(inference_sentences)
            final_result = helper.gpt4o_wrapper(system_prompt=add_inference_prompt, user_prompt=aggregated_result, system_role=True)
            output_json[response_idx] = {"aggregated": final_result}
    # with open(f"{path}/aggregated.json", "w") as f:
    #     json.dump(output_json, f, indent=4)
    # print("Aggregated results saved to: ", f"{path}/aggregated.json")



