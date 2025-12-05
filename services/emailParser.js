const { parseEmailToProposal } = require('./gemini'); 

exports.processInboundEmail = async (emailData) => {
  const parsedProposal = await parseEmailToProposal(emailData.body);
  
  await supabase.from('proposals').insert([{
    rfp_id: parsedProposal.rfp_id,
    vendor_id: parsedProposal.vendor_id,
    raw_email: emailData.body,
    parsed_data: parsedProposal.data,
    status: 'parsed'
  }]);
};

