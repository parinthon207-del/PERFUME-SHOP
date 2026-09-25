// ==========================================
// 1. BASE CLASS (Abstraction & Base Model)
// ==========================================
class BaseProduct {
    #id;
    #price;

    constructor(id, name, brand, price, image) {
        this.#id = id;
        this.name = name.replace(/["']/g, ''); // Encapsulation & Clean string
        this.brand = brand;
        this.#price = price;
        this.image = image;
    }

    // Encapsulation: Getter / Setter
    getId() {
        return this.#id;
    }

    getPrice() {
        return this.#price;
    }

    // Polymorphism: Method ที่ถูกเตรียมไว้ให้อนุพัทธ์ (Subclass) Override
    getFormattedDetails() {
        return `ราคา ฿${this.#price.toLocaleString()}`;
    }
}

// ==========================================
// 2. INHERITANCE & POLYMORPHISM
// ==========================================
class Perfume extends BaseProduct {
    constructor(id, name, brand, type, volume, price, details, image) {
        // Inheritance: เรียกใช้ constructor ของคลาสแม่ (BaseProduct)
        super(id, name, brand, price, image);
        this.type = type;
        this.volume = volume;
        this.details = details;
    }

    // Polymorphism (Method Overriding): ปรับเปลี่ยนการทำงานจากคลาสแม่
    getFormattedDetails() {
        return `${this.type} | ${this.volume}ml - ฿${this.getPrice().toLocaleString()}`;
    }
}

// ==========================================
// 3. ENCAPSULATION (Cart Item Management)
// ==========================================
class CartItem {
    #quantity;

    constructor(product, quantity = 1) {
        this.product = product; // Instance ของ Perfume
        this.#quantity = quantity;
    }

    getQuantity() {
        return this.#quantity;
    }

    setQuantity(amount) {
        if (amount >= 0) {
            this.#quantity = amount;
        }
    }

    increment() {
        this.#quantity += 1;
    }

    decrement() {
        this.#quantity -= 1;
    }

    getTotalPrice() {
        return this.product.getPrice() * this.#quantity;
    }
}

// ==========================================
// 4. SHOPPING CART CLASS (Business Logic)
// ==========================================
class ShoppingCart {
    constructor() {
        this.items = []; // Array ของ CartItem
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.product.getId() === product.getId());
        if (existingItem) {
            existingItem.increment();
        } else {
            this.items.push(new CartItem(product, 1));
        }
    }

    updateQuantity(productId, change) {
        const item = this.items.find(i => i.product.getId() === productId);
        if (!item) return;

        if (change > 0) {
            item.increment();
        } else {
            item.decrement();
            if (item.getQuantity() <= 0) {
                this.removeItem(productId);
            }
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.product.getId() !== productId);
    }

    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.getQuantity(), 0);
    }

    getTotalAmount() {
        return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    }

    clear() {
        this.items = [];
    }
}

// ==========================================
// 5. UI MANAGER CLASS (DOM & Event Handling)
// ==========================================
class UIManager {
    constructor(productsData) {
        this.products = productsData.map(p => 
            new Perfume(p.id, p.name, p.brand, p.type, p.volume, p.price, p.details, p.image)
        );
        this.cart = new ShoppingCart();
        this.activeCategory = 'ALL';
    }

    init() {
        this.renderProducts(this.products);
        this.updateCartUI();
    }

