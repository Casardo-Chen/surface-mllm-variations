import useSystemStore from '../store/use-system-store';

/**
 * Update this URL when ngrok is running and a new tunnel is created.
 */
const BACKEND_URL = "http://127.0.0.1:8000"


/**
 * Generate Image Description
 * @param {string} image - URL of the image or Base64 encoded image
 * @param {string} prompt - User prompt
 * @param {string} openaiKey - OpenAI API key (optional, for user-provided keys)
 * @param {string} geminiKey - Google Gemini API key (optional, for user-provided keys)
 * @param {string} claudeKey - Anthropic Claude API key (optional, for user-provided keys)
 * @returns {string} Image description
 */
export async function generateImageDescription(image, prompt, numTrials, selectedModels, promptVariation, source, openaiKey = null, geminiKey = null, claudeKey = null) {
    try{
         // Only include API keys in request if they are provided
         const requestBody = { 
             image: image,
             prompt: prompt,
             numTrials: numTrials,
             selectedModels: selectedModels,
             promptVariation: promptVariation,
             source: source,
         };

         // Add API keys only if provided (user's own keys)
         if (openaiKey) {
             requestBody.openaiKey = openaiKey;
         }
         if (geminiKey) {
             requestBody.geminiKey = geminiKey;
         }
         if (claudeKey) {
             requestBody.claudeKey = claudeKey;
         }

         const response = await fetch(`${BACKEND_URL}/generate`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify(requestBody),
         });
         const data = await response.json();
         return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
     }
     
 }

/**
 * Create 
 * @param {string} userId - User ID
 * @returns {string} Message
 */
export async function createNewUser(userId){
    try{
        const response = await fetch(`${BACKEND_URL}/create_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
            }),
        });
        const data = await response.json();
        console.log('User created:', data);
        return data.message;
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}
