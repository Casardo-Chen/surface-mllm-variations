import helper
import prompts
from pydantic import BaseModel
import json
import concurrent.futures

class AtomicFact(BaseModel):
    atomic_facts: list[str]

class Sentences(BaseModel):
    descriptions: list[str]
    inferences: list[str]

class NewAtomicFact(BaseModel):
    id: str
    fact: str
    question: str

class AugmentedAtomicFact(BaseModel):
    tagged_sentence: str
    atomic_facts: list[NewAtomicFact]


def description_classification(text):
    sentences = helper.gpt4o_wrapper(system_prompt=prompts.descriptive_prompt, user_prompt=text, structure=Sentences, system_role=True, structured=True)
    return sentences


def new_atomic_fact_generation(sentence, index):
    """
    @param data: break a sentence into atomic facts
    @return: list of atomic facts
    """
    atomic_facts = helper.gpt4o_wrapper(system_prompt=prompts.augmented_atomic_prompt, user_prompt=sentence, structure=AugmentedAtomicFact, system_role=True, structured=True)
    return {"sentence_index": index, "atomic_facts": atomic_facts}


def new_break_down_all_atomic_facts(data):
    """
    @param data: a list of senteces
    @return: a list of atomic facts
    """
    atomic_facts = {} # a sentence index and the atomic facts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_sentence = {executor.submit(atomic_fact_generation, sentence, index): (sentence, index) for index, sentence in enumerate(data)}
        
        for future in concurrent.futures.as_completed(future_to_sentence):
            try:
                result = future.result()
                atomic_facts[result["sentence_index"]] = {
                    "tagged_sentence": result["atomic_facts"].tagged_sentence,
                    "atomic_facts": [
                        fact.model_dump() # Convert Pydantic model to dict
                        for fact in result["atomic_facts"].atomic_facts
                    ]
                }
            except Exception as e:
                print(f"Error processing sentence: {e}")
    return atomic_facts


def atomic_fact_generation(sentence, index):
    """
    @param data: break a sentence into atomic facts 
    @return: list of atomic facts
    """
    atomic_facts = helper.gpt4o_wrapper(system_prompt=prompts.atomic_prompt, user_prompt=sentence, structure=AtomicFact, system_role=True, structured=True)
    return {"sentence_index": index, "atomic_facts": atomic_facts.atomic_facts}


def break_down_all_descriptions(data):
    """
    @param data: json file with the descriptions
    @return: list of dictionaries with the sentences added
    """
    # if the data is json, convert it to a list of dictionaries
    if isinstance(data, dict):
        data = list(data.values())
    results = []
    
    # Using ThreadPoolExecutor for parallel execution
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_desc = {executor.submit(description_classification, item["description"]): item for item in data}
        
        for future in concurrent.futures.as_completed(future_to_desc):
            item = future_to_desc[future]
            try:
                sentences = future.result()
                item["descriptive"] = sentences.descriptions  # Add the descriptions to the item
                item["inference"] = sentences.inferences  # Add the inferences
            except Exception as e:
                print(f"Error processing item {item}: {e}")
            
            results.append(item)
    return results


def break_down_all_atomic_facts(data):
    """
    @param data: a list of senteces
    @return: a list of atomic facts
    """
    atomic_facts = {} # a dictionary mapping sentence index to atomic facts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_sentence = {executor.submit(atomic_fact_generation, sentence, index): (sentence, index) for index, sentence in enumerate(data)}
        
        for future in concurrent.futures.as_completed(future_to_sentence):
            try:
                result = future.result()
                sentence_index = result["sentence_index"]
                atomic_facts[sentence_index] = result["atomic_facts"]
            except Exception as e:
                print(f"Error processing sentence: {e}")
    return atomic_facts
    
        

if __name__ == "__main__":
    # for each response, break it down into sentences
    with open("./data/map/descriptions_with_sentences.json", "r") as f:
        data = json.load(f)
    output = {}
    for item in data:
        output[item["id"]] = item
        output[item["id"]]["atomic_facts"] = break_down_all_atomic_facts(item["descriptive"])
    
    # save the result to a json file
    with open("./data/map/test.json", "w") as f:
        json.dump(output, f, indent=4)



