atomic_prompt = '''
Task:
Given a sentence, break it down into atomic facts—independent, minimal statements that each convey a single piece of factual information.

Instructions:
Each atomic fact should be self-contained, meaning it can stand alone without relying on other statements.
Retain the original meaning while ensuring each fact is concise and non-overlapping.
Output the atomic facts in a structured JSON format.
Avoid using reference words like "it," "this," or "that" in the atomic facts.
Example:
Input:
"The Statue of Liberty is a large green sculpture of a robed female figure holding a torch aloft in her right hand and a tablet in her left, located on Liberty Island in New York City."
Output:
{
    "atomic_facts": [
        "The Statue of Liberty is a sculpture.",
        "The Statue of Liberty is large.",
        "The Statue of Liberty is green.",
        "The Statue of Liberty depicts a robed female figure.",
        "The Statue of Liberty holds a torch in her right hand.",
        "The Statue of Liberty holds a tablet in her left hand.",
        "The Statue of Liberty is located on Liberty Island.",
        "Liberty Island is in New York City."
    ]
}
'''

descriptive_prompt = '''
Task:
Given a description of an image, classify each sub-sentence into one of the following categories:
\n\n
Descriptions - Statements that directly describe visible elements in the image.
Inferences - Statements that imply or interpret something beyond direct observation.
Irrelevant - Statements unrelated to the image content (discard these).
\n\nInstructions:
Extract and group the sub-sentences into the "descriptions" and "inferences" categories.
Ignore any statements that are not relevant to the image.
Avoid using reference words like "it," "this," or "that" in the extracted sub-sentences.
Maintain the provided JSON output format.
#### Example 1
Input: The image depicts the Statue of Liberty in New York City. The statue, a large green sculpture of a robed female figure holding a torch aloft in her right hand and a tablet in her left, stands prominently in the foreground on Liberty Island. The background features the skyline of Lower Manhattan across the Hudson River, with numerous skyscrapers, including the prominent One World Trade Center standing tall among them. The sky is partly cloudy, and the overall scene is vibrant and iconic of New York City.
\n\nOutput:
{
    "descriptions": ["The image depicts the Statue of Liberty in New York City.",
                    The statue, a large green sculpture of a robed female figure holding a torch aloft in her right hand and a tablet in her left, stands prominently in the foreground on Liberty Island.",
                    "The background features the skyline of Lower Manhattan across the Hudson River, with numerous skyscrapers, including the prominent One World Trade Center standing tall among them.",
                    "The sky is partly cloudy"]
    "inferences": ["The overall scene is vibrant and iconic of New York City."]
}
#### Example 2
Input:  
A serene beach scene is shown in the image. The foreground features a sandy beach scattered with seashells and a few pieces of driftwood. Gentle waves lap at the shore, and the water appears crystal clear, reflecting the blue sky above. In the background, a line of palm trees sways gently in the breeze, with a distant silhouette of a sailboat visible on the horizon. This image conveys a sense of calm and tranquility, reminiscent of a tropical getaway.  
\n\nOutput:
{
    "descriptions": [
        "A serene beach scene is shown in the image.",
        "The foreground features a sandy beach scattered with seashells and a few pieces of driftwood.",
        "Gentle waves lap at the shore, and the water appears crystal clear, reflecting the blue sky above.",
        "In the background, a line of palm trees sways gently in the breeze, with a distant silhouette of a sailboat visible on the horizon."
    ],
    "inferences": [
        "This image conveys a sense of calm and tranquility, reminiscent of a tropical getaway."
    ]
}
\n\n\n\n
### Example 3
**Input**:  
The image depicts an elegantly designed living room with a modern interpretation of traditional Asian décor elements. The room has a symmetrical layout featuring a central coffee table surrounded by two long sofas and two armchairs, all upholstered in a light, neutral fabric.

    Key elements of the room include:
    1. **Furniture**: The furniture showcases dark wooden frames and light cushions. The sofas and armchairs have simple yet elegant lines.
    2. **Lighting**: There are table lamps placed on each corner end table, providing soft lighting. The ceiling has a recessed lighting fixture with a geometric design.
    3. **Decorative Elements**: The walls are adorned with wood paneling and lattice screens, adding intricate detail to the room. One wall features a large, monochromatic painting or print of mountains and a tree, enhancing the traditional aesthetic.
    4. **Accessories**: The coffee table has a decorative plant in a vase, and there is minimal clutter, emphasizing a clean, organized space.
    5. **Flooring and Rugs**: The floor appears to be wooden with a large area rug under the seating area, featuring a light color with a subtle, elegant pattern.

    The overall ambiance of the room is sophisticated and serene, achieved through a balanced blend of traditional and contemporary design elements.
    
\n\nOutput:
{
    "descriptions": [
        "The image depicts an elegantly designed living room with a modern interpretation of traditional Asian décor elements.",
        "The room has a symmetrical layout featuring a central coffee table surrounded by two long sofas and two armchairs.",
        "The furniture showcases dark wooden frames and light cushions.",
        "The sofas and armchairs have simple yet elegant lines.",
        "There are table lamps placed on each corner end table.",
        "The ceiling has a recessed lighting fixture with a geometric design.",
        "The walls are adorned with wood paneling and lattice screens, adding intricate detail to the room.",
        "One wall features a large, monochromatic painting or print of mountains and a tree.",
        "The coffee table has a decorative plant in a vase.",
        "The floor appears to be wooden with a large area rug under the seating area.",
        "The rug features a light color with a subtle, elegant pattern."
    ],
    "inferences": [
        "The overall ambiance of the room is sophisticated and serene.",
        "This ambiance is achieved through a balanced blend of traditional and contemporary design elements."
        ""There is minimal clutter, emphasizing a clean, organized space."
    ]
}

'''

