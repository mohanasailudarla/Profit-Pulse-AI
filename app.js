/**
 * AdGenius AI - Secure Frontend Controller
 * Full-stack integration with FastAPI Backend (Port 8000)
 */

const API_BASE = "http://localhost:8000";
const state = {
    token: localStorage.getItem('adgenius_token'),
    user: JSON.parse(localStorage.getItem('adgenius_user')),
    currentView: 'auth'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    checkAuthStatus();
    initEventListeners();
});

function checkAuthStatus() {
    if (state.token) {
        showDashboard();
    } else {
        showAuth();
    }
}

// --- UI Logic ---
function showAuth() {
    document.getElementById('auth-view').classList.add('active');
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('main-nav').classList.add('hidden');
    state.currentView = 'auth';
}

function showDashboard() {
    document.getElementById('auth-view').classList.remove('active');
    document.getElementById('dashboard-view').classList.add('active');
    document.getElementById('main-nav').classList.remove('hidden');
    document.getElementById('user-display-name').textContent = state.user?.name || "User";
    state.currentView = 'dashboard';
    
    // Auto-load history
    fetchHistory();
}

function initEventListeners() {
    // Auth Toggles
    document.getElementById('to-register').addEventListener('click', () => {
        document.getElementById('login-form-container').classList.add('hidden');
        document.getElementById('register-form-container').classList.remove('hidden');
    });
    document.getElementById('to-login').addEventListener('click', () => {
        document.getElementById('register-form-container').classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    });

    // Login Form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register Form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Analysis Form
    document.getElementById('analysis-form').addEventListener('submit', handleAnalyze);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('adgenius_token');
        localStorage.removeItem('adgenius_user');
        location.reload();
    });
}

// --- API Calls ---

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('reg-btn-text');
    const spinner = document.getElementById('reg-spinner');
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    toggleAuthLoading(true, btn, spinner);
    clearAuthError();

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success - switch to login
            document.getElementById('to-login').click();
            showAuthError("Registration successful! Please login.", "blue");
        } else {
            showAuthError(data.detail || "Registration failed");
        }
    } catch (err) {
        showAuthError("Server connection failed");
    } finally {
        toggleAuthLoading(false, btn, spinner);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-spinner');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    toggleAuthLoading(true, btn, spinner);
    clearAuthError();

    try {
        // FastAPI Login (Form-data)
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            state.token = data.access_token;
            state.user = { email, name: email.split('@')[0] }; // Basic name fallback
            localStorage.setItem('adgenius_token', state.token);
            localStorage.setItem('adgenius_user', JSON.stringify(state.user));
            showDashboard();
        } else {
            showAuthError(data.detail || "Invalid credentials");
        }
    } catch (err) {
        showAuthError("Server connection failed");
    } finally {
        toggleAuthLoading(false, btn, spinner);
    }
}

async function handleAnalyze(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
    submitBtn.disabled = true;

    const body = {
        budget: parseFloat(document.getElementById('budget').value),
        platform: document.getElementById('platform').value,
        target_audience: document.getElementById('audience').value,
        duration: parseInt(document.getElementById('duration').value)
    };

    try {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(body)
        });

        if (response.status === 401) {
            // Token expired or invalid
            state.logout();
            return;
        }

        const data = await response.json();
        
        if (response.ok) {
            renderAnalysisResult(data);
            fetchHistory(); // Refresh history
        } else {
            alert(data.detail || "Analysis failed");
        }
    } catch (err) {
        alert("Connection error");
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(`${API_BASE}/results`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderHistory(data);
        }
    } catch (err) {
        console.error("History fetch error", err);
    }
}

// --- Render Helpers ---

function renderAnalysisResult(data) {
    const container = document.getElementById('current-result-container');
    container.classList.remove('hidden');
    
    // Update API Source Badge
    const badge = document.getElementById('api-source-badge');
    if (data.metrics && data.metrics.data_source) {
        badge.textContent = data.metrics.data_source;
        badge.classList.remove('hidden');
    } else {
        badge.textContent = "Standard Data";
    }

    document.getElementById('result-score').textContent = data.score;
    document.getElementById('res-ctr').textContent = data.metrics.ctr;
    document.getElementById('res-conv').textContent = data.metrics.conversion_rate;
    document.getElementById('res-roi').textContent = data.metrics.roi;
    document.getElementById('res-leads').textContent = data.metrics.estimated_leads;

    const recsDiv = document.getElementById('res-recommendations');
    recsDiv.innerHTML = data.recommendations.map(rec => `
        <div class="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-sm leading-relaxed">
            ${rec}
        </div>
    `).join('');
    
    lucide.createIcons();
    container.scrollIntoView({ behavior: 'smooth' });
}

function renderHistory(list) {
    const listDiv = document.getElementById('history-list');
    const emptyDiv = document.getElementById('history-empty');
    const countSpan = document.getElementById('history-count');
    
    countSpan.textContent = `${list.length} Sessions`;

    if (list.length === 0) {
        emptyDiv.classList.remove('hidden');
        listDiv.innerHTML = '';
        return;
    }

    emptyDiv.classList.add('hidden');
    listDiv.innerHTML = list.reverse().map(item => `
        <div class="glass p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/5 transition-all">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-gray-500 uppercase">${item.input_data.platform}</span>
                    <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span class="text-xs text-gray-400">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div class="font-medium text-sm">Budget: $${item.input_data.budget} | Score: <span class="text-blue-400">${item.score}</span></div>
            </div>
            <div class="flex gap-2">
                 <div class="text-right">
                    <div class="text-xs text-gray-400 uppercase font-black">ROI</div>
                    <div class="text-sm font-bold text-green-400">${item.metrics.roi}</div>
                 </div>
            </div>
        </div>
    `).join('');
}

// --- Helpers ---
function toggleAuthLoading(isLoading, btn, spinner) {
    if (isLoading) {
        btn.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        btn.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function showAuthError(msg, type = "red") {
    const err = document.getElementById('auth-error');
    err.textContent = msg;
    err.classList.remove('hidden', 'text-red-500', 'text-blue-400', 'bg-red-500/10', 'bg-blue-500/10', 'border-red-500/20', 'border-blue-500/20');
    
    if (type === "red") {
        err.classList.add('text-red-500', 'bg-red-500/10', 'border-red-500/20');
    } else {
        err.classList.add('text-blue-400', 'bg-blue-500/10', 'border-blue-500/20');
    }
}

function clearAuthError() {
    document.getElementById('auth-error').classList.add('hidden');
}
