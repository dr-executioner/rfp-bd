const { supabase } = require("../supabase/supabaseClient");

exports.getProposalsForRFP = async (req, res) => {
  try {
    const { user_id: userId } = req.user;
    const { rfp_id } = req.params;

    const { data: proposals, error: propError } = await supabase
      .from('proposals')
      .select(`
        *,
        vendors (
          id, name, email, categories
        )
      `)
      .eq('rfp_id', rfp_id);

    if (propError) throw propError;

    const { data: rfp } = await supabase
      .from('rfps')
      .select('id')
      .eq('id', rfp_id)
      .eq('user_id', userId)
      .single();

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found or access denied' });
    }

    res.json({ 
      success: true, 
      data: proposals || [] 
    });
  } catch (error) {
    console.error('Proposals error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.scoreProposals = async (req, res) => {
  try {
    const { proposals } = req.body; // Array of proposal data

    // Mock AI scoring (replace with Gemini later)
    const scoredProposals = proposals.map(p => ({
      ...p,
      score: {
        price: Math.random() * 100,
        delivery: Math.random() * 100,
        completeness: Math.random() * 100,
        total: Math.random() * 100
      },
      recommendation: Math.random() > 0.5 ? 'Recommended' : 'Consider'
    }));

    res.json({ success: true, data: scoredProposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

