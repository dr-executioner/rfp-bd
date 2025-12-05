const { supabase } = require('../supabase/supabaseClient');

// GET /api/v1/vendors - List all vendors
exports.listVendors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('List vendors error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/v1/vendors - Create vendor
exports.createVendor = async (req, res) => {
  try {
    const vendorData = req.body;

		console.log("Vendor Data", vendorData)
    // Basic validation
    if (!vendorData.name || !vendorData.email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/v1/vendors/:id
exports.getVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/v1/vendors/:id
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('vendors')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/v1/vendors/:id
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;

