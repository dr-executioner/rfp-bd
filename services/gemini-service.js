require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseNaturalLanguageToRFP = async (naturalLanguage) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Parse this natural language procurement request into a structured RFP JSON:

"${naturalLanguage}"

Extract and return ONLY valid JSON with this exact schema:
{
  "title": "Short descriptive title",
  "description": "Full natural language description", 
  "budget": number | null,
  "items": [
    {
      "name": "Item name",
      "qty": number,
      "specs": "Specifications string"
    }
  ],
  "deadline": "YYYY-MM-DD" | null,
  "payment_terms": "string" | null,
  "warranty_months": number | null,
  "status": "draft"
}

Examples:
"I need 20 laptops 16GB RAM, budget $50k" → budget: 50000, items: [{name:"laptops", qty:20, specs:"16GB RAM"}]
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON in AI response');

  return JSON.parse(jsonMatch[0]);
};

module.exports = { parseNaturalLanguageToRFP };

