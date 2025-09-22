// ===== JEBLI ORDER PIPELINE - GOOGLE APPS SCRIPT BACKEND =====
// This script handles order management, tracking, and email notifications

// Configuration
const CONFIG = {
  SHEET_NAME: 'Orders',
  API_KEY: 'jebli_secret_key_2024_xyz789_secure_hash',
  EMAIL_FROM: 'JEBLI Orders <Jebli963.90@gmail.com>',
  EMAIL_REPLY_TO: 'Jebli963.90@gmail.com',
  EMAIL_SUBJECTS: {
    SUBMITTED: '🎉 Your JEBLI Order Has Been Confirmed! #{tracking_id}',
    PREPARING: '📦 Your JEBLI Order is Being Prepared! #{tracking_id}',
    SHIPPED: '🚚 Your JEBLI Order is On Its Way! #{tracking_id}',
    DELIVERED: '✅ Your JEBLI Order Has Been Delivered! #{tracking_id}',
    CANCELLED: '❌ Your JEBLI Order Has Been Cancelled #{tracking_id}'
  },
  STATUSES: ['Submitted', 'Preparing', 'Shipped', 'Delivered', 'Cancelled']
};

// Main function to handle web app requests
function doPost(e) {
  try {
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    // Validate API key for write operations
    if (data.key !== CONFIG.API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: 'Invalid API key'
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
    
    let result;
    
    switch (data.action) {
      case 'new':
        result = handleNewOrder(data);
        break;
      case 'update':
        result = handleStatusUpdate(data);
        break;
      default:
        result = { ok: false, error: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'Server error: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for order lookup and admin listing)
function doGet(e) {
  try {
    const params = e.parameter;
    let result;
    
    if (params.action === 'get' && params.tracking_id) {
      result = handleGetOrder(params.tracking_id);
    } else if (params.action === 'list' && params.key === CONFIG.API_KEY) {
      result = handleListOrders();
    } else {
      result = { ok: false, error: 'Invalid request' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'Server error: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle new order creation
function handleNewOrder(data) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'city', 'whatsapp', 'items'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return { ok: false, error: `Missing required field: ${field}` };
      }
    }
    
    // Generate unique tracking ID
    const trackingId = generateTrackingId();
    
    // Get or create orders sheet
    const sheet = getOrCreateOrdersSheet();
    
    // Calculate totals from the correct data structure - ensure all values are numbers
    const subtotalTL = parseFloat(data.totals?.subtotalTL || data.subtotalTL || 0);
    const subtotalUSD = parseFloat(data.totals?.subtotalUSD || data.subtotalUSD || 0);
    const serviceFeeUSD = parseFloat(data.totals?.serviceFeeUSD || data.serviceFeeUSD || 0);
    const shippingUSD = parseFloat(data.totals?.shippingUSD || data.shippingUSD || 0);
    const totalUSD = parseFloat(data.totals?.totalUSD || data.totalUSD || 0);
    let totalWeightKg = parseFloat(data.totals?.totalWeightKg || data.totalWeightKg || 0);
    
    // Debug: Log the exact data structure received
    console.log('🔍 Received data structure:', {
      hasTotals: !!data.totals,
      totalsKeys: data.totals ? Object.keys(data.totals) : 'none',
      directKeys: Object.keys(data).filter(key => key.includes('total') || key.includes('subtotal') || key.includes('service') || key.includes('shipping')),
      totals: data.totals,
      directValues: {
        subtotalTL: data.subtotalTL,
        subtotalUSD: data.subtotalUSD,
        serviceFeeUSD: data.serviceFeeUSD,
        shippingUSD: data.shippingUSD,
        totalUSD: data.totalUSD,
        totalWeightKg: data.totalWeightKg
      }
    });
    
    // Also check if items have individual weights
    if (data.items && data.items.length > 0) {
      const calculatedWeight = data.items.reduce((sum, item) => sum + (parseFloat(item.weightKg) || 0), 0);
      if (calculatedWeight > 0) {
        totalWeightKg = calculatedWeight;
      }
    }
    
    // Debug logging
    console.log('📊 Order totals calculated:', {
      subtotalTL,
      subtotalUSD,
      serviceFeeUSD,
      shippingUSD,
      totalUSD,
      totalWeightKg
    });
    
    // Additional debugging for data types
    console.log('🔍 Data type debugging:', {
      subtotalTL_type: typeof subtotalTL,
      subtotalUSD_type: typeof subtotalUSD,
      totalUSD_type: typeof totalUSD,
      totalUSD_value: totalUSD,
      totalUSD_parsed: parseFloat(totalUSD)
    });
    
    // Debug the incoming data structure
    console.log('🔍 Incoming data structure:', {
      hasTotals: !!data.totals,
      totalsKeys: data.totals ? Object.keys(data.totals) : 'none',
      directTotalUSD: data.totalUSD,
      totalsTotalUSD: data.totals?.totalUSD,
      finalTotalUSD: totalUSD
    });
    
    // Prepare row data
    const rowData = [
      new Date(), // timestamp
      trackingId, // tracking_id
      data.name, // name
      data.email, // email
      data.city, // city
      data.whatsapp, // whatsapp
      JSON.stringify(data.items), // items_json
      Number(subtotalTL), // subtotal_tl - ensure it's a number
      Number(subtotalUSD), // subtotal_usd - ensure it's a number
      Number(serviceFeeUSD), // service_fee_usd - ensure it's a number
      Number(shippingUSD), // shipping_usd - ensure it's a number
      Number(totalUSD), // total_usd - ensure it's a number
      Number(totalWeightKg), // total_weight_kg - ensure it's a number
      'Submitted', // status
      '', // admin_notes
      data.notes || '', // customer_notes (using data.notes instead of data.customerNotes)
      data.locale || 'en' // locale
    ];
    
    // Debug: Log the exact row data being stored
    console.log('📊 Row data being stored:', rowData);
    console.log('🔍 Row data types:', rowData.map((value, index) => ({ index, value, type: typeof value })));
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email with properly structured order data
    const orderDataForEmail = {
      tracking_id: trackingId,
      name: data.name,
      email: data.email,
      city: data.city,
      whatsapp: data.whatsapp,
      items: data.items,
      subtotal_tl: subtotalTL,
      subtotal_usd: subtotalUSD,
      service_fee_usd: serviceFeeUSD,
      shipping_usd: shippingUSD,
      total_usd: totalUSD,
      total_weight_kg: totalWeightKg,
      status: 'Submitted',
      customer_notes: data.notes || '',
      locale: data.locale || 'en',
      // Also include camelCase versions for compatibility
      totalUSD: totalUSD,
      totalWeightKg: totalWeightKg
    };
    
    // Debug: Log the exact data being sent to email
    console.log('📧 Email data structure being sent:', {
      orderDataForEmail,
      total_usd: orderDataForEmail.total_usd,
      totalUSD: orderDataForEmail.totalUSD,
      total_usd_type: typeof orderDataForEmail.total_usd,
      totalUSD_type: typeof orderDataForEmail.totalUSD,
      total_usd_parsed: parseFloat(orderDataForEmail.total_usd),
      totalUSD_parsed: parseFloat(orderDataForEmail.totalUSD)
    });
    
         console.log('🌐 Order locale received:', data.locale);
     sendOrderEmail(data.email, 'Submitted', trackingId, orderDataForEmail, data.locale);
     
     // Send admin notification email for new order
     sendAdminNotification(trackingId, orderDataForEmail);
     
     return {
       ok: true,
       tracking_id: trackingId,
       message: 'Order created successfully'
     };
    
  } catch (error) {
    return { ok: false, error: 'Failed to create order: ' + error.toString() };
  }
}

// Handle order status update
function handleStatusUpdate(data) {
  try {
    const { tracking_id, status, admin_notes } = data;
    
    // Validate tracking ID
    if (!tracking_id) {
      return { ok: false, error: 'Missing tracking_id' };
    }
    
    // Validate status
    if (!CONFIG.STATUSES.includes(status)) {
      return { ok: false, error: 'Invalid status' };
    }
    
    // Get orders sheet
    const sheet = getOrCreateOrdersSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the order row
    let orderRow = -1;
    let orderData = null;
    
    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][1] === tracking_id) { // tracking_id is column B (index 1)
        orderRow = i + 1; // Sheet rows are 1-indexed
        orderData = getOrderDataFromRow(sheet, i);
        break;
      }
    }
    
    if (orderRow === -1) {
      return { ok: false, error: 'Order not found' };
    }
    
    // Update status and admin notes
    sheet.getRange(orderRow, 14).setValue(status); // Status is column N (index 13)
    if (admin_notes) {
      sheet.getRange(orderRow, 15).setValue(admin_notes); // Admin notes is column O (index 14)
    }
    
    // Send status update email
    sendOrderEmail(orderData.email, status, tracking_id, orderData, orderData.locale);
    
    return {
      ok: true,
      updated: true,
      message: 'Order status updated successfully'
    };
    
  } catch (error) {
    return { ok: false, error: 'Failed to update order: ' + error.toString() };
  }
}

// Handle order lookup by tracking ID
function handleGetOrder(trackingId) {
  try {
    const sheet = getOrCreateOrdersSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the order
    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][1] === trackingId) { // tracking_id is column B (index 1)
        const orderData = getOrderDataFromRow(sheet, i);
        return {
          ok: true,
          order: orderData
        };
      }
    }
    
    return { ok: false, error: 'Order not found' };
    
  } catch (error) {
    return { ok: false, error: 'Failed to get order: ' + error.toString() };
  }
}

