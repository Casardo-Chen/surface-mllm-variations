import gradio as gr
import requests
import json
import os
import base64
from typing import Dict, List, Tuple, Optional
import time
import logging
from config import *

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL), format=LOG_FORMAT)
logger = logging.getLogger(__name__)

class VisionLanguageVariationApp:
    def __init__(self):
        self.current_data = {}
        self.current_image_id = None
        self.current_image_url = None
        
    def generate_descriptions(self, 
                            image, 
                            prompt: str, 
                            num_trials: int, 
                            selected_models: List[str], 
                            prompt_variation: str,
                            user_id: str) -> Tuple[str, str, str, str, str, str, str, str]:
        """
        Generate image descriptions using the backend API
        """
        try:
            # Validate inputs
            if not image:
                return ("Error: Please provide an image",) * 8
            
            if not prompt.strip():
                prompt = "Describe the image in detail."
            
            if not selected_models:
                return ("Error: Please select at least one model",) * 8
            
            if not user_id.strip():
                user_id = "gradio_user"
            
            logger.info(f"Generating descriptions for user: {user_id}")
            
            # Prepare the request data
            data = {
                "image": image,
                "prompt": prompt,
                "numTrials": int(num_trials),
                "selectedModels": selected_models,
                "promptVariation": prompt_variation,
                "source": "url" if image.startswith("http") else "base64",
                "userId": user_id
            }
            
            # Make API call to backend with timeout
            logger.info("Sending request to backend...")
            response = requests.post(f"{BACKEND_URL}/generate", json=data, timeout=BACKEND_TIMEOUT)
            
            if response.status_code == 200:
                result = response.json()
                descriptions = result.get("descriptions", {})
                variation_summary = result.get("variationSummary", {})
                image_id = result.get("imageId", "")
                
                # Store current data
                self.current_data = descriptions
                self.current_image_id = image_id
                self.current_image_url = image
                
                logger.info("Successfully generated descriptions and analysis")
                
                # Format the output for display
                model_diff = variation_summary.get("model_diff", "No analysis available")
                var_only = variation_summary.get("var_only", "No analysis available")
                percentage = variation_summary.get("percentage", "No analysis available")
                nl = variation_summary.get("nl", "No analysis available")
                similarity = variation_summary.get("similarity", "No analysis available")
                uniqueness = variation_summary.get("uniqueness", "No analysis available")
                disagreement = variation_summary.get("disagreement", "No analysis available")
                
                # Format individual descriptions
                descriptions_text = self._format_descriptions(descriptions)
                
                return (model_diff, var_only, percentage, nl, similarity, 
                       uniqueness, disagreement, descriptions_text)
            else:
                error_msg = f"Backend Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                       error_msg, error_msg, error_msg)
                
        except requests.exceptions.ConnectionError:
            error_msg = ERROR_MESSAGES["backend_connection"]
            logger.error(error_msg)
            return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                   error_msg, error_msg, error_msg)
        except requests.exceptions.Timeout:
            error_msg = ERROR_MESSAGES["backend_timeout"]
            logger.error(error_msg)
            return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                   error_msg, error_msg, error_msg)
        except Exception as e:
            error_msg = f"Error generating descriptions: {str(e)}"
            logger.error(error_msg)
            return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                   error_msg, error_msg, error_msg)
    
    def _format_descriptions(self, descriptions: Dict) -> str:
        """Format individual model descriptions for display"""
        if not descriptions:
            return "No descriptions available"
        
        formatted = []
        for key, desc in descriptions.items():
            if key == "prompt":
                continue
            model = desc.get("model", "Unknown")
            description = desc.get("description", "No description")
            formatted.append(f"**{model.upper()} (Trial {desc.get('id', '?')}):**\n{description}\n")
        
        return "\n".join(formatted)
    
    def load_existing_data(self, image_name: str) -> Tuple[str, str, str, str, str, str, str, str]:
        """Load existing data from backend"""
        try:
            data = {"imageName": image_name}
            response = requests.post(f"{BACKEND_URL}/get_descriptions", json=data)
            
            if response.status_code == 200:
                result = response.json()
                descriptions = result.get("descriptions", {})
                variation = result.get("variation", {})
                metadata = result.get("metadata", {})
                
                # Store current data
                self.current_data = descriptions
                self.current_image_url = metadata.get("image", "")
                
                # Format outputs
                model_diff = variation.get("model_diff", "No analysis available")
                var_only = variation.get("var_only", "No analysis available")
                percentage = variation.get("percentage", "No analysis available")
                nl = variation.get("nl", "No analysis available")
                similarity = variation.get("similarity", "No analysis available")
                uniqueness = variation.get("uniqueness", "No analysis available")
                disagreement = variation.get("disagreement", "No analysis available")
                
                descriptions_text = self._format_descriptions(descriptions)
                
                return (model_diff, var_only, percentage, nl, similarity, 
                       uniqueness, disagreement, descriptions_text)
            else:
                error_msg = f"Error loading data: {response.status_code}"
                return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                       error_msg, error_msg, error_msg)
                
        except Exception as e:
            error_msg = f"Error loading data: {str(e)}"
            return (error_msg, error_msg, error_msg, error_msg, error_msg, 
                   error_msg, error_msg, error_msg)
    
    def get_available_datasets(self) -> List[str]:
        """Get list of available datasets from backend"""
        try:
            # This would need to be implemented in the backend
            # For now, return hardcoded list based on the data directory
            data_dir = "../backend/data"
            if os.path.exists(data_dir):
                return [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
            return []
        except:
            return []

def create_interface():
    app = VisionLanguageVariationApp()
    
    # Get theme
    theme = getattr(gr.themes, THEME.title())() if hasattr(gr.themes, THEME.title()) else gr.themes.Soft()
    
    with gr.Blocks(title="Vision-Language Model Variation Analysis", theme=theme) as demo:
        with gr.Row():
            with gr.Column(scale=3):
                gr.Markdown("# MLLM-generated Image Descriptions Variations")
                gr.Markdown("Compare image descriptions across vision-language models")
            with gr.Column(scale=3):
                paper_btn = gr.Button("📄 View Paper", variant="secondary", size="sm")
        
        # Paper button click handler
        paper_btn.click(
            fn=lambda: None,
            inputs=[],
            outputs=[],
            js="() => { window.open('https://arxiv.org/abs/2507.15692', '_blank'); }"
        )
        
        with gr.Tab("Generate New Analysis"):
            with gr.Row():
                with gr.Column(scale=1):
                    # Input controls
                    gr.Markdown("## Input Configuration")
                    
                    image_input = gr.Image(
                        type="filepath",
                        height=300
                    )
                    
                    prompt_input = gr.Textbox(
                        label="Prompt",
                        placeholder=DEFAULT_PROMPT,
                        value=DEFAULT_PROMPT,
                        lines=3
                    )
                    
                    num_trials = gr.Slider(
                        minimum=1,
                        maximum=10,
                        value=DEFAULT_NUM_TRIALS,
                        step=1,
                        label="Number of Trials"
                    )
                    
                    selected_models = gr.CheckboxGroup(
                        choices=[model[1] for model in AVAILABLE_MODELS],
                        value=DEFAULT_MODELS,
                        label="Select Models"
                    )
                    
                    prompt_variation = gr.Radio(
                        choices=[var[1] for var in PROMPT_VARIATIONS],
                        value=DEFAULT_PROMPT_VARIATION,
                        label="Prompt Variation"
                    )
                    
                    user_id = gr.Textbox(
                        label="User ID",
                        value=DEFAULT_USER_ID,
                        placeholder="Enter your user ID"
                    )
                    
                    generate_btn = gr.Button("Generate Descriptions", variant="primary")
                    clear_btn = gr.Button("Clear", variant="secondary")
                
                with gr.Column(scale=2):
                    # Results display
                    gr.Markdown("## Analysis Results")
                    
                    with gr.Tabs():
                        with gr.Tab("Model Differences"):
                            model_diff_output = gr.Markdown(label="Model Differences Analysis")
                        
                        with gr.Tab("Variation Only"):
                            var_only_output = gr.Markdown(label="Variation-Only Analysis")
                        
                        with gr.Tab("Percentage Analysis"):
                            percentage_output = gr.Markdown(label="Percentage-Based Analysis")
                        
                        with gr.Tab("Natural Language"):
                            nl_output = gr.Markdown(label="Natural Language Analysis")
                        
                        with gr.Tab("Similarity"):
                            similarity_output = gr.Markdown(label="Similarity Analysis")
                        
                        with gr.Tab("Uniqueness"):
                            uniqueness_output = gr.Markdown(label="Uniqueness Analysis")
                        
                        with gr.Tab("Disagreement"):
                            disagreement_output = gr.Markdown(label="Disagreement Analysis")
                        
                        with gr.Tab("Individual Descriptions"):
                            descriptions_output = gr.Markdown(label="Individual Model Descriptions")
        
        with gr.Tab("Examples"):
            gr.Markdown("## Load Previously Generated Analysis")
            
            with gr.Row():
                with gr.Column():
                    dataset_dropdown = gr.Dropdown(
                        choices=app.get_available_datasets(),
                        label="Select Dataset",
                        interactive=True
                    )
                    load_btn = gr.Button("Load Analysis", variant="primary")
                
                with gr.Column():
                    gr.Markdown("### Loaded Analysis")
                    with gr.Tabs():
                        with gr.Tab("Model Differences"):
                            loaded_model_diff = gr.Markdown(label="Model Differences Analysis")
                        
                        with gr.Tab("Variation Only"):
                            loaded_var_only = gr.Markdown(label="Variation-Only Analysis")
                        
                        with gr.Tab("Percentage Analysis"):
                            loaded_percentage = gr.Markdown(label="Percentage-Based Analysis")
                        
                        with gr.Tab("Natural Language"):
                            loaded_nl = gr.Markdown(label="Natural Language Analysis")
                        
                        with gr.Tab("Similarity"):
                            loaded_similarity = gr.Markdown(label="Similarity Analysis")
                        
                        with gr.Tab("Uniqueness"):
                            loaded_uniqueness = gr.Markdown(label="Uniqueness Analysis")
                        
                        with gr.Tab("Disagreement"):
                            loaded_disagreement = gr.Markdown(label="Disagreement Analysis")
                        
                        with gr.Tab("Individual Descriptions"):
                            loaded_descriptions = gr.Markdown(label="Individual Model Descriptions")
        
        # Event handlers
        generate_btn.click(
            fn=app.generate_descriptions,
            inputs=[image_input, prompt_input, num_trials, selected_models, prompt_variation, user_id],
            outputs=[model_diff_output, var_only_output, percentage_output, nl_output, 
                    similarity_output, uniqueness_output, disagreement_output, descriptions_output]
        )
        
        load_btn.click(
            fn=app.load_existing_data,
            inputs=[dataset_dropdown],
            outputs=[loaded_model_diff, loaded_var_only, loaded_percentage, loaded_nl,
                    loaded_similarity, loaded_uniqueness, loaded_disagreement, loaded_descriptions]
        )
        
        clear_btn.click(
            fn=lambda: (None, DEFAULT_PROMPT, DEFAULT_NUM_TRIALS, DEFAULT_MODELS, DEFAULT_PROMPT_VARIATION, DEFAULT_USER_ID,
                       "", "", "", "", "", "", "", ""),
            outputs=[image_input, prompt_input, num_trials, selected_models, prompt_variation, user_id,
                    model_diff_output, var_only_output, percentage_output, nl_output,
                    similarity_output, uniqueness_output, disagreement_output, descriptions_output]
        )
    
    return demo

if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        server_name=GRADIO_SERVER_NAME,
        server_port=GRADIO_SERVER_PORT,
        share=GRADIO_SHARE,
        debug=GRADIO_DEBUG
    )
