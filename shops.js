// ===== SHOPS FUNCTIONALITY =====



// Complete shops data with all available brands
const SHOPS_DATA = [
    // Featured Marketplaces
    {
        name: "Trendyol",
        category: "marketplace",
        description: "Turkish fashion marketplace with great deals",
        url: "https://www.trendyol.com",
        logo: "brand-logos/trendyol.jpg",
        status: "active"
    },
    {
        name: "Hepsi Burada",
        category: "electronics",
        description: "Turkish e-commerce marketplace",
        url: "https://www.hepsiburada.com",
        logo: "brand-logos/hepsi burada.png",
        status: "active"
    },

    // Women's Fashion
    {
        name: "Zara",
        category: "womens-fashion",
        description: "Trendy women's fashion and accessories",
        url: "https://www.zara.com/tr/en",
        logo: "brand-logos/zara.jpg",
        status: "active"
    },
    {
        name: "H&M",
        category: "womens-fashion",
        description: "Affordable women's fashion and accessories",
        url: "https://www2.hm.com/tr_tr/index.html",
        logo: "brand-logos/h&m.png",
        status: "active"
    },
    {
        name: "Mango",
        category: "womens-fashion",
        description: "Contemporary women's fashion and accessories",
        url: "https://shop.mango.com/tr/kadin",
        logo: "brand-logos/mango.png",
        status: "active"
    },
    {
        name: "Pull & Bear",
        category: "womens-fashion",
        description: "Youthful women's fashion and streetwear",
        url: "https://www.pullandbear.com/tr",
        logo: "brand-logos/pull&bear.png",
        status: "active"
    },
    {
        name: "Bershka",
        category: "womens-fashion",
        description: "Trendy women's fashion for young people",
        url: "https://www.bershka.com/tr",
        logo: "brand-logos/bershka.png",
        status: "active"
    },
    {
        name: "Massimo Dutti",
        category: "womens-fashion",
        description: "Premium women's fashion and accessories",
        url: "https://www.massimodutti.com/tr",
        logo: "brand-logos/massimo dutti.png",
        status: "active"
    },

    // Men's Fashion
    {
        name: "Zara Men",
        category: "mens-fashion",
        description: "Trendy men's fashion and accessories",
        url: "https://www.zara.com/tr/en/man",
        logo: "brand-logos/zara.jpg",
        status: "active"
    },
    {
        name: "H&M Men",
        category: "mens-fashion",
        description: "Affordable men's fashion and accessories",
        url: "https://www2.hm.com/tr_tr/erkek.html",
        logo: "brand-logos/h&m.png",
        status: "active"
    },
    {
        name: "Pull & Bear Men",
        category: "mens-fashion",
        description: "Youthful men's fashion and streetwear",
        url: "https://www.pullandbear.com/tr/erkek",
        logo: "brand-logos/pull&bear.png",
        status: "active"
    },
    {
        name: "Bershka Men",
        category: "mens-fashion",
        description: "Trendy men's fashion for young people",
        url: "https://www.bershka.com/tr/erkek",
        logo: "brand-logos/bershka.png",
        status: "active"
    },
    {
        name: "Massimo Dutti Men",
        category: "mens-fashion",
        description: "Premium men's fashion and accessories",
        url: "https://www.massimodutti.com/tr/erkek",
        logo: "brand-logos/massimo dutti.png",
        status: "active"
    },
    {
        name: "Benetton",
        category: "mens-fashion",
        description: "Colorful fashion for all ages",
        url: "https://www.benetton.com/tr",
        logo: "brand-logos/benetton.png",
        status: "active"
    },
    {
        name: "Gap",
        category: "fashion",
        description: "Casual American fashion",
        url: "https://www.gap.com.tr",
        logo: "brand-logos/gap.png",
        status: "active"
    },
    {
        name: "Levi's",
        category: "fashion",
        description: "Iconic denim and casual wear",
        url: "https://www.levi.com.tr",
        logo: "brand-logos/levis.png",
        status: "active"
    },
    {
        name: "US Polo Assn",
        category: "fashion",
        description: "Classic American polo fashion",
        url: "https://www.uspoloassn.com.tr",
        logo: "brand-logos/us polo assn.png",
        status: "active"
    },
    {
        name: "Koton",
        category: "fashion",
        description: "Turkish fashion retailer",
        url: "https://www.koton.com/tr",
        logo: "brand-logos/koton.png",
        status: "active"
    },
    {
        name: "Mavi",
        category: "fashion",
        description: "Turkish denim brand",
        url: "https://www.mavi.com.tr",
        logo: "brand-logos/mavi.png",
        status: "active"
    },
    {
        name: "DeFacto",
        category: "fashion",
        description: "Turkish fashion brand",
        url: "https://www.defacto.com.tr",
        logo: "brand-logos/defacto.png",
        status: "active"
    },
    {
        name: "LC Waikiki",
        category: "fashion",
        description: "Turkish fashion retailer",
        url: "https://www.lcwaikiki.com/tr-TR",
        logo: "brand-logos/lc waikiki.jpg",
        status: "active"
    },
    {
        name: "Boyner",
        category: "fashion",
        description: "Turkish department store",
        url: "https://www.boyner.com.tr",
        logo: "brand-logos/boyner.png",
        status: "active"
    },
    {
        name: "Twist",
        category: "fashion",
        description: "Turkish fashion brand",
        url: "https://www.twist.com.tr",
        logo: "brand-logos/twist.png",
        status: "active"
    },
    {
        name: "İpek Yol",
        category: "fashion",
        description: "Turkish fashion retailer",
        url: "https://www.ipekyol.com.tr",
        logo: "brand-logos/ipek yol.png",
        status: "active"
    },
    {
        name: "Vakko",
        category: "fashion",
        description: "Turkish luxury fashion",
        url: "https://www.vakko.com.tr",
        logo: "brand-logos/vakko.png",
        status: "active"
    },
    {
        name: "Vakkorama",
        category: "fashion",
        description: "Turkish fashion retailer",
        url: "https://www.vakkorama.com.tr",
        logo: "brand-logos/Vakkorama.jpg",
        status: "active"
    },
    {
        name: "Altın Yıldız",
        category: "fashion",
        description: "Turkish fashion brand",
        url: "https://www.altinyildiz.com.tr",
        logo: "brand-logos/altin yildiz.png",
        status: "active"
    },
    {
        name: "Les Benjamins",
        category: "fashion",
        description: "Turkish streetwear brand",
        url: "https://www.lesbenjamins.com.tr",
        logo: "brand-logos/les benjamins.png",
        status: "active"
    },
    {
        name: "ADL",
        category: "fashion",
        description: "Turkish fashion brand",
        url: "https://www.adl.com.tr",
        logo: "brand-logos/adl.png",
        status: "active"
    },
    {
        name: "Beymen",
        category: "fashion",
        description: "Turkish luxury department store",
        url: "https://www.beymen.com.tr",
        logo: "brand-logos/beymen.png",
        status: "active"
    },
    {
        name: "OXXO",
        category: "fashion",
        description: "Turkish fashion retailer",
        url: "https://www.oxxo.com.tr",
        logo: "brand-logos/oxxo.png",
        status: "active"
    },
    {
        name: "Fashfed",
        category: "fashion",
        description: "Turkish fashion marketplace",
        url: "https://www.fashfed.com.tr",
        logo: "brand-logos/fashfed.png",
        status: "active"
    },
    {
        name: "Modanisa",
        category: "fashion",
        description: "Islamic fashion and modest wear",
        url: "https://www.modanisa.com.tr",
        logo: "brand-logos/modanisa.png",
        status: "active"
    },
    {
        name: "Penti",
        category: "fashion",
        description: "Turkish lingerie and fashion",
        url: "https://www.penti.com.tr",
        logo: "brand-logos/penti.png",
        status: "active"
    },
    {
        name: "Intimissimi",
        category: "fashion",
        description: "Italian lingerie brand",
        url: "https://www.intimissimi.com.tr",
        logo: "brand-logos/intimissmi.png",
        status: "active"
    },
    {
        name: "Victoria's Secret",
        category: "fashion",
        description: "American lingerie and beauty",
        url: "https://www.victoriassecret.com.tr",
        logo: "brand-logos/victorias secret.png",
        status: "active"
    },
    {
        name: "Oysho",
        category: "fashion",
        description: "Spanish lingerie and sportswear",
        url: "https://www.oysho.com.tr",
        logo: "brand-logos/oysho.png",
        status: "active"
    },
    {
        name: "Guess",
        category: "fashion",
        description: "American fashion brand",
        url: "https://www.guess.com.tr",
        logo: "brand-logos/guess.png",
        status: "active"
    },
    {
        name: "Calvin Klein",
        category: "fashion",
        description: "American fashion and underwear",
        url: "https://www.calvinklein.com.tr",
        logo: "brand-logos/calvin klein.png",
        status: "active"
    },

    // Sports & Athletic
    {
        name: "Nike",
        category: "sport",
        description: "Official Nike store with latest sports gear and footwear",
        url: "https://www.nike.com/tr",
        logo: "brand-logos/nike.png",
        status: "active"
    },
    {
        name: "Adidas",
        category: "sport",
        description: "Premium sportswear and athletic equipment",
        url: "https://www.adidas.com.tr",
        logo: "brand-logos/adidas.png",
        status: "active"
    },
    {
        name: "Puma",
        category: "sport",
        description: "Sports lifestyle and athletic wear",
        url: "https://tr.puma.com",
        logo: "brand-logos/puma.jpg",
        status: "active"
    },
    {
        name: "Under Armour",
        category: "sport",
        description: "Performance athletic wear",
        url: "https://www.underarmour.com.tr",
        logo: "brand-logos/underarmor.png",
        status: "active"
    },
    {
        name: "New Balance",
        category: "sport",
        description: "Athletic footwear and sportswear",
        url: "https://www.newbalance.com.tr",
        logo: "brand-logos/new balance.png",
        status: "active"
    },
    {
        name: "Lululemon",
        category: "sport",
        description: "Premium yoga and athletic wear",
        url: "https://www.lululemon.com.tr",
        logo: "brand-logos/lululemon.png",
        status: "active"
    },
    {
        name: "Converse",
        category: "sport",
        description: "Iconic sneakers and casual wear",
        url: "https://www.converse.com.tr",
        logo: "brand-logos/converse.png",
        status: "active"
    },
    {
        name: "Vans",
        category: "sport",
        description: "Skateboarding and lifestyle footwear",
        url: "https://www.vans.com.tr",
        logo: "brand-logos/vans.jpg",
        status: "active"
    },
    {
        name: "Crocs",
        category: "sport",
        description: "Comfortable casual footwear",
        url: "https://www.crocs.com.tr",
        logo: "brand-logos/crocs.png",
        status: "active"
    },
    {
        name: "Columbia",
        category: "sport",
        description: "Outdoor and adventure gear",
        url: "https://www.columbia.com.tr",
        logo: "brand-logos/columbia.png",
        status: "active"
    },
    {
        name: "The North Face",
        category: "sport",
        description: "Outdoor clothing and equipment",
        url: "https://www.thenorthface.com.tr",
        logo: "brand-logos/the north face.png",
        status: "active"
    },
    {
        name: "Timberland",
        category: "sport",
        description: "Outdoor footwear and clothing",
        url: "https://www.timberland.com.tr",
        logo: "brand-logos/timber land.png",
        status: "active"
    },
    {
        name: "Skechers",
        category: "sport",
        description: "Comfortable walking and casual shoes",
        url: "https://www.skechers.com.tr",
        logo: "brand-logos/sketchesrs.png",
        status: "active"
    },
    {
        name: "Sneaks Up",
        category: "sport",
        description: "Sneaker and streetwear retailer",
        url: "https://www.sneaksup.com.tr",
        logo: "brand-logos/sneaks up.png",
        status: "active"
    },
    {
        name: "Decathlon",
        category: "sport",
        description: "Sports equipment and outdoor gear",
        url: "https://www.decathlon.com.tr",
        logo: "brand-logos/decathlon.png",
        status: "active"
    },
    {
        name: "Superstep",
        category: "sport",
        description: "Sports footwear and equipment",
        url: "https://www.superstep.com.tr",
        logo: "brand-logos/superstep.jpg",
        status: "active"
    },

    // Electronics & Technology
    {
        name: "Apple",
        category: "electronics",
        description: "Latest iPhones, iPads, and Mac computers",
        url: "https://www.apple.com/tr",
        logo: "brand-logos/apple.png",
        status: "active"
    },
    {
        name: "Samsung",
        category: "electronics",
        description: "Smartphones, TVs, and home appliances",
        url: "https://www.samsung.com/tr",
        logo: "brand-logos/samsung.png",
        status: "active"
    },
    {
        name: "Media Markt",
        category: "electronics",
        description: "Electronics and home appliances",
        url: "https://www.mediamarkt.com.tr",
        logo: "brand-logos/media markt.png",
        status: "active"
    },
    {
        name: "Dyson",
        category: "electronics",
        description: "Premium home appliances and technology",
        url: "https://www.dyson.com.tr",
        logo: "brand-logos/dyson.png",
        status: "active"
    },

    // Beauty & Cosmetics
    {
        name: "Flormar",
        category: "beauty",
        description: "Turkish cosmetics and beauty products",
        url: "https://www.flormar.com.tr",
        logo: "brand-logos/flormar.png",
        status: "active"
    },
    {
        name: "Gratis",
        category: "beauty",
        description: "Turkish beauty and personal care",
        url: "https://www.gratis.com.tr",
        logo: "brand-logos/gratis.png",
        status: "active"
    },
    {
        name: "Rossman",
        category: "beauty",
        description: "German drugstore and beauty retailer",
        url: "https://www.rossmann.com.tr",
        logo: "brand-logos/rossman.jpg",
        status: "active"
    },
    {
        name: "Kismet by Milka",
        category: "beauty",
        description: "Turkish beauty brand",
        url: "https://www.kismetbymilka.com.tr",
        logo: "brand-logos/kismet by milka.png",
        status: "active"
    },

    // Jewelry & Accessories
    {
        name: "Swarovski",
        category: "jewelry",
        description: "Crystal jewelry and accessories",
        url: "https://www.swarovski.com.tr",
        logo: "brand-logos/swarvoski.png",
        status: "active"
    },
    {
        name: "Pandora",
        category: "jewelry",
        description: "Charm bracelets and jewelry",
        url: "https://www.pandora.net/tr",
        logo: "brand-logos/pandora.png",
        status: "active"
    },
    {
        name: "Swatch",
        category: "jewelry",
        description: "Swiss watches and accessories",
        url: "https://www.swatch.com.tr",
        logo: "brand-logos/swatch.png",
        status: "active"
    },
    {
        name: "Saat & Saat",
        category: "jewelry",
        description: "Turkish watch retailer",
        url: "https://www.saatvesaat.com.tr",
        logo: "brand-logos/saat and saat.png",
        status: "active"
    },

    // Home & Lifestyle
    {
        name: "English Home",
        category: "home_lifestyle",
        description: "Home decor and lifestyle products",
        url: "https://www.englishhome.com.tr",
        logo: "brand-logos/english home.png",
        status: "active"
    },
    {
        name: "Mudo",
        category: "home_lifestyle",
        description: "Turkish home decor and furniture",
        url: "https://www.mudo.com.tr",
        logo: "brand-logos/mudo.png",
        status: "active"
    },
    {
        name: "Armine",
        category: "home_lifestyle",
        description: "Turkish home and garden products",
        url: "https://www.armine.com.tr",
        logo: "brand-logos/armine.png",
        status: "active"
    },

    // Luggage & Travel
    {
        name: "Samsonite",
        category: "travel",
        description: "Premium luggage and travel accessories",
        url: "https://www.samsonite.com.tr",
        logo: "brand-logos/samsonite.png",
        status: "active"
    },
    {
        name: "Troy",
        category: "travel",
        description: "Turkish luggage and travel brand",
        url: "https://www.troy.com.tr",
        logo: "brand-logos/troy.png",
        status: "active"
    },

    // Marketplace
    
    // Kids & Baby Fashion
    {
        name: "Jacadi",
        category: "kids_fashion",
        description: "French luxury kids and baby fashion brand",
        url: "https://jacadi.com.tr",
        logo: "brand-logos/jacadi.jpg",
        status: "active"
    },
    {
        name: "B&G Store",
        category: "kids_fashion",
        description: "Turkish kids fashion and accessories store",
        url: "https://www.bgstore.com.tr",
        logo: "brand-logos/bandg.png",
        status: "active"
    }
];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Initializing shops page...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Display shops
    displayShops(SHOPS_DATA);
    
    // Set initial language selector value
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        if (window.currentLanguage) {
            langSelect.value = window.currentLanguage;
        }
    }
    
    console.log('✅ Shops page initialized successfully');
});