// Handle admin order listing
function handleListOrders() {
  try {
    const sheet = getOrCreateOrdersSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) { // Only header row
      return { ok: true, orders: [] };
    }
    
    const orders = [];
    
    // Process each order row (skip header)
    for (let i = 1; i < values.length; i++) {
      const orderData = getOrderDataFromRow(sheet, i);
      orders.push(orderData);
    }
    
    return {
      ok: true,
      orders: orders
    };
    
  } catch (error) {
    return { ok: false, error: 'Failed to list orders: ' + error.toString() };
  }
}

// Generate unique tracking ID
function generateTrackingId() {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                 (date.getMonth() + 1).toString().padStart(2, '0') +
                 date.getDate().toString().padStart(2, '0');
  
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `JEB-${dateStr}-${randomStr}`;
}

// Get or create orders sheet
function getOrCreateOrdersSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    // Create the sheet with headers
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    
    const headers = [
      'timestamp',
      'tracking_id',
      'name',
      'email',
      'city',
      'whatsapp',
      'items_json',
      'subtotal_tl',
      'subtotal_usd',
      'service_fee_usd',
      'shipping_usd',
      'total_usd',
      'total_weight_kg',
      'status',
      'admin_notes',
      'customer_notes',
      'locale'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#f0f0f0');
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }
  
  return sheet;
}

