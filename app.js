// ===== JEBLI.CO MAIN PAGE FUNCTIONALITY =====

// Configuration Constants - Will be set after JEBLI_CONFIG loads
let FX_USD_TO_TL = 40.5; // Default value, will be updated
let SERVICE_FEE_RATE = 0.15; // Default value, will be updated  
let SHIPPING_PER_KG_USD = 6; // Default value, will be updated
const WHATSAPP_PHONE = "+90 533 325 23 33";

// Global State
let items = [];
let rates = {
    usdToTl: 39
};
let currentDiscount = null; // Track current applied discount
let discountUsage = []; // Track discount usage for admin

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing JEBLI main page...');
    
    // Try to initialize, retry if JEBLI_CONFIG isn't ready yet
    if (typeof window.JEBLI_CONFIG === 'undefined') {
        console.log('⏳ JEBLI_CONFIG not ready yet, retrying in 100ms...');
        setTimeout(initializeJEBLI, 100);
        return;
    }
    
    initializeJEBLI();
});

// Also try to initialize when window loads (fallback)
window.addEventListener('load', function() {
    console.log('🌐 Window loaded, checking JEBLI_CONFIG...');
    if (typeof window.JEBLI_CONFIG !== 'undefined' && !window.jebliInitialized) {
        console.log('✅ JEBLI_CONFIG found on window load, initializing...');
        window.jebliInitialized = true;
        initializeJEBLI();
    }
    
    // Ensure language functionality is working
    setTimeout(() => {
        if (typeof window.changeLanguage === 'function') {
            console.log('✅ Language functionality is ready');
        } else {
            console.error('❌ Language functionality not available');
        }
    }, 200);
});

// Main initialization function
function initializeJEBLI() {
    if (typeof window.JEBLI_CONFIG === 'undefined') {
        console.log('⏳ JEBLI_CONFIG still not ready, retrying in 100ms...');
        setTimeout(initializeJEBLI, 100);
        return;
    }
    
    console.log('✅ JEBLI_CONFIG loaded:', window.JEBLI_CONFIG);
    
    // Update configuration constants from JEBLI_CONFIG
    updateConfigurationFromJEBLIConfig();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load rates from storage
    loadRatesFromStorage();
    
    // Add initial product item
    addInitialProductItem();
    
    // Listen for admin updates
    setupAdminUpdateListener();
    
    // Setup smooth scrolling for contact link
    setupSmoothScrolling();
    
    // Test fetch API
    testFetchAPI();
    
    console.log('✅ Main page initialized successfully');
}

// Update configuration constants from JEBLI_CONFIG
function updateConfigurationFromJEBLIConfig() {
    if (typeof window.JEBLI_CONFIG !== 'undefined') {
        FX_USD_TO_TL = window.JEBLI_CONFIG.DEFAULT_FX_RATE;
        SERVICE_FEE_RATE = window.JEBLI_CONFIG.SERVICE_FEE_RATE;
        SHIPPING_PER_KG_USD = window.JEBLI_CONFIG.SHIPPING_PER_KG_USD;
        rates.usdToTl = FX_USD_TO_TL;
        
        console.log('⚙️ Configuration updated from JEBLI_CONFIG:', {
            FX_USD_TO_TL,
            SERVICE_FEE_RATE,
            SHIPPING_PER_KG_USD
        });
    }
    
    // Also check localStorage for admin settings
    const adminFxRate = localStorage.getItem('jebli-usd-to-tl');
    const adminShippingRate = localStorage.getItem('jebli-shipping-rate');
    const adminServiceFee = localStorage.getItem('jebli-service-fee');
    
    if (adminFxRate) {
        FX_USD_TO_TL = parseFloat(adminFxRate);
        rates.usdToTl = FX_USD_TO_TL;
        console.log('✅ FX Rate updated from admin settings:', FX_USD_TO_TL);
    }
    
    if (adminShippingRate) {
        SHIPPING_PER_KG_USD = parseFloat(adminShippingRate);
        console.log('✅ Shipping rate updated from admin settings:', SHIPPING_PER_KG_USD);
    }
    
    if (adminServiceFee) {
        SERVICE_FEE_RATE = parseFloat(adminServiceFee) / 100; // Convert percentage to decimal
        console.log('✅ Service fee updated from admin settings:', SERVICE_FEE_RATE);
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up main page event listeners...');
    
    // Mobile menu functionality
    setupMobileMenu();
    
    // Calculator functionality
    setupCalculator();
    
    // Discount code functionality
    setupDiscountCodeListeners();
    
    // Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        console.log('✅ Language selector found, setting up event listener');
        langSelect.addEventListener('change', handleLanguageChange);
        
        // Set initial value
        if (window.currentLanguage) {
            langSelect.value = window.currentLanguage;
        } else {
            // Default to English if no language is set
            langSelect.value = 'en';
        }
    } else {
        console.log('❌ Language selector not found');
    }
    
    // Listen for settings updates from admin dashboard
    window.addEventListener('jebliSettingsUpdated', function(event) {
        console.log('🔄 Settings updated from admin dashboard:', event.detail);
        
        const { fxRate, shippingRate, serviceFee } = event.detail;
        
        if (fxRate) {
            FX_USD_TO_TL = fxRate;
            rates.usdToTl = fxRate;
            console.log('✅ FX Rate updated in real-time:', fxRate);
        }
        
        if (shippingRate) {
            SHIPPING_PER_KG_USD = shippingRate;
            console.log('✅ Shipping rate updated in real-time:', shippingRate);
        }
        
        if (serviceFee) {
            SERVICE_FEE_RATE = serviceFee / 100; // Convert percentage to decimal
            console.log('✅ Service fee updated in real-time:', SERVICE_FEE_RATE);
        }
        
        // Recalculate if calculator is visible
        if (typeof calculateTotal === 'function') {
            calculateTotal();
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('Settings updated from admin dashboard!', 'success');
        }
    });
    
    // Add item button
    const addItemBtn = document.getElementById('addItem');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addProductItem);
    }
    
    // Submit button
    const submitBtn = document.getElementById('submitSheet');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitOrder);
    }
    
    console.log('✅ Main page event listeners setup complete');
    
    // Ensure language selector is synced
    if (typeof window.syncLanguageSelector === 'function') {
        window.syncLanguageSelector();
    } else {
        // If translations.js hasn't loaded yet, wait for it
        setTimeout(() => {
            if (typeof window.syncLanguageSelector === 'function') {
                window.syncLanguageSelector();
            }
        }, 100);
    }
}