// Setup event listeners
function setupEventListeners() {
    console.log('🔧 Setting up shops page event listeners...');
    
    // Language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        console.log('✅ Language selector found in shops page, setting up event listener');
        langSelect.addEventListener('change', handleLanguageChange);
        
        // Set initial value
        if (window.currentLanguage) {
            langSelect.value = window.currentLanguage;
        } else {
            // Default to English if no language is set
            langSelect.value = 'en';
        }
    }
    
    console.log('✅ Shops page event listeners setup complete');
    
    // Ensure language selector is synced
    if (typeof window.syncLanguageSelector === 'function') {
        window.syncLanguageSelector();
    }
}

// Language functionality
function handleLanguageChange(event) {
    const newLang = event.target.value;
    console.log(`🔄 Shops page language change requested: ${newLang}`);
    
    if (typeof window.changeLanguage === 'function') {
        window.changeLanguage(newLang);
    }
}

// Display shops
function displayShops(shops) {
    const shopsGrid = document.getElementById('shopsGrid');
    if (!shopsGrid) return;
    
    if (shops.length === 0) {
        shopsGrid.innerHTML = `
            <div class="card center" style="grid-column: 1 / -1;">
                <h3 data-i18n="no_shops_found">No shops found</h3>
                <p class="muted" data-i18n="try_adjusting_filters">Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    shopsGrid.innerHTML = shops.map(shop => {
        // Create a unique key for each shop's description
        const shopKey = shop.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const descKey = `shop_${shopKey}_desc`;
        
        return `
            <div class="shop-card" data-category="${shop.category}">
                <img src="${shop.logo}" alt="${shop.name}" class="shop-logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yMCAyMEg2MFY2MEgyMFYyMFoiIGZpbGw9IiVFQkVFOEU4Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg1MFY1MEgzMFYzMFoiIGZpbGw9IiNBQ0E1OUQ5Ii8+Cjwvc3ZnPgo='">
                <h3 class="shop-name">${shop.name}</h3>
                <p class="shop-description" data-i18n="${descKey}">${shop.description}</p>
                <span class="shop-category" data-i18n="category_${shop.category}">${shop.category}</span>
                <a href="${shop.url}" target="_blank" class="shop-link" data-i18n="visit_shop">Visit Shop</a>
            </div>
        `;
    }).join('');
}

// Filter shops
function filterShops() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const searchFilter = document.getElementById('searchFilter')?.value || '';
    
    let filteredShops = SHOPS_DATA;
    
    // Filter by category
    if (categoryFilter) {
        filteredShops = filteredShops.filter(shop => shop.category === categoryFilter);
    }
    
    // Filter by search term
    if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        filteredShops = filteredShops.filter(shop => 
            shop.name.toLowerCase().includes(searchLower) ||
            shop.description.toLowerCase().includes(searchLower) ||
            shop.category.toLowerCase().includes(searchLower)
        );
    }
    
    displayShops(filteredShops);
}

// Refresh shops (placeholder for admin integration)
function refreshShops() {
    console.log('🔄 Refreshing shops...');
    // In real implementation, this would fetch from admin dashboard
    displayShops(SHOPS_DATA);
}



// Add shop card styles to the page
const shopStyles = `
<style>
.shop-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.shop-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow);
}

