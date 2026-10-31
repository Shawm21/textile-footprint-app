// ==========================================================================
// AUTHENTICATION & ORDER DATABASE MANAGEMENT
// Handles user login, registration, admin credentials, session persistence,
// and complete per-user order database history
// ==========================================================================

const AUTH_STORAGE_KEY = 'textile_user_session';
const USERS_DB_KEY = 'textile_users_db';
const ORDERS_DB_KEY = 'textile_orders_db';
const CLOUD_DB_BASE = 'https://kvdb.io/58kgo4aeL9FzTJNjzKsmVK';

/**
 * Fetch and merge registered users from the central cloud database
 */
async function syncUsersFromCloud() {
    try {
        const res = await fetch(`${CLOUD_DB_BASE}/users?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
            const cloudUsers = await res.json();
            if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
                const localUsers = getUsersDB();
                const userMap = new Map();
                localUsers.forEach(u => {
                    if (u && u.username) userMap.set(u.username.toLowerCase(), u);
                });
                cloudUsers.forEach(u => {
                    if (u && u.username) {
                        const uname = u.username.toLowerCase();
                        if (uname === 'admin') {
                            userMap.set('admin', {
                                username: 'admin',
                                email: u.email || 'admin@textile.eco',
                                password: '1234',
                                name: u.name || 'Administrator',
                                company: u.company || 'Textile Operations Command',
                                role: 'System Administrator',
                                registeredAt: u.registeredAt || '2026-01-01T00:00:00.000Z'
                            });
                        } else {
                            userMap.set(uname, u);
                        }
                    }
                });
                if (!userMap.has('admin')) {
                    userMap.set('admin', {
                        username: 'admin',
                        email: 'admin@textile.eco',
                        password: '1234',
                        name: 'Administrator',
                        company: 'Textile Operations Command',
                        role: 'System Administrator',
                        registeredAt: '2026-01-01T00:00:00.000Z'
                    });
                }
                const merged = Array.from(userMap.values());
                localStorage.setItem(USERS_DB_KEY, JSON.stringify(merged));
                return merged;
            }
        }
    } catch (e) {
        console.warn('Cloud users sync offline or unreachable:', e);
    }
    return getUsersDB();
}

/**
 * Push all registered users to the central cloud database
 */
async function syncUsersToCloud(users) {
    try {
        const toSend = users || getUsersDB();
        await fetch(`${CLOUD_DB_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: JSON.stringify(toSend)
        });
        return true;
    } catch (e) {
        console.warn('Cloud users push error:', e);
        return false;
    }
}

/**
 * Fetch and merge orders from the central cloud database
 */
async function syncOrdersFromCloud() {
    try {
        const res = await fetch(`${CLOUD_DB_BASE}/orders?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
            const cloudOrders = await res.json();
            if (Array.isArray(cloudOrders)) {
                const localOrders = getOrdersDB();
                const orderMap = new Map();
                localOrders.forEach(o => orderMap.set(o.id, o));
                cloudOrders.forEach(o => orderMap.set(o.id, o));
                const merged = Array.from(orderMap.values()).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(merged));
                return merged;
            }
        }
    } catch (e) {
        console.warn('Cloud orders sync offline:', e);
    }
    return getOrdersDB();
}

/**
 * Push all orders to the central cloud database
 */
async function syncOrdersToCloud(orders) {
    try {
        const toSend = orders || getOrdersDB();
        await fetch(`${CLOUD_DB_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: JSON.stringify(toSend)
        });
        return true;
    } catch (e) {
        console.warn('Cloud orders push error:', e);
        return false;
    }
}

/**
 * Initialize user database with default Admin if empty
 */
