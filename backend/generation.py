# generative AI
from google import genai
from google.genai import types
from openai import OpenAI
from anthropic import Anthropic
import prompts
import time

import extraction

# sys
import requests
import os
import re
from concurrent.futures import ThreadPoolExecutor
import json
# environment
from dotenv import load_dotenv
load_dotenv()

def get_gemini_description(image_content, prompt):
    """
    Args:
        image_url (str): The URL of the image
        prompt (str): The prompt to generate a description
    Returns:
        str: The description of the image
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-1.5-pro",
        contents=[
            prompt,
            types.Part.from_bytes(data=image_content, mime_type="image/jpeg")
        ],
    )
    return response.text.strip()

def get_gpt_description(image_url, prompt):
    """
    Args:
        image_url (str): The URL of the image
        prompt (str): The prompt to generate a description
    Returns:
        str: The description of the image
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that describes images for blind and low vision"
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        },
                    },
                ],
            }
        ],
    )
    return response.choices[0].message.content

def get_claude_description(image_url, prompt):
    """
    Args:
        image_url (str): The URL of the image
        prompt (str): The prompt to generate a description
    Returns:
        str: The description of the image
    """
    client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "url",
                            "url": image_url
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ],
            }
        ],
    )
    return response.content[0].text

def get_claude_description_base64(base64_image, prompt):
    """
    Args:
        base64_image (str): The base64 encoded image
        prompt (str): The prompt to generate a description
    Returns:
        str: The description of the image
    """
    client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": base64_image
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ],
            }
        ],
    )
    return response.content[0].text

def prompt_paraphrase(prompt, n=2):
    """
    Paraphrase a given prompt to n-1 different prompts
    Args:
        prompt (str): The input prompt to paraphrase
        n (int): The number of paraphrases to generate
    Returns:
        list: A list of n paraphrased
    """
    n = max(1, n)
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = f'''Paraphrase {n} version of the following prompt: {prompt} \n\n
    Please return in following json format: 
    {{
        "1": "paraphrase prompt 1",
        "2": "paraphrase prompt 2",
        ...
    }}
    '''
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        response_format={"type": "json_object"}        
    )
    # change the response to json then get the value as a list
    prompts = json.loads(response.choices[0].message.content).values()
    # change to list 
    return list(prompts)


def get_all_descriptions(image, prompt, num_descriptions=3, models=["gemini", "gpt", "claude"], variation_type="original", source="url"):
    """
    Args:
        image (str): The URL of the image or the base64 encoded image
        prompt (str): The prompt to generate a description
        num_descriptions (int): The number of descriptions to generate for each model
    Returns:
        dict: A dictionary containing the descriptions generated by each model
            {
            "1": {
                "id": "gemini",
                "description": "description of the image"
            },
            "2": {
                "id": "gpt",
                "description": "description of the image"
            },
            ...
    """

    descriptions = {}

    # decide if need to modify the prompt
    prompts = [prompt] * num_descriptions
    print(len(prompts))
    if variation_type == "paraphrased":
        paraphrased = prompt_paraphrase(prompt, max(1, num_descriptions-1))
        prompts = [prompt] + paraphrased
    elif variation_type == "various": # user self defined prompt/ diff perspective TODO: need to think more about what exactly this means
        prompts = [prompt] * num_descriptions

    
    def fetch_description(p, func, *args):
        try:
            return func(*args), p
        except Exception as e:
            return f"Error: {str(e)}"
    
    tasks = []
    if source == "url":
        image_content = requests.get(image).content
        with ThreadPoolExecutor() as executor:
            # for all the prompt in the list, generate the description
            for i, p in enumerate(prompts, 1):
                # for each model, generate the description
                for m in models:
                    if m == "gemini":
                        tasks.append(executor.submit(fetch_description, p, get_gemini_description, image_content, p))
                    elif m == "gpt":
                        tasks.append(executor.submit(fetch_description, p, get_gpt_description, image, p))
                    elif m == "claude":
                        tasks.append(executor.submit(fetch_description, p, get_claude_description, image, p))
            for i, future in enumerate(tasks, 1):
                m = models[(i-1) % len(models)]
                
                descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0], "prompt": future.result()[1]}
                # descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0],}

            return descriptions
    else:
        base64_str = re.sub('^data:image/.+;base64,', '', image)
        # also get the media type of the image
        media_type = re.search(r'^data:image/(.+);base64,', image).group(1)
        print(media_type) 
        with ThreadPoolExecutor() as executor:
            # for all the prompt in the list, generate the description
            for i, p in enumerate(prompts, 1):
                # for each model, generate the description
                for m in models:
                    if m == "gemini":
                        tasks.append(executor.submit(fetch_description, p, get_gemini_description, base64_str, p))
                    elif m == "gpt":
                        tasks.append(executor.submit(fetch_description, p, get_gpt_description, image, p))
                    elif m == "claude":
                        tasks.append(executor.submit(fetch_description, p, get_claude_description_base64, base64_str, p))
            for i, future in enumerate(tasks, 1):
                m = models[(i-1) % len(models)]
                
                descriptions[int(i)] = {"id": i, "model": m, "description": future.result()[0], "prompt": future.result()[1]}
            return descriptions


