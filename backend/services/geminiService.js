const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeEmergency = async (messyData, patientHistory) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
      You are an expert AI Emergency Medical Responder.
      A patient has triggered an SOS. Analyze the following data and structured patient history to determine the emergency type, severity, and immediate actions.

      Patient History:
      ${JSON.stringify(patientHistory)}

      Messy Data (Current Context):
      ${JSON.stringify(messyData)}

      You MUST respond ONLY with a valid JSON object in the exact following structure. Do not include markdown formatting or backticks around the JSON.
      {
        "emergencyType": "string",
        "severityLevel": "Low" | "Medium" | "Critical",
        "explanation": "string (brief explanation of why this severity and type was assigned)",
        "immediateActions": ["action 1", "action 2", "action 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Clean up response if it contains markdown code blocks
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error analyzing emergency with Gemini:", error);
    // Fallback response for live demos if API fails
    return {
      emergencyType: "Unknown Medical Emergency",
      severityLevel: "Critical",
      explanation: "Unable to process AI analysis. Defaulting to Critical for safety.",
      immediateActions: ["Call Ambulance", "Perform CPR if unconscious", "Stay with the patient"]
    };
  }
};

module.exports = {
  analyzeEmergency
};