    renderProducts(productsToRender) {
        const grid = document.getElementById('product-grid');
        if (!grid) return;

        if (productsToRender.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16 text-[#8C827A]">
                    <i class="fa-solid fa-magnifying-glass text-2xl mb-2"></i>
                    <p class="text-xs">ไม่พบรายการน้ำหอมที่ค้นหา</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = productsToRender.map(product => `
            <div class="bg-white rounded-xl p-5 border border-[#8C827A]/20 flex flex-col justify-between hover:border-[#C5A070] transition-all duration-300 group shadow-sm">
                <div>
                    <div class="relative overflow-hidden rounded-lg mb-4 bg-[#FDFBF7] aspect-square">
                        <img src="${product.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${product.name}">
                        <span class="absolute top-2.5 left-2.5 bg-[#181716] text-[#FDFBF7] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            ${product.type}
                        </span>
                    </div>

                    <p class="text-[10px] text-[#C5A070] font-bold uppercase tracking-widest mb-1">${product.brand}</p>
                    <h3 class="text-base font-bold text-[#181716] mb-1 leading-snug">${product.name}</h3>
                    <p class="text-xs text-[#8C827A] font-normal mb-4 line-clamp-2">${product.details}</p>
                </div>

                <div class="pt-3 border-t border-[#8C827A]/15 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-[#8C827A] block">${product.volume}ml</span>
                        <span class="text-base font-bold text-[#181716]">฿${product.getPrice().toLocaleString()}</span>
                    </div>
                    <button onclick="app.addToCart(${product.getId()})" class="px-4 py-2 rounded-lg btn-primary text-xs font-medium transition active:scale-95">
                        + เพิ่ม
                    </button>
                </div>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.getId() === productId);
        if (!product) return;

        this.cart.addItem(product);
        this.updateCartUI();
        this.showToast(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
    }

    updateQuantity(productId, change) {
        this.cart.updateQuantity(productId, change);
        this.updateCartUI();
    }

    removeFromCart(productId) {
        this.cart.removeItem(productId);
        this.updateCartUI();
    }

    updateCartUI() {
        const container = document.getElementById('cart-items-container');
        const badge = document.getElementById('cart-badge');
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');

        if (!container || !badge || !subtotalEl || !totalEl) return;

        badge.innerText = this.cart.getTotalCount();

        if (this.cart.items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 text-[#8C827A]">
                    <i class="fa-solid fa-bag-shopping text-3xl mb-3 text-[#8C827A]/50"></i>
                    <p class="text-xs font-medium">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
            `;
            subtotalEl.innerText = '฿0';
            totalEl.innerText = '฿0';
            return;
        }

        container.innerHTML = this.cart.items.map(item => `
            <div class="flex items-center space-x-3 bg-white p-3 rounded-lg border border-[#8C827A]/15 shadow-sm">
                <img src="${item.product.image}" alt="${item.product.name}" class="w-14 h-14 object-cover rounded-md bg-[#FDFBF7]">
                <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-bold text-[#181716] truncate">${item.product.name}</h4>
                    <p class="text-[10px] text-[#8C827A]">${item.product.getFormattedDetails()}</p>
                    
                    <div class="flex items-center space-x-2 mt-2">
                        <button onclick="app.updateQuantity(${item.product.getId()}, -1)" class="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-[#181716] flex items-center justify-center text-xs font-bold">-</button>
                        <span class="text-xs font-bold text-[#181716]">${item.getQuantity()}</span>
                        <button onclick="app.updateQuantity(${item.product.getId()}, 1)" class="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-[#181716] flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-bold text-[#181716] block">฿${item.getTotalPrice().toLocaleString()}</span>
                    <button onclick="app.removeFromCart(${item.product.getId()})" class="text-[#8C827A] hover:text-red-500 text-xs mt-2 transition">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const totalAmount = `฿${this.cart.getTotalAmount().toLocaleString()}`;
        subtotalEl.innerText = totalAmount;
        totalEl.innerText = totalAmount;
    }

    handleSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const filtered = this.products.filter(p => 
            (this.activeCategory === 'ALL' || p.type === this.activeCategory) &&
            (p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query))
        );
        this.renderProducts(filtered);
    }

    filterCategory(category, event) {
        this.activeCategory = category;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        if (event && event.currentTarget) event.currentTarget.classList.add('active');
        this.handleSearch();
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        if (!toast || !toastMessage) return;

        toastMessage.innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 2500);
    }

    handleCheckout() {
        if (this.cart.items.length === 0) {
            this.showToast('กรุณาเลือกสินค้าลงตะกร้าก่อนสั่งซื้อ');
            return;
        }

        this.cart.clear();
        this.updateCartUI();
        toggleCartModal();

        setTimeout(() => openSuccessModal(), 350);
    }
}

// --- MOCK DATA ---
const productsData = [
    {
        id: 1,
        name: "SANTAL 33",
        brand: "LE LABO",
        type: "EDP",
        volume: 100,
        price: 10500,
        details: "กลิ่นไม้หอมในตำนาน อบอุ่นด้วย Sandalwood, Cedarwood และ Cardamom",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        name: "BLEU DE CHANEL",
        brand: "CHANEL",
        type: "EDP",
        volume: 100,
        price: 6700,
        details: "กลิ่นหอมสดชื่น ลุ่มลึก นุ่มนวล เผยเสน่ห์ความเป็นผู้ชายอย่างมีสไตล์",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        name: "SAUVAGE",
        brand: "DIOR",
        type: "EDT",
        volume: 100,
        price: 5200,
        details: "กลิ่นหอมสดชื่น ทรงพลัง ด้วยส่วนผสมของ Bergamot และ Ambroxan",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 4,
        name: "BACCHARAT ROUGE 540",
        brand: "MAISON FRANCIS KURKDJIAN",
        type: "EDP",
        volume: 70,
        price: 11500,
        details: "กลิ่นหอมหวานละมุน มะลิ และ Saffron ผสานความอบอุ่นของ Amberwood",
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800"
    }
];

// INITIALIZE APP
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new UIManager(productsData);
    app.init();
});

// GLOBAL HELPER FUNCTIONS FOR HTML EVENTS
function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    const panel = document.getElementById('cart-panel');
    if (!modal || !panel) return;

    if (modal.classList.contains('invisible')) {
        modal.classList.remove('invisible', 'opacity-0');
        setTimeout(() => panel.classList.remove('translate-x-full'), 10);
    } else {
        panel.classList.add('translate-x-full');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('invisible'), 350);
    }
}

function handleSearch() { app.handleSearch(); }
function filterCategory(cat, ev) { app.filterCategory(cat, ev); }
function handleCheckout() { app.handleCheckout(); }

// Success Pop-up Modal (แสดงผล 2.5 วินาที แล้วปิดให้อัตโนมัติ)
function openSuccessModal() {
    const modal = document.getElementById('checkout-success-modal');
    const panel = document.getElementById('success-panel');
    const icon = document.getElementById('success-icon');

    if (!modal || !panel) return;

    panel.classList.remove('animate-pop-in');
    if (icon) icon.classList.remove('animate-check-pop');

    // แสดง Modal
    modal.classList.remove('invisible', 'opacity-0');

    setTimeout(() => {
        panel.classList.add('animate-pop-in');
        if (icon) icon.classList.add('animate-check-pop');
    }, 10);

    // ⏳ สั่งปิด Modal อัตโนมัติหลังผ่านไป 2.5 วินาที (2500ms)
    setTimeout(() => {
        closeSuccessModal();
    }, 2500);
}

function closeSuccessModal() {
    const modal = document.getElementById('checkout-success-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('invisible'), 300);
}