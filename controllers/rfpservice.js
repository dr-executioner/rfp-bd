const { supabase } = require('../supabase/supabaseClient'); 

// GET /rfps - List RFPs
exports.listRFPs = async (req, res) => {
  try {
    const {id } = req.user; 
   
	console.log("Id inside list rfp service", id)
    const { data, error } = await supabase
      .from('rfps')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('List RFPs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /rfps - Create RFP
exports.createRFP = async (req, res) => {
  try {
    const { user_id } = req.user;
    const rfpData = {
      ...req.body,
      user_id // Auto-set from auth
    };

    // Basic validation
    if (!rfpData.title) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title is required' 
      });
    }

    const { data, error } = await supabase
      .from('rfps')
      .insert([rfpData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Create RFP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /rfps/:id
exports.getRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const { data, error } = await supabase
      .from('rfps')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Not found
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: 'RFP not found' 
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get RFP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /rfps/:id - Update status, etc.
exports.updateRFP = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const { data, error } = await supabase
      .from('rfps')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update RFP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;

