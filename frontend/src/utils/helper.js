// uuid generator
export const uuid = () => {
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

const modelNames = {
    "gpt": "GPT",
    "gemini": "Gemini",
    "claude": "Claude",
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

/**
 * Highlights parenthetical content (text within parentheses) with different colors
 * @param {string} text - Text to process
 * @returns {string} Text with parenthetical content wrapped in colored spans
 */
export const highlightVariations = (text) => {
  if (!text) return text;
  
  const colors = [
    '#faedcb',
    // '#c9e4de',
    // '#c6def1',
    // '#dbcdf0',
    // '#f2c6de',
    // '#f7d9c4'
  ];
  
  let colorIndex = 0;
  let result = '';
  let i = 0;
  let depth = 0;
  let start = -1;
  
  // Process text character by character to handle nested parentheses
  while (i < text.length) {
    const char = text[i];
    
    if (char === '(') {
      if (depth === 0) {
        // Start of a new parenthetical expression
        start = i;
      }
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0 && start !== -1) {
        // End of a parenthetical expression
        const match = text.substring(start, i + 1);
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        result += `<span style="background-color: ${color}; padding: 2px 4px; border-radius: 3px;">${match}</span>`;
        start = -1;
        i++;
        continue;
      }
    }
    
    // Add character to result only if we're not inside parentheses (depth === 0)
    // or if we're inside but haven't started tracking yet (shouldn't happen, but safety check)
    if (depth === 0) {
      result += char;
    }
    
    i++;
  }
  
  // Handle any remaining unmatched parentheses
  if (start !== -1) {
    result += text.substring(start);
  }
  
  return result;
}