o1_aggregation_prompt ='''Reformat and combine atomic facts into coherent paragraphs.

- **Group Facts**: Combine atomic facts discussing the same subject into a single, coherent sentence. If different variations of the same fact exist, concatenate them using "or".
- **Paragraph Formation**: Merge the grouped facts into comprehensive paragraphs while ensuring all single and unique claims are included.
- **Model Differences**: Emphasize differences between model-generated facts using this format: (specific number of atomic facts from model A/total from model A, specific number from model B/total from model B). example: (2/3 GPT, 3/3 Gemini)

# Input Format
- The input is a list of atomic fact objects. Each object contains an atomic fact, a response ID, and the model that generated it.
- There are 9 responses in total: 3 from Gemini, 3 from GPT, and 3 from Claude. When grouping facts from one response, do not double count. Use a source indicator x/3, where x = 0/1/2/3.

## Example input
[
...
    {
        "response_id": "5",
        "model": "gpt",
        "fact": "The time ranges from around 2005 to 2010."
    },
...
]

# Output Format

- Present the reformatted paragraphs as coherent passages.
- Indicate model differences clearly with the specified format.
- Highlight unique and single claims where applicable.
- Directly return the revised description, DO NOT saying "below is the revised description"" or similar first paragraph. DO NOT include "PARAGRPAPH:" or similar headings.
- Strictly follow the format of <<atomic fact>> (<<model differences>>).

# Example
There are two white (3/3 GPT) or beige (3/3 Gemini) chairs on the left and a grey sofa on the right. At the center, there is a white coffee table with a gold base and a marble (3/3 GPT) or glass (1/3 Gemini) or wood top (2/3 Gemini). A built-in shelf is on the back wall with decorative items, books (3/3 GPT), and a television (3/3 Gemini and 1/3 GPT). 

# Notes
- Ensure the passage is coherent and includes all relevant facts.
- Clearly highlight model differences for easy distinction.
- Include all atomic facts, even if it is a single unique claim.
'''