.shop-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.shop-logo {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sand-50);
    border-radius: 12px;
    overflow: hidden;
}

.shop-logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
}

.shop-info {
    flex: 1;
}

.shop-name {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
}

.shop-category {
    display: inline-block;
    padding: 4px 12px;
    background: var(--sand-300);
    color: var(--white);
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.shop-description {
    margin: 0 0 16px 0;
    color: var(--taupe-500);
    line-height: 1.6;
}

.shop-url {
    color: var(--charcoal-600);
    text-decoration: none;
    font-size: 0.875rem;
    word-break: break-all;
    display: block;
    margin-bottom: 16px;
}

.shop-url:hover {
    text-decoration: underline;
    color: var(--black);
}

.shop-status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.shop-status.active {
    background: #dcfce7;
    color: #166534;
}

.shop-status.inactive {
    background: #fef2f2;
    color: #991b1b;
}

.shop-actions {
    margin-top: 16px;
}

.shop-actions .btn {
    width: 100%;
    text-align: center;
}

@media (max-width: 768px) {
    .shop-header {
        flex-direction: column;
        text-align: center;
    }
    
    .shop-logo {
        width: 80px;
        height: 80px;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', shopStyles);

// ===== MOBILE MENU FUNCTIONALITY =====

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;
    
    if (!mobileMenuBtn || !mainNav) {
        console.log('❌ Mobile menu elements not found');
        return;
    }
    
    console.log('✅ Setting up mobile menu...');
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        const isActive = mainNav.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close menu when clicking close button
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
    
    // Close menu when clicking on nav links
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenuBtn.contains(event.target) && !mainNav.contains(event.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize (if switching to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    console.log('✅ Mobile menu setup complete');
}

// Open mobile menu
function openMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;
    
    if (!mobileMenuBtn || !mainNav) return;
    
    mobileMenuBtn.classList.add('active');
    mainNav.classList.add('active');
    body.style.overflow = 'hidden'; // Prevent background scrolling
    
    console.log('📱 Mobile menu opened');
}

// Close mobile menu
function closeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;
    
    if (!mobileMenuBtn || !mainNav) return;
    
    mobileMenuBtn.classList.remove('active');
    mainNav.classList.remove('active');
    body.style.overflow = ''; // Restore scrolling
    
    console.log('📱 Mobile menu closed');
}

// Initialize mobile menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupMobileMenu();
});
