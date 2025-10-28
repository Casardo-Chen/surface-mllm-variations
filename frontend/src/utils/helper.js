// uuid generator
export const uuid = () => {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

const modelNames = {
    "gpt": "GPT-4o",
    "gemini": "Gemini 1.5 pro",
    "claude": "Claude 3.7 sonnet",
};

export const getModelName = (model) => {
    return modelNames[model] || model;
};

/**
 * Helper function to convert Blob to base64
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} Base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