if __name__ == "__main__":
    # image_path = "https://a0.muscache.com/im/pictures/prohost-api/Hosting-1138706281079728392/original/8380acf3-3d82-4415-ac1e-91d81802fbe6.jpeg?im_w=720&im_format=avif"
    # image = requests.get(image_path)


    # res = get_all_descriptions(image_path, "Describe the image in detail", 3, variation_type="paraphrased")

    # #save the result to a json file
    # with open("./test.json", "w") as f:
    #     json.dump(res, f, indent=4)
    


    test_data = '''
    [
{
"response_id": "5",
"description": "The image is a map of Europe with annotations indicating the number of Americans who reported having ancestry from each European country, based on the 2019 American Community Survey. Each country on the map is labeled with a number representing the ancestry count. Some notable data points include:\n\n- Germany: 45,000,000\n- Ireland: 34,000,000\n- United Kingdom: 8,000,000\n- Italy: 18,000,000\n- Poland: 9,000,000\n- Sweden: 3,800,000\n- Russia: 2,000,000\n\nThe numbers are positioned on top of each country, and the map uses different colors to represent each nation. The source is cited as the 2019 American Community Survey. The map is credited to freeworldmaps.net.",
"model": "gpt"
},
{
"response_id": "8",
"description": "The image is a map of Europe showing the number of U.S. Americans with ancestry from each European country. The numbers are overlaid on each country, indicating the population in the U.S. that reports ancestry from that country based on the 2019 American Community Survey.\n\nKey details include:\n\n- The largest numbers are from Germany (45,000,000), Ireland (34,000,000), and the United Kingdom (32,000,000).\n- Other significant numbers include Italy (17,000,000), Poland (9,000,000), and France (8,000,000).\n- Scandinavian countries have smaller numbers, such as Sweden (3,800,000) and Norway (4,600,000).\n- Eastern European countries like Russia have numbers such as 2,000,000, while Ukraine has 961,000.\n- The smallest reported numbers are shown in smaller countries like Liechtenstein (65,000) and Luxembourg (62,000).\n\nThe map\u2019s source is labeled as the 2019 American Community Survey and the website "freeworldmaps.net." The countries are color-coded in different shades with numbers prominently displayed.",
"model": "gpt"
},
{
"response_id": "1",
"description": "The image is a map of Europe, color-coded by country, with numbers overlaid indicating the estimated number of US Americans with ancestry from each European country. The title at the top left states: "Number of US Americans with Ancestry from every European country".  A source is provided at the bottom left, citing self-reported data from the 2019 American Community Survey.  The website "www.freeworldmaps.net" is displayed across the bottom of the map.\n\nCountries are shaded with different colors, likely grouped by region or ancestry prevalence.  Shades of red and pink dominate Northern and Eastern Europe, with yellows and creams prevalent in Western and Southern Europe.  The numbers displayed on each country represent the population of US Americans claiming ancestry from that specific country.  The numbers vary significantly, ranging from 11,000 (likely Cyprus) to 54,000,000 for both England and the United Kingdom as a whole (likely due to overlapping ancestry). Other high numbers include Germany (45,000,000) and Ireland (34,000,000).  Smaller island nations like Iceland have much lower numbers (54,000).  The map provides a visual representation of the distribution of European ancestry within the US population.",
"model": "gemini"
},
{
"response_id": "7",
"description": "The image is a map of Europe, color-coded by country, with text overlaid showing the estimated number of US Americans with ancestry from each country.  The title at the top left reads "Number of US Americans with Ancestry from every European country".  A source is provided at the bottom left, citing "Self-reported, 2019, American Community Survey" and the website "www.freeworldmaps.net".\n\nThe countries are shaded in varying colors, generally grouped by region.  Scandinavia is largely red/pink, while the British Isles are a teal/green.  Western Europe is a light tan/yellow.  Eastern European countries are primarily a pale yellow. Southern European countries, including Italy and Greece, range from darker orange to a light green.\n\nEach country has a number overlaid on it, representing the population of US Americans claiming ancestry from that nation. These numbers range from tens of thousands (e.g., Iceland at 54,000) to tens of millions (e.g., Germany at 45,000,000). The countries with the largest numbers appear to be Germany, England (54,000,000), and Ireland (34,000,000).  Russia is represented with the highest number (2,000,000), but it should be noted that the map only shows the European portion.\n\nThe map's detail is not high-resolution; borders are simplified, and smaller islands or territories may not be fully represented.  The color scheme, while providing visual grouping, doesn't seem to follow any particular gradient or logical order.  The numbers are clearly visible and bold, dominating the visual presentation.",
"model": "gemini"
},
{
"response_id": "6",
"description": "The image shows a map of Europe with color-coded countries displaying statistics about the number of US Americans who claim ancestry from each European country, according to self-reported data from the 2019 American Community Survey.\n\nThe countries are colored in either light yellow or pink/red, with numerical figures overlaid on each country. Some key figures shown include:\n\n- Germany: 45,000,000\n- United Kingdom: 34,000,000\n- Ireland: 54,000,000\n- Italy: 16,000,000\n- France: 8,000,000\n- Poland: 9,000,000\n- Sweden: 3,400,000\n- Norway: 3,800,000\n- Greece: 1,200,000\n- Spain: 1,300,000\n\nThe title of the map reads "Number of US Americans with Ancestry from every European country" and notes that the source is "Self-reported, 2019, American Community Survey." The map illustrates the significant European heritage of the American population, with particularly strong connections to Germany, the United Kingdom, and Ireland. The watermark "www.freeworldmaps.net" appears at the bottom of the image.",
"model": "claude"
},
{
"response_id": "2",
"description": "The image is a map of Europe highlighting the number of U.S. Americans with ancestry from each European country. The map is color-coded with numbers overlaid on each country indicating the estimated population of Americans with ancestry from that region. It is based on self-reported data from the 2019 American Community Survey and includes the following details for various countries:\n\n- United Kingdom: 9,000,000\n- Ireland: 39,000,000\n- Germany: 45,000,000\n- Italy: 16,000,000\n- Poland: 9,000,000\n- France: 8,000,000\n- Norway: 4,500,000\n- Sweden: 3,800,000\n- Russia: 2,000,000\n- Spain: 3,100,000\n- Greece: 1,200,000\n\nSmaller populations are noted for other countries, such as Iceland with 54,000 and Portugal with 1,300,000. \n\nThe map has a source notation for "Self-reported, 2019, American Community Survey" and includes a watermark from "www.freeworldmaps.net."",
"model": "gpt"
},
{
"response_id": "3",
"description": "The image shows a map of Europe displaying the number of US Americans who claim ancestry from each European country, according to self-reported data from the 2019 American Community Survey.\n\nThe countries are color-coded (in pink/red and yellow/light green) with population figures overlaid on each nation. Some notable numbers include:\n\n- Germany: 45,000,000 (the highest number)\n- United Kingdom/Great Britain: 34,000,000\n- Ireland: 54,000,000\n- Italy: 16,000,000\n- Poland: 9,000,000\n- France: 8,000,000\n- Sweden: 3,400,000\n- Norway: 3,800,000\n\nThe map illustrates the significant European heritage of the US population, with particularly strong connections to Germany, Ireland, and the UK. Smaller countries generally show lower numbers, with countries in Eastern and Southern Europe typically showing fewer American descendants than those in Western and Northern Europe.\n\nThe source cited at the bottom of the image is "Self-reported, 2019, American Community Survey," and the map appears to be from freeworldmaps.net.",
"model": "claude"
},
{
"response_id": "4",
"description": "The image is a map of Europe, color-coded by country, with text overlaid indicating the estimated number of US Americans with ancestry from each country. The title at the top left reads "Number of US Americans with Ancestry from every European country."  A source is cited in the lower left: "Self-reported, 2019, American Community Survey."  The website "www.freeworldmaps.net" is displayed across the bottom of the map.\n\nEach country is shaded with a color, seemingly correlating with the population size of the reported ancestry group: darker red for larger numbers and lighter yellows for smaller numbers.  The numbers themselves are written in black, prominently displayed within each country's borders.  For example, Germany is a darker red with "45,000,000", while Iceland is a light yellow with "54,000". Some smaller countries have smaller, less prominent numbers, likely reflecting smaller sample sizes.  Russia is included but only its European portion is colored and labeled "2,000,000".  Island nations like Iceland, the United Kingdom, and Cyprus are also included and labeled.  The map appears to use a simplified political map as a base, omitting many small islands and focusing on national borders.",
"model": "gemini"
},
{
"response_id": "9",
"description": "The image shows a map of Europe displaying the number of US Americans who claim ancestry from each European country, according to self-reported data from the 2019 American Community Survey.\n\nThe map uses a color-coding system with countries in either light yellow or pink/red, with numerical figures superimposed on each country. Some of the notable figures include:\n\n- Germany: 45,000,000 Americans claiming German ancestry\n- United Kingdom: 34,000,000\n- Ireland: 54,000,000\n- Italy: 16,000,000\n- France: 8,000,000\n- Poland: 9,000,000\n- Sweden: 3,400,000\n- Norway: 3,800,000\n- Russia/Eastern Europe: 2,000,000\n- Spain: 1,300,000\n- Greece: 1,200,000\n\nIceland shows 54,000 Americans claiming ancestry, while smaller countries have correspondingly smaller numbers. The title of the map reads "Number of US Americans with Ancestry from every European country" and cites its source as "Self-reported, 2019, American Community Survey." The map appears to be from a website called "freeworldmaps.net" as indicated by a watermark at the bottom.\n\nThis visualization demonstrates the diverse European heritage of the American population and reflects historical immigration patterns to the United States over centuries.",
"model": "claude"
}
]'''
    start_time = time.time()
    # test_res = gemini_thinking(test_data)
    test_res = extraction.generate_summary(test_data)

    print("--- %s seconds ---" % (time.time() - start_time))

    print(test_res)

