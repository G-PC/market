// ============================================
// ПОЛЬЗОВАТЕЛИ
// ============================================
let users = [
    { id: 1, email: 'admin@mail.ru', password: '123456', role: 'admin', name: 'Администратор' },
    { id: 2, email: 'user@mail.ru', password: '123456', role: 'user', name: 'Иван Петров' },
    { id: 3, email: 'pvz@mail.ru', password: '123456', role: 'pvz', name: 'ПВЗ №1' }
];
let nextUserId = 4;

// ============================================
// ТОВАРЫ
// ============================================
let products = [
    { id: 1, name: 'Смартфон Xiaomi', price: 25000, description: 'Отличный смартфон' },
    { id: 2, name: 'Наушники Sony', price: 5000, description: 'Беспроводные наушники' },
    { id: 3, name: 'Чехол для телефона', price: 800, description: 'Силиконовый чехол' },
    { id: 4, name: 'Зарядное устройство', price: 1200, description: 'Быстрая зарядка 65W' },
    { id: 5, name: 'Клавиатура механическая', price: 4500, description: 'Механическая клавиатура' }
];
let nextProductId = 6;

// ============================================
// ЗАКАЗЫ
// ============================================
let orders = [
    { id: 1, userId: 2, products: [{id: 1, quantity: 1}], total: 25000, status: 'new', date: '2026-08-20', pvzId: 3 },
    { id: 2, userId: 2, products: [{id: 2, quantity: 2}], total: 10000, status: 'processing', date: '2026-08-21', pvzId: 3 }
];
let nextOrderId = 3;

// ============================================
// LOCAL STORAGE
// ============================================
function loadData() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) { 
        try { 
            const p = JSON.parse(savedUsers); 
            if (p && p.length > 0) users = p; 
        } catch(e) {} 
    }
    
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) { 
        try { 
            const p = JSON.parse(savedProducts); 
            if (p && p.length > 0) products = p; 
        } catch(e) {} 
    }
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) { 
        try { 
            const p = JSON.parse(savedOrders); 
            if (p && p.length > 0) orders = p; 
        } catch(e) {} 
    }
    
    const savedNextUserId = localStorage.getItem('nextUserId');
    if (savedNextUserId) nextUserId = Number(savedNextUserId);
    
    const savedNextProductId = localStorage.getItem('nextProductId');
    if (savedNextProductId) nextProductId = Number(savedNextProductId);
    
    const savedNextOrderId = localStorage.getItem('nextOrderId');
    if (savedNextOrderId) nextOrderId = Number(savedNextOrderId);
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('nextUserId', String(nextUserId));
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('nextProductId', String(nextProductId));
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('nextOrderId', String(nextOrderId));
}

function saveAll() {
    saveUsers();
    saveProducts();
    saveOrders();
}

// Загружаем данные при старте
loadData();

// ============================================
// ТОВАРЫ: ФУНКЦИИ
// ============================================
function getProduct(id) {
    return products.find(p => p.id === id);
}

function getProducts() {
    return products;
}

function addProduct(name, price, description) {
    const product = { 
        id: nextProductId++, 
        name, 
        price: Number(price), 
        description: description || '' 
    };
    products.push(product);
    saveProducts();
    return product;
}

function updateProduct(id, data) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...data };
        saveProducts();
        return true;
    }
    return false;
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveProducts();
}

// ============================================
// ЗАКАЗЫ: ФУНКЦИИ
// ============================================
function createOrder(userId, items) {
    const total = items.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    const order = {
        id: nextOrderId++,
        userId: userId,
        products: items,
        total: total,
        status: 'new',
        date: new Date().toISOString().split('T')[0],
        pvzId: 3
    };
    orders.push(order);
    saveOrders();
    return order;
}

function getUserOrders(userId) {
    return orders.filter(o => o.userId === userId);
}

function getPVZOrders(pvzId) {
    return orders.filter(o => o.pvzId === pvzId);
}

function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        saveOrders();
        return true;
    }
    return false;
}

function getAllOrders() {
    return orders;
}

// ============================================
// КОРЗИНА
// ============================================
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(productId, quantity) {
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity: quantity });
    }
    saveCart(cart);
    // НЕ ВЫЗЫВАЕМ renderCatalog()!
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

function clearCart() {
    saveCart([]);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);
}

function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll('#cartCount').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline' : 'none';
    });
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
function showNotification(message, type = 'info') {
    const old = document.querySelector('.notification');
    if (old) old.remove();
    
    const colors = { 
        success: '#4CAF50', 
        error: '#f44336', 
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    div.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || '#333'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(div);
    
    // Добавляем стиль анимации, если ещё нет
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// ============================================
// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ
// ============================================
window.users = users;
window.products = products;
window.orders = orders;
window.nextUserId = nextUserId;
window.nextProductId = nextProductId;
window.nextOrderId = nextOrderId;

window.loadData = loadData;
window.saveUsers = saveUsers;
window.saveProducts = saveProducts;
window.saveOrders = saveOrders;
window.saveAll = saveAll;

window.getProduct = getProduct;
window.getProducts = getProducts;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;

window.createOrder = createOrder;
window.getUserOrders = getUserOrders;
window.getPVZOrders = getPVZOrders;
window.updateOrderStatus = updateOrderStatus;
window.getAllOrders = getAllOrders;

window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.updateCartBadge = updateCartBadge;

window.showNotification = showNotification;

console.log('🛍️ Маркет загружен!');
console.log('👥 Пользователей:', users.length);
console.log('📦 Товаров:', products.length);
console.log('📋 Заказов:', orders.length);
console.log('🛒 Товаров в корзине:', getCartCount());
