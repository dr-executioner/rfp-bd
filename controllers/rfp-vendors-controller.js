const { supabase } = require("../supabase/supabaseClient");

exports.linkVendorsToRFP = async (req, res) => {
  try {
    const { user_id:userId } = req.user;
    const { rfp_id, vendor_ids } = req.body; 

		console.log("Rfp Id:", rfp_id)
		console.log("Vendor id :", vendor_ids)
    const { data: rfp } = await supabase
      .from('rfps')
      .select('id')
      .eq('id', rfp_id)
      .eq('user_id', userId)
      .single();

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const { data: vendors } = await supabase
      .from('vendors')
      .select('id')
      .in('id', vendor_ids);

    if (vendors.length !== vendor_ids.length) {
      return res.status(400).json({ error: 'Some vendors not found' });
    }

    const rfpVendorData = vendor_ids.map(vendor_id => ({
      rfp_id,
      vendor_id
    }));

    const { data, error } = await supabase
      .from('rfp_vendors')
      .insert(rfpVendorData)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: `${vendor_ids.length} vendors linked to RFP`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.unlinkVendorFromRfp = async (req, res) => {
  try {
    console.log("Rfp Vendor Id:", req.params.rfpVendorId);
    console.log("User id:", req.user.user_id);
    
    const { user_id: userId } = req.user;
    const { rfpVendorId } = req.params;

    const { data: rfpVendor, error: fetchError } = await supabase
      .from('rfp_vendors')
      .select(`
        id,
        rfps!rfp_vendors_rfp_id_fkey (
          id,
          user_id
        )
      `)
      .eq('id', rfpVendorId)
      .single();

    console.log("rfpVendor FULL:", rfpVendor);

    if (!rfpVendor) {
      return res.status(404).json({ 
        error: 'RFP-Vendor link not found', 
        rfpVendorId 
      });
    }

    if (rfpVendor.rfps.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('rfp_vendors')
      .delete()
      .eq('id', rfpVendorId);

    if (error) throw error;

    res.json({ success: true, unlinked: rfpVendorId });
  } catch (error) {
    console.error('Unlink error:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getVendorsForRFP = async (req, res) => {
  try {
    const {  user_id } = req.user;
    const { rfp_id } = req.params;
  
	/* 
	const { data, error } = await supabase
      .from('rfp_vendors')
      .select(`
        *,
        rfps!rfp_vendors_rfp_id_fkey (
          id, user_id
        ),
        vendors (
          id, name, email, categories, status, rfp_count
        )
      `)
      .eq('rfps.user_id', user_id)  
      .eq('rfp_id', rfp_id);
	*/


    // Check if RFP exists for user
    const { data: rfpCheck } = await supabase
      .from('rfps')
      .select('id')
      .eq('id', rfp_id)
      .eq('user_id', user_id);
    

    // Simplified query first
    const { data, error } = await supabase
      .from('rfp_vendors')
      .select('*, vendors(name, email)')
      .eq('rfp_id', rfp_id);

    if (error) throw error;
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

