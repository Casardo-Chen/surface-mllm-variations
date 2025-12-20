import useSystemStore from '../store/use-system-store';

/**
 * Update this URL when ngrok is running and a new tunnel is created.
 */
const BACKEND_URL = "https://infinite-wren-modern.ngrok-free.app"

// const BACKEND_URL = "https://22b4-66-112-231-147.ngrok-free.app"

// const BACKEND_URL = "https://22b4-66-112-231-147.ngrok-free.app";

// const BACKEND_URL = "http://127.0.0.1:8000"

/**
 * Generate Image Description
 * @param {string} image - URL of the image or Base64 encoded image
 * @param {string} prompt - User prompt
 * @returns {string} Image description
 */
export async function generateImageDescription(image, prompt, numTrials, selectedModels, promptVariation, source) {
    try{
         const response = await fetch(`${BACKEND_URL}/generate`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ 
                 image: image,
                 prompt: prompt,
                 numTrials: numTrials,
                 selectedModels: selectedModels,
                 promptVariation: promptVariation,
                 source: source,
                //  userId: useUserStudyStore.getState().userId,
             }),
         });
         const data = await response.json();
         return data;
    } catch (error) {
         console.error('Error:', error);
         return null;
     }
     
 }
 
 /**
  * Verify atomic facts
  * @param {string} atomicFact - Atomic fact to verify
  * @param {string} imageUrl - URL of the image
  * @param {string} currentModel - Current model
  * @returns {list} List of evaluation from other models
  */
 export async function verifyAtomicFacts(atomicFact, imageUrl, currentModel) {
     const response = await fetch(`${BACKEND_URL}/verify`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({
             atomicFact: atomicFact,
             imageUrl: imageUrl,
             currentModel: currentModel,
         }),
     });
     const data = await response.json();
     return data.verifications;
 }

/**
 * Generate Image Description
 * @param {string} imageName - Name of the image
 * @returns {string} Image description
 */

export async function getImageDescriptions(imageName) {
    console.log('Getting description for image:', imageName);
    try {
        const response = await fetch(`${BACKEND_URL}/get_descriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageName: imageName,
                mode : useSystemStore.getState().systemMode
            }),
        });
        const data = await response.json();
        console.log(imageName, 'description:', data);
        return data
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
}


/**
 * Get variation-aware description
 * @param {string} imageName - Name of the image
 * @returns {string} Variation-aware description
 */
export async function getVariationDescription(imageName) {
    console.log('Getting variations:', imageName);
    try {
        const response = await fetch(`${BACKEND_URL}/get_variations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageName: imageName,
                mode : "user"
            }),
        });
        const data = await response.json();
        console.log('Variation', data)
        return data
    }
    catch (error) {
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
