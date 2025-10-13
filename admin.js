// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.discounts = [];
        this.shops = [];
        this.orders = [];
        this.settings = {};
        
        this.checkAuth();
        this.init().catch(error => {
            console.error('❌ Error initializing admin dashboard:', error);
        });
    }
    
    checkAuth() {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('jebli-admin-logged-in') === 'true';
        const sessionTime = parseInt(localStorage.getItem('jebli-admin-session') || '0');
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        if (!isLoggedIn || (currentTime - sessionTime > sessionDuration)) {
            // Not logged in or session expired
            localStorage.removeItem('jebli-admin-logged-in');
            localStorage.removeItem('jebli-admin-session');
            window.location.href = 'admin-login.html';
            return;
        }
    }
    
    // Clear all data for production readiness
    clearAllData() {
        console.log('🧹 Clearing all data for production readiness...');
        
        // Clear all orders from all storage locations
        const orderKeys = [
            'jebli-orders',
            'jebli_admin_orders',
            'jebli-admin-deleted-orders',
            'jebli-orders-backup',
            'jebli-orders-sync'
        ];
        
        orderKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Cleared ${key}`);
        });
        
        // Clear admin-specific data
        const adminKeys = [
            'jebli-admin-discounts',
            'jebli-admin-shops',
            'jebli-admin-settings',
            'jebli-admin-stats',
            'jebli-admin-cache'
        ];
        
        adminKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Cleared ${key}`);
        });
        
        // Reset internal data
        this.orders = [];
        this.discounts = [];
        this.shops = [];
        this.settings = {};
        
        console.log('✅ All data cleared for production readiness');
    }
    
    // Filter out deleted orders
    filterDeletedOrders() {
        const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
        if (!deletedOrders) return;
        
        try {
            const deletedArray = JSON.parse(deletedOrders);
            const deletedTrackingIds = new Set(deletedArray.map(d => d.tracking_id));
            
            const originalCount = this.orders.length;
            this.orders = this.orders.filter(order => !deletedTrackingIds.has(order.tracking_id));
            
            if (originalCount !== this.orders.length) {
                console.log(`🧹 Filtered out ${originalCount - this.orders.length} deleted orders`);
                this.saveData();
            }
            
            console.log(`✅ Deleted orders filter applied: ${deletedTrackingIds.size} orders marked as deleted`);
        } catch (error) {
            console.error('❌ Error filtering deleted orders:', error);
        }
    }
    
    // Clear all deleted orders tracking (for testing/reset)
    clearDeletedOrdersTracking() {
        if (confirm('⚠️ Clear all deleted orders tracking? This will allow previously deleted orders to reappear. Continue?')) {
            localStorage.removeItem('jebli-admin-deleted-orders');
            console.log('🗑️ Cleared all deleted orders tracking');
            this.showToast('Deleted orders tracking cleared', 'info');
        }
    }
    
    // Production-ready data management
    async clearAllOrders() {
        if (confirm('⚠️ Are you sure you want to clear ALL orders? This action cannot be undone.')) {
            try {
                // Clear from all storage locations
                const orderKeys = [
                    'jebli-orders',
                    'jebli_admin_orders',
                    'jebli-admin-deleted-orders',
                    'jebli-orders-backup',
                    'jebli-orders-sync'
                ];
                
                orderKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Reset internal data
                this.orders = [];
                this.updateDashboard();
                this.loadOrders();
                
                // Show success message
                this.showNotification('All orders cleared successfully', 'success');
                
                console.log('✅ All orders cleared for production');
            } catch (error) {
                console.error('❌ Error clearing orders:', error);
                this.showNotification('Error clearing orders', 'error');
            }
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    async init() {
        // Show loading state
        this.showLoadingState();
        
        try {
            // Load data in parallel for better performance
            await Promise.all([
                this.loadData(),
                this.loadSettings()
            ]);
            
            // Setup UI components
            this.setupEventListeners();
            this.updateDashboard();
            this.loadDiscounts();
            this.loadShops();
            this.loadOrders();
            
            // Force cleanup of all storage locations to ensure consistency
            this.forceCleanupAllStorage();
            
            // Set up periodic refresh to stay in sync with main website
            this.setupPeriodicRefresh();
            
            // Hide loading state
            this.hideLoadingState();
            
            console.log('✅ Admin dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing admin dashboard:', error);
            this.hideLoadingState();
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }
    
    
    showLoadingState() {
        const loadingHTML = `
            <div id="admin-loading" class="loading-overlay">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }
    
    hideLoadingState() {
        const loadingElement = document.getElementById('admin-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    showError(message) {
        const errorHTML = `
            <div id="admin-error" class="error-overlay">
                <div class="error-message">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }
    
    setupPeriodicRefresh() {
        // Refresh orders every 30 seconds to stay in sync
        setInterval(() => {
            this.refreshOrdersFromStorage();
        }, 30000); // 30 seconds
        
        console.log('⏰ Periodic refresh setup: checking for new orders every 30 seconds');
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up admin dashboard event listeners...');
        
        // Mobile navigation toggle
        this.setupMobileNavigation();
        
        // Language selector
        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            langSelect.addEventListener('change', this.handleLanguageChange.bind(this));
        }
        
        // Search functionality
        const orderSearchInput = document.getElementById('orderSearchInput');
        if (orderSearchInput) {
            orderSearchInput.addEventListener('input', this.searchOrders.bind(this));
        }
        
        // Clear search button
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', this.clearSearch.bind(this));
        }
        
        // Order status filter
        const orderStatusFilter = document.getElementById('orderStatusFilter');
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', this.filterOrders.bind(this));
        }
        
        // Data management buttons
        const forceCleanupBtn = document.getElementById('forceCleanupBtn');
        if (forceCleanupBtn) {
            forceCleanupBtn.addEventListener('click', this.forceCleanupAllStorage.bind(this));
        }
        
        const syncOrdersBtn = document.getElementById('syncOrdersBtn');
        if (syncOrdersBtn) {
            syncOrdersBtn.addEventListener('click', this.syncOrdersFromMainWebsite.bind(this));
        }
        
        // Listen for orders updates from main website
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        window.addEventListener('jebli-orders-updated', this.syncOrdersFromMainWebsite.bind(this));
        
        // Listen for discount usage from main website
        window.addEventListener('jebli-discount-used', this.handleDiscountUsage.bind(this));
        
        // Touch-friendly interactions for mobile
        this.setupTouchInteractions();
        
        // Navigation event listeners
        this.setupNavigationListeners();
        
        // Form and modal event listeners
        this.setupFormAndModalListeners();
        
        console.log('✅ Admin dashboard event listeners setup complete');
    }

    // Setup mobile navigation
    setupMobileNavigation() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (mobileNavToggle && sidebar) {
            mobileNavToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                mobileNavToggle.classList.toggle('active');
                
                // Prevent body scroll when sidebar is open
                if (sidebar.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // Close sidebar when clicking outside
            document.addEventListener('click', (event) => {
                if (!sidebar.contains(event.target) && !mobileNavToggle.contains(event.target)) {
                    sidebar.classList.remove('active');
                    mobileNavToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Close sidebar on escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    mobileNavToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 900) {
                    sidebar.classList.remove('active');
                    mobileNavToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            console.log('✅ Mobile navigation setup complete');
        }
    }

    // Setup touch-friendly interactions
    setupTouchInteractions() {
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn, .btn-sm, .nav-link, .sidebar-nav a');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.transition = 'transform 0.1s ease';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
            
            button.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Add swipe gestures for mobile
        this.setupSwipeGestures();
        
        console.log('✅ Touch interactions setup complete');
    }

    // Setup swipe gestures for mobile
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar && mainContent) {
            // Swipe right to open sidebar
            mainContent.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            mainContent.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Swipe right (negative diffX) to open sidebar
                if (diffX < -50 && Math.abs(diffY) < 50 && window.innerWidth <= 900) {
                    sidebar.classList.add('active');
                    document.querySelector('.mobile-nav-toggle')?.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
            
            // Swipe left to close sidebar
            sidebar.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });
            
            sidebar.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Swipe left (positive diffX) to close sidebar
                if (diffX > 50 && Math.abs(diffY) < 50) {
                    sidebar.classList.remove('active');
                    document.querySelector('.mobile-nav-toggle')?.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }
    
    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load section-specific data
        if (sectionId === 'dashboard') {
            this.loadDashboardStats();
        } else if (sectionId === 'discounts') {
            this.loadDiscounts();
        } else if (sectionId === 'discount-usage') {
            this.loadDiscountUsage();
            this.updateDiscountUsageStats();
        } else if (sectionId === 'shops-section') {
            this.loadShops();
        } else if (sectionId === 'orders') {
            this.loadOrders();
        } else if (sectionId === 'settings') {
            this.loadSettings();
        }
        
        console.log(`✅ Navigated to ${sectionId} section`);
    }
    
    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            discounts: 'Discount Codes',
            shops: 'Manage Shops',
            orders: 'Order Management',
            settings: 'Settings'
        };
        return titles[section] || 'Dashboard';
    }
    
    // Discount Management
    openDiscountModal(discount = null) {
        const modal = document.getElementById('discountModal');
        const title = document.getElementById('discountModalTitle');
        const form = document.getElementById('discountForm');
        
        if (discount) {
            // Edit mode
            title.textContent = 'Edit Discount';
            this.populateDiscountForm(discount);
            form.dataset.editId = discount.id;
        } else {
            // Add mode
            title.textContent = 'Add New Discount';
            form.reset();
            delete form.dataset.editId;
        }
        
        modal.classList.add('show');
    }
    
    closeDiscountModal() {
        document.getElementById('discountModal').classList.remove('show');
    }
    
    populateDiscountForm(discount) {
        document.getElementById('discountCode').value = discount.code;
        document.getElementById('discountType').value = discount.type;
        document.getElementById('discountValue').value = discount.value;
        document.getElementById('discountDescription').value = discount.description;
        document.getElementById('discountMinOrder').value = discount.minOrder || '';
        document.getElementById('discountMaxUses').value = discount.maxUses || '';
        document.getElementById('discountExpiry').value = discount.expiry || '';
        
        this.updateValueHint(discount.type);
    }
    
    updateValueHint(type) {
        const hint = document.getElementById('valueHint');
        if (hint) {
            hint.textContent = type === 'percentage' ? '%' : '$';
        }
    }
    
    saveDiscount() {
        const form = document.getElementById('discountForm');
        const editId = form.dataset.editId;
        
        const discountData = {
            code: document.getElementById('discountCode').value.toUpperCase(),
            type: document.getElementById('discountType').value,
            value: parseFloat(document.getElementById('discountValue').value),
            description: document.getElementById('discountDescription').value,
            minOrder: parseFloat(document.getElementById('discountMinOrder').value) || 0,
            maxUses: parseInt(document.getElementById('discountMaxUses').value) || null,
            expiry: document.getElementById('discountExpiry').value || null,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        if (editId) {
            // Update existing discount
            const index = this.discounts.findIndex(d => d.id === editId);
            if (index !== -1) {
                this.discounts[index] = { ...this.discounts[index], ...discountData };
            }
        } else {
            // Add new discount
            discountData.id = this.generateId();
            this.discounts.push(discountData);
        }
        
        this.saveData();
        this.loadDiscounts();
        this.closeDiscountModal();
        this.showToast('Discount saved successfully! Main website updated in real-time!', 'success');
        this.updateDashboard();
        
        // Notify main website to refresh
        this.notifyMainWebsite();
    }
    
    deleteDiscount(id) {
        this.showConfirmModal(
            'Are you sure you want to delete this discount code?',
            () => {
                this.discounts = this.discounts.filter(d => d.id !== id);
                this.saveData();
                this.loadDiscounts();
                this.showToast('Discount deleted successfully!', 'success');
                this.updateDashboard();
            }
        );
    }
    
    clearAllDiscounts() {
        this.showConfirmModal(
            'Are you sure you want to clear ALL discount codes? This action cannot be undone.',
            () => {
                this.discounts = [];
                this.saveData();
                this.loadDiscounts();
                this.showToast('All discount codes cleared!', 'success');
                this.updateDashboard();
            }
        );
    }
    
    toggleDiscountStatus(id) {
        const discount = this.discounts.find(d => d.id === id);
        if (discount) {
            discount.status = discount.status === 'active' ? 'inactive' : 'active';
            this.saveData();
            this.loadDiscounts();
            this.showToast(`Discount ${discount.status}`, 'success');
        }
    }
    
    loadDiscounts() {
        const tbody = document.getElementById('discountsTableBody');
        tbody.innerHTML = '';
        
        this.discounts.forEach(discount => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${discount.code}</strong></td>
                <td>${discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</td>
                <td>${discount.type === 'percentage' ? discount.value + '%' : '$' + discount.value}</td>
                <td>${discount.description}</td>
                <td>
                    <span class="shop-status ${discount.status}">${discount.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editDiscount('${discount.id}')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteDiscount('${discount.id}')">
                        Delete
                    </button>
                    <button class="btn btn-sm ${discount.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                            onclick="adminDashboard.toggleDiscountStatus('${discount.id}')">
                        ${discount.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    editDiscount(id) {
        const discount = this.discounts.find(d => d.id === id);
        if (discount) {
            this.openDiscountModal(discount);
        }
    }
    
    // Shop Management
    openShopModal(shop = null) {
        const modal = document.getElementById('shopModal');
        const title = document.getElementById('shopModalTitle');
        const form = document.getElementById('shopForm');
        
        if (shop) {
            // Edit mode
            title.textContent = 'Edit Shop';
            this.populateShopForm(shop);
            form.dataset.editId = shop.id;
        } else {
            // Add mode
            title.textContent = 'Add New Shop';
            form.reset();
            delete form.dataset.editId;
        }
        
        modal.classList.add('show');
    }
    
    closeShopModal() {
        document.getElementById('shopModal').classList.remove('show');
    }
    
    populateShopForm(shop) {
        document.getElementById('shopName').value = shop.name;
        document.getElementById('shopUrl').value = shop.url;
        document.getElementById('shopLogo').value = shop.logo || '';
        document.getElementById('shopCategory').value = shop.category;
        document.getElementById('shopDescription').value = shop.description || '';
        document.getElementById('shopStatus').value = shop.status;
    }
    
    saveShop() {
        // Implementation for saving shop
        console.log('✅ Shop saved');
        this.showToast('Shop saved successfully!', 'success');
    }
    
    deleteShop(id) {
        this.showConfirmModal(
            'Are you sure you want to delete this shop?',
            () => {
                this.shops = this.shops.filter(s => s.id !== id);
                this.saveData();
                this.loadShops();
                this.showToast('Shop deleted successfully!', 'success');
                this.updateDashboard();
            }
        );
    }
    
    clearAllShops() {
        this.showConfirmModal(
            'Are you sure you want to clear ALL shops? This action cannot be undone.',
            () => {
                this.shops = [];
                this.saveData();
                this.loadShops();
                this.showToast('All shops cleared!', 'success');
                this.updateDashboard();
            }
        );
    }
    
    refreshAllShops() {
        this.showConfirmModal(
            'This will add all 65 default shops to your existing shops. Continue?',
            () => {
                // Get existing custom shops
                const existingShops = [...this.shops];
                
                // Load default shops
                this.loadDefaultShops();
                
                // Merge with existing shops, avoiding duplicates by name
                const existingNames = existingShops.map(shop => shop.name.toLowerCase());
                const newShops = this.shops.filter(shop => !existingNames.includes(shop.name.toLowerCase()));
                
                // Combine existing and new shops
                this.shops = [...existingShops, ...newShops];
                
                this.saveData();
                this.loadShops();
                this.showToast(`Added ${newShops.length} new shops successfully!`, 'success');
                this.updateDashboard();
            }
        );
    }
    
    toggleShopStatus(id) {
        const shop = this.shops.find(s => s.id === id);
        if (shop) {
            shop.status = shop.status === 'active' ? 'inactive' : 'active';
            this.saveData();
            this.loadShops();
            this.showToast(`Shop ${shop.status}`, 'success');
        }
    }
    
    loadShops() {
        console.log('🔄 Loading shops...');
        
        const shopsSection = document.getElementById('shops-section');
        if (!shopsSection) {
            console.error('❌ Shops section not found');
            return;
        }
        
        // Load shops from localStorage or use default shops
        const savedShops = localStorage.getItem('jebli-admin-shops');
        if (savedShops) {
            try {
                this.shops = JSON.parse(savedShops);
                console.log(`📊 Loaded ${this.shops.length} shops from localStorage`);
            } catch (error) {
                console.error('❌ Error parsing saved shops:', error);
                this.shops = [];
            }
        } else {
            // Load default shops from shops.js
            this.loadDefaultShops();
        }
        
        this.displayShops();
        console.log('✅ Shops section loaded');
    }
    
    loadDefaultShops() {
        console.log('🔄 Loading default shops...');
        
        // Load shops from the main shops.js file
        if (typeof SHOPS_DATA !== 'undefined') {
            this.shops = SHOPS_DATA.map((shop, index) => ({
                id: `shop_${index + 1}`,
                name: shop.name,
                category: shop.category,
                description: shop.description,
                url: shop.url,
                logo: shop.logo,
                status: shop.status || 'active',
                created_at: new Date().toISOString()
            }));
            
            // Save to localStorage
            this.saveData();
            console.log(`✅ Loaded ${this.shops.length} default shops`);
        } else {
            console.error('❌ SHOPS_DATA not found');
            this.shops = [];
        }
    }
    
    displayShops() {
        const shopsSection = document.getElementById('shops-section');
        if (!shopsSection) return;
        
        const shopsGrid = shopsSection.querySelector('.shops-grid');
        if (!shopsGrid) return;
        
        if (this.shops.length === 0) {
            shopsGrid.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">🏪</div>
                    <h3>No Shops Found</h3>
                    <p>No shops have been added yet.</p>
                    <button class="btn btn-primary" onclick="adminDashboard.refreshAllShops()">
                        Load Default Shops
                    </button>
                </div>
            `;
            return;
        }
        
        shopsGrid.innerHTML = this.shops.map(shop => `
            <div class="shop-card ${shop.status === 'inactive' ? 'inactive' : ''}">
                <div class="shop-header">
                    <img src="${shop.logo}" alt="${shop.name}" class="shop-logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0xMCAxMEgzMFYzMEgxMFYxMFoiIGZpbGw9IiVFQkVFOEU4Ii8+CjxwYXRoIGQ9Ik0xNSAxNUgyNVYyNUgxNVYxNVoiIGZpbGw9IiNBQ0E1OUQ5Ii8+Cjwvc3ZnPgo='">
                    <div class="shop-info">
                        <h3 class="shop-name">${shop.name}</h3>
                        <span class="shop-category">${shop.category}</span>
                    </div>
                </div>
                <p class="shop-description">${shop.description}</p>
                <div class="shop-actions">
                    <a href="${shop.url}" target="_blank" class="btn btn-sm btn-secondary">Visit</a>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.editShop('${shop.id}')">Edit</button>
                    <button class="btn btn-sm ${shop.status === 'active' ? 'btn-warning' : 'btn-success'}" onclick="adminDashboard.toggleShopStatus('${shop.id}')">
                        ${shop.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteShop('${shop.id}')">Delete</button>
                </div>
            </div>
        `).join('');
        
        console.log(`✅ Displayed ${this.shops.length} shops`);
    }
    
    editShop(id) {
        const shop = this.shops.find(s => s.id === id);
        if (shop) {
            this.openShopModal(shop);
        }
    }
    
    // Order Management
    loadOrders() {
        console.log('📊 Loading orders into table...');
        console.log(`📊 Total orders to display: ${this.orders.length}`);
        console.log('📊 Orders data:', this.orders);
        
        // Use the centralized display function
        this.displayOrdersInTable(this.orders);
        
        console.log('✅ Orders loaded successfully');
    }
    
    // Enhanced order filtering with proper data handling
    filterOrders() {
        console.log('🔄 Filtering orders...');
        
        const statusFilter = document.getElementById('orderStatusFilter').value;
        const searchQuery = document.getElementById('orderSearchInput').value.toLowerCase().trim();
        
        console.log('🔍 Filter criteria:', { status: statusFilter, search: searchQuery });
        
        let filteredOrders = this.orders;
        
        // Filter by status
        if (statusFilter && statusFilter !== '') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        // Filter by search query (name or order ID)
        if (searchQuery) {
            filteredOrders = filteredOrders.filter(order => {
                const orderName = (order.name || '').toLowerCase();
                const orderId = (order.tracking_id || order.id || '').toLowerCase();
                const orderEmail = (order.email || '').toLowerCase();
                
                return orderName.includes(searchQuery) || 
                       orderId.includes(searchQuery) || 
                       orderEmail.includes(searchQuery);
            });
        }
        
        console.log(`📊 Showing ${filteredOrders.length} orders (filtered from ${this.orders.length} total)`);
        
        // Use the same comprehensive order display logic
        this.displayOrdersInTable(filteredOrders);
        
        // Update clear search button visibility
        this.updateClearSearchButton();
    }
    
    // Search orders by name or order ID
    searchOrders(query) {
        console.log('🔍 Searching orders for:', query);
        
        if (!query || query.trim() === '') {
            // If search is empty, just apply status filter
            this.filterOrders();
            return;
        }
        
        const searchQuery = query.toLowerCase().trim();
        const statusFilter = document.getElementById('orderStatusFilter').value;
        
        let filteredOrders = this.orders;
        
        // Filter by status first
        if (statusFilter && statusFilter !== '') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        // Then filter by search query
        filteredOrders = filteredOrders.filter(order => {
            const orderName = (order.name || '').toLowerCase();
            const orderId = (order.tracking_id || order.id || '').toLowerCase();
            const orderEmail = (order.email || '').toLowerCase();
            
            return orderName.includes(searchQuery) || 
                   orderId.includes(searchQuery) || 
                   orderEmail.includes(searchQuery);
        });
        
        console.log(`🔍 Search results: ${filteredOrders.length} orders found`);
        
        // Display filtered results
        this.displayOrdersInTable(filteredOrders);
        
        // Update clear search button visibility
        this.updateClearSearchButton();
    }
    
    // Update clear search button visibility
    updateClearSearchButton() {
        const searchInput = document.getElementById('orderSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        
        if (searchInput.value.trim() !== '') {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }
    
    // Clear search and show all orders
    clearSearch() {
        document.getElementById('orderSearchInput').value = '';
        this.filterOrders();
    }
    
    // Centralized order display function
    displayOrdersInTable(ordersToDisplay) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) {
            console.error('❌ Orders table body not found!');
            return;
        }
        
        console.log(`📊 Displaying ${ordersToDisplay.length} orders in table`);
        console.log('📊 Sample order data:', ordersToDisplay[0] || 'No orders');
        
        tbody.innerHTML = '';
        
        if (ordersToDisplay.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                        No orders found matching the current filter
                    </td>
                </tr>
            `;
            return;
        }
        
        ordersToDisplay.forEach((order, index) => {
            console.log(`📊 Processing order ${index + 1}:`, order);
            
            const row = document.createElement('tr');
            const trackingId = order.tracking_id || order.id;
            const orderName = order.name || 'N/A';
            const orderEmail = order.email || 'N/A';
            const orderCity = order.city || 'N/A';
            const orderWhatsApp = order.whatsapp || 'N/A';
            const itemsCount = this.getItemsCount(order);
                    const totalUSD = parseFloat(order.totalUSD || order.total_usd || 0);
        const orderStatus = order.status || 'Submitted';
        const orderDate = order.timestamp ? new Date(order.timestamp).toLocaleDateString() : 'N/A';
        
        // Debug logging for order display
        console.log('🔍 Order display debug:', {
            trackingId,
            orderName,
            totalUSD,
            totalUSD_type: typeof totalUSD,
            order_totalUSD: order.totalUSD,
            order_total_usd: order.total_usd,
            order_totals: order.totals
        });
            
            console.log(`📊 Order ${index + 1} processed:`, {
                trackingId, orderName, itemsCount, totalUSD, orderStatus, orderDate
            });
            
            row.innerHTML = `
                <td><strong>${trackingId}</strong></td>
                <td>
                    <div class="order-customer">
                        <strong>${orderName}</strong><br>
                        <small>${orderEmail}</small><br>
                        <small>${orderCity}</small><br>
                        <small>${orderWhatsApp}</small>
                    </div>
                </td>
                <td>${itemsCount} items</td>
                <td>$${parseFloat(totalUSD).toFixed(2)}</td>
                <td>
                    <select class="status-select" onchange="adminDashboard.updateOrderStatusInBackend('${trackingId}', this.value)">
                        ${Object.values(JEBLI_CONFIG.STATUSES).map(status => 
                            `<option value="${status}" ${status === orderStatus ? 'selected' : ''}>${status}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>${orderDate}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewOrder('${trackingId}')">
                        👁️ View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteOrder('${trackingId}')" style="margin-left: 5px;">
                        🗑️ Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Successfully displayed ${ordersToDisplay.length} orders in table`);
    }
    
    // Dashboard
    updateDashboard() {
        document.getElementById('activeDiscountsCount').textContent = 
            this.discounts.filter(d => d.status === 'active').length;
        
        document.getElementById('totalShopsCount').textContent = this.shops.length;
        
        document.getElementById('totalOrdersCount').textContent = this.orders.length;
        
        const totalRevenue = this.orders.reduce((sum, order) => sum + parseFloat(order.totalUSD || order.total_usd || 0), 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        
        // Show live indicators for orders and revenue
        this.showLiveIndicators();
        
        // Update recent orders
        this.updateRecentOrders();
    }
    
    showLiveIndicators() {
        const ordersIndicator = document.getElementById('ordersLiveIndicator');
        const revenueIndicator = document.getElementById('revenueLiveIndicator');
        
        if (ordersIndicator && revenueIndicator) {
            // Show indicators
            ordersIndicator.style.display = 'flex';
            revenueIndicator.style.display = 'flex';
            
            // Hide after 5 seconds
            setTimeout(() => {
                ordersIndicator.style.display = 'none';
                revenueIndicator.style.display = 'none';
            }, 5000);
        }
    }
    
    updateRecentOrders() {
        const recentOrdersContainer = document.getElementById('recentOrders');
        if (!recentOrdersContainer) return;
        
        if (this.orders.length === 0) {
            recentOrdersContainer.innerHTML = `
                <div class="activity-item">
                    <span class="activity-text">No recent orders</span>
                    <span class="activity-time">-</span>
                </div>
            `;
            return;
        }
        
        // Get last 5 orders
        const recentOrders = this.orders
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        recentOrdersContainer.innerHTML = recentOrders.map(order => {
            const orderDate = new Date(order.timestamp);
            const timeAgo = this.getTimeAgo(orderDate);
            
            return `
                <div class="activity-item">
                    <div class="activity-content">
                        <span class="activity-text">
                            <strong>${order.name}</strong> - $${order.totalUSD.toFixed(2)}
                        </span>
                        <span class="activity-details">
                            ${order.items.length} items • ${order.city}
                        </span>
                    </div>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
        }).join('');
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
    

    
    // Order Management Functions
    viewOrder(trackingId) {
        const order = this.orders.find(o => o.tracking_id === trackingId || o.id === trackingId);
        if (order) {
            this.showOrderDetailsModal(order);
        }
    }
    
    // Show order details in a modal
    showOrderDetailsModal(order) {
        // Debug logging for order data
        console.log('🔍 Showing order details modal for:', order.tracking_id || order.id);
        console.log('🔍 Full order data:', order);
        console.log('🔍 Order items:', order.items);
        console.log('🔍 Order items_json:', order.items_json);
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Order Details - ${order.tracking_id || order.id}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-details-grid">
                        <div class="order-section">
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> ${order.name || 'N/A'}</p>
                            <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
                            <p><strong>City:</strong> ${order.city || 'N/A'}</p>
                            <p><strong>WhatsApp:</strong> ${order.whatsapp || 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${this.getStatusClass(order.status)}">${order.status || 'Submitted'}</span></p>
                            <p><strong>Date:</strong> ${order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A'}</p>
                        </div>
                        
                        <div class="order-section">
                            <h4>Order Summary</h4>
                            <p><strong>Items:</strong> ${this.getItemsCount(order)}</p>
                            <p><strong>Subtotal (TL):</strong> ₺${parseFloat(order.subtotalTL || order.subtotal_tl || 0).toFixed(2)}</p>
                            <p><strong>Subtotal (USD):</strong> $${parseFloat(order.subtotalUSD || order.subtotal_usd || 0).toFixed(2)}</p>
                            <p><strong>Service Fee:</strong> $${parseFloat(order.serviceFeeUSD || order.service_fee_usd || 0).toFixed(2)}</p>
                            <p><strong>Shipping:</strong> $${parseFloat(order.shippingUSD || order.shipping_usd || 0).toFixed(2)}</p>
                            <p><strong>Total:</strong> $${parseFloat(order.totalUSD || order.total_usd || 0).toFixed(2)}</p>
                            <p><strong>Weight:</strong> ${parseFloat(order.totalWeightKg || order.total_weight_kg || 0).toFixed(2)} kg</p>
                        </div>
                    </div>
                    
                    <div class="order-section">
                        <h4>Product Items</h4>
                        <div class="items-list">
                            ${this.renderOrderItems(order)}
                        </div>
                    </div>
                    
                    ${order.notes ? `
                    <div class="order-section">
                        <h4>Customer Notes</h4>
                        <p>${order.notes}</p>
                    </div>
                    ` : ''}
                    
                    ${order.admin_notes ? `
                    <div class="order-section">
                        <h4>Admin Notes</h4>
                        <p>${order.admin_notes}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Get items count from order
    getItemsCount(order) {
        if (order.items && Array.isArray(order.items)) {
            return order.items.length;
        }
        if (order.items_json) {
            try {
                const items = JSON.parse(order.items_json);
                return Array.isArray(items) ? items.length : 0;
            } catch (e) {
                console.error('Error parsing items_json:', e);
                return 0;
            }
        }
        return 0;
    }
    
    // Render order items
    renderOrderItems(order) {
        let items = [];
        
        if (order.items && Array.isArray(order.items)) {
            items = order.items;
        } else if (order.items_json) {
            try {
                items = JSON.parse(order.items_json);
            } catch (e) {
                console.error('Error parsing items_json:', e);
                items = [];
            }
        }
        
        if (items.length === 0) {
            return '<p class="muted">No items found</p>';
        }
        
        // Debug logging for items data
        console.log('🔍 Rendering items for order:', order.tracking_id || order.id);
        console.log('🔍 Items data:', items);
        items.forEach((item, index) => {
            console.log(`🔍 Item ${index + 1}:`, {
                url: item.url,
                size: item.size,
                size_type: typeof item.size,
                size_trimmed: item.size ? item.size.trim() : 'undefined',
                size_is_empty: item.size === '',
                color: item.color,
                color_type: typeof item.color,
                color_trimmed: item.color ? item.color.trim() : 'undefined',
                color_is_empty: item.color === '',
                qty: item.qty,
                priceTL: item.priceTL,
                weightKg: item.weightKg
            });
        });
        
        return items.map((item, index) => {
            // Handle different possible field names for size and color
            // Check if the value exists and is not just an empty string
            const size = (item.size && item.size.trim() !== '') ? item.size : 
                        (item.sizeText && item.sizeText.trim() !== '') ? item.sizeText : 
                        (item.sizeValue && item.sizeValue.trim() !== '') ? item.sizeValue : 
                        'Not specified';
                        
            const color = (item.color && item.color.trim() !== '') ? item.color : 
                         (item.colorText && item.colorText.trim() !== '') ? item.colorText : 
                         (item.colorValue && item.colorValue.trim() !== '') ? item.colorValue : 
                         'Not specified';
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <strong>Item ${index + 1}</strong>
                    </div>
                    <div class="item-details">
                        <p><strong>URL:</strong> <a href="${item.url || '#'}" target="_blank" rel="noopener">${item.url || 'N/A'}</a></p>
                        <p><strong>Size:</strong> ${size}</p>
                        <p><strong>Color:</strong> ${color}</p>
                        <p><strong>Quantity:</strong> ${item.qty || item.quantity || 1}</p>
                        ${item.priceTL || item.price ? `<p><strong>Price (TL):</strong> ₺${parseFloat(item.priceTL || item.price || 0).toFixed(2)}</p>` : '<p><strong>Price (TL):</strong> Not specified</p>'}
                        ${item.weightKg || item.weight ? `<p><strong>Weight:</strong> ${parseFloat(item.weightKg || item.weight || 0).toFixed(2)} kg</p>` : '<p><strong>Weight:</strong> Not specified</p>'}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Get status class for styling
    getStatusClass(status) {
        const statusMap = {
            'Submitted': 'status-submitted',
            'Preparing': 'status-preparing',
            'Shipped': 'status-shipped',
            'Delivered': 'status-delivered',
            'Cancelled': 'status-cancelled'
        };
        return statusMap[status] || 'status-submitted';
    }
    
    updateOrderStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            const newStatus = prompt('Enter new status (Submitted/Preparing/Shipped/Delivered/Cancelled):', order.status);
            if (newStatus && Object.values(JEBLI_CONFIG.STATUSES).includes(newStatus)) {
                this.updateOrderStatusInBackend(order.tracking_id, newStatus);
            }
        }
    }
    
    // Enhanced order status update with backend integration
    async updateOrderStatusInBackend(trackingId, newStatus, adminNotes = '') {
        try {
            console.log(`🔄 Updating order ${trackingId} status to ${newStatus}...`);
            
                    const response = await fetch(JEBLI_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                key: JEBLI_CONFIG.API_KEY,
                action: 'update',
                tracking_id: trackingId,
                status: newStatus,
                admin_notes: adminNotes
            })
        });
            
            const result = await response.json();
            
            if (result.ok && result.updated) {
                // Update local order
                const order = this.orders.find(o => o.tracking_id === trackingId);
                if (order) {
                    order.status = newStatus;
                    if (adminNotes) {
                        order.admin_notes = adminNotes;
                    }
                    
                    // Save to localStorage
                    this.saveData();
                    
                    // Refresh displays
                    this.loadOrders();
                    this.updateDashboard();
                    
                    // Show success message
                    this.showToast(`Order status updated to ${newStatus}`, 'success');
                    
                    console.log(`✅ Order ${trackingId} status updated to ${newStatus}`);
                }
            } else {
                throw new Error(result.error || 'Failed to update order status');
            }
            
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            this.showToast(`Failed to update order status: ${error.message}`, 'error');
        }
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Reset revenue and orders
    resetRevenue() {
        if (confirm('Are you sure you want to reset all revenue and orders? This cannot be undone.')) {
            // Track all current orders as deleted to prevent them from reappearing
            const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
            let deletedArray = [];
            if (deletedOrders) {
                try {
                    deletedArray = JSON.parse(deletedOrders);
                } catch (error) {
                    console.error('Error parsing deleted orders:', error);
                    deletedArray = [];
                }
            }
            
            // Add all current orders to deleted orders list
            this.orders.forEach(order => {
                deletedArray.push({
                    tracking_id: order.tracking_id,
                    deleted_at: new Date().toISOString(),
                    order_data: order
                });
            });
            
            // Keep only last 100 deleted orders to prevent localStorage bloat
            if (deletedArray.length > 100) {
                deletedArray = deletedArray.slice(-100);
            }
            
            localStorage.setItem('jebli-admin-deleted-orders', JSON.stringify(deletedArray));
            
            this.orders = [];
            this.saveData();
            
            // Also clear from main website localStorage to prevent duplicates
            localStorage.removeItem('jebli-orders');
            this.loadOrders();
            this.updateDashboard();
            this.showToast('💰 Revenue and orders have been reset to zero.', 'success');
            console.log('💰 Revenue reset: All orders cleared');
        }
    }

    // Delete a specific order
    async deleteOrder(trackingId) {
        const order = this.orders.find(o => o.tracking_id === trackingId);
        if (!order) {
            this.showToast('Order not found', 'error');
            return;
        }

        const confirmMessage = `Are you sure you want to delete order ${trackingId}?\n\nCustomer: ${order.name}\nTotal: $${parseFloat(order.totalUSD || order.total_usd || 0).toFixed(2)}\n\nThis action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            try {
                console.log(`🗑️ Deleting order ${trackingId}...`);
                
                // Remove from local array
                this.orders = this.orders.filter(o => o.tracking_id !== trackingId);
                
                // Add to deleted orders list
                const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
                let deletedArray = [];
                if (deletedOrders) {
                    try {
                        deletedArray = JSON.parse(deletedOrders);
                    } catch (error) {
                        console.error('Error parsing deleted orders:', error);
                        deletedArray = [];
                    }
                }
                
                // Add to deleted orders list
                deletedArray.push({
                    tracking_id: trackingId,
                    deleted_at: new Date().toISOString(),
                    order_data: order
                });
                
                // Keep only last 100 deleted orders to prevent localStorage bloat
                if (deletedArray.length > 100) {
                    deletedArray = deletedArray.slice(-100);
                }
                
                localStorage.setItem('jebli-admin-deleted-orders', JSON.stringify(deletedArray));
                
                // Remove from ALL localStorage locations
                const allOrderKeys = [
                    'jebli-orders',
                    'jebli_admin_orders', 
                    'jebli-orders-backup',
                    'jebli-orders-sync'
                ];
                
                allOrderKeys.forEach(key => {
                    const orders = localStorage.getItem(key);
                    if (orders) {
                        try {
                            const ordersArray = JSON.parse(orders);
                            const filteredOrders = ordersArray.filter(o => o.tracking_id !== trackingId);
                            localStorage.setItem(key, JSON.stringify(filteredOrders));
                            console.log(`🗑️ Removed order ${trackingId} from ${key}`);
                        } catch (error) {
                            console.error(`Error updating ${key}:`, error);
                        }
                    }
                });
                
                // Save current state
                this.saveData();
                
                // Refresh displays
                this.loadOrders();
                this.updateDashboard();
                
                // Show success message
                this.showToast(`Order ${trackingId} deleted successfully`, 'success');
                
                console.log(`✅ Order ${trackingId} deleted successfully`);
                
            } catch (error) {
                console.error('❌ Error deleting order:', error);
                this.showToast(`Failed to delete order: ${error.message}`, 'error');
            }
        }
    }

    // Delete all orders
    deleteAllOrders() {
        if (this.orders.length === 0) {
            this.showToast('No orders to delete', 'info');
            return;
        }

        const confirmMessage = `Are you sure you want to delete ALL ${this.orders.length} orders?\n\nThis will:\n• Remove all order history\n• Reset revenue to $0\n• Clear all tracking IDs\n\nThis action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            try {
                console.log(`🗑️ Deleting all ${this.orders.length} orders...`);
                
                // Track all deleted orders to prevent them from reappearing
                const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
                let deletedArray = [];
                if (deletedOrders) {
                    try {
                        deletedArray = JSON.parse(deletedOrders);
                    } catch (error) {
                        console.error('Error parsing deleted orders:', error);
                        deletedArray = [];
                    }
                }
                
                // Add all current orders to deleted orders list
                this.orders.forEach(order => {
                    deletedArray.push({
                        tracking_id: order.tracking_id,
                        deleted_at: new Date().toISOString(),
                        order_data: order
                    });
                });
                
                // Keep only last 100 deleted orders to prevent localStorage bloat
                if (deletedArray.length > 100) {
                    deletedArray = deletedArray.slice(-100);
                }
                
                localStorage.setItem('jebli-admin-deleted-orders', JSON.stringify(deletedArray));
                
                // Clear all orders
                this.orders = [];
                
                // Save to localStorage
                this.saveData();
                
                // Also clear from main website localStorage to prevent duplicates
                localStorage.removeItem('jebli-orders');
                
                // Refresh displays
                this.loadOrders();
                this.updateDashboard();
                
                // Show success message
                this.showToast(`All orders deleted successfully. Revenue reset to $0.`, 'success');
                
                console.log(`✅ All orders deleted successfully`);
                
            } catch (error) {
                console.error('❌ Error deleting all orders:', error);
                this.showToast(`Failed to delete all orders: ${error.message}`, 'error');
            }
        }
    }
    
    // Clean up orphaned deleted orders from other localStorage locations
    cleanupOrphanedDeletedOrders(deletedTrackingIds) {
        console.log('🧹 Cleaning up orphaned deleted orders from other localStorage locations...');
        
        // Check main website localStorage
        const mainOrders = localStorage.getItem('jebli-orders');
        if (mainOrders) {
            try {
                const mainOrdersArray = JSON.parse(mainOrders);
                const originalCount = mainOrdersArray.length;
                
                // Remove deleted orders
                const filteredMainOrders = mainOrdersArray.filter(order => !deletedTrackingIds.has(order.tracking_id));
                
                if (filteredMainOrders.length !== originalCount) {
                    localStorage.setItem('jebli-orders', JSON.stringify(filteredMainOrders));
                    console.log(`🧹 Cleaned up ${originalCount - filteredMainOrders.length} deleted orders from main website localStorage`);
                }
            } catch (error) {
                console.error('Error cleaning up main website localStorage:', error);
            }
        }
        
        // Check any other potential order storage locations
        const otherOrderKeys = ['jebli-orders'];
        otherOrderKeys.forEach(key => {
            const otherOrders = localStorage.getItem(key);
            if (otherOrders) {
                try {
                    const otherOrdersArray = JSON.parse(otherOrders);
                    const originalCount = otherOrdersArray.length;
                    
                    // Remove deleted orders
                    const filteredOtherOrders = otherOrdersArray.filter(order => !deletedTrackingIds.has(order.tracking_id));
                    
                    if (filteredOtherOrders.length !== originalCount) {
                        localStorage.setItem(key, JSON.stringify(filteredOtherOrders));
                        console.log(`🧹 Cleaned up ${originalCount - filteredOtherOrders.length} deleted orders from ${key}`);
                    }
                } catch (error) {
                    console.error(`Error cleaning up ${key}:`, error);
                }
            }
        });
        
        console.log('✅ Cleanup completed');
    }
    
    // Force cleanup of all localStorage locations to ensure consistency
    forceCleanupAllStorage() {
        console.log('🧹 Force cleaning up all localStorage locations...');
        
        const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
        if (!deletedOrders) {
            console.log('📭 No deleted orders found, nothing to clean up');
            return;
        }
        
        try {
            const deletedArray = JSON.parse(deletedOrders);
            const deletedTrackingIds = new Set(deletedArray.map(order => order.tracking_id));
            console.log(`🗑️ Found ${deletedTrackingIds.size} deleted orders to clean up from all storage`);
            
            // Clean up all potential order storage locations
            const orderStorageKeys = ['jebli-orders', 'jebli_admin_orders'];
            
            orderStorageKeys.forEach(key => {
                const orders = localStorage.getItem(key);
                if (orders) {
                    try {
                        const ordersArray = JSON.parse(orders);
                        const originalCount = ordersArray.length;
                        
                        // Remove deleted orders
                        const filteredOrders = ordersArray.filter(order => !deletedTrackingIds.has(order.tracking_id));
                        
                        if (filteredOrders.length !== originalCount) {
                            localStorage.setItem(key, JSON.stringify(filteredOrders));
                            console.log(`🧹 Cleaned up ${originalCount - filteredOrders.length} deleted orders from ${key}`);
                        }
                    } catch (error) {
                        console.error(`Error cleaning up ${key}:`, error);
                    }
                }
            });
            
            console.log('✅ Force cleanup completed for all storage locations');
            
        } catch (error) {
            console.error('❌ Error during force cleanup:', error);
        }
    }
    
    // Sync orders from main website while respecting deletions
    syncOrdersFromMainWebsite() {
        console.log('🔄 Syncing orders from main website...');
        
        const mainOrders = localStorage.getItem('jebli-orders');
        if (!mainOrders) {
            console.log('📭 No orders found in main website localStorage');
            return;
        }
        
        try {
            const mainOrdersArray = JSON.parse(mainOrders);
            console.log(`📊 Found ${mainOrdersArray.length} orders in main website localStorage`);
            
            // Get deleted orders tracking
            const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
            let deletedTrackingIds = new Set();
            
            if (deletedOrders) {
                try {
                    const deletedArray = JSON.parse(deletedOrders);
                    deletedArray.forEach(order => deletedTrackingIds.add(order.tracking_id));
                    console.log(`🗑️ Found ${deletedTrackingIds.size} deleted orders to respect`);
                } catch (error) {
                    console.error('Error parsing deleted orders in sync:', error);
                }
            }
            
            // Filter out deleted orders and merge with existing admin orders
            const filteredMainOrders = mainOrdersArray.filter(order => !deletedTrackingIds.has(order.tracking_id));
            console.log(`📊 Filtered main orders: ${mainOrdersArray.length} total - ${deletedTrackingIds.size} deleted = ${filteredMainOrders.length} active`);
            
            // Merge with existing admin orders, avoiding duplicates
            const existingTrackingIds = new Set(this.orders.map(order => order.tracking_id));
            const newOrders = filteredMainOrders.filter(order => !existingTrackingIds.has(order.tracking_id));
            
            if (newOrders.length > 0) {
                this.orders = [...this.orders, ...newOrders];
                console.log(`📊 Added ${newOrders.length} new orders from main website`);
                
                // Save to admin localStorage
                this.saveData();
                
                // Refresh displays
                this.loadOrders();
                this.updateDashboard();
                
                this.showToast(`🆕 Synced ${newOrders.length} new orders from main website`, 'success');
            } else {
                console.log('📊 No new orders to sync');
            }
            
        } catch (error) {
            console.error('❌ Error syncing orders from main website:', error);
        }
    }
    
    showToast(message, type = 'info') {
        // Use the new notification system
        this.showNotification(message, type);
    }
    
    showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmAction = document.getElementById('confirmAction');
        
        confirmMessage.textContent = message;
        
        // Remove previous event listeners
        const newConfirmAction = confirmAction.cloneNode(true);
        confirmAction.parentNode.replaceChild(newConfirmAction, confirmAction);
        
        newConfirmAction.addEventListener('click', () => {
            onConfirm();
            this.closeConfirmModal();
        });
        
        modal.classList.add('show');
    }
    
    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('show');
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(link => {
            link.classList.remove('show');
        });
    }
    
    // Data Management
    async loadData() {
        console.log('🔄 Loading data from backend and localStorage...');
        
        try {
            // First, try to load orders from backend
            await this.loadOrdersFromBackend();
            
            // Load other data from localStorage
            const savedDiscounts = localStorage.getItem('jebli-admin-discounts');
            const savedShops = localStorage.getItem('jebli-admin-shops');
            const savedSettings = localStorage.getItem('jebli-admin-settings');
            
            console.log('🔍 Found in localStorage:');
            console.log('  - Discounts:', savedDiscounts ? 'Found' : 'Not found');
            console.log('  - Shops:', savedShops ? 'Found' : 'Not found');
            console.log('  - Settings:', savedSettings ? 'Found' : 'Not found');
            
            if (savedDiscounts) this.discounts = JSON.parse(savedDiscounts);
            if (savedShops) this.shops = JSON.parse(savedShops);
            if (savedSettings) this.settings = JSON.parse(savedSettings);
            
            console.log(`📊 After parsing: ${this.discounts.length} discounts, ${this.shops.length} shops, ${this.orders.length} orders`);
            
            // Filter out deleted orders
            this.filterDeletedOrders();
            
            // Always load default shops if none exist
            if (this.shops.length === 0) {
                console.log('🏪 No shops found, loading default shops...');
                this.loadDefaultShops();
                console.log(`🏪 Default shops loaded: ${this.shops.length} shops`);
            }
            
            console.log(`📊 Final data loaded: ${this.discounts.length} discounts, ${this.shops.length} shops, ${this.orders.length} orders`);
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            // Fallback to localStorage only
            this.loadDataFromLocalStorage();
        }
    }
    
    // Load orders from backend
    async loadOrdersFromBackend() {
        try {
            const response = await fetch(`${JEBLI_CONFIG.API_URL}?action=list&key=${JEBLI_CONFIG.API_KEY}`);
            const data = await response.json();
            
            if (data.ok && data.orders) {
                console.log(`📊 Backend returned ${data.orders.length} orders`);
                
                // Get deleted orders list
                const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
                let deletedTrackingIds = new Set();
                
                if (deletedOrders) {
                    try {
                        const deletedArray = JSON.parse(deletedOrders);
                        deletedArray.forEach(order => deletedTrackingIds.add(order.tracking_id));
                        console.log(`🗑️ Found ${deletedTrackingIds.size} deleted orders to filter out`);
                    } catch (error) {
                        console.error('Error parsing deleted orders:', error);
                    }
                }
                
                // Filter out deleted orders from backend data
                const filteredOrders = data.orders.filter(order => 
                    !deletedTrackingIds.has(order.tracking_id)
                );
                
                console.log(`📊 After filtering deleted orders: ${filteredOrders.length} orders`);
                
                // Set the filtered orders
                this.orders = filteredOrders;
                
                // Save filtered orders to localStorage
                localStorage.setItem('jebli_admin_orders', JSON.stringify(this.orders));
                
                console.log(`✅ Loaded ${this.orders.length} orders from backend (deleted orders filtered out)`);
            } else {
                throw new Error(data.error || 'Failed to load orders from backend');
            }
        } catch (error) {
            console.error('❌ Error loading orders from backend:', error);
            // Fallback to localStorage
            this.loadOrdersFromLocalStorage();
        }
    }
    
    // Load data from localStorage (fallback)
    loadDataFromLocalStorage() {
        console.log('📱 Loading data from localStorage (fallback mode)...');
        
        const savedDiscounts = localStorage.getItem('jebli-admin-discounts');
        const savedShops = localStorage.getItem('jebli-admin-shops');
        const savedOrders = localStorage.getItem('jebli_admin_orders');
        const savedSettings = localStorage.getItem('jebli-admin-settings');
        
        console.log('🔍 Found in localStorage (fallback):');
        console.log('  - Discounts:', savedDiscounts ? 'Found' : 'Not found');
        console.log('  - Shops:', savedShops ? 'Found' : 'Not found');
        console.log('  - Orders:', savedOrders ? 'Found' : 'Not found');
        console.log('  - Settings:', savedSettings ? 'Found' : 'Not found');
        
        if (savedDiscounts) this.discounts = JSON.parse(savedDiscounts);
        if (savedShops) this.shops = JSON.parse(savedShops);
        
        // IMPORTANT: Filter out deleted orders when loading from localStorage fallback
        if (savedOrders) {
            const ordersArray = JSON.parse(savedOrders);
            
            // Check for deleted orders
            const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
            let deletedTrackingIds = new Set();
            
            if (deletedOrders) {
                try {
                    const deletedArray = JSON.parse(deletedOrders);
                    deletedArray.forEach(order => deletedTrackingIds.add(order.tracking_id));
                    console.log(`🗑️ Found ${deletedTrackingIds.size} deleted orders to filter out in fallback`);
                } catch (error) {
                    console.error('Error parsing deleted orders in fallback:', error);
                }
            }
            
            // Filter out deleted orders
            this.orders = ordersArray.filter(order => !deletedTrackingIds.has(order.tracking_id));
            console.log(`📊 Fallback orders: ${ordersArray.length} total - ${deletedTrackingIds.size} deleted = ${this.orders.length} active`);
        }
        
        if (savedSettings) this.settings = JSON.parse(savedSettings);
        
        console.log(`📊 After parsing (fallback): ${this.discounts.length} discounts, ${this.shops.length} shops, ${this.orders.length} orders`);
        
        // Don't merge with main website localStorage to avoid duplicates
        // Admin panel should only use its own localStorage or backend data
        
        // Always load default shops if none exist
        if (this.shops.length === 0) {
            console.log('🏪 No shops found in fallback, loading default shops...');
            this.loadDefaultShops();
            console.log(`🏪 Default shops loaded in fallback: ${this.shops.length} shops`);
        }
        
        console.log(`📊 Final data loaded from localStorage: ${this.discounts.length} discounts, ${this.shops.length} shops, ${this.orders.length} orders`);
    }
    
    saveData() {
        console.log('💾 Saving data to localStorage...');
        console.log(`📊 Saving: ${this.discounts.length} discounts, ${this.shops.length} shops, ${this.orders.length} orders`);
        
        localStorage.setItem('jebli-admin-discounts', JSON.stringify(this.discounts));
        localStorage.setItem('jebli-admin-shops', JSON.stringify(this.shops));
                    localStorage.setItem('jebli_admin_orders', JSON.stringify(this.orders));
        localStorage.setItem('jebli-admin-settings', JSON.stringify(this.settings));
        
        // Also save to main website localStorage for real-time updates
        localStorage.setItem('jebli-discounts', JSON.stringify(this.discounts));
        localStorage.setItem('jebli-shops', JSON.stringify(this.shops));
        
        console.log('✅ Data saved to localStorage. Shops count:', this.shops.length);
        console.log('🏪 Shops saved:', this.shops.map(s => s.name));
        
        // Debug: Check what's actually in localStorage
        const checkAdmin = localStorage.getItem('jebli-admin-shops');
        const checkMain = localStorage.getItem('jebli-shops');
        console.log('🔍 Verification - jebli-admin-shops:', checkAdmin ? 'Found' : 'Not found');
        console.log('🔍 Verification - jebli-shops:', checkMain ? 'Found' : 'Not found');
        
        // Verify the data was actually saved
        try {
            const verifyAdmin = JSON.parse(checkAdmin || '[]');
            const verifyMain = JSON.parse(checkMain || '[]');
            console.log(`🔍 Verification - Admin shops: ${verifyAdmin.length}, Main shops: ${verifyMain.length}`);
        } catch (error) {
            console.error('❌ Error verifying saved data:', error);
        }
    }
    
    loadDefaultDiscounts() {
        this.discounts = [
            {
                id: '1',
                code: 'WELCOME10',
                type: 'percentage',
                value: 10,
                description: '10% off your first order',
                minOrder: 0,
                maxUses: null,
                expiry: null,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                code: 'SAVE20',
                type: 'percentage',
                value: 20,
                description: '20% off your order',
                minOrder: 0,
                maxUses: null,
                expiry: null,
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                code: 'FREESHIP',
                type: 'fixed',
                value: 6,
                description: 'Free shipping (up to $6)',
                minOrder: 0,
                maxUses: null,
                expiry: null,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    loadDefaultShops() {
        this.shops = [
            {
                id: '1',
                name: 'Adidas',
                url: 'https://www.adidas.com',
                logo: 'brand-logos/adidas.png',
                category: 'sport',
                description: 'Official Adidas store for sports and athletic wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Nike',
                url: 'https://www.nike.com',
                logo: 'brand-logos/nike.png',
                category: 'sport',
                description: 'Official Nike store for sports and athletic wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Zara',
                url: 'https://www.zara.com',
                logo: 'brand-logos/zara.jpg',
                category: 'fashion',
                description: 'Trendy fashion clothing and accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'H&M',
                url: 'https://www.hm.com',
                logo: 'brand-logos/h&m.png',
                category: 'fashion',
                description: 'Affordable fashion for everyone',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Mango',
                url: 'https://www.mango.com',
                logo: 'brand-logos/mango.png',
                category: 'fashion',
                description: 'Contemporary fashion and accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Pull&Bear',
                url: 'https://www.pullandbear.com',
                logo: 'brand-logos/pull&bear.png',
                category: 'fashion',
                description: 'Youth fashion and streetwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '7',
                name: 'Bershka',
                url: 'https://www.bershka.com',
                logo: 'brand-logos/bershka.png',
                category: 'fashion',
                description: 'Trendy fashion for young people',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '8',
                name: 'Mavi',
                url: 'https://www.mavi.com',
                logo: 'brand-logos/mavi.png',
                category: 'fashion',
                description: 'Premium denim and casual wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '9',
                name: 'Koton',
                url: 'https://www.koton.com',
                logo: 'brand-logos/koton.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '10',
                name: 'LC Waikiki',
                url: 'https://www.lcwaikiki.com',
                logo: 'brand-logos/lc waikiki.jpg',
                category: 'fashion',
                description: 'Affordable fashion retailer',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '11',
                name: 'Defacto',
                url: 'https://www.defacto.com.tr',
                logo: 'brand-logos/defacto.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '12',
                name: 'Boyner',
                url: 'https://www.boyner.com.tr',
                logo: 'brand-logos/boyner.png',
                category: 'fashion',
                description: 'Premium Turkish department store',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '13',
                name: 'Beymen',
                url: 'https://www.beymen.com',
                logo: 'brand-logos/beymen.png',
                category: 'fashion',
                description: 'Luxury Turkish department store',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '14',
                name: 'Vakko',
                url: 'https://www.vakko.com',
                logo: 'brand-logos/vakko.png',
                category: 'luxury',
                description: 'Premium Turkish fashion house',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '15',
                name: 'Apple',
                url: 'https://www.apple.com',
                logo: 'brand-logos/apple.png',
                category: 'electronics',
                description: 'Premium electronics and technology',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '16',
                name: 'Samsung',
                url: 'https://www.samsung.com',
                logo: 'brand-logos/samsung.png',
                category: 'electronics',
                description: 'Electronics and mobile devices',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '17',
                name: 'Dyson',
                url: 'https://www.dyson.com',
                logo: 'brand-logos/dyson.png',
                category: 'home',
                description: 'Premium home appliances',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '18',
                name: 'Decathlon',
                url: 'https://www.decathlon.com',
                logo: 'brand-logos/decathlon.png',
                category: 'sport',
                description: 'Sports equipment and gear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '19',
                name: 'Converse',
                url: 'https://www.converse.com',
                logo: 'brand-logos/converse.png',
                category: 'shoes',
                description: 'Classic sneakers and footwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '20',
                name: 'Vans',
                url: 'https://www.vans.com',
                logo: 'brand-logos/vans.jpg',
                category: 'shoes',
                description: 'Skateboarding shoes and apparel',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '21',
                name: 'New Balance',
                url: 'https://www.newbalance.com',
                logo: 'brand-logos/new balance.png',
                category: 'shoes',
                description: 'Athletic footwear and apparel',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '22',
                name: 'Puma',
                url: 'https://www.puma.com',
                logo: 'brand-logos/puma.jpg',
                category: 'sport',
                description: 'Sports and lifestyle footwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '23',
                name: 'Under Armour',
                url: 'https://www.underarmour.com',
                logo: 'brand-logos/underarmor.png',
                category: 'sport',
                description: 'Performance athletic wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '24',
                name: 'The North Face',
                url: 'https://www.thenorthface.com',
                logo: 'brand-logos/the north face.png',
                category: 'sport',
                description: 'Outdoor and adventure gear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '25',
                name: 'Columbia',
                url: 'https://www.columbia.com',
                logo: 'brand-logos/columbia.png',
                category: 'sport',
                description: 'Outdoor clothing and gear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '26',
                name: 'Timberland',
                url: 'https://www.timberland.com',
                logo: 'brand-logos/timber land.png',
                category: 'shoes',
                description: 'Outdoor footwear and apparel',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '27',
                name: 'Crocs',
                url: 'https://www.crocs.com',
                logo: 'brand-logos/crocs.png',
                category: 'shoes',
                description: 'Comfortable casual footwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '28',
                name: 'Levi\'s',
                url: 'https://www.levis.com',
                logo: 'brand-logos/levis.png',
                category: 'fashion',
                description: 'Classic denim and casual wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '29',
                name: 'Calvin Klein',
                url: 'https://www.calvinklein.com',
                logo: 'brand-logos/calvin klein.png',
                category: 'fashion',
                description: 'Premium fashion and underwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '30',
                name: 'Guess',
                url: 'https://www.guess.com',
                logo: 'brand-logos/guess.png',
                category: 'fashion',
                description: 'Contemporary fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '31',
                name: 'Gap',
                url: 'https://www.gap.com',
                logo: 'brand-logos/gap.png',
                category: 'fashion',
                description: 'Casual American fashion',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '32',
                name: 'Massimo Dutti',
                url: 'https://www.massimodutti.com',
                logo: 'brand-logos/massimo dutti.png',
                category: 'fashion',
                description: 'Premium fashion and accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '33',
                name: 'Oysho',
                url: 'https://www.oysho.com',
                logo: 'brand-logos/oysho.png',
                category: 'lingerie',
                description: 'Women\'s lingerie and sleepwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '34',
                name: 'Penti',
                url: 'https://www.penti.com',
                logo: 'brand-logos/penti.png',
                category: 'lingerie',
                description: 'Turkish lingerie and home textiles',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '35',
                name: 'Intimissimi',
                url: 'https://www.intimissimi.com',
                logo: 'brand-logos/intimissmi.png',
                category: 'lingerie',
                description: 'Italian lingerie and sleepwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '36',
                name: 'Victoria\'s Secret',
                url: 'https://www.victoriassecret.com',
                logo: 'brand-logos/victorias secret.png',
                category: 'lingerie',
                description: 'Women\'s lingerie and beauty',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '37',
                name: 'Flormar',
                url: 'https://www.flormar.com',
                logo: 'brand-logos/flormar.png',
                category: 'cosmetics',
                description: 'Turkish cosmetics brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '38',
                name: 'Rossmann',
                url: 'https://www.rossmann.de',
                logo: 'brand-logos/rossman.jpg',
                category: 'cosmetics',
                description: 'German drugstore chain',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '39',
                name: 'Gratis',
                url: 'https://www.gratis.com.tr',
                logo: 'brand-logos/gratis.png',
                category: 'cosmetics',
                description: 'Turkish cosmetics and personal care',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '40',
                name: 'English Home',
                url: 'https://www.englishhome.com.tr',
                logo: 'brand-logos/english home.png',
                category: 'home',
                description: 'Home decoration and textiles',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '41',
                name: 'Mudo',
                url: 'https://www.mudo.com.tr',
                logo: 'brand-logos/mudo.png',
                category: 'home',
                description: 'Turkish home decoration',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '42',
                name: 'Pandora',
                url: 'https://www.pandora.net',
                logo: 'brand-logos/pandora.png',
                category: 'accessories',
                description: 'Jewelry and accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '43',
                name: 'Swarovski',
                url: 'https://www.swarovski.com',
                logo: 'brand-logos/swarvoski.png',
                category: 'luxury',
                description: 'Crystal jewelry and accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '44',
                name: 'Saat & Saat',
                url: 'https://www.saatvesaat.com.tr',
                logo: 'brand-logos/saat and saat.png',
                category: 'luxury',
                description: 'Turkish luxury watch retailer',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '45',
                name: 'Swatch',
                url: 'https://www.swatch.com',
                logo: 'brand-logos/swatch.png',
                category: 'accessories',
                description: 'Swiss watch brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '46',
                name: 'Samsonite',
                url: 'https://www.samsonite.com',
                logo: 'brand-logos/samsonite.png',
                category: 'accessories',
                description: 'Luggage and travel accessories',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '47',
                name: 'Trendyol',
                url: 'https://www.trendyol.com',
                logo: 'brand-logos/trendyol.jpg',
                category: 'fashion',
                description: 'Turkish e-commerce platform',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '48',
                name: 'Hepsi Burada',
                url: 'https://www.hepsiburada.com',
                logo: 'brand-logos/hepsi burada.png',
                category: 'electronics',
                description: 'Turkish e-commerce platform',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '49',
                name: 'Media Markt',
                url: 'https://www.mediamarkt.com.tr',
                logo: 'brand-logos/media markt.png',
                category: 'electronics',
                description: 'Electronics and technology retailer',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '50',
                name: 'Modanisa',
                url: 'https://www.modanisa.com',
                logo: 'brand-logos/modanisa.png',
                category: 'hijab_clothing',
                description: 'Modest fashion and hijab clothing',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '51',
                name: 'US Polo Assn',
                url: 'https://www.uspoloassn.com',
                logo: 'brand-logos/us polo assn.png',
                category: 'fashion',
                description: 'American polo and casual wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '52',
                name: 'Twist',
                url: 'https://www.twist.com.tr',
                logo: 'brand-logos/twist.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '53',
                name: 'Troy',
                url: 'https://www.troy.com.tr',
                logo: 'brand-logos/troy.png',
                category: 'fashion',
                description: 'Turkish fashion retailer',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '54',
                name: 'Sketchers',
                url: 'https://www.skechers.com',
                logo: 'brand-logos/sketchesrs.png',
                category: 'shoes',
                description: 'Comfortable casual footwear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '55',
                name: 'Superstep',
                url: 'https://www.superstep.com.tr',
                logo: 'brand-logos/superstep.jpg',
                category: 'shoes',
                description: 'Turkish footwear brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '56',
                name: 'Sneaks Up',
                url: 'https://www.sneaksup.com',
                logo: 'brand-logos/sneaks up.png',
                category: 'shoes',
                description: 'Sneaker and streetwear retailer',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '57',
                name: 'Fashfed',
                url: 'https://www.fashfed.com',
                logo: 'brand-logos/fashfed.png',
                category: 'fashion',
                description: 'Fashion and lifestyle platform',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '58',
                name: 'Armine',
                url: 'https://www.armine.com.tr',
                logo: 'brand-logos/armine.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '59',
                name: 'Benetton',
                url: 'https://www.benetton.com',
                logo: 'brand-logos/benetton.png',
                category: 'fashion',
                description: 'Italian fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '60',
                name: 'Les Benjamins',
                url: 'https://www.lesbenjamins.com',
                logo: 'brand-logos/les benjamins.png',
                category: 'fashion',
                description: 'Turkish streetwear brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '61',
                name: 'Lululemon',
                url: 'https://www.lululemon.com',
                logo: 'brand-logos/lululemon.png',
                category: 'sport',
                description: 'Athletic apparel and yoga wear',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '62',
                name: 'Altın Yıldız',
                url: 'https://www.altinyildiz.com.tr',
                logo: 'brand-logos/altin yildiz.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '63',
                name: 'İpek Yol',
                url: 'https://www.ipekyol.com.tr',
                logo: 'brand-logos/ipek yol.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '64',
                name: 'Kısmet by Milka',
                url: 'https://www.kismetbymilka.com',
                logo: 'brand-logos/kismet by milka.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '65',
                name: 'OXXO',
                url: 'https://www.oxxo.com.tr',
                logo: 'brand-logos/oxxo.png',
                category: 'fashion',
                description: 'Turkish fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '66',
                name: 'Jacadi',
                url: 'https://jacadi.com.tr',
                logo: 'brand-logos/jacadi.jpg',
                category: 'kids_fashion',
                description: 'French luxury kids and baby fashion brand',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: '67',
                name: 'B&G Store',
                url: 'https://www.bgstore.com.tr',
                logo: 'brand-logos/bandg.png',
                category: 'kids_fashion',
                description: 'Turkish kids fashion and accessories store',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear admin session
            localStorage.removeItem('jebli-admin-logged-in');
            localStorage.removeItem('jebli-admin-session');
            
            // Redirect to login page
            window.location.href = 'admin-login.html';
        }
    }
    
    // Clear deleted orders tracking (useful for restoring deleted orders)
    clearDeletedOrdersTracking() {
        if (confirm('Are you sure you want to clear deleted orders tracking? This will allow deleted orders to reappear if they still exist in the backend.')) {
            localStorage.removeItem('jebli-admin-deleted-orders');
            this.showToast('Deleted orders tracking cleared. Deleted orders may reappear on next refresh.', 'info');
            console.log('🗑️ Deleted orders tracking cleared');
        }
    }
    
    // Global functions for onclick attributes
    openDiscountModalGlobal(discount = null) {
        this.openDiscountModal(discount);
    }
    
    openShopModalGlobal(shop = null) {
        this.openShopModal(shop);
    }
    
    clearAllDiscountsGlobal() {
        this.clearAllDiscounts();
    }
    
    clearAllShopsGlobal() {
        this.clearAllShops();
    }
    
    refreshAllShopsGlobal() {
        this.refreshAllShops();
    }
    
    notifyMainWebsite() {
        console.log('Notifying main website of data update...');
        
        // Dispatch a custom event that the main website can listen to
        const event = new CustomEvent('jebli-admin-update', {
            detail: {
                type: 'data-updated',
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
        console.log('Custom event dispatched:', event);
        
        // Also try to notify any open main website tabs
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage({
                    type: 'jebli-admin-update',
                    action: 'refresh-data'
                }, '*');
                console.log('PostMessage sent to opener');
            } catch (e) {
                console.error('Error sending postMessage:', e);
            }
        }
        
        // Try to notify any other open tabs with the same origin
        try {
            localStorage.setItem('jebli-last-update', Date.now().toString());
            console.log('Updated localStorage timestamp');
        } catch (e) {
            console.error('Error updating localStorage:', e);
        }
    }
    
    // Settings Management
    saveSettings() {
        const usdToTlRate = parseFloat(document.getElementById('usdToTlRate').value) || 40.5;
        const shippingRate = parseFloat(document.getElementById('shippingRate').value) || 6;
        const serviceFee = parseFloat(document.getElementById('serviceFee').value) || 15;
        
        this.settings = {
            usdToTlRate,
            shippingRate,
            serviceFee,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('jebli-admin-settings', JSON.stringify(this.settings));
        
        // Also save to main website localStorage for real-time updates
        localStorage.setItem('jebli-usd-to-tl', usdToTlRate.toString());
        localStorage.setItem('jebli-shipping-rate', shippingRate.toString());
        localStorage.setItem('jebli-service-fee', serviceFee.toString());
        
        // Update main website configuration
        this.updateMainWebsiteConfig();
        
        this.showToast('Settings saved successfully! Main website updated in real-time.', 'success');
        console.log('Settings saved:', this.settings);
    }
    
    saveShippingSettings() {
        const shippingRate = parseFloat(document.getElementById('shippingRate').value);
        const serviceFee = parseFloat(document.getElementById('serviceFee').value);
        
        if (shippingRate && shippingRate > 0 && serviceFee && serviceFee >= 0) {
            // Update settings
            this.settings.shippingRate = shippingRate;
            this.settings.serviceFee = serviceFee;
            this.settings.lastUpdated = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('jebli-admin-settings', JSON.stringify(this.settings));
            
            // Update main website
            localStorage.setItem('jebli-shipping-rate', shippingRate.toString());
            localStorage.setItem('jebli-service-fee', serviceFee.toString());
            
            this.updateMainWebsiteConfig();
            
            this.showToast(`Shipping settings updated! Rate: $${shippingRate}/kg, Service Fee: ${serviceFee}%`, 'success');
        } else {
            this.showToast('Please enter valid shipping rate and service fee', 'error');
        }
    }
    
    updateMainWebsiteConfig() {
        // Update the main website's configuration in real-time
        if (window.JEBLI_CONFIG) {
            window.JEBLI_CONFIG.DEFAULT_FX_RATE = this.settings.usdToTlRate;
            window.JEBLI_CONFIG.SHIPPING_PER_KG_USD = this.settings.shippingRate;
            window.JEBLI_CONFIG.SERVICE_FEE_RATE = this.settings.serviceFee / 100; // Convert percentage to decimal
        }
        
        // Dispatch custom event to notify main website
        window.dispatchEvent(new CustomEvent('jebliSettingsUpdated', {
            detail: {
                fxRate: this.settings.usdToTlRate,
                shippingRate: this.settings.shippingRate,
                serviceFee: this.settings.serviceFee
            }
        }));
    }
    
    updateMainWebsiteRate() {
        const newRate = parseFloat(document.getElementById('usdToTlRate').value);
        if (newRate && newRate > 0) {
            // Update main website localStorage
            localStorage.setItem('jebli-usd-to-tl', newRate.toString());
            
            // Save settings
            this.saveSettings();
            
            this.showToast(`USD to TL rate updated to ${newRate}! Main website will use this new rate.`, 'success');
            
            // Notify main website
            this.notifyMainWebsite();
        } else {
            this.showToast('Please enter a valid rate greater than 0', 'error');
        }
    }
    
    loadSettings() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('jebli-admin-settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            
            // Update form fields with saved values
            if (this.settings.usdToTlRate) {
                document.getElementById('usdToTlRate').value = this.settings.usdToTlRate;
            }
            if (this.settings.shippingRate) {
                document.getElementById('shippingRate').value = this.settings.shippingRate;
            }
            if (this.settings.serviceFee) {
                document.getElementById('serviceFee').value = this.settings.serviceFee;
            }
        } else {
            // Set default values
            this.settings = {
                usdToTlRate: 40.5,
                shippingRate: 6,
                serviceFee: 15,
                lastUpdated: new Date().toISOString()
            };
            
            // Update form fields with defaults
            document.getElementById('usdToTlRate').value = this.settings.usdToTlRate;
            document.getElementById('shippingRate').value = this.settings.shippingRate;
            document.getElementById('serviceFee').value = this.settings.serviceFee;
        }
        
        console.log('✅ Settings section loaded with values:', this.settings);
    }

    // Update value hint for discount type
    updateValueHint(type) {
        const valueInput = document.getElementById('discountValue');
        const hint = document.getElementById('valueHint');
        
        if (hint) {
            if (type === 'percentage') {
                hint.textContent = 'Enter percentage (e.g., 10 for 10%)';
                valueInput.placeholder = '10';
                valueInput.max = '100';
            } else {
                hint.textContent = 'Enter fixed amount in USD (e.g., 5 for $5 off)';
                valueInput.placeholder = '5';
                valueInput.max = '';
            }
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast to page
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
        
        console.log(`🍞 Toast shown: ${message} (${type})`);
    }

    refreshOrdersFromStorage() {
        console.log('🔄 Refreshing orders from localStorage...');
        
        // Load orders from localStorage
        const savedOrders = localStorage.getItem('jebli_admin_orders') || localStorage.getItem('jebli-admin-orders');
        if (savedOrders) {
            try {
                const newOrders = JSON.parse(savedOrders);
                console.log(`📊 Found ${newOrders.length} orders in localStorage`);
                console.log('📊 Sample order from localStorage:', newOrders[0] || 'No orders');
                
                // IMPORTANT: Filter out deleted orders before updating the orders array
                const deletedOrders = localStorage.getItem('jebli-admin-deleted-orders');
                let deletedTrackingIds = new Set();
                
                if (deletedOrders) {
                    try {
                        const deletedArray = JSON.parse(deletedOrders);
                        deletedArray.forEach(order => deletedTrackingIds.add(order.tracking_id));
                        console.log(`🗑️ Found ${deletedTrackingIds.size} deleted orders to filter out`);
                    } catch (error) {
                        console.error('Error parsing deleted orders:', error);
                    }
                }
                
                // Filter out deleted orders
                const filteredOrders = newOrders.filter(order => !deletedTrackingIds.has(order.tracking_id));
                console.log(`📊 Filtered orders: ${newOrders.length} total - ${deletedTrackingIds.size} deleted = ${filteredOrders.length} active`);
                
                // IMPORTANT: Clean up any orphaned deleted orders from main localStorage
                if (deletedTrackingIds.size > 0) {
                    this.cleanupOrphanedDeletedOrders(deletedTrackingIds);
                }
                
                // Check if we have new orders (comparing filtered counts)
                const hasNewOrders = filteredOrders.length > this.orders.length;
                
                // Update orders array with filtered orders
                this.orders = filteredOrders;
                
                console.log('📊 Orders array updated with filtered orders, calling loadOrders...');
                
                // Refresh displays
                this.loadOrders();
                this.updateDashboard();
                
                console.log('✅ Orders refreshed successfully');
                
                // Show live indicators and notifications for new orders
                if (hasNewOrders) {
                    this.showLiveIndicators();
                    
                    // Show toast with order details
                    if (filteredOrders.length > 0) {
                        const latestOrder = filteredOrders[filteredOrders.length - 1];
                        const latestOrderTime = new Date(latestOrder.timestamp).getTime();
                        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
                        
                        if (latestOrderTime > fiveMinutesAgo) {
                            const totalUSD = latestOrder.totalUSD || latestOrder.total_usd || 0;
                            this.showToast(`🎉 New order from ${latestOrder.name}! Revenue: $${totalUSD.toFixed(2)}`, 'success');
                        }
                    }
                }
                
            } catch (error) {
                console.error('❌ Error refreshing orders from localStorage:', error);
            }
        } else {
            console.log('📭 No orders found in localStorage');
        }
    }

    // Handle language change
    handleLanguageChange(event) {
        const language = event.target.value;
        this.changeLanguage(language);
    }

    // Handle storage changes
    handleStorageChange(event) {
        if (event.key === 'jebli-orders' || event.key === 'jebli_admin_orders') {
            console.log('💾 Storage change detected, refreshing orders...');
            this.refreshOrdersFromStorage();
        }
    }

    // Change language
    changeLanguage(language) {
        // Implementation for language change
        console.log('🌐 Language changed to:', language);
        // Add your language change logic here
    }

    // Handle discount usage
    handleDiscountUsage(event) {
        const usage = event.detail;
        console.log('💰 Discount usage received:', usage);
        
        // Update discount usage count
        this.updateDiscountUsageStats();
        
        // Show notification
        this.showToast(`Discount ${usage.code} used by ${usage.customerEmail}`, 'success');
        
        // Update discount usage table if visible
        this.loadDiscountUsage();
    }

    // Update discount usage statistics
    updateDiscountUsageStats() {
        const usage = JSON.parse(localStorage.getItem('jebli-discount-usage') || '[]');
        const totalUsage = usage.length;
        const totalSavings = usage.reduce((sum, u) => sum + (u.discountAmount || 0), 0);
        
        // Update stats display
        const totalUsageElement = document.getElementById('totalDiscountUsage');
        const totalSavingsElement = document.getElementById('totalDiscountSavings');
        
        if (totalUsageElement) {
            totalUsageElement.textContent = totalUsage;
        }
        
        if (totalSavingsElement) {
            totalSavingsElement.textContent = `$${totalSavings.toFixed(2)}`;
        }
        
        console.log('📊 Discount usage stats updated:', { totalUsage, totalSavings });
    }

    // Load discount usage for admin viewing
    loadDiscountUsage() {
        const usage = JSON.parse(localStorage.getItem('jebli-discount-usage') || '[]');
        const tbody = document.getElementById('discountUsageTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (usage.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No discount usage recorded yet</td></tr>';
            return;
        }
        
        // Sort by most recent first
        const sortedUsage = usage.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedUsage.forEach(usageItem => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${usageItem.code}</strong></td>
                <td>${usageItem.customerEmail}</td>
                <td>${usageItem.trackingId}</td>
                <td>$${usageItem.discountAmount.toFixed(2)}</td>
                <td>${new Date(usageItem.timestamp).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="adminDashboard.viewOrderDetails('${usageItem.trackingId}')">
                        View Order
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Discount usage table loaded:', usage.length, 'entries');
    }

    // View order details from discount usage
    viewOrderDetails(trackingId) {
        const orders = JSON.parse(localStorage.getItem('jebli_admin_orders') || '[]');
        const order = orders.find(o => o.tracking_id === trackingId);
        
        if (order) {
            // Navigate to orders section and show this order
            this.navigateToSection('orders');
            this.showOrderDetails(order);
        } else {
            this.showToast('Order not found', 'error');
        }
    }

    // Show order details in a modal
    showOrderDetails(order) {
        // Create and show order details modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order Details - ${order.tracking_id}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-details-grid">
                        <div class="detail-section">
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> ${order.customer.name}</p>
                            <p><strong>Email:</strong> ${order.customer.email}</p>
                            <p><strong>City:</strong> ${order.customer.city}</p>
                            <p><strong>WhatsApp:</strong> ${order.customer.whatsapp}</p>
                        </div>
                        <div class="detail-section">
                            <h4>Order Summary</h4>
                            <p><strong>Items:</strong> ${order.items.length}</p>
                            <p><strong>Subtotal:</strong> $${order.totals.subtotalUSD.toFixed(2)}</p>
                            <p><strong>Service Fee:</strong> $${order.totals.serviceFeeUSD.toFixed(2)}</p>
                            <p><strong>Shipping:</strong> $${order.totals.shippingUSD.toFixed(2)}</p>
                            ${order.discount ? `<p><strong>Discount (${order.discount.code}):</strong> -$${order.discount.discountAmount.toFixed(2)}</p>` : ''}
                            <p><strong>Total:</strong> $${order.totals.totalUSD.toFixed(2)}</p>
                        </div>
                        <div class="detail-section">
                            <h4>Items</h4>
                            <div class="order-items-list">
                                ${order.items.map(item => `
                                    <div class="order-item">
                                        <p><strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></p>
                                        <p><strong>Price:</strong> ${item.priceTL} TL / $${item.priceUSD.toFixed(2)}</p>
                                        <p><strong>Weight:</strong> ${item.weightKg} kg</p>
                                        <p><strong>Quantity:</strong> ${item.qty}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Setup navigation listeners
    setupNavigationListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.navigateToSection(sectionId);
            });
        });
        
        console.log('✅ Navigation listeners setup complete');
    }

    // Setup form and modal event listeners
    setupFormAndModalListeners() {
        // Discount type change
        const discountType = document.getElementById('discountType');
        if (discountType) {
            discountType.addEventListener('change', (e) => {
                this.updateValueHint(e.target.value);
            });
        }
        
        // Form submissions
        const discountForm = document.getElementById('discountForm');
        if (discountForm) {
            discountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDiscount();
            });
        }
        
        const shopForm = document.getElementById('shopForm');
        if (shopForm) {
            shopForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveShop();
            });
        }
        
        // Modal close buttons
        const closeDiscountModal = document.getElementById('closeDiscountModal');
        if (closeDiscountModal) {
            closeDiscountModal.addEventListener('click', () => {
                this.closeDiscountModal();
            });
        }
        
        const closeShopModal = document.getElementById('closeShopModal');
        if (closeShopModal) {
            closeShopModal.addEventListener('click', () => {
                this.closeShopModal();
            });
        }
        
        // Cancel buttons
        const cancelDiscount = document.getElementById('cancelDiscount');
        if (cancelDiscount) {
            cancelDiscount.addEventListener('click', () => {
                this.closeDiscountModal();
            });
        }
        
        const cancelShop = document.getElementById('cancelShop');
        if (cancelShop) {
            cancelShop.addEventListener('click', () => {
                this.closeShopModal();
            });
        }
        
        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
        
        console.log('✅ Form and modal listeners setup complete');
    }

    // Load dashboard statistics
    loadDashboardStats() {
        // Update discount usage stats
        this.updateDiscountUsageStats();
        
        // Update other dashboard stats
        const activeDiscounts = this.discounts.filter(d => d.status === 'active').length;
        const activeDiscountsElement = document.getElementById('activeDiscountsCount');
        if (activeDiscountsElement) {
            activeDiscountsElement.textContent = activeDiscounts;
        }
        
        console.log('✅ Dashboard stats loaded');
    }

    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(link => {
            link.classList.remove('show');
        });
    }

    // Close discount modal
    closeDiscountModal() {
        document.getElementById('discountModal').classList.remove('show');
    }

    // Close shop modal
    closeShopModal() {
        document.getElementById('shopModal').classList.remove('show');
    }
}

// Initialize the admin dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Global functions for backward compatibility
function filterOrders(status) {
    if (window.adminDashboard) {
        window.adminDashboard.filterOrders(status);
    } else {
        console.error('Admin dashboard not initialized yet');
    }
}

function clearSearch() {
    if (window.adminDashboard) {
        window.adminDashboard.clearSearch();
    } else {
        console.error('Admin dashboard not initialized yet');
    }
}