// Get order data from sheet row
function getOrderDataFromRow(sheet, rowIndex) {
  const values = sheet.getDataRange().getValues();
  const row = values[rowIndex];
  
  // Parse items safely
  let items = [];
  try {
    items = JSON.parse(row[6] || '[]');
  } catch (error) {
    console.error('Error parsing items JSON:', error);
    items = [];
  }
  
  // Debug: Log what we're getting from the sheet
  console.log('🔍 getOrderDataFromRow debugging for row', rowIndex, ':', {
    row7_type: typeof row[7], // subtotal_tl
    row8_type: typeof row[8], // subtotal_usd  
    row11_type: typeof row[11], // total_usd
    row7_value: row[7],
    row8_value: row[8],
    row11_value: row[11],
    row7_parsed: parseFloat(row[7] || 0),
    row8_parsed: parseFloat(row[8] || 0),
    row11_parsed: parseFloat(row[11] || 0)
  });
  
  return {
    // Original snake_case fields (for backend compatibility)
    timestamp: row[0],
    tracking_id: row[1],
    name: row[2],
    email: row[3],
    city: row[4],
    whatsapp: row[5],
    items: items,
    subtotal_tl: parseFloat(row[7] || 0),
    subtotal_usd: parseFloat(row[8] || 0),
    service_fee_usd: parseFloat(row[9] || 0),
    shipping_usd: parseFloat(row[10] || 0),
    total_usd: parseFloat(row[11] || 0),
    total_weight_kg: parseFloat(row[12] || 0),
    status: row[13],
    admin_notes: row[14],
    customer_notes: row[15],
    locale: row[16],
    
    // Additional camelCase fields (for frontend compatibility)
    id: row[1], // tracking_id as id
    subtotalTL: parseFloat(row[7] || 0),
    subtotalUSD: parseFloat(row[8] || 0),
    serviceFeeUSD: parseFloat(row[9] || 0),
    shippingUSD: parseFloat(row[10] || 0),
    totalUSD: parseFloat(row[11] || 0),
    totalWeightKg: parseFloat(row[12] || 0),
    adminNotes: row[14],
    customerNotes: row[15]
  };
}

