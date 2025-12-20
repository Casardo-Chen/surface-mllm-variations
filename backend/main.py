from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import base64
import json, re

from dotenv import load_dotenv
load_dotenv()

import requests
import os

import generation
import pipeline
import helper


app = Flask(__name__)
# CORS(app, resources={
#     r"/*": {
#         "origins": "http://localhost:5173",
#         "methods": ["POST", "OPTIONS"],
#         "allow_headers": ["Content-Type"]
#     }
# })

CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

# File paths macro
DATA_DIR = "data/"
USER_STUDY_DIR = "user_study/"

curr_data_name =[]

# create a directory specific for the user
@app.route('/create_user', methods=['POST',])
def create_directory():
    data = request.json
    try:
        user_id = data.get("userId")
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    user_dir = os.path.join(USER_STUDY_DIR, user_id)
    print(user_dir)
    if not os.path.exists(user_dir):
        os.makedirs(os.path.dirname(user_dir + "/"))

    else:
        return jsonify({"error": "Directory already exists"}), 400

    return jsonify({"message": "Directory created"}), 200

# get the descriptions.json file based on the image name
@app.route('/get_descriptions', methods=['POST'])
def get_descriptions():
    data = request.json
    try:
        image_name = data.get("imageName")
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
    descriptions_file_path = os.path.join(DATA_DIR, image_name, "descriptions.json")
    variation_file_path = os.path.join(DATA_DIR, image_name, "summary.json")
    metadata_file_path = os.path.join(DATA_DIR, image_name, "metadata.json")

    if not os.path.exists(descriptions_file_path) or not os.path.exists(variation_file_path) or not os.path.exists(metadata_file_path):
        return jsonify({"error": "Descriptions file not found"}), 404

    with open(descriptions_file_path, "r", encoding="utf-8") as f:
        descriptions = json.load(f)

    with open(variation_file_path, "r", encoding="utf-8") as f:
        variation = json.load(f)

    with open(metadata_file_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    
    return jsonify({"descriptions": descriptions, "variation": variation, "metadata": metadata}), 200


@app.route('/get_variation', methods=['POST',])
def get_variation():
    data = request.json
    try:
        image_name = data.get("imageName")
        mode = data.get("mode")
        print(image_name)
        print(mode)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

    data_path = os.path.join(DATA_DIR, image_name, "summary.json")

    if not os.path.exists(data_path):
        return jsonify({"error": "Variation file not found"}), 404

    with open(data_path, "r", encoding="utf-8") as f:
        aggregated_data = json.load(f)
    
    return aggregated_data, 200


@app.route('/generate', methods=['POST',])
def generate_descriptions():
    """
    API endpoint to generate descriptions from different models
    """
    data = request.json
    try:
        image = data.get("image")
        prompt = data.get("prompt")
        num_trials = int(data.get("numTrials"))
        models = data.get("selectedModels")
        variation_type = data.get("promptVariation")
        source = data.get("source")
        user_id = data.get("userId")
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

    folder_name = helper.uuid_gen()
    output_path = f"./user_study/{user_id}/{folder_name}"
    if not os.path.exists(os.path.dirname(output_path+"/")):
        os.makedirs(os.path.dirname(output_path + "/"))

    # save the metadata to the output path
    with open(f"{output_path}/metadata.json", "w") as f:
        json.dump(data, f, indent=4)


    descriptions = pipeline.variation_generation(image, num_trials, models, variation_type, prompt, output_path, source)

    variation_summary = pipeline.aggregated_description_generation(descriptions, output_path, num_trials, models)
    # NOTE: save the quota during trials
    # variation_summary = {}

  
    return jsonify({"descriptions": descriptions, "imageId": folder_name, "variationSummary": variation_summary}), 200


@app.route('/upload_image', methods=['POST'])
def upload_image():
    """
    API endpoint to upload an image to the server
    """
    data = request.json
    try:
        image = data.get("image")
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    base64_str = re.sub('^data:image/.+;base64,', '', image)
    
    # run a gemini model to generate the description
    description = generation.get_claude_description_base64(base64_str, "describe image")
    print(description)


    return jsonify({"description": description}), 200


if __name__ == '__main__':
    app.run(debug=True, port=8000)
