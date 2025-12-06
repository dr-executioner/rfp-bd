const { supabase } = require('../supabase/supabaseClient');  
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.processInboundEmail = async (emailData) => {
  console.log('📧 Processing email from:', emailData.from);
  
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('email', emailData.from)
    .single();

  if (!vendor) {
    console.log('❌ Vendor not found:', emailData.from);
    return { error: 'Vendor not found' };
  }

  const rfpIdMatch = emailData.subject.match(/([a-f0-9-]{36})/i);
  if (!rfpIdMatch) {
    console.log('❌ No RFP ID in subject:', emailData.subject);
    return { error: 'No RFP ID found' };
  }
console.log("rfpIdMatch", rfpIdMatch)	

  const rfpId = rfpIdMatch[1];

	console.log("rfpId", rfpId)
  const parsedProposal = await parseEmailToProposal(emailData.body);

  const { data, error } = await supabase
    .from('proposals')
    .insert([{
	  rfp_id:rfpId,
      vendor_id: vendor.id,
      raw_email: emailData.body,
      parsed_data: parsedProposal,
      status: 'parsed'
    }])
    .select();

  if (error) throw error;
  
  console.log('✅ Proposal created:', data[0].id);
  return data[0];
};

const parseEmailToProposal = async (emailBody) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
Parse this vendor proposal email:

${emailBody.substring(0, 4000)}

Return ONLY JSON:
{
  "total_price": number | null,
  "delivery_days": number | null, 
  "items": [{"name": string, "qty": number, "unit_price": number}],
  "payment_terms": string | null,
  "warranty_months": number | null
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.error('Gemini parse error:', error);
    return { total_price: null, delivery_days: null }; // Fallback
  }
};

