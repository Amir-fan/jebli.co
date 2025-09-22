# JEBLI Admin Dashboard

A comprehensive admin dashboard for managing discount codes, shops, orders, and website settings for the JEBLI Turkish shopping website.

## 🚀 **Features**

### **1. Dashboard Overview**
- **Statistics Cards**: View active discounts, total shops, orders, and revenue
- **Recent Activity**: Monitor recent admin actions
- **Quick Navigation**: Easy access to all management sections

### **2. Discount Code Management**
- **Add New Discounts**: Create percentage or fixed amount discounts
- **Edit Existing Codes**: Modify discount values, descriptions, and conditions
- **Advanced Options**: Set minimum order amounts, maximum uses, and expiry dates
- **Status Control**: Activate/deactivate discount codes
- **Bulk Operations**: Manage multiple discount codes efficiently

### **3. Shop Management**
- **Add New Shops**: Add Turkish online stores with categories and descriptions
- **Edit Shop Details**: Update shop information, URLs, and status
- **Category Organization**: Organize shops by fashion, sport, electronics, etc.
- **Status Control**: Activate/deactivate shops
- **Logo Management**: Add shop logos and branding

### **4. Order Management**
- **View All Orders**: See customer orders with details
- **Status Tracking**: Monitor order progress (pending, processing, shipped, delivered)
- **Filter Orders**: Filter by status, date, or customer
- **Order Details**: View complete order information

### **5. Settings Management**
- **General Settings**: Configure site name and default language
- **Business Settings**: Adjust service fees and shipping rates
- **Real-time Updates**: Changes apply immediately to the main website

## 🔐 **Security & Access**

### **Login Credentials**
- **Username**: `admin`
- **Password**: `jebli2024`
- **Session Duration**: 24 hours
- **Auto-logout**: Automatic logout after session expiry

### **Access URLs**
- **Login Page**: `admin-login.html`
- **Dashboard**: `admin.html` (requires authentication)

## 📱 **How to Use**

### **Getting Started**
1. Navigate to `admin-login.html`
2. Enter credentials: `admin` / `jebli2024`
3. Access the full admin dashboard

### **Managing Discount Codes**
1. **Navigate to**: Discount Codes section
2. **Add New**: Click "+ Add New Discount"
3. **Configure**:
   - **Code**: Enter discount code (e.g., WELCOME10)
   - **Type**: Choose percentage or fixed amount
   - **Value**: Set discount amount (10% or $5)
   - **Description**: Explain the discount to customers
   - **Minimum Order**: Set minimum purchase requirement
   - **Maximum Uses**: Limit total uses (optional)
   - **Expiry Date**: Set expiration date (optional)
4. **Save**: Click "Save Discount"

### **Managing Shops**
1. **Navigate to**: Manage Shops section
2. **Add New**: Click "+ Add New Shop"
3. **Configure**:
   - **Name**: Shop display name
   - **URL**: Shop website link
   - **Logo**: Shop logo URL (optional)
   - **Category**: Choose from predefined categories
   - **Description**: Brief shop description
   - **Status**: Active or inactive
4. **Save**: Click "Save Shop"

### **Updating Settings**
1. **Navigate to**: Settings section
2. **Modify Values**: Update service fees, shipping rates, etc.
3. **Auto-save**: Changes are saved automatically

## 🔄 **Data Synchronization**

### **Real-time Updates**
- Changes made in admin dashboard immediately reflect on the main website
- Discount codes are automatically loaded when customers visit
- Shop listings update in real-time
- Settings changes apply instantly

### **Data Storage**
- All data stored in browser localStorage
- Persistent across browser sessions
- Automatic backup and recovery
- Export/import functionality (coming soon)

## 📊 **Dashboard Statistics**

### **Metrics Tracked**
- **Active Discounts**: Number of currently active discount codes
- **Total Shops**: Total number of shops in the system
- **Total Orders**: Complete order count
- **Revenue**: Total revenue from all orders

### **Activity Monitoring**
- Recent admin actions
- System changes
- User activity logs

## 🛠 **Technical Details**

### **Built With**
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript ES6+**: Class-based architecture
- **LocalStorage**: Client-side data persistence
- **Responsive Design**: Mobile-first approach

### **Browser Support**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### **File Structure**
```
jebli.co/
├── admin.html              # Main admin dashboard
├── admin-login.html        # Admin login page
├── admin-styles.css        # Admin dashboard styles
├── admin.js               # Admin dashboard functionality
├── index.html             # Main website
├── app.js                 # Main website functionality
├── translations.js        # Multi-language support
└── ADMIN_README.md        # This documentation
```

## 🔧 **Customization**

### **Adding New Categories**
1. Edit `admin.html` - add new option to category select
2. Update `admin.js` - add category handling logic
3. Modify main website to display new categories

### **Modifying Discount Types**
1. Edit discount form in `admin.html`
2. Update validation logic in `admin.js`
3. Modify main website discount handling

### **Adding New Features**
1. Create new section in `admin.html`
2. Add corresponding JavaScript in `admin.js`
3. Update navigation and routing

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Can't Access Dashboard**
- Check login credentials
- Clear browser cache
- Ensure JavaScript is enabled

#### **Changes Not Appearing**
- Refresh the main website
- Check browser console for errors
- Verify data is saved in localStorage

#### **Data Loss**
- Check browser storage settings
- Ensure localStorage is enabled
- Check for browser updates

### **Support**
- Check browser console for error messages
- Verify all files are properly loaded
- Ensure proper file permissions

## 🔮 **Future Enhancements**

### **Planned Features**
- **User Management**: Multiple admin accounts
- **Analytics Dashboard**: Advanced reporting
- **Export/Import**: Data backup and restore
- **API Integration**: Connect to external services
- **Advanced Security**: Two-factor authentication
- **Audit Logs**: Complete action history

### **Integration Possibilities**
- **Google Sheets**: Order data sync
- **Email Notifications**: Order alerts
- **SMS Integration**: Customer updates
- **Payment Processing**: Online payments
- **Inventory Management**: Stock tracking

## 📝 **Changelog**

### **Version 1.0.0** (Current)
- Initial admin dashboard release
- Discount code management
- Shop management
- Basic order tracking
- Settings configuration
- Security authentication

---

**Note**: This admin dashboard is designed for the JEBLI Turkish shopping website. All changes made here will directly affect the customer experience on the main website. Use with caution and test changes before making them live.
