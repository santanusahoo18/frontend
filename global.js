// Shared Global Script for Security Gate Pass System

// 1. Initial Mock Database Setup
const MOCK_AVATARS = {
  employee1: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2310b981'><circle cx='50' cy='35' r='20'/><path d='M15 85c0-18 15-30 35-30s35 12 35 30z'/></svg>",
  employee2: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%233b82f6'><circle cx='50' cy='35' r='20'/><path d='M15 85c0-18 15-30 35-30s35 12 35 30z'/></svg>",
  visitor1: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23f59e0b'><circle cx='50' cy='35' r='20'/><path d='M15 85c0-18 15-30 35-30s35 12 35 30z'/></svg>",
  blacklisted: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23ef4444'><circle cx='50' cy='35' r='20'/><path d='M15 85c0-18 15-30 35-30s35 12 35 30z'/><path d='M30 30l40 40M70 30L30 70' stroke='%23000' stroke-width='8'/></svg>",
};

const initialSetup = () => {
  // Mock operators
  if (!localStorage.getItem('sec_operators')) {
    const operators = [
      { email: 'admin@securepass.com', password: 'Admin@123', name: 'Commander Admin', role: 'admin', avatar: MOCK_AVATARS.employee2 },
      { email: 'security@securepass.com', password: 'Security@123', name: 'Officer Rajesh', role: 'security', avatar: MOCK_AVATARS.employee1 }
    ];
    localStorage.setItem('sec_operators', JSON.stringify(operators));
  }

  // Mock registered persons (employees and previous visitors)
  if (!localStorage.getItem('sec_people')) {
    const people = [
      { id: 'emp_1', name: 'Amit Sharma', adhar: '123456789012', address: 'Block A, Security Enclave, Delhi', phone: '9876543210', category: 'Employee', empId: 'EMP-088', purpose: 'Operations', photo: MOCK_AVATARS.employee1, validityStart: '09:00', validityEnd: '17:00', created: '2026-06-20T09:00:00Z' },
      { id: 'emp_2', name: 'Priya Patel', adhar: '987654321098', address: 'Tech Park Hub, Bangalore', phone: '9812345678', category: 'Employee', empId: 'EMP-142', purpose: 'Engineering', photo: MOCK_AVATARS.employee2, validityStart: '09:00', validityEnd: '17:00', created: '2026-06-21T09:30:00Z' },
      { id: 'vis_1', name: 'John Doe', adhar: '456789012345', address: 'Sector 62, Noida', phone: '8877665544', category: 'Visitor', empId: 'VIS-991', purpose: 'Client Interview', photo: MOCK_AVATARS.visitor1, validityStart: '09:00', validityEnd: '17:00', created: '2026-06-24T10:00:00Z' }
    ];
    localStorage.setItem('sec_people', JSON.stringify(people));
  }

  // Mock blacklist
  if (!localStorage.getItem('sec_blacklist')) {
    const blacklist = [
      { id: 'vis_black', name: 'Vikram Singh', adhar: '111122223333', address: 'Unknown St, Ghaziabad', phone: '9900887766', category: 'Visitor', empId: 'VIS-BLK', purpose: 'Suspicious', photo: MOCK_AVATARS.blacklisted, reason: 'Suspicious behavior & unauthorized entry attempt', date: '2026-06-22T14:20:00Z' }
    ];
    localStorage.setItem('sec_blacklist', JSON.stringify(blacklist));
  }

  // Mock admin codes
  if (!localStorage.getItem('sec_codes')) {
    const codes = [
      { code: 'AD-1234', status: 'active', expiresAt: new Date(Date.now() + 3600000).toISOString(), createdBy: 'admin@securepass.com' } // valid for 1 hr
    ];
    localStorage.setItem('sec_codes', JSON.stringify(codes));
  }

  // Mock gate activity logs
  if (!localStorage.getItem('sec_logs')) {
    const logs = [
      { id: 'log_1', type: 'secure', message: 'System boot telemetry self-check cleared.', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'log_2', type: 'secure', message: 'Database schema local storage cache connected.', timestamp: new Date(Date.now() - 7100000).toISOString() },
      { id: 'log_3', type: 'secure', message: 'Operator Commander Admin authenticated and session initialized.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'log_4', type: 'denied', message: 'Biometric block trigger: Vikram Singh (Aadhaar 111122223333) blocked. Reason: suspicious behavior.', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ];
    localStorage.setItem('sec_logs', JSON.stringify(logs));
  }
};

initialSetup();

// 2. Authentication Services
const Auth = {
  login(email, password) {
    const ops = JSON.parse(localStorage.getItem('sec_operators') || '[]');
    const user = ops.find(o => o.email.toLowerCase() === email.toLowerCase() && o.password === password);
    if (user) {
      localStorage.setItem('sec_current_session', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  logout() {
    localStorage.removeItem('sec_current_session');
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    const session = localStorage.getItem('sec_current_session');
    return session ? JSON.parse(session) : null;
  },

  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
    }
    return user;
  },

  requireAdmin() {
    const user = this.requireAuth();
    if (user.role !== 'admin') {
      alert('Access Denied: Requires Administrator Privileges.');
      window.location.href = 'dashboard.html';
    }
    return user;
  }
};

// 3. Database CRUD operations
const Db = {
  // People registry
  getPeople() {
    return JSON.parse(localStorage.getItem('sec_people') || '[]');
  },
  getPerson(id) {
    return this.getPeople().find(p => p.id === id);
  },
  getPersonByAadhaar(adhar) {
    return this.getPeople().find(p => p.adhar === adhar);
  },
  addPerson(person) {
    const people = this.getPeople();
    // Auto validate timings to 9am - 5pm
    person.validityStart = '09:00';
    person.validityEnd = '17:00';
    person.created = new Date().toISOString();
    people.push(person);
    localStorage.setItem('sec_people', JSON.stringify(people));
    return person;
  },
  updatePerson(updated) {
    let people = this.getPeople();
    people = people.map(p => p.id === updated.id ? { ...p, ...updated } : p);
    localStorage.setItem('sec_people', JSON.stringify(people));
    return updated;
  },

  // Blacklist
  getBlacklist() {
    return JSON.parse(localStorage.getItem('sec_blacklist') || '[]');
  },
  isBlacklisted(adhar) {
    return this.getBlacklist().some(b => b.adhar === adhar);
  },
  getBlacklistEntry(adhar) {
    return this.getBlacklist().find(b => b.adhar === adhar);
  },
  addToBlacklist(person, reason) {
    const blacklist = this.getBlacklist();
    if (this.isBlacklisted(person.adhar)) return false;
    
    const entry = {
      ...person,
      reason: reason,
      date: new Date().toISOString()
    };
    blacklist.push(entry);
    localStorage.setItem('sec_blacklist', JSON.stringify(blacklist));
    
    // Also remove from active registry if blacklisted
    let people = this.getPeople();
    people = people.filter(p => p.adhar !== person.adhar);
    localStorage.setItem('sec_people', JSON.stringify(people));
    return true;
  },
  removeFromBlacklist(adhar) {
    let blacklist = this.getBlacklist();
    const entry = blacklist.find(b => b.adhar === adhar);
    if (!entry) return false;

    blacklist = blacklist.filter(b => b.adhar !== adhar);
    localStorage.setItem('sec_blacklist', JSON.stringify(blacklist));

    // Restore back to people registry
    const newPerson = {
      id: entry.id,
      name: entry.name,
      adhar: entry.adhar,
      address: entry.address,
      phone: entry.phone,
      category: entry.category,
      empId: entry.empId,
      purpose: entry.purpose,
      photo: entry.photo,
      validityStart: entry.validityStart || '09:00',
      validityEnd: entry.validityEnd || '17:00',
      created: new Date().toISOString()
    };
    this.addPerson(newPerson);
    return true;
  },

  // Admin codes
  getAdminCodes() {
    return JSON.parse(localStorage.getItem('sec_codes') || '[]');
  },
  generateAdminCode(email) {
    const codes = this.getAdminCodes();
    const newCode = 'AD-' + Math.floor(1000 + Math.random() * 9000);
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const codeObj = { code: newCode, status: 'active', expiresAt, createdBy: email };
    codes.push(codeObj);
    localStorage.setItem('sec_codes', JSON.stringify(codes));
    return codeObj;
  },
  validateAdminCode(inputCode) {
    const codes = this.getAdminCodes();
    const index = codes.findIndex(c => c.code === inputCode && c.status === 'active');
    if (index === -1) return { valid: false, message: 'Invalid registration key' };

    const codeObj = codes[index];
    if (new Date() > new Date(codeObj.expiresAt)) {
      codeObj.status = 'expired';
      localStorage.setItem('sec_codes', JSON.stringify(codes));
      return { valid: false, message: 'Registration key has expired (5-min limit)' };
    }

    codeObj.status = 'used';
    localStorage.setItem('sec_codes', JSON.stringify(codes));
    return { valid: true };
  },

  // Logs operations
  getLogs() {
    return JSON.parse(localStorage.getItem('sec_logs') || '[]');
  },
  addLog(type, message) {
    const logs = this.getLogs();
    const newLog = {
      id: 'log_' + Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Prepend to show newest first
    if (logs.length > 100) logs.pop();
    localStorage.setItem('sec_logs', JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('sec_log_added', { detail: newLog }));
    return newLog;
  }
};

// 4. Toast Notifications
const Toast = {
  show(message, type = 'secure') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="width:10px; height:10px; border-radius:50%; background-color: var(--color-${type === 'secure' ? 'secure' : type === 'denied' ? 'denied' : 'warning'});"></div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('active'), 50);

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// 4b. Audio Diagnostics Feedback Engine (Web Audio API Synthesizer)
const AudioFeedback = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playProcessing() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },
  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain2.gain.setValueAtTime(0.1, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  },
  playWarning() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.4);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start();
    osc.stop(now + 0.4);
  }
};

