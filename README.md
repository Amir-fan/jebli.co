# JEBLI.co - Original Design Restored

JEBLI is a service that helps customers in Syria order products from Turkish online stores. We handle the shopping, shipping, and delivery process.

## 🎨 Design System

### Brand Colors
- **Sand 50**: `#EBE8E8` - Light backgrounds
- **Sand 300**: `#AEA59D` - Secondary elements
- **Taupe 500**: `#837C76` - Muted text
- **White**: `#FFFFFF` - Primary backgrounds
- **Charcoal 600**: `#57534F` - Body text
- **Black**: `#000000` - Headings

### Typography
- **Headings**: "The Seasons", "Tan Ashford", "Playfair Display", serif
- **Body**: "TT Hoves", "Inter", "Poppins", system-ui, sans-serif
- **Arabic**: "Ikseer", "Cairo", "IBM Plex Arabic", Tahoma, sans-serif

### Design Tokens
- **Border Radius**: 16px
- **Shadows**: 
  - Soft: `0 6px 20px rgba(0,0,0,.05)`
  - Regular: `0 10px 30px rgba(0,0,0,.06)`

## 🚀 Features

### Homepage (`index.html`)
- **Hero Section**: Clear value proposition with CTA buttons
- **How It Works**: 4-step process explanation
- **Start Options**: Browse shops or go to order form
- **Order Form**: Customer info, products, and price breakdown
- **Pricing Policy**: Transparent fee structure
- **FAQ**: Common questions and answers

### Shops Page (`shops.html`)
- **Browse Turkish Shops**: Curated list of trusted stores
- **Filtering**: By category and search
- **Shop Cards**: Logo, name, description, and visit button

### Order System
- **FX Rate Editor**: Adjustable USD to TL conversion rate
- **Product Management**: Add/remove items with details
- **Live Calculator**: 
  - Service fee: 15% of subtotal
  - Shipping: $6 per kg
  - Real-time total updates
- **WhatsApp Integration**: Direct contact for orders

### Internationalization
- **English & Arabic**: Full language support
- **RTL Support**: Proper Arabic text direction
- **Persistent Language**: Saves user preference

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **No Frameworks**: Pure web standards
- **Responsive Design**: Mobile-first approach
- **Accessibility**: High contrast and reduced motion support

## 📱 Responsive Design

- **Mobile**: Optimized for touch devices
- **Tablet**: Adaptive grid layouts
- **Desktop**: Full-featured experience
- **Breakpoints**: 480px, 768px, 900px

## 🔧 Setup & Development

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd jebli.co
   ```

2. **Start local server**
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 📁 File Structure

```
jebli.co/
├── index.html          # Homepage with order form
├── shops.html          # Browse Turkish shops
├── styles.css          # Main stylesheet
├── app.js              # Homepage functionality
├── shops.js            # Shops page functionality
├── admin.html          # Admin dashboard
├── admin.js            # Admin functionality
├── admin-styles.css    # Admin styles
└── brand-logos/        # Shop logos and images
```

## 🎯 Key Functionality

### Order Processing
1. Customer fills out form with personal info
2. Adds product links, sizes, colors, prices, weights
3. System calculates totals in real-time
4. Order submitted to Google Apps Script webhook
5. WhatsApp integration for customer support

### Shop Management
- Curated list of Turkish online stores
- Category-based filtering
- Search functionality
- Direct links to shop websites

### Language System
- Seamless EN/AR toggle
- Persistent language preference
- RTL layout support for Arabic
- All text properly internationalized

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: Screen reader friendly

## 📞 Contact & Support

- **Email**: info@jebli.co
- **WhatsApp**: +963xxxxxxxxx
- **Service**: Shopping assistance from Turkey to Syria

## 🔒 Security & Privacy

- **No Sensitive Data**: Only order information
- **Local Storage**: Language preferences only
- **External Links**: All shop links open in new tabs
- **Form Validation**: Client-side input validation

---

*JEBLI.co - Making online shopping accessible and convenient for everyone.*