// Send order status email
function sendOrderEmail(email, status, trackingId, orderData, locale) {
  try {
    console.log('📧 Sending email for order:', trackingId);
    console.log('📧 Order data structure:', orderData);
    console.log('📧 Total USD from orderData:', orderData.total_usd);
    console.log('📧 Total USD from orderData.totalUSD:', orderData.totalUSD);
    
    const subject = CONFIG.EMAIL_SUBJECTS[status.toUpperCase()].replace('{tracking_id}', trackingId);
    const body = generateEmailBody(status, trackingId, orderData, locale);
    
    // Create HTML version of the email
    const htmlBody = convertToHtml(body);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: 'JEBLI Team',
      replyTo: CONFIG.EMAIL_REPLY_TO
    });
    
    console.log('✅ Email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Generate email body based on status and locale
function generateEmailBody(status, trackingId, orderData, locale) {
  console.log('🌐 Email locale decision:', { locale, isArabic: locale === 'ar', willUseArabic: locale === 'ar' });
  if (locale === 'ar') {
    return generateArabicEmailBody(status, trackingId, orderData);
  } else {
    return generateEnglishEmailBody(status, trackingId, orderData);
  }
}

// Generate English email body
function generateEnglishEmailBody(status, trackingId, orderData) {
  console.log('📧 Generating English email for order:', trackingId);
  console.log('📧 Order data in email template:', orderData);
  console.log('📧 Total USD values:', {
    total_usd: orderData.total_usd,
    totalUSD: orderData.totalUSD,
    final: orderData.total_usd || orderData.totalUSD || 0
  });
  
  let body = `Dear ${orderData.name},\n\n`;
  
  switch (status) {
    case 'Submitted':
      body += `🎉 Your order has been confirmed! We're processing it now.\n\n`;
      break;
    case 'Preparing':
      body += `📦 Your order is being prepared for shipment.\n\n`;
      break;
    case 'Shipped':
      body += `🚚 Your order is on its way! Delivery in 7-10 days.\n\n`;
      break;
    case 'Delivered':
      body += `✅ Your order has been delivered successfully!\n\n`;
      break;
    case 'Cancelled':
      body += `❌ Your order has been cancelled as requested.\n\n`;
      break;
  }
  
  // Essential order details only
  body += `📊 ORDER SUMMARY\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `🆔 Tracking ID: ${trackingId}\n`;
  body += `💰 Total: $${parseFloat(orderData.total_usd || orderData.totalUSD || 0).toFixed(2)}\n`;
  body += `📦 Items: ${orderData.items ? orderData.items.length : 0} item(s)\n`;
  body += `🏙️ City: ${orderData.city}\n\n`;
  
  // Contact info
  body += `📞 NEED HELP?\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `📧 Email: info@jebli.co\n`;
  body += `📱 WhatsApp: +90 533 325 23 33\n`;
  body += `🌐 Track: https://jebli.co/track.html\n\n`;
  
  body += `Thank you for choosing JEBLI!\n`;
  body += `The JEBLI Team`;
  
  return body;
}

// Generate Arabic email body
function generateArabicEmailBody(status, trackingId, orderData) {
  console.log('📧 Generating Arabic email for order:', trackingId);
  console.log('📧 Order data in Arabic email template:', orderData);
  console.log('📧 Total USD values in Arabic:', {
    total_usd: orderData.total_usd,
    totalUSD: orderData.totalUSD,
    final: orderData.total_usd || orderData.totalUSD || 0
  });
  
  let body = `عزيزي ${orderData.name},\n\n`;
  
  switch (status) {
    case 'Submitted':
      body += `🎉 تم تأكيد طلبك! نحن نعالجه الآن.\n\n`;
      break;
    case 'Preparing':
      body += `📦 طلبك قيد التحضير للشحن.\n\n`;
      break;
    case 'Shipped':
      body += `🚚 طلبك في الطريق! التسليم خلال 7-10 أيام.\n\n`;
      break;
    case 'Delivered':
      body += `✅ تم تسليم طلبك بنجاح!\n\n`;
      break;
    case 'Cancelled':
      body += `❌ تم إلغاء طلبك كما طلبت.\n\n`;
      break;
  }
  
  // Essential order details only
  body += `📊 ملخص الطلب\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `🆔 رقم التتبع: ${trackingId}\n`;
  body += `💰 الإجمالي: $${parseFloat(orderData.total_usd || orderData.totalUSD || 0).toFixed(2)}\n`;
  body += `📦 العناصر: ${orderData.items ? orderData.items.length : 0} عنصر(ات)\n`;
  body += `🏙️ المدينة: ${orderData.city}\n\n`;
  
  // Contact info
  body += `📞 تحتاج مساعدة؟\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `📧 البريد الإلكتروني: info@jebli.co\n`;
  body += `📱 واتساب: +90 533 325 23 33\n`;
  body += `🌐 التتبع: https://jebli.co/track.html\n\n`;
  
  body += `شكراً لاختيارك جبلي!\n`;
  body += `فريق جبلي`;
  
  return body;
}

// Get Arabic status text
function getArabicStatus(status) {
  const statusMap = {
    'Submitted': 'مقدم',
    'Preparing': 'قيد التحضير',
    'Shipped': 'مشحون',
    'Delivered': 'تم التسليم',
    'Cancelled': 'ملغي'
  };
  
  return statusMap[status] || status;
}

// Convert plain text email to HTML
function convertToHtml(textBody) {
  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JEBLI Order Update</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6; 
            color: #4A453F; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: #F8F6F4;
        }
        .email-container {
            background: #FFFFFF;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #E8E2DC;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #E8E2DC;
            padding-bottom: 24px;
            margin-bottom: 32px;
            background: linear-gradient(135deg, #F8F6F4 0%, #F1EDE8 100%);
            margin: -32px -32px 32px -32px;
            padding: 32px 32px 24px 32px;
            border-radius: 16px 16px 0 0;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            color: #2A2622;
            margin-bottom: 8px;
        }
        .tagline {
            color: #6B645E;
            font-size: 14px;
            font-weight: 500;
            margin: 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #2A2622;
            margin: 24px 0 16px 0;
            border-left: 4px solid #DC2626;
            padding-left: 12px;
        }
        .order-details {
            background: #F8F6F4;
            border: 1px solid #E8E2DC;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .item-list {
            background: #F1EDE8;
            border: 1px solid #D4CCC2;
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
        }
        .contact-info {
            background: #FEE2E2;
            border: 1px solid #DC2626;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #E8E2DC;
            color: #6B645E;
            font-size: 14px;
            background: #F8F6F4;
            margin: 32px -32px -32px -32px;
            padding: 24px 32px 32px 32px;
            border-radius: 0 0 16px 16px;
        }
        .highlight {
            background: #FEE2E2;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
            color: #B91C1C;
            border: 1px solid #DC2626;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 8px 0;
        }
        .status-submitted { background: #DBEAFE; color: #1E40AF; border: 1px solid #3B82F6; }
        .status-preparing { background: #FEF3C7; color: #92400E; border: 1px solid #F59E0B; }
        .status-shipped { background: #DCFCE7; color: #166534; border: 1px solid #22C55E; }
        .status-delivered { background: #D1FAE5; color: #065F46; border: 1px solid #10B981; }
        .status-cancelled { background: #FEE2E2; color: #991B1B; border: 1px solid #EF4444; }
        ul { margin: 12px 0; padding-left: 20px; }
        li { margin: 8px 0; line-height: 1.6; }
        .price-highlight {
            background: #059669;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin: 4px 0;
        }
        .tracking-highlight {
            background: #DC2626;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            margin: 8px 0;
        }
        .emoji-icon {
            font-size: 16px;
            margin-right: 6px;
            vertical-align: middle;
        }
        
        .content {
            color: #4A453F;
        }
        
        .content p {
            color: #4A453F;
            margin: 8px 0;
        }
        
        .content strong {
            color: #2A2622;
            font-weight: 700;
        }
        
        .section-title {
            color: #2A2622 !important;
        }
        
        .footer p {
            color: #6B645E !important;
        }
        
        .footer .contact-info p {
            color: #4A453F !important;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🏔️ JEBLI</div>
            <p class="tagline">Making Turkish shopping accessible in Syria 🇹🇷 → 🇸🇾</p>
        </div>
        
        <div class="content">
`;

  // Convert text content to HTML
  const lines = textBody.split('\n');
  let inSection = false;
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line === '') {
      html += '<br>';
      continue;
    }
    
    // Section headers (lines with emojis and all caps or special formatting)
    if (line.match(/^[📋📦⏰📱💬🆔💰]/)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (inSection) {
        html += '</div>';
      }
      
      if (line.includes('ORDER DETAILS') || line.includes('ORDER SUMMARY') || line.includes('WHAT HAPPENS NEXT') || line.includes('TRACKING YOUR ORDER') || line.includes('NEED HELP')) {
        html += `<div class="section-title">${line}</div>`;
        if (line.includes('ORDER DETAILS')) {
          html += '<div class="order-details">';
          inSection = true;
        } else if (line.includes('ORDER SUMMARY')) {
          html += '<div class="item-list">';
          inSection = true;
        } else if (line.includes('NEED HELP')) {
          html += '<div class="contact-info">';
          inSection = true;
        } else {
          html += '<div>';
          inSection = true;
        }
      } else {
        html += `<p><strong>${line}</strong></p>`;
      }
    }
    // Separator lines
    else if (line.match(/^━+$/)) {
      // Skip separator lines in HTML
      continue;
    }
    // List items (lines starting with bullet points or numbers)
    else if (line.match(/^[🕐🔍📱🚚📧✉️🌐🔔]/) || line.match(/^•/)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${line.replace(/^[🕐🔍📱🚚📧✉️🌐🔔•]\s*/, '')}</li>`;
    }
    // Regular content
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      // Highlight tracking IDs and important values with enhanced styling
      if (line.includes('JEB-')) {
        line = line.replace(/(JEB-[\w-]+)/g, '<span class="tracking-highlight">$1</span>');
      }
      if (line.includes('$')) {
        line = line.replace(/(\$[\d,]+\.?\d*)/g, '<span class="price-highlight">$1</span>');
      }
      if (line.includes('TL')) {
        line = line.replace(/([\d,]+\.?\d*\s*TL)/g, '<span class="highlight">$1</span>');
      }
      
      html += `<p>${line}</p>`;
    }
  }
  
  if (inList) {
    html += '</ul>';
  }
  if (inSection) {
    html += '</div>';
  }
  
  html += `
        </div>
        
        <div class="footer">
                         <p style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 15px;">🙏 Thank you for choosing JEBLI!</p>
             <p style="font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px;">The JEBLI Team</p>
             <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 15px;">🇹🇷 → 🇸🇾 Making Turkish shopping accessible in Syria</p>
             <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #64748b;">
                 <p style="font-size: 12px; color: #94a3b8; margin: 5px 0;">📧 support@jebli.co</p>
                 <p style="font-size: 12px; color: #94a3b8; margin: 5px 0;">📱 +90 437 929 51 63</p>
                 <p style="font-size: 12px; color: #94a3b8; margin: 5px 0;">🌐 jebli.co</p>
             </div>
        </div>
    </div>
</body>
</html>
`;

  return html;
}

// Create standardized response
function createResponse(success, message, data = null) {
  return {
    ok: success,
    message: message,
    data: data
  };
}

 // Send admin notification for new orders
 function sendAdminNotification(trackingId, orderData) {
   try {
     console.log('📧 Sending admin notification for new order:', trackingId);
     
     const subject = `🆕 NEW ORDER RECEIVED! ${trackingId} - $${parseFloat(orderData.total_usd || orderData.totalUSD || 0).toFixed(2)}`;
     
     const body = generateAdminNotificationBody(trackingId, orderData);
     const htmlBody = convertAdminNotificationToHtml(body);
     
     MailApp.sendEmail({
       to: CONFIG.EMAIL_REPLY_TO, // Send to JEBLI email
       subject: subject,
       htmlBody: htmlBody,
       name: 'JEBLI Order System',
       replyTo: CONFIG.EMAIL_REPLY_TO
     });
     
     console.log('✅ Admin notification sent successfully');
     return true;
   } catch (error) {
     console.error('Failed to send admin notification:', error);
     return false;
   }
 }
 
// Generate admin notification email body
function generateAdminNotificationBody(trackingId, orderData) {
  let body = `🆕 NEW ORDER RECEIVED!\n\n`;
  
  // Essential order info only
  body += `📊 ORDER SUMMARY\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `🆔 Tracking ID: ${trackingId}\n`;
  body += `👤 Customer: ${orderData.name}\n`;
  body += `📧 Email: ${orderData.email}\n`;
  body += `🏙️ City: ${orderData.city}\n`;
  body += `📱 WhatsApp: ${orderData.whatsapp}\n`;
  body += `💰 Total: $${parseFloat(orderData.total_usd || orderData.totalUSD || 0).toFixed(2)}\n`;
  body += `📦 Items: ${orderData.items ? orderData.items.length : 0} item(s)\n\n`;
  
  if (orderData.customer_notes) {
    body += `📝 Notes: ${orderData.customer_notes}\n\n`;
  }
  
  // Quick action items
  body += `⏰ ACTION REQUIRED\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `🕐 Review order details\n`;
  body += `✅ Update status in admin dashboard\n`;
  body += `📧 Reply to: ${orderData.email}\n\n`;
  
  body += `🌐 Admin: jebli.co/admin`;
  
  return body;
}
 
// Convert admin notification to HTML
function convertAdminNotificationToHtml(textBody) {
  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JEBLI - New Order Notification</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6; 
            color: #4A453F; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: #F8F6F4;
        }
        .email-container {
            background: #FFFFFF;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 2px solid #DC2626;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #DC2626;
            padding-bottom: 24px;
            margin-bottom: 32px;
            background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
            margin: -32px -32px 32px -32px;
            padding: 32px 32px 24px 32px;
            border-radius: 16px 16px 0 0;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #FFFFFF;
            margin-bottom: 8px;
        }
        .tagline {
            color: #FEE2E2;
            font-size: 14px;
            font-weight: 500;
            margin: 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #2A2622;
            margin: 24px 0 16px 0;
            border-left: 4px solid #DC2626;
            padding-left: 12px;
        }
        .order-details {
            background: #F8F6F4;
            border: 1px solid #E8E2DC;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .item-list {
            background: #F1EDE8;
            border: 1px solid #D4CCC2;
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
        }
        .action-required {
            background: #FEE2E2;
            border: 2px solid #DC2626;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #E8E2DC;
            color: #6B645E;
            font-size: 14px;
            background: #F8F6F4;
            margin: 32px -32px -32px -32px;
            padding: 24px 32px 32px 32px;
            border-radius: 0 0 16px 16px;
        }
        .highlight {
            background: #DC2626;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            display: inline-block;
            margin: 8px 0;
        }
        .price-highlight {
            background: #059669;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin: 4px 0;
        }
        .tracking-highlight {
            background: #DC2626;
            color: white;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 8px;
            display: inline-block;
            margin: 8px 0;
        }
        ul { margin: 12px 0; padding-left: 20px; }
        li { margin: 8px 0; line-height: 1.6; }
        .content p {
            color: #4A453F;
            margin: 8px 0;
        }
        .content strong {
            color: #2A2622;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🚨 NEW ORDER ALERT</div>
            <p class="tagline">JEBLI Order Management System</p>
        </div>
         
         <div class="content">
 `;
 
   // Convert text content to HTML
   const lines = textBody.split('\n');
   let inSection = false;
   let inList = false;
   
   for (let i = 0; i < lines.length; i++) {
     let line = lines[i].trim();
     
     if (line === '') {
       html += '<br>';
       continue;
     }
     
     // Section headers
     if (line.match(/^[📊🛒⏰🔗]/)) {
       if (inList) {
         html += '</ul>';
         inList = false;
       }
       if (inSection) {
         html += '</div>';
       }
       
       if (line.includes('ORDER SUMMARY')) {
         html += `<div class="section-title">${line}</div>`;
         html += '<div class="order-details">';
         inSection = true;
       } else if (line.includes('ITEMS DETAILS')) {
         html += `<div class="section-title">${line}</div>`;
         html += '<div class="item-list">';
         inSection = true;
       } else if (line.includes('ACTION REQUIRED')) {
         html += `<div class="section-title">${line}</div>`;
         html += '<div class="action-required">';
         inSection = true;
       } else if (line.includes('Quick Links')) {
         html += `<div class="section-title">${line}</div>`;
         html += '<div>';
         inSection = true;
       } else {
         html += `<p><strong>${line}</strong></p>`;
       }
     }
     // Separator lines
     else if (line.match(/^━+$/)) {
       continue;
     }
     // List items
     else if (line.match(/^[🕐🔍📱✅🌐📊📧]/)) {
       if (!inList) {
         html += '<ul>';
         inList = true;
       }
       html += `<li>${line.replace(/^[🕐🔍📱✅🌐📊📧]\s*/, '')}</li>`;
     }
     // Regular content
     else {
       if (inList) {
         html += '</ul>';
         inList = false;
       }
       
       // Highlight important values
       if (line.includes('JEB-')) {
         line = line.replace(/(JEB-[\w-]+)/g, '<span class="tracking-highlight">$1</span>');
       }
       if (line.includes('$')) {
         line = line.replace(/(\$[\d,]+\.?\d*)/g, '<span class="price-highlight">$1</span>');
       }
       
       html += `<p>${line}</p>`;
     }
   }
   
   if (inList) {
     html += '</ul>';
   }
   if (inSection) {
     html += '</div>';
   }
   
   html += `
         </div>
         
         <div class="footer">
             <p style="font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 15px;">🚨 ACTION REQUIRED - NEW ORDER</p>
             <p style="font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px;">JEBLI Order Management System</p>
             <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 15px;">Check admin dashboard immediately</p>
         </div>
     </div>
 </body>
 </html>
 `;
 
   return html;
 }
 
 // Handle CORS preflight requests
 function doOptions(e) {
   return ContentService.createTextOutput('')
     .setMimeType(ContentService.MimeType.TEXT);
 }
