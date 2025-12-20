from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from dotenv import load_dotenv
load_dotenv()

import pipeline


app = Flask(__name__)
# CORS(app, resources={
#     r"/*": {
#         "origins": "http://surface-uncertainty.netlify.app",
#         "methods": ["POST", "OPTIONS"],
#         "allow_headers": ["Content-Type"]
#     }
# })

CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

# File paths macro
# DATA_DIR = "data/"
# USER_STUDY_DIR = "user_study/"

curr_data_name =[]

# create a directory specific for the user
# @app.route('/create_user', methods=['POST',])
# def create_directory():
    # data = request.json
    # try:
    #     user_id = data.get("userId")
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 400
    
    # user_dir = os.path.join(USER_STUDY_DIR, user_id)
    # print(user_dir)
    # # if not os.path.exists(user_dir):
    # #     os.makedirs(os.path.dirname(user_dir + "/"))

    # # else:
    # #     return jsonify({"error": "Directory already exists"}), 400

    # return jsonify({"message": "Directory created"}), 200

@app.route('/generate', methods=['POST',])
def generate_descriptions():
    """
    API endpoint to generate descriptions from different models
    Note: API keys are accepted from the request but are never logged or stored.
    They are only used for the API calls and then discarded.
    """
    data = request.json
    try:
        image = data.get("image")
        prompt = data.get("prompt")
        num_trials = int(data.get("numTrials"))
        models = data.get("selectedModels")
        variation_type = data.get("promptVariation")
        source = data.get("source")
        # user_id = data.get("userId")
        
        # Get API keys from request (user-provided keys)
        # These are optional - if not provided, backend will use env vars
        api_keys = {
            "openai": data.get("openaiKey"),
            "gemini": data.get("geminiKey"),
            "claude": data.get("claudeKey")
        }
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

    # folder_name = helper.uuid_gen()
    # output_path = f"./user_study/{user_id}/{folder_name}"
    # if not os.path.exists(os.path.dirname(output_path+"/")):
    #     os.makedirs(os.path.dirname(output_path + "/"))

    # save the metadata to the output path (but exclude API keys for security)
    # metadata_safe = {k: v for k, v in data.items() if not k.endswith("Key")}
    # with open(f"{output_path}/metadata.json", "w") as f:
    #     json.dump(metadata_safe, f, indent=4)


    descriptions = pipeline.variation_generation(
        image, num_trials, models, variation_type, prompt, output_path=None, source=source, api_keys=api_keys
    )

    variation_summary = pipeline.aggregated_description_generation(
        descriptions, None, num_trials, models, api_keys
    )
    # NOTE: save the quota during trials
    # variation_summary = {}
  
    # folder_name = helper.uuid_gen()  # Commented out since file storage is disabled
    return jsonify({"descriptions": descriptions, "imageId": None, "variationSummary": variation_summary}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000)
