const { GoogleGenerativeAI, Schema, Type } = require('@google/generative-ai');

let _genAI = null;

const getClient = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
};

const stripMarkdownFences = (text) =>
  text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

/**
 * Calls Gemini to classify an emergency and recommend immediate actions based on exact prompt format.
 *
 * @param {string} userInput - Raw input text from the chatbot UI
 * @param {Object} patientHistory - Structured patient profile
 * @param {Object} location - GPS location data
 * @param {Array} hospitals - List of nearby hospitals (mocked or real)
 * @param {Object} traffic - Current traffic conditions (mocked or real)
 * @returns {Promise<Object>} The strict JSON structure requested
 */
const analyzeEmergency = async (userInput, patientHistory, location, hospitals, traffic) => {
  try {
    const model = getClient().getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent JSON
        responseMimeType: "application/json",
      }
    });

    const prompt = `
You are an advanced Emergency Response AI system.
Your role is to analyze messy, unstructured real-world inputs and convert them into structured, verified, and life-saving actions.

### STEP 1: UNDERSTAND THE SITUATION
- Extract symptoms, events, and key signals from the input
- Identify the type of emergency (e.g., cardiac, trauma, respiratory, general)
- Handle ambiguity and noisy input intelligently

### STEP 2: RISK CLASSIFICATION
Classify severity into:
- LOW
- MODERATE
- HIGH
- CRITICAL
Be cautious and prioritize safety.

### STEP 3: CONTEXTUAL REASONING
- Combine user input with medical history
- Identify possible conditions
- Cross-check for risk factors (e.g., heart disease + chest pain = high risk)

### STEP 4: HOSPITAL SELECTION
From the given hospital list:
- Choose the most appropriate hospital based on:
  - Emergency type
  - Required specialization (cardiology, trauma, etc.)
  - Distance

### STEP 5: ROUTE OPTIMIZATION
From the given route/traffic data:
- Select the fastest route (lowest ETA)
- Identify routes to avoid due to congestion or delays

### STEP 6: ACTION GENERATION
Generate clear, step-by-step actions:
- Immediate first-aid steps
- Whether to call ambulance
- What to avoid doing
Keep instructions simple and practical.

### STEP 7: OUTPUT FORMAT (STRICT JSON)
Return ONLY valid JSON in the following structure:
{
  "emergency_type": "",
  "severity": "",
  "confidence": "",
  "reasoning": "",
  "recommended_hospital": {
    "name": "",
    "reason": "",
    "distance": "",
    "specialty_match": ""
  },
  "route": {
    "best_route": "",
    "eta": "",
    "avoid_routes": "",
    "traffic_reason": ""
  },
  "actions": [
    "",
    "",
    ""
  ],
  "alerts": {
    "send_ambulance": true,
    "notify_contacts": true,
    "sos_trigger": true
  }
}

### RULES:
- Be decisive and safety-first
- Do NOT give vague answers
- Do NOT include explanations outside JSON
- Keep actions short and clear
- If unsure, assume higher risk

### INPUT DATA:
User Input:
${userInput}

Medical History:
${JSON.stringify(patientHistory, null, 2)}

Location:
${JSON.stringify(location, null, 2)}

Nearby Hospitals:
${JSON.stringify(hospitals, null, 2)}

Traffic Data:
${JSON.stringify(traffic, null, 2)}
`.trim();

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const parsed = JSON.parse(stripMarkdownFences(rawText));

    return parsed;
  } catch (error) {
    console.error('analyzeEmergency error:', error.message);
    // Safety fallback returning exactly the requested schema
    return {
      emergency_type: "Unknown Context / Critical Error",
      severity: "CRITICAL",
      confidence: "LOW",
      reasoning: "AI analysis failed; falling back to highest safety protocol.",
      recommended_hospital: {
        name: "Nearest Verified General Hospital",
        reason: "Fallback routing due to error",
        distance: "Unknown",
        specialty_match: "General Trauma"
      },
      route: {
        best_route: "Primary Highway",
        eta: "ASAP",
        avoid_routes: "Unknown",
        traffic_reason: "Unknown"
      },
      actions: [
        "Call emergency services (112 / 911) immediately",
        "Stay with the patient",
        "Perform CPR if unresponsive and non-breathing"
      ],
      alerts: {
        send_ambulance: true,
        notify_contacts: true,
        sos_trigger: true
      }
    };
  }
};

const getPersonalisedHealthTip = async (patientHistory) => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
You are a friendly AI health assistant for the JeevanSetu app.
Based on the following patient profile, give ONE short, actionable, personalised health tip (2–3 sentences max).
Be warm, specific, and practical. Do not recommend consulting a doctor — this is a preventive nudge.

Patient Profile:
${JSON.stringify(patientHistory, null, 2)}

Respond with only the tip text, no extra formatting.
`.trim();

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('getPersonalisedHealthTip error:', error.message);
    return 'Stay hydrated and keep your emergency contacts updated in your JeevanSetu profile.';
  }
};

module.exports = {
  analyzeEmergency,
  getPersonalisedHealthTip,
};
