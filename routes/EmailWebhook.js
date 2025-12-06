const express = require('express');
const router = express.Router();
const { processInboundEmail } = require('../services/emailParser');

router.post('/inbound-email', async (req, res) => {
  try {
    console.log('📧 Inbound email:', req.body);
    
    await processInboundEmail({
      from: req.body.from,
      subject: req.body.subject,
      body: req.body.text || req.body.html,
      headers: req.headers
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