// 5. Sidebar Generator UI Injection
const uiInitSidebar = () => {
  const container = document.querySelector('.app-container');
  if (!container) return;

  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return; // Login/Register pages do not need sidebar

  const pathname = window.location.pathname;
  const page = pathname.substring(pathname.lastIndexOf('/') + 1);

  const sidebarHtml = `
    <nav class="sidebar" id="appSidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>SECUREPASS AI</span>
        </a>
        <button class="sidebar-toggle" id="sidebarToggleBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <ul class="sidebar-menu">
        <li class="sidebar-item ${page === 'dashboard.html' ? 'active' : ''}">
          <a href="dashboard.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'model.html' ? 'active' : ''}">
          <a href="model.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Live AI Scanner</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'register-person.html' ? 'active' : ''}">
          <a href="register-person.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Register Visitor</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'print-list.html' || page === 'print-preview.html' ? 'active' : ''}">
          <a href="print-list.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print Passes</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'blacklist.html' ? 'active' : ''}">
          <a href="blacklist.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Block Person</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'blacklist-view.html' ? 'active' : ''}">
          <a href="blacklist-view.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Blacklist Table</span>
          </a>
        </li>
        <li class="sidebar-item ${page === 'admin-codes.html' ? 'active' : ''}">
          <a href="admin-codes.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              <circle cx="12" cy="16" r="1"></circle>
            </svg>
            <span>Admin Keys</span>
          </a>
        </li>
      </ul>
      
      <div class="sidebar-footer">
        <div class="operator-info">
          <span class="operator-name">${currentUser.name}</span>
          <span class="operator-role">${currentUser.role.toUpperCase()}</span>
        </div>
        <button id="logoutBtn" style="background:none; border:none; margin-left:auto; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; justify-content:center; padding:5px; border-radius:6px; transition:color 0.2s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </nav>
  `;

  // Prepend to app container
  container.insertAdjacentHTML('afterbegin', sidebarHtml);

  // Inject Mobile Header Bar and Backdrop elements
  const mobileHeaderHtml = `
    <div class="mobile-header">
      <a href="dashboard.html" class="mobile-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>SECUREPASS AI</span>
      </a>
      <button class="mobile-hamburger" id="mobileMenuBtn" aria-label="Open Navigation Menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
  `;
  container.insertAdjacentHTML('afterbegin', mobileHeaderHtml);

  // Toggle button actions
  const sidebar = document.getElementById('appSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  
  if (localStorage.getItem('sec_sidebar_collapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

  // Desktop sidebar collapse toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sec_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });
  }

  // Mobile sidebar slide overlay toggles
  if (mobileMenuBtn && sidebarBackdrop) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarBackdrop.classList.toggle('active');
    });

    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarBackdrop.classList.remove('active');
    });

    // Close menu when operator navigates
    const links = sidebar.querySelectorAll('.sidebar-item a');
    links.forEach(l => {
      l.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
      });
    });
  }

  // Logout actions
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  uiInitSidebar();
});