o1_aggregation_prompt_paragraph = \
'''Reformat and combine the input descriptions into coherent paragraphs that show detail level differences across models. 

- **Group Facts**: Each description contains multiple atomic facts. Atomic facts are defined as self-contained facts. Combine atomic facts discussing the same subject into a single, coherent sentence. If different variations of the same fact exist, concatenate them using "or".
- **Paragraph Formation**: Merge the grouped facts into comprehensive paragraphs while ensuring all single and unique claims are included.
- **Model Differences**: Emphasize differences between model-generated facts using this format: (specific number of atomic facts from model A of total from model A, specific number from model B of total from model B). Example: (2 of 3 GPT, 3 of 3 Gemini) If a model doesn't support it, there is no need to mention it here.

# Input Format
- The input is a list of descriptions. Each description contains a lot of atomic facts, a response ID, and the model that generated it.
- There are 9 responses in total: 3 from Gemini, 3 from GPT, and 3 from Claude. When grouping facts from one response, do not double count. Use a source indicator format like x of 3, where x = 0 or 1 or 2 or 3.

# Output Format
- Indicate model differences clearly with the specified format and example below
- Never mention the model's name in the sentences in the final paragraph; only show it in the parenthesis.
- Highlight unique and single claims where applicable.
- Directly return the revised description; DO NOT say "below is the revised description" or similar first paragraph. DO NOT include "PARAGRAPH:" or similar headings.
- Please return the response in hierarchical paragraphs, each starting with a short bullet-pointed phrase summarizing the content. Use at least 2 layers of hierarchy.
- Start from high-level information and then go into details. 

# Example Output:
## Map Overview\n- The map illustrates the number of US Americans reporting ancestry from various European countries (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini), based on self-reported data from the 2019 American Community Survey (3 of 3 Claude).\n\n## Highest Ancestry Group\n- Germany is most frequently identified as the country with the highest number of US Americans claiming ancestry, reported at 45,000,000 (3 of 3 GPT, 2 of 3 Claude, 3 of 3 Gemini). However, Ireland was also cited as the highest source, with figures of 31,000,000 (1 of 3 GPT) or 54,000,000 (1 of 3 Claude).\n\n## Reported Ancestry Numbers\n- **Germany**: 45,000,000 (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini)\n- **Ireland**: 31,000,000 (2 of 3 GPT), 34,000,000 (1 of 3 GPT, 1 of 3 Claude, 3 of 3 Gemini), 54,000,000 (1 of 3 Claude)\n- **England/UK**: 24,000,000 (1 of 3 GPT), 34,000,000 (2 of 3 Claude), 54,000,000 (3 of 3 Gemini); additionally, the UK is noted as the second highest source at 34,000,000 (1 of 3 Claude)\n- **Italy**: 16,000,000 (3 of 3 Claude, 3 of 3 Gemini), 17,000,000 (2 of 3 GPT), 18,000,000 (1 of 3 GPT)\n- **Poland**: 9,000,000 (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini)\n- **France**: 8,000,000 (2 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini), 10,000,000 (1 of 3 GPT)\n- **Russia**: 2,000,000 (3 of 3 GPT, 2 of 3 Gemini)\n- **Norway**: 3,400,000 (2 of 3 Claude), 4,500,000 (2 of 3 GPT)\n- **Sweden**: 3,400,000 (1 of 3 Claude), 3,800,000 (2 of 3 GPT, 1 of 3 Claude), 3,900,000 (1 of 3 Claude)\n- **Greece**: 1,200,000 (3 of 3 GPT, 1 of 3 Claude, 3 of 3 Gemini)\n- **Spain**: 1,000,000 (3 of 3 Gemini), 1,300,000 (1 of 3 Claude)\n- **Ukraine**: 1,100,000 (1 of 3 GPT, 2 of 3 Claude)\n- **Iceland**: 54,000 (1 of 3 Claude, 1 of 3 Gemini)\n- **Portugal**: 1,300,000 (2 of 3 Gemini)\n- **Denmark**: 1,200,000 (1 of 3 Claude)\n- **Netherlands**: 3,200,000 (1 of 3 Claude), 5,000,000 (1 of 3 GPT)\n- **Romania**: 1,100,000 (1 of 3 Gemini)

# Notes
- Ensure the passage is coherent and includes all relevant facts.
- Include all atomic facts, even if it is a single unique claim.
'''

# deprecated
o1_majority_prompt = '''Edit a description to show the majority opinion when variations exist while keeping the invariant part unchanged.

For each atomic fact, show only the most likely description based on a majority opinion. Use percentage to indicate the degree of agreement among the language models by calculating the percentage of agreement out of 9 total possible responses.

# Task

1. Review the claims and the part with variations and sources (e.g. Norway is given as 4,600,000 or 4,500,000 (each 1/3 GPT) or 3,800,000 (3/3 Claude)).
2. For each claim, identify the number of models supporting it and calculate the consensus percentage by considering how many model responses (out of 9) align with each claim.
3. Present only the most supported claim in natural language, indicating the level of agreement. If multiple claims have the same amount of support, show them all.
4. If there are no variations (single model supporting this and no variation) still do steps 2 and 3.
5. If it is a sentence without any variations and without any model support information, keep them unchanged in the final description. Ensure that the descriptions remain the same if there are no variations and no model support information.

## Example Input:

There are two white (3/3 GPT) or beige (3/3 Gemini) chairs on the left and a grey sofa on the right. At the center there is a white coffee table with a gold base and a marble (3/3 GPT) or glass(1/3 Gemini) or wood top (2/3 Gemini). A built-in shelf is on the back wall with decorative items, books (3/3 GPT), and television (3/3 Gemini and 1/3 GPT).

## Example Output:

There are two white(50%) or beige (50%) chairs on the left and a grey sofa on the right. At the center, there is a white coffee table with a marble top (50%) and a gold base. A built-in shelf is on the back wall with decorative items, books (50%) and a television (67%).'''


