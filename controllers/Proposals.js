const { scoreProposals } = require("../services/proposalScorer");
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
    const { proposals } = req.body;

    console.log('🤖 AI Scoring', proposals.length, 'proposals...');

    const scoredProposals = await scoreProposals(proposals);

    res.json({ 
      success: true, 
      data: scoredProposals 
    });
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProposals = async (req, res) => {
  try {

    const { user_id: userId } = req.user;
    const { status, limit = 50, page = 1 } = req.query;

    let query = supabase
      .from('proposals')
      .select(`
        *,
        vendors (
          id, name, email, categories
        ),
        rfps (
          id, title, budget, status
        )
      `)
      .eq('rfps.user_id', userId)
      .order('created_at', { ascending: false });

    // Optional filters
    if (status) {
      query = query.eq('status', status);
    }

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data: proposals, error } = await query;

    if (error) throw error;

    // Count total for pagination
    const { count, error: countError } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('rfps.user_id', userId);

    res.json({
      success: true,
      data: proposals || [],
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all proposals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