// Language functionality
function handleLanguageChange(event) {
    const newLang = event.target.value;
    
    // Close mobile menu before language change
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mainNav && mobileMenuBtn) {
        mainNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Reset mobile menu setup flag to allow re-setup
    if (mobileMenuBtn) {
        mobileMenuBtn.removeAttribute('data-mobile-menu-setup');
    }
    
    if (typeof window.changeLanguage === 'function') {
        window.changeLanguage(newLang);
        // Re-setup mobile menu after language change
        setTimeout(() => {
            setupMobileMenu();
        }, 100);
    } else {
        // Fallback: try to reload the page with the new language
        localStorage.setItem('jebli-language', newLang);
        window.location.reload();
    }
}

// Product management
function addProductItem() {
    const itemsContainer = document.getElementById('items');
    const itemIndex = items.length;
    
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
        <div class="product-item-header">
            <span class="product-item-title">Item ${itemIndex + 1}</span>
            ${itemIndex > 0 ? `<button type="button" class="remove-item" onclick="removeProductItem(${itemIndex})">×</button>` : ''}
        </div>
        <div class="product-grid">
            <div>
                <label>Product URL</label>
                <input type="url" class="input" placeholder="https://..." oninput="updateItem(${itemIndex}, 'url', this.value)">
            </div>
            <div>
                <label>Size</label>
                <input type="text" class="input" placeholder="M, L, XL..." oninput="updateItem(${itemIndex}, 'size', this.value)">
            </div>
            <div>
                <label>Color</label>
                <input type="text" class="input" placeholder="Red, Blue..." oninput="updateItem(${itemIndex}, 'color', this.value)">
            </div>
            <div>
                <label>Price (TL)</label>
                <input type="number" class="input" step="0.01" min="0" oninput="updateItem(${itemIndex}, 'priceTL', parseFloat(this.value) || 0)">
            </div>
            <div>
                <label>Weight (kg)</label>
                <input type="number" class="input" step="0.1" min="0" oninput="updateItem(${itemIndex}, 'weightKg', parseFloat(this.value) || 0)">
            </div>
            <div>
                <label>Quantity</label>
                <input type="number" class="input" min="1" value="1" oninput="updateItem(${itemIndex}, 'qty', parseInt(this.value) || 1)">
            </div>
        </div>
    `;
    
    itemsContainer.appendChild(productItem);
    items.push({
        id: `item-${Date.now()}-${itemIndex}`, // Generate unique ID
        url: '',
        size: '',
        color: '',
        priceTL: 0,
        weightKg: 0,
        qty: 1
    });
    
    recalculateTotals();
    console.log('➕ Product item added, total items:', items.length);
}

function removeProductItem(index) {
    items.splice(index, 1);
    const productItems = document.querySelectorAll('.product-item');
    productItems[index].remove();
    
    // Update item numbers and remove buttons
    updateProductItemNumbers();
    recalculateTotals();
    console.log('➖ Product item removed');
}

function updateProductItemNumbers() {
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach((item, index) => {
        const title = item.querySelector('.product-item-title');
        title.textContent = `Item ${index + 1}`;
        
        const removeBtn = item.querySelector('.remove-item');
        if (removeBtn) {
            removeBtn.onclick = () => removeProductItem(index);
        }
    });
}

function updateItem(index, field, value) {
    if (items[index]) {
        items[index][field] = value;
        recalculateTotals();
    }
}

function addInitialProductItem() {
    addProductItem();
}

// Rate management
function loadRatesFromStorage() {
    // Check if admin has set a custom rate
    const adminRate = localStorage.getItem('jebli-usd-to-tl');
    if (adminRate) {
        rates.usdToTl = parseFloat(adminRate);
    }
    
    const fxInput = document.getElementById('fx');
    if (fxInput) {
        fxInput.value = rates.usdToTl;
        fxInput.readOnly = true;
    }
}

// Calculations
function recalculateTotals() {
    // Update rates from inputs
    const fxInput = document.getElementById('fx');
    if (fxInput) {
        rates.usdToTl = parseFloat(fxInput.value) || FX_USD_TO_TL;
    }
    
    // Calculate totals - ensure all values are numbers
    const subtotalTL = parseFloat(items.reduce((sum, item) => sum + (parseFloat(item.priceTL || 0)), 0));
    const subtotalUSD = parseFloat(subtotalTL / rates.usdToTl); // Convert TL to USD
    const serviceFeeUSD = parseFloat(subtotalUSD * SERVICE_FEE_RATE);
    const totalWeight = parseFloat(items.reduce((sum, item) => sum + (parseFloat(item.weightKg || 0)), 0));
    const shippingUSD = parseFloat(totalWeight * SHIPPING_PER_KG_USD);
    let totalUSD = parseFloat(subtotalUSD + serviceFeeUSD + shippingUSD);
    
    // Apply discount if active
    let discountUSD = 0;
    if (currentDiscount) {
        if (currentDiscount.type === 'percentage') {
            discountUSD = totalUSD * (currentDiscount.value / 100);
        } else {
            discountUSD = Math.min(currentDiscount.value, totalUSD); // Don't go below 0
        }
        totalUSD = Math.max(0, totalUSD - discountUSD);
    }
    
    // Update price lines display
    updatePriceLines(subtotalTL, subtotalUSD, serviceFeeUSD, shippingUSD, totalUSD, discountUSD);
    
    console.log('💰 Totals recalculated:', { 
        subtotalTL, 
        subtotalUSD, 
        serviceFeeUSD, 
        shippingUSD, 
        discountUSD,
        totalUSD 
    });
}

function updatePriceLines(subtotalTL, subtotalUSD, serviceFeeUSD, shippingUSD, totalUSD, discountUSD = 0) {
    const priceLines = document.getElementById('priceLines');
    if (!priceLines) return;
    
    let discountHTML = '';
    if (discountUSD > 0 && currentDiscount) {
        discountHTML = `
            <div class="row discount">
                <span>Discount (${currentDiscount.code}):</span>
                <span>-$${discountUSD.toFixed(2)}</span>
            </div>
        `;
    }
    
    priceLines.innerHTML = `
        <div class="row">
            <span>Subtotal (TL):</span>
            <span>${subtotalTL.toFixed(2)} TL</span>
        </div>
        <div class="row">
            <span>Subtotal (USD):</span>
            <span>$${subtotalUSD.toFixed(2)}</span>
        </div>
        <div class="row">
            <span>Service Fee (15%):</span>
            <span>$${serviceFeeUSD.toFixed(2)}</span>
        </div>
        <div class="row">
            <span>Shipping ($6/kg):</span>
            <span>$${shippingUSD.toFixed(2)}</span>
        </div>
        ${discountHTML}
        <div class="row total">
            <span>Total (USD):</span>
            <span>$${totalUSD.toFixed(2)}</span>
        </div>
    `;
}

// Utility functions
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
    
    console.log(`🍞 Toast shown: ${message} (${type})`);
}

// Setup smooth scrolling for contact link
function setupSmoothScrolling() {
    // Handle contact link clicks
    const contactLink = document.querySelector('a[href="#contact"]');
    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// Admin update listener
function setupAdminUpdateListener() {
    // Listen for localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'jebli-usd-to-tl') {
            console.log('🔄 Admin updated USD to TL rate:', e.newValue);
            // Reload rates and recalculate
            loadRatesFromStorage();
            recalculateTotals();
        }
    });
    
    // Listen for custom events
    window.addEventListener('jebli-admin-update', function(e) {
        console.log('🔄 Admin update received:', e.detail);
        // Reload rates and recalculate
        loadRatesFromStorage();
        recalculateTotals();
    });
    
    // Check for updates every 5 seconds
    setInterval(() => {
        const lastUpdate = localStorage.getItem('jebli-last-update');
        if (lastUpdate) {
            const currentRate = localStorage.getItem('jebli-usd-to-tl');
            if (currentRate && parseFloat(currentRate) !== rates.usdToTl) {
                console.log('🔄 Rate change detected, updating...');
                loadRatesFromStorage();
                recalculateTotals();
            }
        }
    }, 5000);
}

// Test fetch API functionality
async function testFetchAPI() {
    try {
        console.log('🧪 Testing fetch API...');
        const testResponse = await fetch('https://httpbin.org/get');
        const testData = await testResponse.json();
        console.log('✅ Fetch API test successful:', testData);
        
        // Test Google Apps Script endpoint
        console.log('🧪 Testing Google Apps Script endpoint...');
        const gsResponse = await fetch(`${JEBLI_CONFIG.API_URL}?action=get&tracking_id=test`);
        const gsData = await gsResponse.json();
        console.log('✅ Google Apps Script test successful:', gsData);
    } catch (error) {
        console.error('❌ Fetch API test failed:', error);
    }
}

// ===== ORDER TRACKING SYSTEM =====



// ===== ENHANCED ORDER SUBMISSION =====

// Enhanced order submission with backend integration
async function submitOrder() {
    console.log('🚀 Starting enhanced order submission...');
    
    // Check if JEBLI_CONFIG is available
    if (typeof JEBLI_CONFIG === 'undefined') {
        console.error('❌ JEBLI_CONFIG not available');
        showToast('Configuration error. Please refresh the page.', 'error');
        return;
    }
    
    console.log('✅ JEBLI_CONFIG available:', JEBLI_CONFIG);
    
    // Debug: Check form fields before validation
    console.log('🔍 Checking form fields before validation...');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const cityField = document.getElementById('city');
    const whatsappField = document.getElementById('wa');
    
    console.log('📝 Form fields before validation:', {
        name: nameField,
        email: emailField,
        city: cityField,
        whatsapp: whatsappField
    });
    
    if (nameField) console.log('📝 Name field value:', nameField.value);
    if (emailField) console.log('📝 Email field value:', emailField.value);
    if (cityField) console.log('📝 City field value:', cityField.value);
    if (whatsappField) console.log('📝 WhatsApp field value:', whatsappField.value);
    
    // Validate required fields
    if (!validateOrderForm()) {
        console.log('❌ Form validation failed');
        return;
    }
    
    // Ensure totals are up to date before building payload
    recalculateTotals();
    
    // Build order payload
    console.log('🔍 All items before filtering:', items);
    const validItems = items.filter(item => item.url && item.priceTL > 0);
    console.log('✅ Valid items after filtering:', validItems);
    
    // Calculate totals - ensure all values are numbers
    const subtotalTL = parseFloat(validItems.reduce((sum, item) => sum + (parseFloat(item.priceTL || 0) * (parseInt(item.qty || 1))), 0));
    const subtotalUSD = parseFloat(subtotalTL / rates.usdToTl);
    const serviceFeeUSD = parseFloat(subtotalUSD * SERVICE_FEE_RATE);
    const totalWeightKg = parseFloat(validItems.reduce((sum, item) => sum + (parseFloat(item.weightKg || 0)), 0));
    const shippingUSD = parseFloat(totalWeightKg * SHIPPING_PER_KG_USD);
    let totalUSD = parseFloat(subtotalUSD + serviceFeeUSD + shippingUSD);
    
    console.log('💰 Totals calculated:', {
        subtotalTL,
        subtotalUSD,
        serviceFeeUSD,
        totalWeightKg,
        shippingUSD,
        totalUSD,
        rates: rates.usdToTl
    });
    
    // Debug configuration values
    console.log('⚙️ Configuration values used:', {
        FX_USD_TO_TL,
        SERVICE_FEE_RATE,
        SHIPPING_PER_KG_USD,
        rates_usdToTl: rates.usdToTl
    });
    
    // Debug stored rates
    const storedRate = localStorage.getItem('jebli-usd-to-tl');
    console.log('💾 Stored rate from localStorage:', storedRate);
    console.log('🔍 Final rate being used:', rates.usdToTl);
    
    // Test calculation
    const testTL = 390;
    const testUSD = testTL / rates.usdToTl;
    console.log('🧮 Test calculation:', `${testTL} TL / ${rates.usdToTl} = $${testUSD.toFixed(2)}`);
    
    // Apply discount if active
    let discountValue = 0;
    if (currentDiscount) {
        if (currentDiscount.type === 'percentage') {
            discountValue = totalUSD * (currentDiscount.value / 100);
        } else {
            discountValue = Math.min(currentDiscount.value, totalUSD); // Don't go below 0
        }
        totalUSD = Math.max(0, totalUSD - discountValue);
    }

    const orderPayload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        city: document.getElementById('city').value.trim(),
        whatsapp: document.getElementById('wa').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        items: validItems.map(item => ({
            url: item.url,
            priceTL: item.priceTL,
            priceUSD: (item.priceTL / rates.usdToTl) || 0,
            weightKg: item.weightKg || 0,
            qty: item.qty || 1
        })),
        rates: {
            usdToTl: rates.usdToTl
        },
        totals: {
            subtotalTL: subtotalTL,
            subtotalUSD: subtotalUSD,
            serviceFeeUSD: serviceFeeUSD,
            shippingUSD: shippingUSD,
            totalUSD: totalUSD,
            totalWeightKg: totalWeightKg,
            discountUSD: discountValue
        },
        discount: currentDiscount ? {
            code: currentDiscount.code,
            type: currentDiscount.type,
            value: currentDiscount.value,
            description: currentDiscount.description,
            discountAmount: discountValue
        } : null,
        timestamp: new Date().toISOString()
    };
    
    console.log('📦 Order payload built:', orderPayload);
    console.log('🔍 Order payload totals breakdown:', {
        subtotalTL: orderPayload.totals.subtotalTL,
        subtotalUSD: orderPayload.totals.subtotalUSD,
        serviceFeeUSD: orderPayload.totals.serviceFeeUSD,
        shippingUSD: orderPayload.totals.shippingUSD,
        totalUSD: orderPayload.totals.totalUSD,
        totalWeightKg: orderPayload.totals.totalWeightKg,
        discountUSD: orderPayload.totals.discountUSD
    });
    console.log('🔍 Order payload totals types:', {
        subtotalTL_type: typeof orderPayload.totals.subtotalTL,
        subtotalUSD_type: typeof orderPayload.totals.subtotalUSD,
        totalUSD_type: typeof orderPayload.totals.totalUSD
    });
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitSheet');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        console.log('🌐 Sending to API:', JEBLI_CONFIG.API_URL);
        console.log('🔑 API Key:', JEBLI_CONFIG.API_KEY);
        
        // Debug: Log the exact payload being sent
        const requestBody = {
            key: JEBLI_CONFIG.API_KEY,
            action: 'new',
            ...orderPayload
        };
        
        console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
        console.log('🔍 Payload breakdown:', {
            name: requestBody.name,
            email: requestBody.email,
            city: requestBody.city,
            whatsapp: requestBody.whatsapp,
            itemsCount: requestBody.items ? requestBody.items.length : 0,
            firstItem: requestBody.items ? requestBody.items[0] : null,
            totals: requestBody.totals,
            totalUSD: requestBody.totals?.totalUSD
        });
        
        // Send to backend
        const response = await fetch(JEBLI_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                key: JEBLI_CONFIG.API_KEY,
                action: 'new',
                ...orderPayload
            })
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);
        
        const result = await response.json();
        console.log('📥 Response data:', result);
        
        if (result.ok && result.tracking_id) {
            // Success - show tracking ID and save locally
            handleOrderSuccess(result.tracking_id, orderPayload);
        } else {
            // Error from backend
            throw new Error(result.error || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('❌ Order submission failed:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        
        // More detailed error logging
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('🌐 Network error - check if API is accessible');
            showToast('Network error. Please check your internet connection.', 'error');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.error('🌐 Fetch failed - possible CORS or network issue');
            showToast('Fetch failed. Possible CORS or network issue.', 'error');
        } else {
            showToast(`Order submission failed: ${error.message}`, 'error');
        }
        
        // Re-enable submit button
        const submitBtn = document.getElementById('submitSheet');
        submitBtn.textContent = 'Submit to JEBLI';
        submitBtn.disabled = false;
    }
}

// Validate order form
function validateOrderForm() {
    console.log('🔍 Starting form validation...');
    
    // Get form elements
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const cityField = document.getElementById('city');
    const whatsappField = document.getElementById('wa');
    
    console.log('📝 Form fields found:', {
        name: nameField,
        email: emailField,
        city: cityField,
        whatsapp: whatsappField
    });
    
    // Check if fields exist
    if (!nameField || !emailField || !cityField || !whatsappField) {
        console.error('❌ One or more form fields not found!');
        showToast('Form fields not found. Please refresh the page.', 'error');
        return false;
    }
    
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const city = cityField.value.trim();
    const whatsapp = whatsappField.value.trim();
    
    console.log('📝 Field values:', { name, email, city, whatsapp });
    
    // Basic validation
    if (!name || !email || !city || !whatsapp) {
        console.error('❌ Missing required fields:', { name: !!name, email: !!email, city: !!city, whatsapp: !!whatsapp });
        showToast('Please fill in all required fields', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }
    
    // WhatsApp validation (must include country code)
    if (!whatsapp.startsWith('+')) {
        showToast('WhatsApp number must include country code (e.g., +90)', 'error');
        return false;
    }
    
    // Check if at least one product has valid URL and price
    console.log('🔍 Validating items:', items);
    const validItems = items.filter(item => {
        const hasUrl = item.url && item.url.trim() !== '';
        const hasPrice = item.priceTL && parseFloat(item.priceTL) > 0;
        console.log(`Item ${item.id || 'no-id'}: url="${item.url}", priceTL="${item.priceTL}", hasUrl=${hasUrl}, hasPrice=${hasPrice}`);
        return hasUrl && hasPrice;
    });
    console.log('✅ Valid items found:', validItems.length);
    
    if (validItems.length === 0) {
        showToast('Please add at least one product with valid URL and price', 'error');
        return false;
    }
    
    return true;
}

// Build order payload for backend
function buildOrderPayload() {
    const validItems = items.filter(item => item.url && item.priceTL > 0);
    
    // Calculate totals - ensure all values are numbers
    const subtotalTL = parseFloat(validItems.reduce((sum, item) => sum + (parseFloat(item.priceTL || 0) * (parseInt(item.qty || 1))), 0));
    const subtotalUSD = parseFloat(subtotalTL / rates.usdToTl);
    const serviceFeeUSD = parseFloat(subtotalUSD * SERVICE_FEE_RATE);
    const totalWeightKg = parseFloat(validItems.reduce((sum, item) => sum + (parseFloat(item.weightKg || 0)), 0));
    const shippingUSD = parseFloat(totalWeightKg * SHIPPING_PER_KG_USD);
    let totalUSD = parseFloat(subtotalUSD + serviceFeeUSD + shippingUSD);
    
    // Apply discount if active
    if (currentDiscount) {
        const discountValue = currentDiscount.type === 'percentage' ? currentDiscount.value : currentDiscount.value;
        if (currentDiscount.type === 'percentage') {
            totalUSD = totalUSD * (1 - discountValue / 100);
        } else {
            totalUSD -= discountValue;
        }
    }
    
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        city: document.getElementById('city').value.trim(),
        whatsapp: document.getElementById('wa').value.trim(),
        customerNotes: document.getElementById('notes').value.trim(),
        items: validItems.map(item => ({
            url: item.url,
            size: item.size || '',
            color: item.color || '',
            qty: item.qty || 1,
            priceTL: item.priceTL,
            weightKg: item.weightKg || 0
        })),
        subtotalTL: subtotalTL,
        subtotalUSD: subtotalUSD,
        serviceFeeUSD: serviceFeeUSD,
        shippingUSD: shippingUSD,
        totalUSD: totalUSD,
        totalWeightKg: totalWeightKg,
        locale: window.currentLanguage || 'en'
    };
    
    console.log('🌐 Order locale:', window.currentLanguage || 'en');
}

// Handle successful order submission
function handleOrderSuccess(trackingId, orderPayload) {
    console.log('🎉 Order submitted successfully!', { trackingId, orderPayload });
    
    // Track discount usage if discount was applied
    if (currentDiscount && orderPayload.discount) {
        trackDiscountUsage(currentDiscount.code, trackingId, orderPayload.discount.discountAmount);
    }
    
    // Show success message with tracking ID
    const successMessage = `Order submitted successfully! Your tracking ID is: ${trackingId}`;
    showToast(successMessage, 'success');
    
    // Show tracking ID prominently
    showTrackingIdDisplay(trackingId);
    
    // Save order locally for admin dashboard
    console.log('💾 Saving order locally with payload:', orderPayload);
    saveOrderLocally(trackingId, orderPayload);
    
    // Reset form
    resetOrderForm();
    
    // Re-enable submit button
    const submitBtn = document.getElementById('submitSheet');
    submitBtn.textContent = 'Submit to JEBLI';
    submitBtn.disabled = false;
}

// Show tracking ID display
function showTrackingIdDisplay(trackingId) {
    // Create tracking ID display
    const trackingDisplay = document.createElement('div');
    trackingDisplay.className = 'tracking-display';
    trackingDisplay.innerHTML = `
        <div class="tracking-success">
            <h3>🎉 Order Submitted Successfully!</h3>
            <div class="tracking-id-section">
                <p><strong>Your Tracking ID:</strong></p>
                <div class="tracking-id-display">
                    <span class="tracking-id">${trackingId}</span>
                    <button class="copy-btn" onclick="copyTrackingId('${trackingId}')">📋 Copy</button>
                </div>
            </div>
            <p>We'll send you email updates on your order status.</p>
            <p>You can also track your order using the tracking widget in the footer.</p>
        </div>
    `;
    
    // Insert after the order form
    const orderSection = document.querySelector('#order');
    orderSection.appendChild(trackingDisplay);
    
    // Scroll to tracking display
    trackingDisplay.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (trackingDisplay.parentNode) {
            trackingDisplay.parentNode.removeChild(trackingDisplay);
        }
    }, 10000);
}

// Copy tracking ID to clipboard
function copyTrackingId(trackingId) {
    navigator.clipboard.writeText(trackingId).then(() => {
        showToast('Tracking ID copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy tracking ID', 'error');
    });
}

// Save order locally for admin dashboard
function saveOrderLocally(trackingId, orderPayload) {
    const localOrder = {
        tracking_id: trackingId,
        status: JEBLI_CONFIG.STATUSES.SUBMITTED,
        timestamp: new Date().toISOString(),
        ...orderPayload
    };
    
    // Ensure totals are properly structured for admin dashboard
    if (orderPayload.totals) {
        localOrder.totalUSD = orderPayload.totals.totalUSD;
        localOrder.total_usd = orderPayload.totals.totalUSD; // Also save as snake_case for compatibility
        localOrder.subtotalUSD = orderPayload.totals.subtotalUSD;
        localOrder.subtotal_usd = orderPayload.totals.subtotalUSD;
        localOrder.serviceFeeUSD = orderPayload.totals.serviceFeeUSD;
        localOrder.service_fee_usd = orderPayload.totals.serviceFeeUSD;
        localOrder.shippingUSD = orderPayload.totals.shippingUSD;
        localOrder.shipping_usd = orderPayload.totals.shippingUSD;
        localOrder.totalWeightKg = orderPayload.totals.totalWeightKg;
        localOrder.total_weight_kg = orderPayload.totals.totalWeightKg;
    }
    
    // Get existing orders
    const existingOrders = JSON.parse(localStorage.getItem('jebli_orders') || '[]');
    existingOrders.push(localOrder);
    
    // Save to localStorage
    localStorage.setItem('jebli_orders', JSON.stringify(existingOrders));
    
    // Also save to admin-specific key
    localStorage.setItem('jebli_admin_orders', JSON.stringify(existingOrders));
    
    console.log('💾 Order saved locally:', localOrder);
    console.log('💾 Order totals structure:', {
        totalUSD: localOrder.totalUSD,
        total_usd: localOrder.total_usd,
        totals: localOrder.totals
    });
}

// Reset order form
function resetOrderForm() {
    // Clear form fields
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('city').value = '';
    document.getElementById('wa').value = '';
    document.getElementById('notes').value = '';
    
    // Reset items
    items = [];
    const itemsContainer = document.getElementById('items');
    itemsContainer.innerHTML = '';
    addInitialProductItem();
    
    // Recalculate totals
    recalculateTotals();
    
    console.log('🔄 Order form reset');
}

// ===== MOBILE MENU FUNCTIONALITY =====

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileMenuBtn || !mainNav) return;
    
    // Prevent duplicate setup
    if (mobileMenuBtn.hasAttribute('data-mobile-menu-setup')) return;
    mobileMenuBtn.setAttribute('data-mobile-menu-setup', 'true');
    
    // Close menu function
    function closeMenu() {
        mainNav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Open menu
    mobileMenuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        mainNav.classList.add('active');
        mobileMenuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close button
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
        });
    }
    
    // Close when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Close when clicking outside (but not on language dropdown)
    document.addEventListener('click', function(e) {
        const isLanguageDropdown = e.target.closest('.language-selector');
        if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target) && !isLanguageDropdown) {
            closeMenu();
        }
    });
    
    // Close on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
    
    // Close on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

// Setup discount code functionality
function setupDiscountCodeListeners() {
    const applyDiscountBtn = document.getElementById('applyDiscount');
    const removeDiscountBtn = document.getElementById('removeDiscount');
    const discountCodeInput = document.getElementById('discountCode');
    
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', applyDiscountCode);
    }
    
    if (removeDiscountBtn) {
        removeDiscountBtn.addEventListener('click', removeDiscountCode);
    }
    
    if (discountCodeInput) {
        // Allow Enter key to apply discount
        discountCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyDiscountCode();
            }
        });
        
        // Auto-uppercase input
        discountCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    // Load discount codes from storage
    loadDiscountCodesFromStorage();
    
    console.log('✅ Discount code listeners setup complete');
}

// Apply discount code
function applyDiscountCode() {
    const discountCodeInput = document.getElementById('discountCode');
    const discountMessage = document.getElementById('discountMessage');
    const discountDetails = document.getElementById('discountDetails');
    
    const code = discountCodeInput.value.trim().toUpperCase();
    
    if (!code) {
        showDiscountMessage('Please enter a discount code', 'error');
        return;
    }
    
    // Get discount codes from storage
    const discountCodes = JSON.parse(localStorage.getItem('jebli-discounts') || '[]');
    const discount = discountCodes.find(d => d.code === code && d.status === 'active');
    
    if (!discount) {
        showDiscountMessage('Invalid or expired discount code', 'error');
        return;
    }
    
    // Check if discount is expired
    if (discount.expiry && new Date(discount.expiry) < new Date()) {
        showDiscountMessage('This discount code has expired', 'error');
        return;
    }
    
    // Check minimum order amount
    const subtotalUSD = items.reduce((sum, item) => sum + (item.priceUSD || 0), 0);
    if (discount.minOrder && subtotalUSD < discount.minOrder) {
        showDiscountMessage(`Minimum order amount: $${discount.minOrder}`, 'error');
        return;
    }
    
    // Check maximum uses
    if (discount.maxUses) {
        const usageCount = getDiscountUsageCount(code);
        if (usageCount >= discount.maxUses) {
            showDiscountMessage('This discount code has reached its maximum usage limit', 'error');
            return;
        }
    }
    
    // Apply discount
    currentDiscount = discount;
    showDiscountMessage(`Discount applied: ${discount.description}`, 'success');
    showDiscountDetails(discount);
    
    // Recalculate totals with discount
    recalculateTotals();
    
    console.log('✅ Discount applied:', discount);
}

// Remove discount code
function removeDiscountCode() {
    currentDiscount = null;
    
    // Clear discount display
    const discountCodeInput = document.getElementById('discountCode');
    const discountMessage = document.getElementById('discountMessage');
    const discountDetails = document.getElementById('discountDetails');
    
    discountCodeInput.value = '';
    discountMessage.innerHTML = '';
    discountDetails.style.display = 'none';
    
    // Recalculate totals without discount
    recalculateTotals();
    
    showToast('Discount code removed', 'info');
    console.log('✅ Discount code removed');
}

// Show discount message
function showDiscountMessage(message, type = 'info') {
    const discountMessage = document.getElementById('discountMessage');
    if (discountMessage) {
        discountMessage.textContent = message;
        discountMessage.className = `discount-message ${type}`;
    }
}

// Show discount details
function showDiscountDetails(discount) {
    const discountDetails = document.getElementById('discountDetails');
    const discountDescription = document.getElementById('discountDescription');
    const discountValue = document.getElementById('discountValue');
    
    if (discountDetails && discountDescription && discountValue) {
        discountDescription.textContent = discount.description;
        discountValue.textContent = discount.type === 'percentage' 
            ? `${discount.value}% off` 
            : `$${discount.value} off`;
        
        discountDetails.style.display = 'flex';
    }
}

// Get discount usage count
function getDiscountUsageCount(code) {
    const usage = JSON.parse(localStorage.getItem('jebli-discount-usage') || '[]');
    return usage.filter(u => u.code === code).length;
}

// Load discount codes from storage
function loadDiscountCodesFromStorage() {
    // Listen for admin updates to discount codes
    window.addEventListener('storage', (e) => {
        if (e.key === 'jebli-discounts') {
            console.log('🔄 Discount codes updated from admin:', e.newValue);
            // If current discount was removed, clear it
            if (currentDiscount) {
                const newDiscounts = JSON.parse(e.newValue || '[]');
                const stillValid = newDiscounts.find(d => d.id === currentDiscount.id);
                if (!stillValid) {
                    removeDiscountCode();
                    showToast('Your discount code is no longer valid', 'error');
                }
            }
        }
    });
    
    console.log('✅ Discount codes storage listener setup complete');
}

// Calculate discount amount
function calculateDiscountAmount() {
    if (!currentDiscount) return 0;
    
    const subtotalTL = items.reduce((sum, item) => sum + (item.priceTL || 0), 0);
    const subtotalUSD = subtotalTL / rates.usdToTl;
    const serviceFeeUSD = subtotalUSD * SERVICE_FEE_RATE;
    const totalWeight = items.reduce((sum, item) => sum + (item.weightKg || 0), 0);
    const shippingUSD = totalWeight * SHIPPING_PER_KG_USD;
    const totalBeforeDiscount = subtotalUSD + serviceFeeUSD + shippingUSD;
    
    if (currentDiscount.type === 'percentage') {
        return totalBeforeDiscount * (currentDiscount.value / 100);
    } else {
        return Math.min(currentDiscount.value, totalBeforeDiscount);
    }
}

// Track discount usage for admin analytics
function trackDiscountUsage(code, trackingId, discountAmount) {
    const usage = {
        code: code,
        trackingId: trackingId,
        discountAmount: discountAmount,
        timestamp: new Date().toISOString(),
        customerEmail: document.getElementById('email').value.trim()
    };
    
    // Get existing usage
    const existingUsage = JSON.parse(localStorage.getItem('jebli-discount-usage') || '[]');
    existingUsage.push(usage);
    
    // Save usage
    localStorage.setItem('jebli-discount-usage', JSON.stringify(existingUsage));
    
    // Notify admin dashboard
    window.dispatchEvent(new CustomEvent('jebli-discount-used', {
        detail: usage
    }));
    
    console.log('💰 Discount usage tracked:', usage);
}


// ===== MOBILE OPTIMIZATION UTILITIES =====

// Handle mobile-specific interactions
function setupMobileOptimizations() {
    // Add touch-friendly interactions
    if ('ontouchstart' in window) {
        console.log('📱 Touch device detected, applying mobile optimizations');
        
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn, .nav-link');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
}

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', function() {
    setupMobileOptimizations();
});

// ===== FANARI LABS POPUP FUNCTIONALITY =====

// Open Fanari Labs popup
function openFanariLabsPopup() {
    const popup = document.getElementById('fanariLabsPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Add escape key listener
        document.addEventListener('keydown', handlePopupEscape);
        
        // Add click outside listener
        popup.addEventListener('click', handlePopupOutsideClick);
        
        console.log('👨‍💻 Fanari Labs popup opened');
    }
}

// Close Fanari Labs popup
function closeFanariLabsPopup() {
    const popup = document.getElementById('fanariLabsPopup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Remove event listeners
        document.removeEventListener('keydown', handlePopupEscape);
        popup.removeEventListener('click', handlePopupOutsideClick);
        
        console.log('👨‍💻 Fanari Labs popup closed');
    }
}

// Handle escape key for popup
function handlePopupEscape(event) {
    if (event.key === 'Escape') {
        closeFanariLabsPopup();
    }
}

// Handle click outside popup content
function handlePopupOutsideClick(event) {
    if (event.target === event.currentTarget) {
        closeFanariLabsPopup();
    }
}

// ===== CALCULATOR FUNCTIONALITY =====

let calculatorItems = [];
let itemCounter = 0;

// Setup calculator functionality
function setupCalculator() {
    const calculatorForm = document.getElementById('calculatorForm');
    const addItemBtn = document.getElementById('addItemBtn');
    
    if (!calculatorForm) return;
    
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🧮 Calculator form submitted');
        calculateTotal();
    });
    
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addCalculatorItem);
    }
    
    // Add click listener to calculate button
    const calculateBtn = document.querySelector('.calculator-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🧮 Calculate button clicked');
            calculateTotal();
        });
    }
    
    // Add first item by default
    addCalculatorItem();
}

// Add a new calculator item
function addCalculatorItem() {
    itemCounter++;
    const itemId = `item-${itemCounter}`;
    
    const item = {
        id: itemId,
        priceTL: 0,
        name: `Item ${itemCounter}`
    };
    
    calculatorItems.push(item);
    
    const itemsContainer = document.getElementById('calculatorItems');
    if (itemsContainer) {
        const itemElement = createItemElement(item);
        itemsContainer.appendChild(itemElement);
    }
    
    // Add event listeners for real-time calculation
    setupItemEventListeners(itemId);
    
    // Calculate total
    calculateTotal();
}

// Create item element
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'calculator-item';
    itemDiv.id = `item-${item.id}`;
    
    itemDiv.innerHTML = `
        <div class="calculator-item-header">
            <span class="calculator-item-title">${item.name}</span>
            <button type="button" class="remove-item-btn" onclick="removeCalculatorItem('${item.id}')" title="Remove item">×</button>
        </div>
        <div class="calculator-item-fields">
            <div class="form-group">
                <label for="price-${item.id}" data-i18n="calculator_price_label">Price (TL)</label>
                <div class="input-group">
                    <input type="number" id="price-${item.id}" class="input" placeholder="0" step="0.01" min="0" value="${item.priceTL}" inputmode="numeric" pattern="[0-9]*">
                    <span class="input-suffix">TL</span>
                </div>
            </div>
        </div>
    `;
    
    return itemDiv;
}

// Setup event listeners for an item
function setupItemEventListeners(itemId) {
    const priceInput = document.getElementById(`price-${itemId}`);
    
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            updateItem(itemId, 'priceTL', parseFloat(this.value) || 0);
            calculateTotal();
        });
    }
}

// Update item data
function updateItem(itemId, field, value) {
    const item = calculatorItems.find(item => item.id === itemId);
    if (item) {
        item[field] = value;
    }
}

// Remove calculator item
function removeCalculatorItem(itemId) {
    // Remove from array
    calculatorItems = calculatorItems.filter(item => item.id !== itemId);
    
    // Remove from DOM
    const itemElement = document.getElementById(`item-${itemId}`);
    if (itemElement) {
        itemElement.remove();
    }
    
    // Recalculate
    calculateTotal();
    
    // If no items left, add one
    if (calculatorItems.length === 0) {
        addCalculatorItem();
    }
}

// Calculate total cost
function calculateTotal() {
    // Get current configuration
    const fxRate = window.JEBLI_CONFIG ? window.JEBLI_CONFIG.DEFAULT_FX_RATE : 40.5;
    const serviceFeeRate = window.JEBLI_CONFIG ? window.JEBLI_CONFIG.SERVICE_FEE_RATE : 0.15;
    
    let subtotal = 0;
    let hasValidItems = false;
    
    // Calculate subtotal
    calculatorItems.forEach(item => {
        if (item.priceTL > 0) {
            subtotal += item.priceTL / fxRate;
            hasValidItems = true;
        }
    });
    
    if (!hasValidItems) {
        document.getElementById('calculatorResults').style.display = 'none';
        return;
    }
    
    // Calculate service fee
    const serviceFee = subtotal * serviceFeeRate;
    const totalCost = subtotal + serviceFee;
    
    // Update items breakdown
    updateItemsBreakdown(fxRate);
    
    // Update totals
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('serviceFee').textContent = `$${serviceFee.toFixed(2)}`;
    document.getElementById('shippingCost').textContent = `$0.00`;
    document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
    
    // Show results
    document.getElementById('calculatorResults').style.display = 'block';
}

// Update items breakdown display
function updateItemsBreakdown(fxRate) {
    const breakdownContainer = document.getElementById('itemsBreakdown');
    if (!breakdownContainer) return;
    
    breakdownContainer.innerHTML = '';
    
    calculatorItems.forEach((item, index) => {
        if (item.priceTL > 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-breakdown';
            
            const convertedPrice = item.priceTL / fxRate;
            
            itemDiv.innerHTML = `
                <span class="item-breakdown-name">${item.name}: ${item.priceTL.toFixed(2)} TL</span>
                <span class="item-breakdown-price">$${convertedPrice.toFixed(2)}</span>
            `;
            
            breakdownContainer.appendChild(itemDiv);
        }
    });
}