function initUsersDB() {
    let users = [];
    try {
        const raw = localStorage.getItem(USERS_DB_KEY);
        users = raw ? JSON.parse(raw) : [];
    } catch (e) {
        users = [];
    }

    const adminIndex = users.findIndex(u => u && u.username && u.username.toLowerCase() === 'admin');
    const adminRecord = {
        username: 'admin',
        email: 'admin@textile.eco',
        password: '1234',
        name: 'Administrator',
        company: 'Textile Operations Command',
        role: 'System Administrator',
        registeredAt: '2026-01-01T00:00:00.000Z'
    };

    if (adminIndex === -1) {
        users.unshift(adminRecord);
    } else {
        // Enforce password 1234 and required properties
        users[adminIndex] = {
            ...users[adminIndex],
            ...adminRecord,
            password: '1234'
        };
    }
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    return users;
}

/**
 * Get all registered users
 */
function getUsersDB() {
    return initUsersDB();
}

/**
 * Register a new user and persist to database
 */
function registerUser(userData) {
    const { name, company, username, email, password } = userData;

    if (!name || !username || !password) {
        return { success: false, message: 'Name, username, and password are required.' };
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (password.length < 4) {
        return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const users = getUsersDB();

    // Check if username or email already taken
    const exists = users.some(u => 
        u.username.toLowerCase() === trimmedUser || 
        (trimmedEmail && u.email && u.email.toLowerCase() === trimmedEmail)
    );

    if (exists) {
        return { success: false, message: 'Username or email already exists. Please choose another.' };
    }

    const newUser = {
        username: trimmedUser,
        email: trimmedEmail || `${trimmedUser}@textile.eco`,
        password: password,
        name: name.trim(),
        company: (company || 'Textile Mill').trim(),
        role: 'Sustainability Specialist',
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

    // Instantly sync to cloud database so other devices and admin panel see it
    syncUsersToCloud(users).catch(err => console.warn('Cloud sync error on registration', err));

    return { success: true, user: newUser };
}

/**
 * Log in a user and set session
 */
function loginUser(identifier, password, remember = true) {
    if (!identifier || password === undefined || password === null || password === '') {
        return { success: false, message: 'Please provide both username/email and password.' };
    }

    const trimmedId = String(identifier).trim().toLowerCase();
    const trimmedPass = String(password).trim();

    // Primary System Administrator login guarantee
    if ((trimmedId === 'admin' || trimmedId === 'admin@textile.eco') && (trimmedPass === '1234' || password === '1234')) {
        const sessionUser = {
            username: 'admin',
            email: 'admin@textile.eco',
            name: 'Administrator',
            role: 'System Administrator',
            company: 'Textile Operations Command',
            loginTime: new Date().toISOString()
        };
        const targetStorage = remember ? localStorage : sessionStorage;
        targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
        initUsersDB();
        return { success: true, user: sessionUser };
    }

    const users = getUsersDB();

    // Find user by username or email
    const user = users.find(u => 
        (u && u.username && u.username.toLowerCase() === trimmedId) || 
        (u && u.email && u.email.toLowerCase() === trimmedId)
    );

    if (!user) {
        return { success: false, message: 'User not found. Please register first or verify credentials.' };
    }

    if (user.password !== password && user.password !== trimmedPass) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }

    // Create session (without exposing raw password)
    const sessionUser = {
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        loginTime: new Date().toISOString()
    };

    const targetStorage = remember ? localStorage : sessionStorage;
    targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
}

/**
 * Returns currently logged-in user object or null
 */
function getCurrentUser() {
    try {
        const session = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Log out and redirect to login page
 */
function logoutUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'login.html';
}

/**
 * Guard routes: redirect unauthenticated users to login.html
 */
/**
 * Delete a user from database (admin only, cannot delete admin)
 */
function deleteUserFromDB(username) {
    if (!username || username.toLowerCase() === 'admin') {
        return { success: false, message: 'Cannot delete primary administrator.' };
    }
    const users = getUsersDB();
    const filtered = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(filtered));
    syncUsersToCloud(filtered).catch(err => console.warn(err));
    return { success: true };
}

/**
 * Reset a user's password (admin only)
 */
function resetUserPassword(username, newPassword) {
    if (!username || !newPassword || newPassword.length < 4) {
        return { success: false, message: 'Password must be at least 4 characters.' };
    }
    const users = getUsersDB();
    const target = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!target) {
        return { success: false, message: 'User not found.' };
    }
    target.password = newPassword;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    syncUsersToCloud(users).catch(err => console.warn(err));
    return { success: true };
}

/**
 * Guard routes: redirect unauthenticated users to login.html and guard admin.html
 */
function checkAuthRoute() {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.href.toLowerCase().includes('login.html');
    const isAdminPage = window.location.pathname.endsWith('admin.html') || window.location.href.toLowerCase().includes('admin.html');
    const user = getCurrentUser();

    if (!user && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (user && isLoginPage) {
        window.location.href = 'index.html';
    } else if (user && isAdminPage && (!user.username || user.username.toLowerCase() !== 'admin')) {
        alert('Access denied: Administrator privileges required.');
        window.location.href = 'profile.html';
    }
}

// ==========================================================================
// ORDER DATABASE MANAGEMENT
// ==========================================================================

/**
 * Get all orders from the database
 */
function getOrdersDB() {
    try {
        const raw = localStorage.getItem(ORDERS_DB_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Save an assessment order to the database under user's profile
 */
function saveOrderToDB(orderInput = {}) {
    const user = getCurrentUser() || { username: 'guest', name: 'Guest User', company: 'General Mill' };
    
    // Retrieve current project state and results
    let state = {};
    if (typeof getProjectState === 'function') {
        state = getProjectState();
    } else {
        try {
            const raw = localStorage.getItem('textile_footprint_project_state');
            state = raw ? JSON.parse(raw) : {};
        } catch(e) {}
    }

    let results = null;
    if (typeof getStoredResults === 'function') {
        results = getStoredResults();
    }
    if (!results && typeof calculateProjectFootprint === 'function') {
        results = calculateProjectFootprint(state);
    }
    if (!results) {
        try {
            const raw = localStorage.getItem('textile_footprint_last_results');
            results = raw ? JSON.parse(raw) : null;
        } catch(e) {}
    }

    const totalCarbon = results ? results.totalCarbon : 0;
    const carbonIntensity = results ? results.carbonIntensity : 0;
    const totalWater = results ? results.totalWater : 0;
    const waterIntensity = results ? results.waterIntensity : 0;

    const orderId = orderInput.orderId || ('PO-' + Date.now().toString(36).toUpperCase());
    const fabricTitle = state.fabricType ? (state.fabricType.charAt(0).toUpperCase() + state.fabricType.slice(1)) : 'Fabric';
    const orderName = orderInput.orderName || `${fabricTitle} Order (${state.productionWeight || 1000} kg)`;

    const orderRecord = {
        id: orderId,
        name: orderName,
        poNumber: orderInput.poNumber || orderId,
        notes: orderInput.notes || '',
        userId: user.username,
        userEmail: user.email,
        userName: user.name,
        userCompany: user.company,
        createdAt: new Date().toISOString(),
        fabricType: state.fabricType || 'cotton',
        productionWeight: state.productionWeight || 1000,
        totalCarbon: totalCarbon,
        carbonIntensity: carbonIntensity,
        totalWater: totalWater,
        waterIntensity: waterIntensity,
        stateSnapshot: JSON.parse(JSON.stringify(state)),
        resultsSnapshot: results ? JSON.parse(JSON.stringify(results)) : null
    };

    const orders = getOrdersDB();
    const existingIndex = orders.findIndex(o => o.id === orderId);
    if (existingIndex >= 0) {
        orders[existingIndex] = orderRecord;
    } else {
        orders.unshift(orderRecord);
    }

    localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(orders));
    syncOrdersToCloud(orders).catch(err => console.warn('Cloud order push error', err));
    return orderRecord;
}

/**
 * Get orders for currently logged in user (or all if admin)
 */
function getUserOrders() {
    const user = getCurrentUser();
    if (!user) return [];

    const orders = getOrdersDB();
    if (user.username.toLowerCase() === 'admin') {
        return orders; // Admin can inspect all orders
    }
    return orders.filter(o => o.userId && o.userId.toLowerCase() === user.username.toLowerCase());
}

/**
 * Delete an order by ID
 */
function deleteOrderFromDB(orderId) {
    const orders = getOrdersDB();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(filtered));
    syncOrdersToCloud(filtered).catch(err => console.warn(err));
    return true;
}

/**
 * Load a past order back into active calculator state and redirect
 */
function loadOrderIntoCalculator(orderId) {
    const orders = getOrdersDB();
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.stateSnapshot) {
        alert('Could not find order state data.');
        return false;
    }

    localStorage.setItem('textile_footprint_project_state', JSON.stringify(order.stateSnapshot));
    if (order.resultsSnapshot) {
        localStorage.setItem('textile_footprint_last_results', JSON.stringify(order.resultsSnapshot));
    }

    window.location.href = 'results.html';
    return true;
}

/**
 * Render user profile & navigation links
 */
function renderUserNav() {
    const user = getCurrentUser();
    const navSlots = document.querySelectorAll('.user-nav-slot');
    if (!user || navSlots.length === 0) return;

    const isAdmin = user.username && user.username.toLowerCase() === 'admin';

    navSlots.forEach(slot => {
        slot.innerHTML = `
            <div class="user-profile-badge">
                <a href="${isAdmin ? 'admin.html' : 'profile.html'}" class="user-avatar" title="${isAdmin ? 'Admin Monitoring Console' : 'View Profile & Orders'}" style="${isAdmin ? 'background:#fef08a; color:#854d0e; font-weight:800;' : ''}">
                    ${isAdmin ? 'A' : user.name.charAt(0).toUpperCase()}
                </a>
                <div class="user-meta">
                    <a href="${isAdmin ? 'admin.html' : 'profile.html'}" class="user-name" title="${isAdmin ? 'Admin Monitoring Console' : 'View Profile & Orders'}">${user.name}</a>
                    <span class="user-role">${user.role}</span>
                </div>
                ${isAdmin ? `
                    <a href="admin.html" class="btn-profile-nav" style="background:#fef08a; color:#854d0e; border-color:#fde047; font-weight:700;" title="Central Admin Monitoring Console">
                        Admin
                    </a>
                ` : ''}
                <a href="profile.html" class="btn-profile-nav" title="My Orders & Profile">
                    Orders
                </a>
                <button class="btn-logout" onclick="logoutUser()" title="Sign out">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Exit
                </button>
            </div>
        `;
    });

    // If admin, append an Admin link to the main navigation if not already present
    if (isAdmin) {
        document.querySelectorAll('.nav-links').forEach(nav => {
            if (!nav.querySelector('.admin-nav-item')) {
                const li = document.createElement('li');
                li.className = 'admin-nav-item';
                const onAdminPage = window.location.pathname.endsWith('admin.html') || window.location.href.toLowerCase().includes('admin.html');
                li.innerHTML = `<a href="admin.html" class="nav-link ${onAdminPage ? 'active' : ''}" style="color:#fef08a; font-weight:700; background:rgba(254, 240, 138, 0.2); border-radius:4px;">Admin Console</a>`;
                nav.appendChild(li);
            }
        });
    }
}

// Initialize database
initUsersDB();

// Run auth check immediately
checkAuthRoute();

// Trigger background cloud sync silently on page load
syncUsersFromCloud().catch(e => console.warn('Cloud sync error on load', e));
syncOrdersFromCloud().catch(e => console.warn('Cloud order sync error on load', e));

document.addEventListener('DOMContentLoaded', () => {
    renderUserNav();
});