unique_point_prompt = '''You are an expert in summarization and comparative analysis. You are provided with a summary of multiple AI-generated descriptions of the same image from multiple models (e.g., Claude, Gemini, GPT). Your task is to analyze these descriptions and generate a structured summary of similarities, differences, and unique points.

1. Synthesizes all key observations across models in a coherent, paragraph-style format.
2. Prioritizes high-level observations first (e.g., image type, layout, purpose) before diving into detailed content (e.g., specific numbers, colors, labels).
3. Identifies and groups all statements that are agreed upon across models.
4. For any statements in the summary of agreements, do not mention potential variants of statements. For example, a good statement is "the shirt is blue". A bad, unacceptable statement is "the shirt is blue, possibly cyan or turquoise"
5. Clearly highlights disagreements with inline references to the differing model outputs.
6. Note any uniquely mentioned information and attribute it to the specific model(s) that mentioned it.
7. Mention the model's name when describing disagreements and unique points.
8. For each summary, list out the points as a bullet point list in Markdown format.
9. Each summary should be as comprehensive as possible of the agreements, disagreements, and unique points.
10. You are strictly required to adhere to the content that is explicitly mentioned in the input. Do not make any inferences if a model does not mention a statement.

Your output must include:

- A JSON object summarizing:
  - `"similarity"`: Key points that were consistent across most or all models.
  - `"disagreement"`: Points where models differed significantly. If only one model is used, then this section details the differences in the responses of that model.
  - `"uniqueness"`: Details or descriptions that were only mentioned by one response or model.
- Each paragraph should be a hierarchical markdown narrative summary incorporating all observations with annotations of the inline model agreement.

Final Output Format:
{
  "similarity": "Summary of similar points across models.",
  "disagreement": "Summary of disagreements between models.",
  "uniqueness": "Summary of unique or model-specific observations."
}

Example input:
"*   The outfit features a light blue (3 of 3 GPT) or light blue/gray (3 of 3 Claude) or periwinkle blue (3 of 3 Gemini) polo shirt, paired with trousers described as beige (2 of 3 GPT) or khaki (1 of 3 GPT, 3 of 3 Gemini) or light yellow/khaki (2 of 3 Claude) or yellow (1 of 3 Claude) or light khaki (1 of 3 Gemini).\n*   This pairing is generally considered a good, agreeable, or decent combination (3 of 3 GPT, 3 of 3 Claude, 3 of 3 Gemini), often seen as classic (2 of 3 GPT, 1 of 3 Claude, 2 of 3 Gemini) and versatile (3 of 3 GPT, 2 of 3 Gemini), or a safe choice (2 of 3 Gemini). The colors complement each other (1 of 3 GPT, 3 of 3 Claude, 1 of 3 Gemini), creating a soft, coordinated look (1 of 3 Claude) with the neutral or light pants providing a nice contrast (1 of 3 Claude). However, some might find the specific shades a bit plain or muted (1 of 3 Gemini), and whether it looks good can depend on individual coloring and fit (1 of 3 Gemini), although it's considered inoffensive and wearable (1 of 3 Gemini).\n*   This combination is appropriate for casual or semi-casual settings (2 of 3 GPT, 2 of 3 Claude, 2 of 3 Gemini), such as golf outings (1 of 3 Claude), casual office days (1 of 3 Claude), summer gatherings (1 of 3 Claude), casual lunches (1 of 3 Claude), relaxed days out (1 of 3 Claude), everyday wear (1 of 3 Gemini), and is particularly suitable for spring or summer (2 of 3 Claude).\n*   The look achieves a classic casual or smart-casual aesthetic (1 of 3 Claude) with a clean, preppy (2 of 3 Claude), and put-together appearance (2 of 3 Claude), though it might also be viewed as relaxed and unassuming rather than particularly stylish (1 of 3 Gemini).\n*   Suggestions to enhance or complete the outfit include adding neutral-colored shoes like brown or white (1 of 3 GPT) or specifically boat shoes, loafers, or canvas sneakers (1 of 3 Gemini), incorporating a brown leather belt (1 of 3 Gemini), adding accessories like a watch or bracelet (1 of 3 Gemini), or layering with a light sweater or jacket (1 of 3 Gemini). Neutral accessories (1 of 3 GPT) or brighter accent colors (1 of 3 Gemini) can add visual interest, allowing the outfit to be dressed up or down (1 of 3 GPT). Ultimately, feeling confident and comfortable is most important (1 of 3 Gemini)."

Example output:

{
  "similarity": "- The outfit contains a polo shirt that is some shade of blue\n- The pants are light\n- The shirt and pants pairing is a good, classic combination\n- The colors of the shirt and pants complement each other\n- The outfit is appropriate for casual settings",
  "disagreement": "- Gemini thinks that the outfit is relaxed and unassuming, while Claude thinks the outfit is stylish and clean\n- GPT and Gemini describe the pants as beige and light khaki, but Claude describes the pants as yellow\n- GPT thinks the shirt light blue, Claude thinks the shirt is light blue/gray, Gemini thinks the shirt is periwinkle blue",
  "uniqueness": "- Claude suggests you can wear it at golf outings, casual office days, everyday wear, relaxed days out\n- Gemini suggests a leather belt as well as a light jacket over the shirt.\n- Gemini believes that the most important part is to feel confident and comfortable."
}
'''

