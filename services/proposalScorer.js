require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scoreProposal = async (proposal) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
Score this vendor proposal against the RFP criteria (0-100 for each):

RFP BUDGET: $${proposal.rfp_budget || 'unknown'}
PROPOSAL PRICE: $${proposal.parsed_data?.total_price || 'unknown'}
DELIVERY DAYS: ${proposal.parsed_data?.delivery_days || 'unknown'} days
PROPOSAL ITEMS: ${JSON.stringify(proposal.parsed_data?.items || [])}

Score each category 0-100:
- PRICE: How competitive vs budget? (100 = under budget, 0 = 2x+ over)
- DELIVERY: How fast vs typical 30-45 days? (100 = <20 days, 0 = >60 days)  
- COMPLETENESS: All items quoted with specs? (100 = perfect match, 0 = missing key items)

Return ONLY valid JSON:
{
  "price": 85,
  "delivery": 92, 
  "completeness": 78,
  "total": 86,
  "recommendation": "Recommended" | "Consider" | "Review",
  "reasoning": "2-3 sentence explanation"
}
`;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();

  // Extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Fallback scoring
    return fallbackScore(proposal);
  }

  return JSON.parse(jsonMatch[0]);
};

const fallbackScore = (proposal) => {
  const priceScore = proposal.parsed_data?.total_price ? 
    Math.max(0, 100 - (proposal.parsed_data.total_price / (proposal.rfp_budget || 50000) * 100)) : 50;
    
  const deliveryScore = proposal.parsed_data?.delivery_days ? 
    Math.max(0, 100 - (proposal.parsed_data.delivery_days / 45 * 100)) : 50;

  const completenessScore = proposal.parsed_data?.items?.length > 0 ? 85 : 40;

  const total = (priceScore * 0.7 + deliveryScore * 0.2 + completenessScore * 0.1);

  return {
    price: Math.round(priceScore),
    delivery: Math.round(deliveryScore), 
    completeness: Math.round(completenessScore),
    total: Math.round(total),
    recommendation: total > 85 ? 'Recommended' : total > 70 ? 'Consider' : 'Review',
    reasoning: 'AI scoring based on price competitiveness, delivery speed, and response completeness.'
  };
};

exports.scoreProposals = async (proposals) => {
  const scored = [];
  for (const proposal of proposals) {
    const score = await scoreProposal({
      ...proposal,
      rfp_budget: proposal.rfp?.budget // Pass RFP budget for comparison
    });
    scored.push({ ...proposal, score });
  }
  return scored;
};

