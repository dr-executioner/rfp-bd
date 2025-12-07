require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendRFPToVendor = async (rfp, vendor) => {
  const msg = {
    to: vendor.email,
    from: 'arya247aviero@gmail.com', 
    subject: `RFP: ${rfp.title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">📋 New RFP: ${rfp.title}</h1>
        
        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0;">
          <h2>Requirements</h2>
          <p>${rfp.description}</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            ${rfp.budget ? `<div><strong>Budget:</strong> $${rfp.budget.toLocaleString()}</div>` : ''}
            ${rfp.deadline ? `<div><strong>Deadline:</strong> ${new Date(rfp.deadline).toLocaleDateString()}</div>` : ''}
            ${rfp.payment_terms ? `<div><strong>Payment:</strong> ${rfp.payment_terms}</div>` : ''}
          </div>
        </div>

        <h3>Items Required</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Specs</th>
            </tr>
          </thead>
          <tbody>
            ${rfp.items.map(item => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px;"><strong>${item.name}</strong></td>
                <td style="padding: 12px;">${item.qty}</td>
                <td style="padding: 12px;">${item.specs}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 24px 0;">
          <h3 style="color: #92400e; margin-top: 0;">📧 Reply by Email</h3>
          <p>Reply to this email with your proposal including pricing, delivery timeline, and terms.</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">
          This is an automated RFP from your procurement system.
        </p>
      </div>
    `
  };

  const result = await sgMail.send(msg);
  return result;
};

module.exports = { sendRFPToVendor };

