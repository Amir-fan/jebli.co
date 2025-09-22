# 🚀 JEBLI Order Pipeline - Google Apps Script Setup Guide

This guide will walk you through setting up the Google Apps Script backend for the JEBLI order pipeline system.

## 📋 Prerequisites

- A Google account
- Access to Google Drive
- Basic understanding of Google Sheets

## 🛠️ Step-by-Step Setup

### 1. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it `JEBLI Orders` or similar
4. Note the URL - you'll need this later

### 2. Create Google Apps Script Project

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. This will open a new Apps Script project
3. Delete the default `Code.gs` file content
4. Copy and paste the entire content from `google-apps-script-backend.js`
5. Save the project with a name like `JEBLI Order Pipeline`

### 3. Configure the Script

1. In the Apps Script editor, you may need to update the configuration:
   - The script will automatically create an `Orders` sheet
   - The API key is set to `jebli_secret_key_2024_xyz789_secure_hash`
   - You can change this key in the `CONFIG` object if needed

### 4. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Choose **Web app** as the type
3. Set the following:
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` (for public access)
4. Click **Deploy**
5. **Authorize** the app when prompted
6. Copy the **Web app URL** - this is your API endpoint

### 5. Update Frontend Configuration

1. Open `config.js` in your website
2. Replace `YOUR_SCRIPT_ID_HERE` with your actual Web App URL
3. Make sure the `API_KEY` matches the one in the Apps Script

### 6. Test the Setup

1. Submit a test order from your website
2. Check the Google Sheet - a new `Orders` sheet should be created
3. Verify the order appears with a tracking ID
4. Check your email for the confirmation message

## 📊 Google Sheet Structure

The script will automatically create a sheet with these columns:

| Column | Field | Description |
|--------|-------|-------------|
| A | timestamp | When the order was created |
| B | tracking_id | Unique tracking ID (JEB-YYYYMMDD-XXXXXX) |
| C | name | Customer name |
| D | email | Customer email |
| E | city | Customer city |
| F | whatsapp | Customer WhatsApp number |
| G | items_json | JSON string of order items |
| H | subtotal_tl | Subtotal in Turkish Lira |
| I | subtotal_usd | Subtotal in USD |
| J | service_fee_usd | Service fee (15%) |
| K | shipping_usd | Shipping cost ($6/kg) |
| L | total_usd | Total order value |
| M | total_weight_kg | Total weight in kg |
| N | status | Order status (Submitted/Preparing/Shipped/Delivered/Cancelled) |
| O | admin_notes | Admin notes and comments |
| P | customer_notes | Customer's order notes |
| Q | locale | Language preference (en/ar) |

## 🔐 Security Considerations

- **API Key**: The current API key is hardcoded. For production, consider:
  - Using environment variables
  - Implementing more sophisticated authentication
  - Rate limiting
  - IP whitelisting

- **CORS**: The script allows all origins (`*`). For production, restrict to your domain.

## 📧 Email Configuration

The script uses Google's `MailApp` service to send emails. Make sure:

1. Your Google account has email sending permissions
2. The `EMAIL_FROM` address is valid
3. Test emails are working properly

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check that the API key in `config.js` matches the one in the Apps Script
   - Ensure there are no extra spaces or characters

2. **"Orders sheet not found"**
   - The script should create the sheet automatically
   - Check that the Apps Script has permission to modify the Google Sheet

3. **Emails not sending**
   - Verify your Google account has email permissions
   - Check the Apps Script logs for errors

4. **CORS errors**
   - The script includes CORS headers
   - Make sure you're using the correct Web App URL

### Debug Mode:

1. In Apps Script, go to **View** → **Execution log**
2. Submit a test order
3. Check the logs for any error messages

## 🔄 Updating the Script

To update the Apps Script:

1. Make changes in the Apps Script editor
2. Save the project
3. Create a new deployment version
4. Update the Web App URL in your frontend if needed

## 📱 Testing the Complete System

1. **Order Submission**:
   - Fill out the order form on your website
   - Submit the order
   - Verify you get a tracking ID
   - Check the Google Sheet for the new order
   - Verify the confirmation email was sent

2. **Order Tracking**:
   - Use the tracking widget in the footer
   - Enter the tracking ID
   - Verify the order details display correctly

3. **Admin Dashboard**:
   - Log into the admin panel
   - Verify orders appear in the table
   - Test changing order status
   - Verify status update emails are sent

4. **Status Updates**:
   - Change an order status in the admin panel
   - Verify the Google Sheet is updated
   - Check that the customer receives an email

## 🎯 Next Steps

Once the basic system is working:

1. **Customize email templates** in the Apps Script
2. **Add more validation** for order data
3. **Implement order search and filtering**
4. **Add admin user management**
5. **Set up automated backups** of the Google Sheet
6. **Monitor usage and performance**

## 📞 Support

If you encounter issues:

1. Check the Apps Script execution logs
2. Verify all configuration values match
3. Test with a simple order first
4. Check browser console for frontend errors

---

**🎉 Congratulations!** You now have a complete order pipeline system for JEBLI that handles orders, tracking, and customer notifications automatically.
