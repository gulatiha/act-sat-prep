'use strict';

// ════════════════════════════════════════════════════════════════════════════
// DATABASE — localStorage wrapper
// ════════════════════════════════════════════════════════════════════════════
const DB = {
  getUsers()           { return JSON.parse(localStorage.getItem('pm_users')   || '{}'); },
  saveUsers(u)         { localStorage.setItem('pm_users', JSON.stringify(u)); },
  getCurrentUser()     { return localStorage.getItem('pm_current_user') || null; },
  setCurrentUser(u)    { u ? localStorage.setItem('pm_current_user', u) : localStorage.removeItem('pm_current_user'); },
  getSessions(user)    { return JSON.parse(localStorage.getItem('pm_sess_' + user)  || '[]'); },
  saveSessions(user,s) { localStorage.setItem('pm_sess_' + user, JSON.stringify(s)); },
  getTutorMsgs(user)   { return JSON.parse(localStorage.getItem('pm_tutor_' + user) || '[]'); },
  saveTutorMsgs(user,m){ localStorage.setItem('pm_tutor_' + user, JSON.stringify(m)); },
};

// ════════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════════
let S = {
  user: null,       // currently logged-in username
  view: 'landing',  // current view name
  quiz: null,       // active practice quiz session
  test: null,       // active full-test session
  timerInterval: null,
};

// ════════════════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════════════════
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function nl2br(str) { return esc(str).replace(/\n/g,'<br>'); }

function getUserStats(username) {
  const sessions = DB.getSessions(username).filter(s => s.completed);
  if (!sessions.length) return { total:0, avgScore:0, weakAreas:[], strongAreas:[], recentScores:[], topicStats:[] };
  const topicMap = {};
  const recentScores = [];
  for (const s of sessions) {
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    recentScores.push({ label: s.testType + ' ' + s.section, score: pct, type: s.type });
    const key = s.testType + ' – ' + s.section;
    if (!topicMap[key]) topicMap[key] = { correct:0, total:0 };
    topicMap[key].correct += s.correct;
    topicMap[key].total   += s.total;
  }
  const scored = Object.entries(topicMap)
    .filter(([,v]) => v.total > 0)
    .map(([k,v]) => [k, Math.round((v.correct / v.total) * 100)])
    .sort((a,b) => a[1]-b[1]);
  const weakAreas   = scored.filter(([,p]) => p < 60).slice(0,3).map(([k]) => k);
  const strongAreas = scored.filter(([,p]) => p >= 80).slice(0,3).map(([k]) => k);
  const avg = Math.round(recentScores.reduce((a,b) => a+b.score, 0) / recentScores.length);
  return { total: sessions.length, avgScore: avg, weakAreas, strongAreas,
           recentScores: recentScores.slice(-10), topicStats: scored };
}

