// JEBLI Order Pipeline Configuration
const JEBLI_CONFIG = {
    // Backend API Configuration
    API_URL: 'https://script.google.com/macros/s/AKfycbxIuOkOX7pQcv6VCsTEePGR4hkB731_b2kqYxci_3YhoqZTUHu_x9T-ypqR0eqK0pHlJQ/exec',
    API_KEY: 'jebli_secret_key_2024_xyz789_secure_hash',
    
    // Business Logic Constants
    DEFAULT_FX_RATE: 39, // TL per USD
    SHIPPING_PER_KG_USD: 6,
    SERVICE_FEE_RATE: 0.15,
    
    // Order Status Values
    STATUSES: {
        SUBMITTED: 'Submitted',
        PREPARING: 'Preparing',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled'
    },
    
    // Email Templates
    EMAIL_SUBJECTS: {
        SUBMITTED: '🎉 Your JEBLI Order Has Been Confirmed! #{tracking_id}',
        PREPARING: '📦 Your JEBLI Order is Being Prepared! #{tracking_id}',
        SHIPPED: '🚚 Your JEBLI Order is On Its Way! #{tracking_id}',
        DELIVERED: '✅ Your JEBLI Order Has Been Delivered! #{tracking_id}',
        CANCELLED: '❌ Your JEBLI Order Has Been Cancelled #{tracking_id}'
    }
};

// Make config globally available
window.JEBLI_CONFIG = JEBLI_CONFIG;