function saveCompletedSession(data) {
  const sessions = DB.getSessions(S.user);
  sessions.push({ ...data, completedAt: Date.now(), completed: true });
  DB.saveSessions(S.user, sessions);
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function scoreColor(pct) {
  if (pct >= 80) return '#16a34a';
  if (pct >= 60) return '#d97706';
  return '#dc2626';
}
function scoreBg(pct) {
  if (pct >= 80) return '#f0fdf4';
  if (pct >= 60) return '#fffbeb';
  return '#fef2f2';
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTER
// ════════════════════════════════════════════════════════════════════════════
const PROTECTED = ['dashboard','practice','quiz','quiz-results','test-select','full-test','test-results','tutor','resources'];

function navigate(view, params = {}) {
  if (PROTECTED.includes(view) && !S.user) { navigate('login'); return; }
  if ((view === 'login' || view === 'register') && S.user) { navigate('dashboard'); return; }
  // Stop any running timer
  if (S.timerInterval && view !== 'full-test') {
    clearInterval(S.timerInterval);
    S.timerInterval = null;
  }
  S.view = view;
  S.params = params;
  renderApp();
  window.scrollTo(0, 0);
}

function renderApp() {
  renderNav();
  const app = document.getElementById('app');
  const views = {
    'landing':      viewLanding,
    'login':        viewLogin,
    'register':     viewRegister,
    'dashboard':    viewDashboard,
    'practice':     viewPractice,
    'quiz':         viewQuiz,
    'quiz-results': viewQuizResults,
    'test-select':  viewTestSelect,
    'full-test':    viewFullTest,
    'test-results': viewTestResults,
    'tutor':        viewTutor,
    'resources':    viewResources,
  };
  app.innerHTML = (views[S.view] || viewLanding)();
}

function renderNav() {
  const nav = document.getElementById('navbar');
  if (S.user) {
    nav.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a onclick="navigate('dashboard')" class="cursor-pointer text-2xl font-extrabold text-white tracking-tight">
          Prep<span style="color:#f6ad55">Master</span>
        </a>
        <div class="hidden md:flex items-center gap-1">
          ${['dashboard','practice','test-select','tutor','resources'].map(v => {
            const labels = {dashboard:'Dashboard',practice:'Practice','test-select':'Full Test',tutor:'AI Tutor',resources:'Resources'};
            const active = S.view === v || (v === 'test-select' && S.view === 'full-test');
            return `<button onclick="navigate('${v}')" class="nav-btn ${active ? 'nav-active' : ''}">${labels[v]}</button>`;
          }).join('')}
        </div>
        <div class="flex items-center gap-3">
          <span class="text-blue-200 text-sm hidden md:block">Hi, ${esc(S.user)}!</span>
          <button onclick="handleLogout()" class="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition">Logout</button>
        </div>
      </div>`;
  } else {
    nav.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a onclick="navigate('landing')" class="cursor-pointer text-2xl font-extrabold text-white tracking-tight">
          Prep<span style="color:#f6ad55">Master</span>
        </a>
        <div class="flex items-center gap-2">
          <button onclick="navigate('login')"    class="text-white hover:text-yellow-300 transition text-sm font-medium px-3 py-1.5">Login</button>
          <button onclick="navigate('register')" class="font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition" style="background:#f6ad55;color:#1e3a5f">Sign Up Free</button>
        </div>
      </div>`;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH HANDLERS
// ════════════════════════════════════════════════════════════════════════════
function handleRegister(e) {
  e.preventDefault();
  const f = e.target;
  const username = f.username.value.trim();
  const password = f.password.value;
  const confirm  = f.confirm.value;
  if (!username || !password) return showAlert('All fields are required.', 'danger');
  if (password !== confirm)   return showAlert('Passwords do not match.', 'danger');
  if (password.length < 6)   return showAlert('Password must be at least 6 characters.', 'danger');
  const users = DB.getUsers();
  if (users[username])       return showAlert('Username already taken.', 'danger');
  users[username] = { password, createdAt: Date.now() };
  DB.saveUsers(users);
  DB.setCurrentUser(username);
  S.user = username;
  navigate('dashboard');
}

function handleLogin(e) {
  e.preventDefault();
  const f = e.target;
  const username = f.username.value.trim();
  const password = f.password.value;
  const users = DB.getUsers();
  if (!users[username] || users[username].password !== password) {
    return showAlert('Invalid username or password.', 'danger');
  }
  DB.setCurrentUser(username);
  S.user = username;
  navigate('dashboard');
}

function handleLogout() {
  DB.setCurrentUser(null);
  S.user = null;
  S.quiz = null;
  S.test = null;
  navigate('landing');
}

function showAlert(msg, type) {
  const el = document.getElementById('form-alert');
  if (!el) return;
  const colors = { danger:'#fee2e2;color:#991b1b;border:1px solid #fca5a5', success:'#f0fdf4;color:#166534;border:1px solid #86efac' };
  el.innerHTML = `<div style="background:${colors[type] || colors.danger};padding:10px 14px;border-radius:8px;font-size:.875rem;margin-bottom:12px">${esc(msg)}</div>`;
}

// ════════════════════════════════════════════════════════════════════════════
// VIEWS — Landing, Login, Register
// ════════════════════════════════════════════════════════════════════════════
function viewLanding() {
  return `
  <section style="background:linear-gradient(135deg,#1e3a5f,#2d5282)" class="text-white py-24 px-4 text-center">
    <h1 class="text-5xl font-extrabold mb-4 leading-tight">Ace the <span style="color:#f6ad55">SAT &amp; ACT</span></h1>
    <p class="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Practice questions, timed full tests, progress tracking, and an AI-powered tutor — all in one place, no account required to explore.</p>
    <div class="flex flex-wrap gap-4 justify-center">
      <button onclick="navigate('register')" class="font-bold text-lg px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg" style="background:#f6ad55;color:#1e3a5f">Start Studying Free</button>
      <button onclick="navigate('login')" class="bg-white/10 border border-white/30 text-white font-semibold text-lg px-8 py-3 rounded-xl hover:bg-white/20 transition">Log In</button>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-4 py-20">
    <h2 class="text-3xl font-bold text-center mb-12" style="color:#1e3a5f">Everything You Need to Score Higher</h2>
    <div class="grid md:grid-cols-4 gap-6">
      ${[['📝','Practice Quizzes','Targeted drills by section, topic, and difficulty with instant explanations.'],
         ['📋','Full Practice Tests','Timed SAT &amp; ACT simulations with a scaled score estimate.'],
         ['🤖','AI Tutor','Personalized advice, study tips, and concept explanations based on your performance.'],
         ['📊','Progress Tracking','Score history, weak-area analysis, and trend charts to guide every session.']
        ].map(([icon,title,desc]) => `
      <div class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
        <div class="text-4xl mb-3">${icon}</div>
        <h3 class="text-lg font-bold mb-2" style="color:#1e3a5f">${title}</h3>
        <p class="text-gray-600 text-sm">${desc}</p>
      </div>`).join('')}
    </div>
  </section>

  <section style="background:#f6ad55" class="py-16 px-4 text-center">
    <h2 class="text-3xl font-bold mb-4" style="color:#1e3a5f">Ready to Raise Your Score?</h2>
    <p class="mb-8" style="color:#1e3a5f;opacity:.7">Join students who study smarter, not harder.</p>
    <button onclick="navigate('register')" class="text-white font-bold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition shadow-lg" style="background:#1e3a5f">Create Your Free Account</button>
  </section>`;
}

function viewLogin() {
  return `
  <div class="max-w-md mx-auto px-4 py-16">
    <div class="bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-extrabold mb-2" style="color:#1e3a5f">Welcome back</h1>
      <p class="text-gray-500 mb-6">Log in to continue your prep journey.</p>
      <div id="form-alert"></div>
      <form onsubmit="handleLogin(event)" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input name="username" required autofocus class="input-field" placeholder="Your username" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input name="password" type="password" required class="input-field" placeholder="Your password" />
        </div>
        <button type="submit" class="btn-primary w-full">Log In</button>
      </form>
      <p class="text-center text-sm text-gray-500 mt-6">
        No account? <button onclick="navigate('register')" class="font-semibold hover:underline" style="color:#1e3a5f">Sign up free</button>
      </p>
    </div>
  </div>`;
}

function viewRegister() {
  return `
  <div class="max-w-md mx-auto px-4 py-16">
    <div class="bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-3xl font-extrabold mb-2" style="color:#1e3a5f">Create your account</h1>
      <p class="text-gray-500 mb-6">Start your SAT &amp; ACT prep — it's free.</p>
      <div id="form-alert"></div>
      <form onsubmit="handleRegister(event)" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input name="username" required autofocus class="input-field" placeholder="Choose a username" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input name="password" type="password" required class="input-field" placeholder="At least 6 characters" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <input name="confirm" type="password" required class="input-field" placeholder="Repeat password" />
        </div>
        <button type="submit" class="btn-primary w-full">Create Account</button>
      </form>
      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account? <button onclick="navigate('login')" class="font-semibold hover:underline" style="color:#1e3a5f">Log in</button>
      </p>
    </div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function viewDashboard() {
  const stats = getUserStats(S.user);
  const recent = DB.getSessions(S.user).filter(s=>s.completed).slice(-5).reverse();

  const statCards = [
    ['Sessions', stats.total, '#1e3a5f'],
    ['Avg Score', stats.total ? stats.avgScore + '%' : '—', '#2563eb'],
    ['Strong Topics', stats.strongAreas.length, '#16a34a'],
    ['Needs Work', stats.weakAreas.length, '#ea580c'],
  ];

  return `
  <div class="max-w-7xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold" style="color:#1e3a5f">Welcome back, ${esc(S.user)}!</h1>
      <p class="text-gray-500 mt-1">Here's how your prep is going.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      ${statCards.map(([label,val,bg]) => `
      <div class="text-white rounded-2xl p-5 shadow" style="background:${bg}">
        <div class="text-3xl font-extrabold">${val}</div>
        <div class="text-sm opacity-80 mt-1">${label}</div>
      </div>`).join('')}
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl shadow p-6">
        <h2 class="text-lg font-bold mb-4" style="color:#1e3a5f">Quick Start</h2>
        <div class="space-y-3">
          ${[['📝','Practice Quiz','5–20 targeted questions','practice'],
             ['📋','Full Practice Test','Timed, all sections','test-select'],
             ['🤖','AI Tutor','Personalized advice','tutor'],
             ['📚','Study Resources','Guides &amp; strategies','resources']
            ].map(([icon,title,sub,view]) => `
          <button onclick="navigate('${view}')" class="w-full flex items-center gap-3 rounded-xl p-4 transition text-left hover:bg-blue-50" style="background:#f8faff">
            <span class="text-2xl">${icon}</span>
            <div>
              <div class="font-semibold" style="color:#1e3a5f">${title}</div>
              <div class="text-xs text-gray-500">${sub}</div>
            </div>
          </button>`).join('')}
        </div>
      </div>

      <!-- Performance Breakdown -->
      <div class="bg-white rounded-2xl shadow p-6">
        <h2 class="text-lg font-bold mb-4" style="color:#1e3a5f">Performance Breakdown</h2>
        ${stats.topicStats.length ? `
          <div class="space-y-3">
            ${stats.topicStats.map(([topic, pct]) => `
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700 font-medium">${esc(topic)}</span>
                <span class="font-bold" style="color:${scoreColor(pct)}">${pct}%</span>
              </div>
              <div class="bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" style="width:${pct}%;background:${scoreColor(pct)}"></div>
              </div>
            </div>`).join('')}
          </div>
          ${stats.weakAreas.length ? `
          <div class="mt-4 p-3 rounded-xl border" style="background:#fff7ed;border-color:#fed7aa">
            <p class="text-xs font-semibold mb-1" style="color:#c2410c">Focus areas:</p>
            ${stats.weakAreas.map(a => `<span class="inline-block text-xs px-2 py-0.5 rounded-full mr-1 mb-1" style="background:#ffedd5;color:#9a3412">${esc(a)}</span>`).join('')}
          </div>` : ''}
        ` : `
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-3">📊</div>
            <p class="text-sm">Complete a practice session to see your breakdown.</p>
          </div>`}
      </div>

      <!-- Recent Sessions -->
      <div class="bg-white rounded-2xl shadow p-6">
        <h2 class="text-lg font-bold mb-4" style="color:#1e3a5f">Recent Sessions</h2>
        ${recent.length ? `
          <div class="space-y-3">
            ${recent.map(s => {
              const pct = s.total ? Math.round((s.correct/s.total)*100) : 0;
              return `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div class="text-sm font-semibold" style="color:#1e3a5f">${esc(s.testType)} – ${esc(s.section)}</div>
                  <div class="text-xs text-gray-400">${s.type === 'full_test' ? 'Full Test' : 'Practice'} · ${fmtDate(s.completedAt)}</div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold" style="color:${scoreColor(pct)}">${pct}%</div>
                  <div class="text-xs text-gray-400">${s.correct}/${s.total}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-3">🎯</div>
            <p class="text-sm">No sessions yet. Take your first quiz!</p>
            <button onclick="navigate('practice')" class="mt-3 inline-block text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition" style="background:#1e3a5f">Start Practice</button>
          </div>`}
      </div>
    </div>

    ${stats.weakAreas.length ? `
    <div class="mt-6 rounded-2xl p-6 text-white shadow" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
      <div class="flex items-start gap-4">
        <span class="text-3xl">💡</span>
        <div>
          <h3 class="font-bold text-lg mb-1">Study Recommendation</h3>
          <p class="text-blue-100 text-sm">Based on your performance, focus on <strong class="text-white">${esc(stats.weakAreas[0])}</strong> next.
          Check the <button onclick="navigate('resources')" class="underline" style="color:#f6ad55">Resources</button> section for targeted guides,
          or ask the <button onclick="navigate('tutor')" class="underline" style="color:#f6ad55">AI Tutor</button> for a personalized study plan.</p>
        </div>
      </div>
    </div>` : ''}
  </div>`;
}

// ════════════════════════════════════════════════════════════════════════════
// PRACTICE QUIZ
// ════════════════════════════════════════════════════════════════════════════
function viewPractice() {
  return `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="mb-8">
      <button onclick="navigate('dashboard')" class="text-sm font-medium hover:underline" style="color:#1e3a5f">← Dashboard</button>
      <h1 class="text-3xl font-extrabold mt-2" style="color:#1e3a5f">Practice Quiz</h1>
      <p class="text-gray-500 mt-1">Customize your drill and get instant feedback on every question.</p>
    </div>
    <div class="bg-white rounded-2xl shadow-lg p-8">
      <form onsubmit="handleStartPractice(event)" class="space-y-6">

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Test</label>
            <select name="testType" onchange="updatePracticeSections(this)" class="select-field">
              <option value="SAT">SAT</option>
              <option value="ACT">ACT</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Section</label>
            <select name="section" id="section-select" onchange="updatePracticeTopics()" class="select-field">
              <option value="">All Sections</option>
              ${getSections('SAT').map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
              <option value="English">English (ACT)</option>
              <option value="Science">Science (ACT)</option>
            </select>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Topic</label>
            <select name="topic" id="topic-select" class="select-field">
              <option value="">All Topics</option>
              ${getTopics(null, null).map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
            <select name="difficulty" class="select-field">
              <option value="">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Number of Questions: <span id="count-val" class="font-bold" style="color:#1e3a5f">10</span>
          </label>
          <input type="range" name="count" min="5" max="20" value="10"
            oninput="document.getElementById('count-val').textContent=this.value"
            class="w-full" style="accent-color:#1e3a5f" />
          <div class="flex justify-between text-xs text-gray-400 mt-1"><span>5</span><span>20</span></div>
        </div>

        <button type="submit" class="btn-primary w-full">Start Quiz →</button>
      </form>
    </div>
    <div class="mt-5 p-4 rounded-xl border text-sm" style="background:#eff6ff;border-color:#bfdbfe;color:#1e40af">
      <strong>Tip:</strong> Start with Mixed settings to find your weak spots, then drill specific topics.
    </div>
  </div>`;
}

function updatePracticeSections(sel) {
  const testType = sel.value;
  const secSel = document.getElementById('section-select');
  secSel.innerHTML = `<option value="">All Sections</option>` +
    getSections(testType).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  updatePracticeTopics();
}

function updatePracticeTopics() {
  const testType = document.querySelector('[name=testType]').value;
  const section  = document.getElementById('section-select').value;
  const topicSel = document.getElementById('topic-select');
  topicSel.innerHTML = `<option value="">All Topics</option>` +
    getTopics(testType, section).map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
}

function handleStartPractice(e) {
  e.preventDefault();
  const f = e.target;
  const opts = {
    testType:   f.testType.value || undefined,
    section:    f.section.value  || undefined,
    topic:      f.topic.value    || undefined,
    difficulty: f.difficulty.value || undefined,
    count:      parseInt(f.count.value) || 10,
  };
  const questions = getQuestions(opts);
  if (!questions.length) { alert('No questions found for those filters. Try different options.'); return; }
  S.quiz = {
    questions,
    answers: {},
    currentIndex: 0,
    type: 'practice',
    testType: f.testType.value,
    section: f.section.value || 'Mixed',
    topic: f.topic.value || 'Mixed',
    difficulty: f.difficulty.value || 'Mixed',
    startedAt: Date.now(),
    results: null,
  };
  navigate('quiz');
}

function viewQuiz() {
  if (!S.quiz) { navigate('practice'); return ''; }
  const { questions, answers, currentIndex } = S.quiz;
  const q = questions[currentIndex];
  const total = questions.length;

  return `
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold" style="color:#1e3a5f">${esc(S.quiz.testType)} – ${esc(S.quiz.section)}</h1>
        <p class="text-sm text-gray-500">${esc(S.quiz.topic)} · ${esc(S.quiz.difficulty)}</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500">Question</div>
        <div class="text-2xl font-bold" style="color:#1e3a5f">${currentIndex+1} / ${total}</div>
      </div>
    </div>

    <div class="bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
      <div class="h-2 rounded-full transition-all" style="width:${((currentIndex+1)/total)*100}%;background:#1e3a5f"></div>
    </div>

    <div class="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-6">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full" style="background:#dbeafe;color:#1e3a5f">${esc(q.topic)}</span>
        <span class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">${q.difficulty}</span>
      </div>
      <p class="text-gray-800 font-medium leading-relaxed mb-6 whitespace-pre-line">${esc(q.question)}</p>
      <div class="space-y-3">
        ${q.options.map(opt => {
          const letter = opt[0];
          const selected = answers[q.id] === letter;
          return `<button onclick="quizSelectAnswer(${q.id},'${letter}')"
            class="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition border-2"
            style="border-color:${selected?'#1e3a5f':'#e2e8f0'};background:${selected?'#1e3a5f':'white'};color:${selected?'white':'#374151'}"
            onmouseover="if(!${selected}){this.style.borderColor='#93c5fd';this.style.background='#eff6ff'}"
            onmouseout="if(!${selected}){this.style.borderColor='#e2e8f0';this.style.background='white'}">
            ${esc(opt)}
          </button>`;
        }).join('')}
      </div>
    </div>

    <div class="flex justify-between items-center">
      ${currentIndex > 0
        ? `<button onclick="quizGo(${currentIndex-1})" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition">← Previous</button>`
        : `<div></div>`}
      ${currentIndex < total - 1
        ? `<button onclick="quizGo(${currentIndex+1})" class="text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition" style="background:#1e3a5f">Next →</button>`
        : `<button onclick="handleSubmitQuiz()" class="bg-green-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-700 transition">Submit Quiz</button>`}
    </div>

    <div class="flex flex-wrap gap-2 mt-6 justify-center">
      ${questions.map((_,i) => {
        const isAnswered = answers[questions[i].id];
        const isCurrent  = i === currentIndex;
        let bg = isCurrent ? '#1e3a5f' : (isAnswered ? '#dbeafe' : '#f3f4f6');
        let tc = isCurrent ? 'white' : (isAnswered ? '#1e40af' : '#9ca3af');
        let bc = isCurrent ? '#1e3a5f' : (isAnswered ? '#3b82f6' : '#d1d5db');
        return `<button onclick="quizGo(${i})" class="w-8 h-8 rounded-full text-xs font-bold transition border-2" style="background:${bg};color:${tc};border-color:${bc}">${i+1}</button>`;
      }).join('')}
    </div>
  </div>`;
}

function quizSelectAnswer(qId, letter) {
  S.quiz.answers[qId] = letter;
  renderApp();
}

function quizGo(index) {
  S.quiz.currentIndex = index;
  renderApp();
  window.scrollTo(0,0);
}

function handleSubmitQuiz() {
  const { questions, answers } = S.quiz;
  const unanswered = questions.filter(q => !answers[q.id]).length;
  if (unanswered > 0 && !confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;

  let correct = 0;
  const attempts = questions.map(q => {
    const userAnswer = answers[q.id] || null;
    const isCorrect  = userAnswer === q.correct;
    if (isCorrect) correct++;
    return { question: q, userAnswer, isCorrect };
  });

  S.quiz.results = { correct, total: questions.length, attempts };
  saveCompletedSession({
    type: 'practice',
    testType: S.quiz.testType,
    section: S.quiz.section,
    topic: S.quiz.topic,
    difficulty: S.quiz.difficulty,
    correct,
    total: questions.length,
  });
  navigate('quiz-results');
}

function viewQuizResults() {
  if (!S.quiz || !S.quiz.results) { navigate('dashboard'); return ''; }
  const { correct, total, attempts } = S.quiz.results;
  const pct = Math.round((correct / total) * 100);
  const msgs = { 80:'Excellent work! Keep it up 🎉', 60:'Good effort! Review the explanations below 📖', 0:"Don't be discouraged — each mistake is a lesson 💪" };
  const msgKey = pct >= 80 ? 80 : pct >= 60 ? 60 : 0;

  return `
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
      <div class="text-6xl font-extrabold mb-2" style="color:${scoreColor(pct)}">${pct}%</div>
      <div class="text-xl font-semibold text-gray-700 mb-1">${correct} / ${total} correct</div>
      <div class="text-sm text-gray-500 mb-4">${esc(S.quiz.testType)} – ${esc(S.quiz.section)} · ${esc(S.quiz.difficulty)} difficulty</div>
      <div class="inline-block text-sm font-semibold px-4 py-2 rounded-full" style="background:${scoreBg(pct)};color:${scoreColor(pct)};border:1px solid ${scoreColor(pct)}40">
        ${msgs[msgKey]}
      </div>
      <div class="flex flex-wrap gap-3 justify-center mt-6">
        <button onclick="navigate('practice')" class="text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition" style="background:#1e3a5f">Practice Again</button>
        <button onclick="navigate('tutor')" class="font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition" style="background:#f6ad55;color:#1e3a5f">Ask AI Tutor</button>
        <button onclick="navigate('dashboard')" class="bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition">Dashboard</button>
      </div>
    </div>

    <h2 class="text-xl font-bold mb-4" style="color:#1e3a5f">Question Review</h2>
    <div class="space-y-5">
      ${attempts.map(({ question:q, userAnswer, isCorrect }) => `
      <div class="bg-white rounded-2xl shadow p-6 border-l-4" style="border-color:${isCorrect?'#4ade80':'#f87171'}">
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex flex-wrap gap-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" style="background:#dbeafe;color:#1e3a5f">${esc(q.topic)}</span>
            <span class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">${q.difficulty}</span>
          </div>
          <span class="text-xl">${isCorrect?'✅':'❌'}</span>
        </div>
        <p class="text-gray-800 font-medium leading-relaxed mb-4 whitespace-pre-line text-sm">${esc(q.question)}</p>
        <div class="space-y-2 mb-4">
          ${q.options.map(opt => {
            const letter = opt[0];
            const isCorrectOpt = letter === q.correct;
            const isUserOpt    = letter === userAnswer && !isCorrect;
            return `<div class="px-4 py-2.5 rounded-xl text-sm font-medium border"
              style="${isCorrectOpt?'background:#f0fdf4;border-color:#86efac;color:#166534':
                      isUserOpt?'background:#fef2f2;border-color:#fca5a5;color:#991b1b':
                      'background:#f9fafb;border-color:#e5e7eb;color:#6b7280'}">
              ${esc(opt)}
              ${isCorrectOpt?'<span class="ml-2 font-bold" style="color:#16a34a">✓ Correct</span>':''}
              ${isUserOpt?'<span class="ml-2" style="color:#dc2626">← Your answer</span>':''}
            </div>`;
          }).join('')}
          ${!userAnswer?`<div class="text-xs italic text-gray-400">Not answered</div>`:''}
        </div>
        <div class="p-4 rounded-xl border text-sm" style="background:#eff6ff;border-color:#bfdbfe;color:#1e40af">
          <strong>Explanation: </strong>${esc(q.explanation)}
        </div>
      </div>`).join('')}
    </div>
    <div class="flex justify-center gap-4 mt-8">
      <button onclick="navigate('practice')" class="text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition" style="background:#1e3a5f">New Quiz</button>
      <button onclick="navigate('dashboard')" class="bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition">Dashboard</button>
    </div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════════════════
// FULL PRACTICE TEST
// ════════════════════════════════════════════════════════════════════════════
function viewTestSelect() {
  const sat = [['Math','20 questions','30 min'],['Reading','5 questions','10 min'],['Writing','6 questions','12 min']];
  const act = [['English','5 questions','8 min'],['Math','20 questions','25 min'],['Reading','3 questions','8 min'],['Science','4 questions','8 min']];

  function card(type, rows, icon) {
    return `
    <button onclick="handleStartFullTest('${type}')"
      class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-left w-full">
      <div class="text-4xl mb-3">${icon}</div>
      <h2 class="text-2xl font-extrabold mb-3" style="color:#1e3a5f">${type}</h2>
      <div class="space-y-2 text-sm text-gray-600 mb-4">
        ${rows.map(([s,q,t]) => `<div class="flex justify-between"><span>${s} (${q})</span><span class="text-gray-400">${t}</span></div>`).join('')}
        <div class="flex justify-between font-semibold pt-2 border-t" style="color:#1e3a5f">
          <span>Total: ~${rows.reduce((a,[,q])=>a+parseInt(q),0)} questions</span>
          <span>~${rows.reduce((a,[,,t])=>a+parseInt(t),0)} min</span>
        </div>
      </div>
      <div class="w-full text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition text-center" style="background:#1e3a5f">
        Start ${type} Test →
      </div>
    </button>`;
  }

  return `
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="mb-8">
      <button onclick="navigate('dashboard')" class="text-sm font-medium hover:underline" style="color:#1e3a5f">← Dashboard</button>
      <h1 class="text-3xl font-extrabold mt-2" style="color:#1e3a5f">Full Practice Test</h1>
      <p class="text-gray-500 mt-1">Timed test simulation with all sections and a scaled score estimate.</p>
    </div>
    <div class="grid sm:grid-cols-2 gap-6">
      ${card('SAT',sat,'📐')}
      ${card('ACT',act,'📗')}
    </div>
    <div class="mt-6 p-4 rounded-xl border text-sm" style="background:#fefce8;border-color:#fde68a;color:#92400e">
      <strong>Before you begin:</strong> Find a quiet space and treat this like the real thing. The timer starts immediately per section.
    </div>
  </div>`;
}

function handleStartFullTest(testType) {
  const sections = getFullPracticeTest(testType);
  S.test = {
    testType,
    sections,
    currentSection: 0,
    answers: {},
    startedAt: Date.now(),
    results: null,
  };
  navigate('full-test');
  // Start timer after render
  setTimeout(() => startSectionTimer(0), 50);
}

function viewFullTest() {
  if (!S.test) { navigate('test-select'); return ''; }
  const { sections, currentSection, answers } = S.test;
  const sec = sections[currentSection];

  return `
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="rounded-2xl p-4 mb-4 flex items-center justify-between" style="background:#1e3a5f;color:white">
      <div>
        <h1 class="font-extrabold text-xl">${esc(S.test.testType)} Full Practice Test</h1>
        <div class="text-blue-200 text-sm">Section ${currentSection+1} of ${sections.length}: ${esc(sec.name)}</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-blue-200">Time Remaining</div>
        <div id="timer-display" class="text-3xl font-mono font-extrabold">--:--</div>
      </div>
    </div>

    <div class="bg-gray-200 rounded-full h-2 mb-5 overflow-hidden">
      <div id="timer-bar" class="h-2 rounded-full transition-all" style="width:100%;background:#f6ad55"></div>
    </div>

    <div class="flex gap-2 flex-wrap mb-6">
      ${sections.map((s,i) => {
        const active = i === currentSection;
        const done   = i < currentSection;
        return `<button onclick="fullTestGoSection(${i})"
          class="px-4 py-2 rounded-lg text-sm font-semibold transition"
          style="background:${active?'#1e3a5f':done?'#dcfce7':'#f3f4f6'};color:${active?'white':done?'#166534':'#374151'}">
          ${esc(s.name)} <span class="text-xs opacity-60">(${s.questions.length})</span>
        </button>`;
      }).join('')}
    </div>

    <div class="space-y-5">
      ${sec.questions.map(q => {
        return `
        <div class="bg-white rounded-2xl shadow p-6" id="ftq-${q.id}">
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" style="background:#dbeafe;color:#1e3a5f">${esc(q.topic)}</span>
            <span class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">${q.difficulty}</span>
          </div>
          <p class="text-gray-800 font-medium leading-relaxed mb-4 whitespace-pre-line text-sm">${esc(q.question)}</p>
          <div class="space-y-2">
            ${q.options.map(opt => {
              const letter = opt[0];
              const sel = answers[q.id] === letter;
              return `<button onclick="fullTestSelectAnswer(${q.id},'${letter}')"
                class="w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium transition border-2"
                style="border-color:${sel?'#1e3a5f':'#e2e8f0'};background:${sel?'#1e3a5f':'white'};color:${sel?'white':'#374151'}"
                onmouseover="if(!${sel}){this.style.borderColor='#93c5fd';this.style.background='#eff6ff'}"
                onmouseout="if(!${sel}){this.style.borderColor='#e2e8f0';this.style.background='white'}">
                ${esc(opt)}
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="flex justify-between mt-6">
      ${currentSection > 0
        ? `<button onclick="fullTestGoSection(${currentSection-1})" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition">← Prev Section</button>`
        : `<div></div>`}
      ${currentSection < sections.length - 1
        ? `<button onclick="fullTestGoSection(${currentSection+1})" class="text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition" style="background:#1e3a5f">Next Section →</button>`
        : `<button onclick="handleSubmitFullTest()" class="bg-green-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-700 transition">Submit Full Test</button>`}
    </div>
  </div>`;
}

function fullTestSelectAnswer(qId, letter) {
  S.test.answers[qId] = letter;
  // Update only the question card without re-rendering whole view
  const card = document.getElementById('ftq-' + qId);
  if (!card) return;
  const q = S.test.sections[S.test.currentSection].questions.find(q => q.id === qId);
  if (!q) return;
  card.querySelectorAll('button').forEach(btn => {
    const bl = btn.dataset ? btn.textContent.trim()[0] : null;
    // Re-apply styles for each option button
  });
  // Just re-render the current section view
  renderApp();
  // Re-start timer display (don't restart timer itself)
  const el = document.getElementById('timer-display');
  if (el && S._timerState) {
    const s = S._timerState.secondsLeft;
    el.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  }
}

function fullTestGoSection(idx) {
  S.test.currentSection = idx;
  renderApp();
  window.scrollTo(0,0);
  setTimeout(() => startSectionTimer(idx), 50);
}

// Timer stored separately from state to survive re-renders
S._timerState = { secondsLeft: 0, totalSeconds: 0 };

function startSectionTimer(sectionIdx) {
  clearInterval(S.timerInterval);
  const minutes = S.test.sections[sectionIdx].timeMinutes;
  const total = minutes * 60;
  S._timerState = { secondsLeft: total, totalSeconds: total };
  updateTimerDisplay();
  S.timerInterval = setInterval(() => {
    S._timerState.secondsLeft--;
    updateTimerDisplay();
    if (S._timerState.secondsLeft <= 0) {
      clearInterval(S.timerInterval);
      const sec = S.test.sections;
      if (S.test.currentSection < sec.length - 1) {
        alert(`Time's up for ${sec[S.test.currentSection].name}! Moving to next section.`);
        fullTestGoSection(S.test.currentSection + 1);
      } else {
        alert("Time's up! Submitting your test.");
        handleSubmitFullTest();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  const bar = document.getElementById('timer-bar');
  const s = S._timerState.secondsLeft;
  const pct = (s / S._timerState.totalSeconds) * 100;
  if (el) {
    el.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    el.style.color = s <= 60 ? '#fca5a5' : 'white';
  }
  if (bar) bar.style.width = pct + '%';
}

function handleSubmitFullTest() {
  clearInterval(S.timerInterval);
  S.timerInterval = null;
  const { sections, answers } = S.test;
  let totalCorrect = 0, totalQ = 0;
  const sectionBreakdown = {};
  const allAttempts = [];

  for (const sec of sections) {
    let secCorrect = 0;
    for (const q of sec.questions) {
      totalQ++;
      const userAnswer = answers[q.id] || null;
      const isCorrect  = userAnswer === q.correct;
      if (isCorrect) { secCorrect++; totalCorrect++; }
      allAttempts.push({ question: q, userAnswer, isCorrect });
    }
    sectionBreakdown[sec.name] = { correct: secCorrect, total: sec.questions.length };
  }

  const scorePct = Math.round((totalCorrect / totalQ) * 100);
  const scaled = S.test.testType === 'SAT'
    ? Math.round(400 + (scorePct / 100) * 800)
    : Math.round(1 + (scorePct / 100) * 35);
  const scoreLabel = S.test.testType === 'SAT' ? `~${scaled}/1600` : `~${scaled}/36`;

  S.test.results = { totalCorrect, totalQ, scorePct, sectionBreakdown, allAttempts, scoreLabel };

  saveCompletedSession({
    type: 'full_test',
    testType: S.test.testType,
    section: 'Full Test',
    correct: totalCorrect,
    total: totalQ,
    sectionBreakdown,
    scaledScore: scaled,
    scoreLabel,
  });
  navigate('test-results');
}

function viewTestResults() {
  if (!S.test || !S.test.results) { navigate('dashboard'); return ''; }
  const { totalCorrect, totalQ, scorePct, sectionBreakdown, allAttempts, scoreLabel } = S.test.results;

  return `
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div class="text-white rounded-2xl p-8 mb-8 shadow-lg" style="background:linear-gradient(135deg,#1e3a5f,#2d5282)">
      <h1 class="text-2xl font-extrabold mb-1">${esc(S.test.testType)} Practice Test Complete</h1>
      <div class="grid sm:grid-cols-3 gap-6 mt-6">
        <div class="text-center">
          <div class="text-5xl font-extrabold" style="color:#f6ad55">${scorePct}%</div>
          <div class="text-blue-200 text-sm mt-1">Overall Score</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-extrabold">${scoreLabel}</div>
          <div class="text-blue-200 text-sm mt-1">Estimated Score</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-extrabold">${totalCorrect}/${totalQ}</div>
          <div class="text-blue-200 text-sm mt-1">Correct Answers</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 mb-8">
      <h2 class="text-xl font-bold mb-4" style="color:#1e3a5f">Section Breakdown</h2>
      <div class="space-y-4">
        ${Object.entries(sectionBreakdown).map(([sec,{correct,total}]) => {
          const pct = Math.round((correct/total)*100);
          return `<div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-semibold text-gray-700">${esc(sec)}</span>
              <span class="font-bold" style="color:${scoreColor(pct)}">${pct}% (${correct}/${total})</span>
            </div>
            <div class="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div class="h-3 rounded-full" style="width:${pct}%;background:${scoreColor(pct)}"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 mb-8 border-l-4" style="border-color:${scoreColor(scorePct)}">
      <h3 class="font-bold text-lg mb-2" style="color:#1e3a5f">
        ${scorePct>=80?'Outstanding Performance!':scorePct>=60?'Good Work — Keep Improving!':'Great Effort — Let\'s Level Up!'}
      </h3>
      <p class="text-gray-600 text-sm leading-relaxed">
        ${scorePct>=80
          ? "You're performing at a high level. Review the few questions you missed for clues about your next improvement."
          : scorePct>=60
          ? "Solid foundation! Your section breakdown shows exactly where to focus next. Target your lowest section first for the biggest gains."
          : "Don't be discouraged — this is what practice tests are for! Review every explanation below, then use the AI Tutor for a personalized study plan."}
      </p>
      <div class="flex gap-3 mt-4 flex-wrap">
        <button onclick="navigate('tutor')" class="font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition text-sm" style="background:#f6ad55;color:#1e3a5f">Get AI Tutor Advice</button>
        <button onclick="navigate('test-select')" class="text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition text-sm" style="background:#1e3a5f">Take Another Test</button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold" style="color:#1e3a5f">Answer Review</h2>
        <button onclick="document.getElementById('review-body').classList.toggle('hidden')" class="text-sm font-semibold hover:underline" style="color:#1e3a5f">Toggle</button>
      </div>
      <div id="review-body" class="space-y-4">
        ${allAttempts.map(({ question:q, userAnswer, isCorrect }) => `
        <div class="rounded-xl p-4 border" style="background:${isCorrect?'#f0fdf4':'#fef2f2'};border-color:${isCorrect?'#86efac':'#fca5a5'}">
          <div class="mb-2">
            <span class="text-xs font-semibold" style="color:${isCorrect?'#166534':'#991b1b'}">${isCorrect?'✅ Correct':'❌ Incorrect'}</span>
            <span class="text-xs text-gray-500 ml-2">${esc(q.section)} · ${esc(q.topic)}</span>
          </div>
          <p class="text-sm text-gray-700 font-medium mb-2 whitespace-pre-line">${esc(q.question)}</p>
          <div class="text-xs mb-2">
            <span class="font-semibold text-gray-600">Your answer: </span>
            <span class="font-bold" style="color:${isCorrect?'#16a34a':'#dc2626'}">${userAnswer || 'Not answered'}</span>
            ${!isCorrect?`&nbsp; <span class="font-semibold text-gray-600">Correct: </span><span class="font-bold" style="color:#16a34a">${q.correct}</span>`:''}
          </div>
          <div class="p-3 rounded-lg text-xs border" style="background:#eff6ff;border-color:#bfdbfe;color:#1e40af">
            <strong>Explanation: </strong>${esc(q.explanation)}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="flex justify-center mt-8">
      <button onclick="navigate('dashboard')" class="text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition" style="background:#1e3a5f">Back to Dashboard</button>
    </div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════════════════
// AI TUTOR (rule-based)
// ════════════════════════════════════════════════════════════════════════════
function viewTutor() {
  const msgs = DB.getTutorMsgs(S.user);
  const starters = ['What should I study first?','Tips for SAT Math?','How do I improve my Reading score?','Explain the difference between SAT and ACT','I feel nervous about the test'];

  return `
  <div class="max-w-4xl mx-auto px-4 py-8 flex flex-col" style="height:calc(100vh - 130px)">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-extrabold" style="color:#1e3a5f">AI Tutor</h1>
        <p class="text-sm text-gray-500">Personalized advice based on your performance</p>
      </div>
      <button onclick="clearTutorChat()" class="text-xs text-gray-400 hover:text-red-500 transition">Clear chat</button>
    </div>

    <div id="chat-box" class="flex-1 overflow-y-auto space-y-4 py-2 pr-1 mb-4">
      ${msgs.length === 0 ? `
      <div class="text-center py-10">
        <div class="text-5xl mb-3">🤖</div>
        <h3 class="text-lg font-bold mb-2" style="color:#1e3a5f">Hi! I'm Alex, your AI Tutor.</h3>
        <p class="text-gray-500 text-sm max-w-md mx-auto">I'll give you personalized advice based on your PrepMaster performance. Ask me anything about test prep!</p>
        <div class="flex flex-wrap gap-2 justify-center mt-4">
          ${starters.map(s => `<button onclick="tutorStarter('${esc(s)}')" class="text-sm px-3 py-1.5 rounded-full transition font-medium hover:opacity-80" style="background:#dbeafe;color:#1e3a5f">${esc(s)}</button>`).join('')}
        </div>
      </div>` : msgs.map(m => tutorBubbleHtml(m.role, m.content)).join('')}
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 flex gap-2 items-end">
      <textarea id="tutor-input" rows="1"
        class="flex-1 resize-none border-none outline-none text-sm text-gray-800 placeholder-gray-400"
        style="max-height:8rem"
        placeholder="Ask your tutor anything..."
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTutorMessage()}"
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
      <button onclick="sendTutorMessage()" class="text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition flex-shrink-0" style="background:#1e3a5f">Send</button>
    </div>
    <p class="text-xs text-gray-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
  </div>`;
}

function tutorBubbleHtml(role, content) {
  if (role === 'user') {
    return `<div class="flex justify-end"><div class="max-w-3/4 px-4 py-3 text-sm leading-relaxed rounded-2xl rounded-br-sm text-white" style="background:#1e3a5f;max-width:78%">${nl2br(content)}</div></div>`;
  }
  return `<div class="flex justify-start gap-2">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5" style="background:#1e3a5f">A</span>
    <div class="px-4 py-3 text-sm leading-relaxed rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-gray-800" style="max-width:78%">${nl2br(content)}</div>
  </div>`;
}

function tutorStarter(text) {
  document.getElementById('tutor-input').value = text;
  sendTutorMessage();
}

function sendTutorMessage() {
  const input = document.getElementById('tutor-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  input.style.height = 'auto';

  const msgs = DB.getTutorMsgs(S.user);
  msgs.push({ role:'user', content: message, ts: Date.now() });

  const stats = getUserStats(S.user);
  const response = getRuleBasedResponse(message, stats);
  msgs.push({ role:'assistant', content: response, ts: Date.now() });

  DB.saveTutorMsgs(S.user, msgs);

  const chatBox = document.getElementById('chat-box');
  if (chatBox) {
    chatBox.innerHTML += tutorBubbleHtml('user', message);
    chatBox.innerHTML += tutorBubbleHtml('assistant', response);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function clearTutorChat() {
  if (!confirm('Clear all chat history?')) return;
  DB.saveTutorMsgs(S.user, []);
  navigate('tutor');
}

function getRuleBasedResponse(msg, stats) {
  const m = msg.toLowerCase();
  const hasStats = stats.total > 0;

  // Build personalized context
  let personalNote = '';
  if (hasStats) {
    if (stats.weakAreas.length) personalNote = `\n\nBased on your recent sessions, I can see you're working on ${stats.weakAreas[0]} — so pay extra attention to the advice relevant to that area.`;
    else if (stats.avgScore >= 80) personalNote = `\n\nYour average of ${stats.avgScore}% is excellent! You're in the refinement stage now — small improvements in tricky question types will push your score even higher.`;
  } else {
    personalNote = `\n\nSince you're just getting started, I don't have your performance data yet. Take a practice quiz first and I can give you much more targeted advice!`;
  }

  // ── TOPIC MATCHING ────────────────────────────────────────────────────────

  if (/\b(hello|hi|hey|start|begin)\b/.test(m)) {
    return `Hey there! Great to meet you. I'm Alex, and I'm here to help you crush the SAT or ACT.\n\nTell me: which test are you preparing for, and when is your test date? Once I know that, I can help you build a study plan that maximizes your score improvement in the time you have.${personalNote}`;
  }

  if (/\b(study plan|schedule|how long|weeks|months|when to start)\b/.test(m)) {
    return `Here's a proven 8-week study plan that works for most students:\n\n📅 Weeks 1–2: Take a full diagnostic test to find your baseline. Don't study beforehand — you need honest data.\n📅 Weeks 3–5: Focus 80% of your time on your two weakest sections. Use targeted practice drills (the PrepMaster Practice Quiz is great for this).\n📅 Weeks 6–7: Take two full practice tests under real time conditions. Review every single mistake.\n📅 Week 8: Light review only — no cramming. Focus on mental prep and sleep.\n\nIf you have less than 8 weeks, cut the review phase short but keep the full practice tests. If you have more, add extra drill time in weeks 3–5.${personalNote}`;
  }

  if (/\b(sat|act)\s*(or|vs|versus|difference|which|better|choose)\b/.test(m) || /which test/.test(m)) {
    return `Great question — picking the right test can make a big difference!\n\nThe SAT tends to favor students who are strong at problem-solving and reasoning. The math section is heavily algebra and data analysis. Reading passages are long and require careful evidence-tracking.\n\nThe ACT is more straightforward and curriculum-based — it tests what you've actually learned in school. The science section sounds scary but is really just data interpretation. The pace is faster (more questions per minute).\n\nMy advice: take one official practice test for each and compare your scaled scores. Most students have a clear preference after that. Many colleges now accept both equally.\n\nIf you're strong in math and comfortable with longer, denser reading — SAT. If you're a fast reader and stronger in science class — ACT.${personalNote}`;
  }

  if (/\b(math|algebra|equation|quadratic|geometry|trigonometry|exponent|fraction)\b/.test(m)) {
    const satMath = hasStats && stats.weakAreas.some(a => a.includes('Math'));
    return `Math is one of the most improvable sections — here's how to attack it:\n\n🔢 Heart of Algebra (SAT) / Pre-Algebra & Algebra (ACT): These are your easiest points. Master isolating variables, systems of equations, and linear functions. Always check your answer by plugging it back in.\n\n📐 Geometry: Memorize the Pythagorean theorem and the special right triangles (30-60-90 and 45-45-90). The area and volume formulas are NOT given on the ACT.\n\n🔣 Advanced Math: For quadratics, learn to factor quickly AND use the quadratic formula as a backup. Know Vieta's formulas (sum of roots = −b/a, product = c/a) — they show up surprisingly often.\n\n⚡ Speed strategies: If algebra feels slow, try plugging in answer choices (backsolving) or plugging in a specific number for variables. On the SAT you can use a calculator on most of the math section — use it!\n\n${satMath ? '⚠️ I see Math is one of your focus areas based on your sessions — prioritize 20–30 minutes of targeted math drills per day.' : ''}${personalNote}`;
  }

  if (/\b(reading|passage|comprehension|inference|evidence|tone|author)\b/.test(m)) {
    return `Reading is where many students leave points on the table. Here's the system that works:\n\n📖 The Golden Rule: Every correct answer is directly supported by specific words in the passage. If you can't point to the line, it's probably wrong.\n\n⚡ Time strategy: Read the questions first, THEN skim the passage for relevant sections. Don't read the entire passage before looking at questions — it wastes time.\n\n🔍 Evidence questions: On the SAT, paired questions (q+evidence) must link directly. Your evidence answer should PROVE your previous answer, not just relate to it.\n\n❌ Eliminating answers: Cross out anything extreme ("always," "never," "solely") and anything that goes beyond the passage (even if it's true in real life, if the passage doesn't say it, it's wrong).\n\n📝 Words-in-context: Read 2 sentences before and after the word. Try each answer choice in the sentence to see which sounds natural.${personalNote}`;
  }

  if (/\b(writing|grammar|punctuation|comma|semicolon|apostrophe|sentence|concise|transition)\b/.test(m)) {
    return `Grammar and Writing is a highly learnable section — these 6 rules cover ~80% of questions:\n\n1️⃣ Subject-verb agreement: Find the true subject (ignore prepositional phrases). "The group of students WAS ready" — the verb agrees with "group," not "students."\n\n2️⃣ Parallel structure: Items in a list must match in form. "She likes hiking, swimming, and to run" → wrong. "hiking, swimming, and running" → correct.\n\n3️⃣ Semicolons: ONLY connect two independent (complete) sentences. Never use a semicolon before a fragment.\n\n4️⃣ Commas: Non-essential clauses need commas on both sides. Essential clauses get no commas.\n\n5️⃣ Conciseness: The SAT/ACT almost always prefers shorter answers. "Due to the fact that" → "Because." "At this point in time" → "Now."\n\n6️⃣ Transitions: Know the difference between contrast (however, nevertheless), cause (therefore, thus), and addition (furthermore, moreover).${personalNote}`;
  }

  if (/\b(act english|act writing)\b/.test(m)) {
    return `ACT English is 75 questions in 45 minutes — pace is everything!\n\n⏱ Time management: You have about 36 seconds per question. Don't linger. If a question takes more than 45 seconds, guess and move on.\n\n📌 "NO CHANGE" is correct about 25% of the time. Always read it seriously — don't assume every sentence needs fixing.\n\n🎯 Rhetorical skills questions: When asked to add, delete, or reorder content, always ask: does this information support the paragraph's main purpose? Stay focused on function, not just grammar.\n\n✂️ Comma splices: Two complete sentences joined only by a comma is always wrong on the ACT. Fix with a semicolon, a period, or a coordinating conjunction (FANBOYS: for, and, nor, but, or, yet, so).${personalNote}`;
  }

  if (/\b(science|act science|data|graph|chart|experiment|hypothesis)\b/.test(m)) {
    return `Here's the secret about ACT Science: you don't actually need science knowledge.\n\nIt's a reading comprehension + data interpretation test in disguise. Here's how to approach each type:\n\n📊 Data Representation (38% of questions): Read graphs directly. Find the trend (does the line go up or down?), identify the axes, and spot outliers. Don't overthink it.\n\n🔬 Research Summaries (45% of questions): Focus on what variable was changed and what effect it produced. Always ask: what was the control condition?\n\n⚔️ Conflicting Viewpoints (17% of questions): Read each scientist's claim separately before looking at questions. Identify what evidence each scientist relies on.\n\n🚀 Speed tip: Read the questions before the passage to know exactly what data you're looking for. This cuts reading time significantly.${personalNote}`;
  }

  if (/\b(time|timing|pacing|fast|slow|run out|speed|minutes)\b/.test(m)) {
    return `Time management is one of the biggest differentiators between average and high scores. Here's how to fix it:\n\n⏱ Know your pace:\n• SAT Math: ~1.5 min/question\n• SAT Reading: ~1.25 min/question\n• ACT English: ~36 sec/question\n• ACT Math: ~1 min/question\n• ACT Reading: ~52 sec/question\n• ACT Science: ~52 sec/question\n\n🔄 The Skip Rule: If you've spent 90+ seconds on one question and you're stuck, mark it and move on. Come back with fresh eyes. Never let one question cost you three.\n\n✅ Always guess: There's no penalty for wrong answers on either test. Never leave a blank. On your first pass, eliminate 1-2 choices and pick the best remaining option.\n\n🏋️ The fix: Do timed practice. Use a timer on every practice session — even for short drills. Timing awareness is a skill you have to train.${personalNote}`;
  }

  if (/\b(anxious|nervous|anxiet|stress|scared|worried|fear|overwhelm)\b/.test(m)) {
    return `Test anxiety is real and very common — and it's completely manageable. Here's what actually works:\n\n🧠 Preparation is the best anxiety reducer. Most test anxiety comes from feeling unprepared. The more practice tests you take in realistic conditions, the more familiar and less threatening the test environment feels.\n\n🌬️ Day-of strategies: Take three slow, deep breaths before starting each section. If you feel panicked during a section, close your eyes for 5 seconds. This sounds simple, but it interrupts the anxiety spiral.\n\n💭 Reframe the stakes: One test score is not your identity or your future. It's one data point. Colleges look at the whole picture. Many students significantly improve on their second attempt.\n\n💤 The night before: Do NOT cram. Light review only. Eat a good dinner, get 8+ hours of sleep, and eat breakfast. Sleep deprivation hurts cognitive performance more than any last-minute studying can help.${personalNote}`;
  }

  if (/\b(improve|better|score|raise|increase|higher|points)\b/.test(m)) {
    const weakPart = hasStats && stats.weakAreas.length
      ? `Based on your data, your best opportunity right now is ${stats.weakAreas[0]}. Focused practice on that section alone could add significant points.`
      : 'Without your performance data yet, start with a diagnostic practice test to find your biggest opportunity areas.';
    return `Here's how to maximize score improvement:\n\n🎯 Focus on your weakest section first. A student at 50% in one section has much more to gain there than a student at 80%. ${weakPart}\n\n📈 The fastest gains come from mastering patterns, not memorizing facts. SAT and ACT questions repeat the same concepts over and over — learn to recognize the "type" of question, not just the answer.\n\n✏️ Review every mistake carefully. For every wrong answer, ask yourself: Why did I get this wrong? Was it a knowledge gap, a careless error, or a time management issue? Each has a different fix.\n\n📋 Take full practice tests regularly. Short drills build skills; full tests build stamina and reveal test-day patterns (like which section you tend to fade in).${personalNote}`;
  }

  if (/\b(vocabulary|words|vocab|difficult words)\b/.test(m)) {
    return `Vocabulary on the new SAT and ACT is very different from the old SAT — they no longer test obscure, archaic words.\n\nInstead, they test "words in context" — how a common word is used in a specific passage. The question will give you 4 definitions of a real word and ask which fits best.\n\nThe strategy: Go back to the passage, cover the word, and think about what the sentence means. Then try each answer choice in place of the word. The correct answer will preserve the sentence's meaning.\n\nDon't waste time memorizing long vocabulary lists. Instead, practice the "cover and predict" strategy on every words-in-context question you do.${personalNote}`;
  }

  if (/\b(resources|study guide|material|book|prep|khan|collegeboard)\b/.test(m)) {
    return `Here are the best free and paid resources for SAT/ACT prep:\n\n🆓 Free:\n• Khan Academy SAT prep (official partner with College Board — highly recommended)\n• College Board's official SAT practice tests (8 full free tests)\n• ACT's official practice test (free on ACT.org)\n• PrepMaster's Resources section — study guides and strategies for every section!\n\n📚 Paid (worth it if you're serious):\n• Official SAT Study Guide (College Board) — real past tests\n• The Real ACT Prep Guide — real past ACT tests\n• Princeton Review or Kaplan for concept explanations\n\nMy recommendation: Start with the free official materials. Real past tests are the gold standard. Third-party books are great for concept review, but nothing beats practicing on real questions.${personalNote}`;
  }

  if (/\b(full test|practice test|diagnostic)\b/.test(m)) {
    return `Full practice tests are the single highest-value activity in your prep. Here's how to get the most out of them:\n\n🎯 Simulate real conditions: Use a timer, sit at a desk, no phone, no music. Treat it exactly like test day.\n\n📝 Don't just look at your score. After the test, spend MORE time reviewing than you spent taking it. Every wrong answer is a learning opportunity. Every right answer you weren't sure about is worth reviewing too.\n\n📅 Frequency: Take one full test every 2 weeks. Any more and you won't have time for the review and skill-building between tests.\n\n📈 Track patterns: Are you missing the same type of question repeatedly? That's your study focus. Are you running out of time in one section? That's your pacing issue.${personalNote}`;
  }

  // Default intelligent response
  const topicGuess = hasStats && stats.weakAreas.length
    ? `I notice from your performance that ${stats.weakAreas[0]} is an area where you have room to grow — want me to give you specific strategies for that?`
    : 'Tell me what you\'re working on and I\'ll give you targeted advice!';

  return `That's a great question! To give you the most useful advice, could you be a bit more specific?\n\nI can help with:\n• SAT or ACT Math strategies\n• Reading and Writing/English techniques\n• ACT Science approach\n• Test timing and pacing\n• Managing test anxiety\n• Building a study schedule\n• Understanding your weak areas and how to fix them\n\n${topicGuess}`;
}

// ════════════════════════════════════════════════════════════════════════════
// RESOURCES
// ════════════════════════════════════════════════════════════════════════════
const RESOURCE_CARDS = [
  { tags:['SAT','Math'], icon:'📐', title:'SAT Math: Heart of Algebra',
    desc:'Linear equations and inequalities make up ~33% of SAT Math.',
    tips:['<strong>Isolate variables:</strong> Move all constants to one side first. Always verify by plugging your answer back in.',
          '<strong>Slope-intercept form:</strong> Know y = mx + b cold. Parallel lines have equal slopes; perpendicular lines have negative reciprocal slopes.',
          '<strong>Systems of equations:</strong> Addition/elimination is usually fastest on the SAT.',
          '<strong>Substitution trick:</strong> If a problem has 6x+14 and you know 3x+7, notice 6x+14 = 2(3x+7). Look for expressions that are multiples of given equations.'] },

  { tags:['SAT','Math'], icon:'🔣', title:'SAT Math: Advanced Math',
    desc:'Quadratics, polynomials, and functions — the hardest questions live here.',
    tips:['<strong>Factoring:</strong> (x+a)(x+b) = x² + (a+b)x + ab. Recognize this pattern instantly.',
          "<strong>Vertex form:</strong> y = a(x−h)² + k — the vertex is at (h, k).",
          "<strong>Vieta's formulas:</strong> For x² + bx + c = 0, sum of roots = −b, product of roots = c.",
          '<strong>Exponent rules:</strong> aᵐ·aⁿ = aᵐ⁺ⁿ and (aᵐ)ⁿ = aᵐⁿ. Know these cold.'] },

  { tags:['SAT','Reading'], icon:'📖', title:'SAT Reading Strategy',
    desc:'Reading is about what the passage says, not what seems logical.',
    tips:['<strong>Read the question first,</strong> then find the relevant section in the passage.',
          '<strong>Every correct answer is textually supported.</strong> If you cannot point to the line that proves it, eliminate it.',
          '<strong>Evidence-based questions:</strong> Your line reference must directly prove your previous answer — not just relate to it.',
          '<strong>Eliminate extreme language:</strong> "Always," "never," "solely" are almost always wrong.'] },

  { tags:['SAT','Writing'], icon:'✏️', title:'SAT Writing: Top 6 Grammar Rules',
    desc:'These rules cover ~80% of all SAT Writing questions.',
    tips:['<strong>Subject-verb agreement:</strong> Ignore prepositional phrases. Find the real subject.',
          '<strong>Parallel structure:</strong> Items in a list must have the same grammatical form.',
          '<strong>Semicolons:</strong> Only between two independent clauses — never before a fragment.',
          '<strong>Non-essential clauses:</strong> Must be set off with commas on both sides.',
          '<strong>Conciseness:</strong> The shorter, clearer choice is almost always right on the SAT.'] },

  { tags:['ACT','Math'], icon:'🔢', title:'ACT Math: Core Strategy',
    desc:'ACT Math covers more ground than SAT Math but at a shallower depth.',
    tips:['<strong>Questions go easy to hard.</strong> Questions 1–20 are mostly pre-algebra — get them all correct.',
          '<strong>No formula sheet.</strong> Memorize: area formulas, Pythagorean theorem, distance formula, and trig identities.',
          '<strong>SOH-CAH-TOA:</strong> sin = opp/hyp, cos = adj/hyp, tan = opp/adj.',
          '<strong>Backsolving:</strong> Plug answer choices into the problem when algebra feels slow — start with B or C.'] },

  { tags:['ACT','Writing'], icon:'📝', title:'ACT English: Speed & Accuracy',
    desc:'75 questions in 45 minutes — about 36 seconds per question.',
    tips:['"<strong>NO CHANGE" is correct ~25% of the time.</strong> Read it critically before rejecting it.',
          '<strong>Comma splices</strong> (two full sentences joined by just a comma) are always wrong on the ACT.',
          '<strong>For rhetorical questions:</strong> Ask whether the information supports the paragraph\'s main purpose.',
          '<strong>Verb tense:</strong> Maintain consistent tense throughout a passage unless there\'s a clear reason to shift.'] },

  { tags:['ACT','Reading'], icon:'📰', title:'ACT Reading: Speed Techniques',
    desc:'40 questions, 35 minutes — pacing is the #1 challenge.',
    tips:['<strong>Do your best passage type first</strong> to bank points and build confidence.',
          '<strong>3-5-3-3 pacing:</strong> Spend 3 min on the passage and 5 min on questions, per passage (≈ 8 min each).',
          '<strong>Line references:</strong> Go directly to the cited lines and read ± 2 sentences. Do not trust your memory.',
          '<strong>Eliminate extreme answers.</strong> "Always," "never," "only" answers are almost always wrong.'] },

  { tags:['ACT','Science'], icon:'🔬', title:'ACT Science: It\'s Not About Science',
    desc:"You don't need to know science — you need to read data.",
    tips:['<strong>Data Representation:</strong> Read graphs directly. What do the axes show? What is the trend?',
          '<strong>Research Summaries:</strong> Identify the independent variable (what changed) and dependent variable (what was measured).',
          '<strong>Conflicting Viewpoints:</strong> Read each scientist\'s position separately. Identify their core claim and evidence before answering.',
          '<strong>Read questions first</strong> to know exactly what to look for in the passage.'] },

  { tags:['Strategy'], icon:'🎯', title:'Test-Day Strategy',
    desc:'What you do on test day matters as much as how you studied.',
    tips:['<strong>Always guess.</strong> No penalty for wrong answers on SAT or ACT — never leave a blank.',
          '<strong>Process of elimination:</strong> Eliminate 2 choices and your odds jump to 50%. Eliminate 3 and it\'s easy.',
          "<strong>Don't linger.</strong> If you're stuck after 90 seconds, mark and move on. Return with fresh eyes.",
          '<strong>The night before:</strong> Light review only, 8 hours of sleep, eat breakfast. Cramming hurts more than it helps.'] },

  { tags:['Strategy'], icon:'📅', title:'8-Week Study Plan',
    desc:'A structured schedule for steady, measurable score improvement.',
    tips:['<strong>Weeks 1–2:</strong> Take a full diagnostic test (no studying first — you need honest data).',
          '<strong>Weeks 3–5:</strong> Targeted drills on your top 2 weak sections, 30–45 min per day.',
          '<strong>Weeks 6–7:</strong> Two full practice tests under real conditions, with thorough review of every mistake.',
          '<strong>Week 8:</strong> Light review only. Prioritize sleep and mental readiness.'] },
];

function viewResources() {
  const allTags = ['All','SAT','ACT','Math','Reading','Writing','Science','Strategy'];
  return `
  <div class="max-w-5xl mx-auto px-4 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold" style="color:#1e3a5f">Study Resources</h1>
      <p class="text-gray-500 mt-1">Strategies, tips, and guides for every section of the SAT and ACT.</p>
    </div>
    <div class="flex flex-wrap gap-2 mb-8" id="filter-row">
      ${allTags.map(tag => `<button onclick="filterResources('${tag}')" id="res-filter-${tag}"
        class="px-4 py-2 rounded-full text-sm font-semibold transition"
        style="${tag==='All'?'background:#1e3a5f;color:white':'background:#f3f4f6;color:#374151'}">${tag}</button>`).join('')}
    </div>
    <div class="grid md:grid-cols-2 gap-6" id="resource-grid">
      ${RESOURCE_CARDS.map(card => `
      <div class="resource-card bg-white rounded-2xl shadow p-6" data-tags="${card.tags.join(',')}">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">${card.icon}</span>
          <div class="flex gap-2 flex-wrap">
            ${card.tags.map(t => `<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="${tagStyle(t)}">${t}</span>`).join('')}
          </div>
        </div>
        <h3 class="text-lg font-bold mb-1" style="color:#1e3a5f">${card.title}</h3>
        <p class="text-sm text-gray-500 mb-4">${card.desc}</p>
        <ul class="space-y-2">
          ${card.tips.map(tip => `<li class="flex gap-2 text-sm text-gray-700"><span style="color:#1e3a5f;font-weight:bold;flex-shrink:0">•</span><span>${tip}</span></li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>
  </div>`;
}

function tagStyle(t) {
  const map = {SAT:'background:#dbeafe;color:#1e40af',ACT:'background:#fee2e2;color:#991b1b',
    Math:'background:#ede9fe;color:#6d28d9',Reading:'background:#d1fae5;color:#065f46',
    Writing:'background:#ffedd5;color:#9a3412',Science:'background:#ccfbf1;color:#0f766e',
    Strategy:'background:#fef9c3;color:#92400e'};
  return map[t] || 'background:#f3f4f6;color:#374151';
}

function filterResources(tag) {
  document.querySelectorAll('[id^=res-filter-]').forEach(btn => {
    const isActive = btn.id === 'res-filter-' + tag;
    btn.style.background = isActive ? '#1e3a5f' : '#f3f4f6';
    btn.style.color = isActive ? 'white' : '#374151';
  });
  document.querySelectorAll('.resource-card').forEach(card => {
    const tags = card.dataset.tags.split(',');
    card.style.display = (tag === 'All' || tags.includes(tag)) ? '' : 'none';
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════════════════
function init() {
  const user = DB.getCurrentUser();
  if (user && DB.getUsers()[user]) {
    S.user = user;
    navigate('dashboard');
  } else {
    navigate('landing');
  }
}

window.addEventListener('DOMContentLoaded', init);
