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
  getSeenIds(user,key)     { return JSON.parse(localStorage.getItem('pm_seen_' + user + '_' + key) || '[]'); },
  saveSeenIds(user,key,ids){ localStorage.setItem('pm_seen_' + user + '_' + key, JSON.stringify(ids)); },
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

function markQuestionsSeen(quiz) {
  if (!S.user || !quiz.seenKey) return;
  const answeredIds = quiz.questions.map(q => q.id);
  let seen = DB.getSeenIds(S.user, quiz.seenKey);
  seen = [...new Set([...seen, ...answeredIds])];

  // Count total available questions for this key's pool
  const poolSize = QUESTIONS.filter(q => {
    const sec = quiz.section !== 'Mixed' ? quiz.section : null;
    const tt  = quiz.testType !== 'Mixed' ? quiz.testType : null;
    if (tt && tt !== 'BOTH' && q.testType !== tt && q.testType !== 'BOTH') return false;
    if (sec && q.section.toLowerCase() !== sec.toLowerCase()) return false;
    return true;
  }).length;

  // Reset seen list when all pool questions have been seen
  if (seen.length >= poolSize) seen = [];
  DB.saveSeenIds(S.user, quiz.seenKey, seen);
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
            <select name="section" id="section-select" onchange="handleSectionChange()" class="select-field">
              <option value="">All Sections</option>
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing (SAT)</option>
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

// Section labels for display
const SECTION_LABELS = { English:'English (ACT)', Science:'Science (ACT)', Writing:'Writing (SAT)', Math:'Math', Reading:'Reading' };
// Which test each section belongs to (undefined = works for either)
const SECTION_TEST_LOCK = { English:'ACT', Science:'ACT', Writing:'SAT' };

function updatePracticeSections(sel) {
  const testType = sel.value;
  const secSel = document.getElementById('section-select');
  const sections = testType === 'SAT'
    ? ['Math','Reading','Writing']
    : testType === 'ACT'
      ? ['English','Math','Reading','Science']
      : ['Math','Reading','Writing','English','Science'];
  secSel.innerHTML = `<option value="">All Sections</option>` +
    sections.map(s => `<option value="${esc(s)}">${esc(SECTION_LABELS[s] || s)}</option>`).join('');
  updatePracticeTopics();
}

function handleSectionChange() {
  const section  = document.getElementById('section-select').value;
  const testSel  = document.querySelector('[name=testType]');
  if (section && SECTION_TEST_LOCK[section]) {
    testSel.value = SECTION_TEST_LOCK[section];
  }
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
  const section = f.section.value || undefined;
  const testType = f.testType.value || undefined;

  // Build a stable key for this section's seen-question list
  const seenKey = (section || 'all') + '_' + (testType || 'all');
  const seenIds = S.user ? DB.getSeenIds(S.user, seenKey) : [];

  const opts = {
    testType,
    section,
    topic:      f.topic.value    || undefined,
    difficulty: f.difficulty.value || undefined,
    count:      parseInt(f.count.value) || 10,
    seenIds,
  };
  const questions = getQuestions(opts);
  if (!questions.length) { alert('No questions found for those filters. Try different options.'); return; }
  S.quiz = {
    questions,
    answers: {},
    currentIndex: 0,
    type: 'practice',
    testType: questions[0].testType || testType || 'Mixed',
    section: section || 'Mixed',
    topic: f.topic.value || 'Mixed',
    difficulty: f.difficulty.value || 'Mixed',
    seenKey,
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
  markQuestionsSeen(S.quiz);
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
  const stats = getUserStats(S.user);

  // Build dynamic starters based on user performance
  const starters = getTutorStarters(stats);

  // Build welcome card content
  let welcomeStats = '';
  if (stats.total > 0) {
    const scoreColor = stats.avgScore >= 75 ? '#16a34a' : stats.avgScore >= 55 ? '#d97706' : '#dc2626';
    welcomeStats = `
    <div class="flex gap-3 justify-center mt-3 flex-wrap">
      <span class="text-xs px-3 py-1 rounded-full font-medium" style="background:#eff6ff;color:#1e40af">${stats.total} session${stats.total!==1?'s':''} completed</span>
      <span class="text-xs px-3 py-1 rounded-full font-medium" style="background:#f0fdf4;color:${scoreColor}">${stats.avgScore}% avg score</span>
      ${stats.weakAreas.length ? `<span class="text-xs px-3 py-1 rounded-full font-medium" style="background:#fff7ed;color:#9a3412">Focus: ${esc(stats.weakAreas[0])}</span>` : ''}
    </div>`;
  }

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
      <div class="text-center py-8">
        <div class="text-5xl mb-3">🎓</div>
        <h3 class="text-lg font-bold mb-1" style="color:#1e3a5f">Hi! I'm Alex, your AI Tutor.</h3>
        <p class="text-gray-500 text-sm max-w-md mx-auto">I give you personalized advice based on your PrepMaster performance. Ask me anything about test prep!</p>
        ${welcomeStats}
        <div class="flex flex-wrap gap-2 justify-center mt-5">
          ${starters.map(s => `<button onclick="tutorStarter('${esc(s)}')" class="text-sm px-3 py-1.5 rounded-full transition font-medium hover:opacity-80" style="background:#dbeafe;color:#1e3a5f">${esc(s)}</button>`).join('')}
        </div>
      </div>` : msgs.map(m => tutorBubbleHtml(m.role, m.content, m.chips)).join('')}
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-3 flex gap-2 items-end">
      <textarea id="tutor-input" rows="1"
        class="flex-1 resize-none border-none outline-none text-sm text-gray-800 placeholder-gray-400"
        style="max-height:8rem"
        placeholder="Ask Alex anything..."
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendTutorMessage()}"
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
      <button onclick="sendTutorMessage()" id="tutor-send-btn" class="text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition flex-shrink-0" style="background:#1e3a5f">Send</button>
    </div>
    <p class="text-xs text-gray-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
  </div>`;
}

function getTutorStarters(stats) {
  const defaults = ['What should I study first?','SAT vs ACT — which is better for me?','How do I manage test anxiety?','Build me a study plan'];
  if (!stats.total) return defaults;
  const out = [];
  if (stats.weakAreas.length) out.push(`How do I improve in ${stats.weakAreas[0]}?`);
  if (stats.weakAreas.length > 1) out.push(`Tips for ${stats.weakAreas[1]}?`);
  if (stats.avgScore >= 75) out.push('How do I push from good to great?');
  else out.push('What are the fastest ways to raise my score?');
  out.push('Build me a study plan');
  if (out.length < 5) out.push('How do I manage test timing?');
  return out.slice(0,5);
}

// Convert simple markdown-ish syntax to HTML for chat bubbles
function formatTutorMd(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n\n/g,'</p><p class="mt-2">')
    .replace(/\n/g,'<br>')
    .replace(/^/,'<p>').replace(/$/,'</p>');
}

function tutorBubbleHtml(role, content, chips) {
  if (role === 'user') {
    return `<div class="flex justify-end"><div class="px-4 py-3 text-sm leading-relaxed rounded-2xl rounded-br-sm text-white" style="background:#1e3a5f;max-width:78%">${formatTutorMd(content)}</div></div>`;
  }
  const chipsHtml = chips && chips.length
    ? `<div class="flex flex-wrap gap-1.5 mt-3">${chips.map(c => `<button onclick="tutorStarter('${esc(c)}')" class="text-xs px-2.5 py-1 rounded-full border transition hover:opacity-80 font-medium" style="border-color:#bfdbfe;color:#1e3a5f;background:#eff6ff">${esc(c)}</button>`).join('')}</div>`
    : '';
  return `<div class="flex justify-start gap-2">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style="background:#1e3a5f">A</span>
    <div class="px-4 py-3 text-sm leading-relaxed rounded-2xl rounded-tl-sm bg-white border border-gray-200 text-gray-800" style="max-width:78%">${formatTutorMd(content)}${chipsHtml}</div>
  </div>`;
}

function tutorTypingHtml() {
  return `<div class="flex justify-start gap-2" id="tutor-typing">
    <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style="background:#1e3a5f">A</span>
    <div class="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 flex items-center gap-1">
      <span class="w-2 h-2 rounded-full animate-bounce" style="background:#1e3a5f;animation-delay:0ms"></span>
      <span class="w-2 h-2 rounded-full animate-bounce" style="background:#1e3a5f;animation-delay:150ms"></span>
      <span class="w-2 h-2 rounded-full animate-bounce" style="background:#1e3a5f;animation-delay:300ms"></span>
    </div>
  </div>`;
}

function tutorStarter(text) {
  const input = document.getElementById('tutor-input');
  if (!input) return;
  input.value = text;
  sendTutorMessage();
}

function sendTutorMessage() {
  const input = document.getElementById('tutor-input');
  const btn = document.getElementById('tutor-send-btn');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  input.style.height = 'auto';
  if (btn) btn.disabled = true;

  const msgs = DB.getTutorMsgs(S.user);
  msgs.push({ role:'user', content: message, ts: Date.now() });
  DB.saveTutorMsgs(S.user, msgs);

  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;

  // Remove welcome screen if present
  const welcome = chatBox.querySelector('.text-center');
  if (welcome) welcome.remove();

  chatBox.insertAdjacentHTML('beforeend', tutorBubbleHtml('user', message));
  chatBox.insertAdjacentHTML('beforeend', tutorTypingHtml());
  chatBox.scrollTop = chatBox.scrollHeight;

  const delay = 600 + Math.random() * 500;
  setTimeout(() => {
    const typing = document.getElementById('tutor-typing');
    if (typing) typing.remove();

    const stats = getUserStats(S.user);
    const resp = getRuleBasedResponse(message, msgs, stats);
    const updatedMsgs = DB.getTutorMsgs(S.user);
    updatedMsgs.push({ role:'assistant', content: resp.text, chips: resp.chips, ts: Date.now() });
    DB.saveTutorMsgs(S.user, updatedMsgs);

    const box = document.getElementById('chat-box');
    if (box) {
      box.insertAdjacentHTML('beforeend', tutorBubbleHtml('assistant', resp.text, resp.chips));
      box.scrollTop = box.scrollHeight;
    }
    if (btn) btn.disabled = false;
  }, delay);
}

function clearTutorChat() {
  if (!confirm('Clear all chat history?')) return;
  DB.saveTutorMsgs(S.user, []);
  navigate('tutor');
}

function getRuleBasedResponse(msg, history, stats) {
  const m = msg.toLowerCase();
  const hasStats = stats.total > 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function r(text, chips) { return { text, chips: chips || [] }; }

  // Personalized data summary shown at the bottom of relevant responses
  function perfNote() {
    if (!hasStats) return '\n\nI don\'t have your performance data yet — take a practice quiz and I can give you much more targeted advice!';
    const parts = [];
    if (stats.weakAreas.length)  parts.push(`**Your focus areas:** ${stats.weakAreas.join(', ')}`);
    if (stats.strongAreas.length) parts.push(`**Your strong areas:** ${stats.strongAreas.join(', ')}`);
    if (parts.length) return '\n\n' + parts.join('\n');
    return `\n\nYour average is **${stats.avgScore}%** — looking solid! Keep drilling your weaker topics.`;
  }

  // Recent conversation context (avoid repeating the same topic)
  const recentTopics = (history || []).slice(-6).map(m => m.content.toLowerCase()).join(' ');

  // ── TOPIC MATCHING ────────────────────────────────────────────────────────

  if (/\b(hello|hi|hey|sup|what.?s up)\b/.test(m)) {
    if (!hasStats) {
      return r(`Hey! I'm Alex, your PrepMaster tutor. 👋\n\nI'm at my best when I have your performance data to work with. Start with a **Practice Quiz** or **Full Test**, then come back and I can give you advice that's actually specific to *your* gaps — not just generic tips.\n\nWhat test are you preparing for?`,
        ['SAT tips','ACT tips','Build me a study plan','I feel nervous about the test']);
    }
    const greeting = stats.avgScore >= 75
      ? `Looking at your data, you're doing well with an average of **${stats.avgScore}%** — now it's time to fine-tune!`
      : `Your current average is **${stats.avgScore}%** and your biggest opportunity is **${stats.weakAreas[0] || 'consistent practice'}**.`;
    return r(`Hey! Great to see you back. ${greeting}\n\nWhat do you want to work on today?`,
      stats.weakAreas.length
        ? [`How do I improve in ${stats.weakAreas[0]}?`, 'Build me a study plan', 'Test-day tips', 'How do I manage time?']
        : ['Build me a study plan', 'SAT vs ACT advice', 'Test-day tips', 'How do I manage time?']);
  }

  if (/\b(study plan|schedule|how long|weeks|months|when to start|build.?me)\b/.test(m)) {
    const weak = hasStats && stats.weakAreas.length ? `\n\n**Your personalized focus:** Based on your sessions, spend extra time on **${stats.weakAreas[0]}${stats.weakAreas[1] ? ' and ' + stats.weakAreas[1] : ''}** during weeks 3–5.` : '';
    return r(`Here's the proven 8-week plan:\n\n📅 **Weeks 1–2:** Take a full diagnostic test cold (no prep). You need honest baseline data.\n📅 **Weeks 3–5:** Put 80% of your time into your two weakest sections. Drill specific question types, not random mixed sets.\n📅 **Weeks 6–7:** Two full timed practice tests. Spend MORE time reviewing them than taking them.\n📅 **Week 8:** Light review only. No new material. Sleep, nutrition, and mindset.${weak}\n\n**Less than 8 weeks?** Skip extended drill time but never skip the full practice tests — they're irreplaceable.`,
      ['How do I manage test timing?', 'What are the fastest ways to raise my score?', 'ACT Science tips', 'Test anxiety help']);
  }

  if (/\b(sat|act)\s*(or|vs|versus|difference|which|better|choose)\b/.test(m) || /which test/.test(m)) {
    return r(`Picking the right test matters more than most students realize.\n\n**SAT is better if you:**\n• Are strong in algebra and data analysis\n• Prefer longer passages with detailed evidence questions\n• Like having more time per question (slightly)\n\n**ACT is better if you:**\n• Are a fast reader and comfortable with high pace\n• Are strong in science class (or good at data interpretation)\n• Prefer more straightforward, curriculum-based questions\n\n**My advice:** Take one real practice test for each. Most students have a clear preference after that — and the score gap between your "better" test is often significant. Most colleges accept both equally.`,
      ['SAT Math tips', 'ACT Science tips', 'Build me a study plan', 'How do I manage time?']);
  }

  if (/\b(math|algebra|equation|quadratic|geometry|trig|exponent|fraction|calculus|linear|polynomial)\b/.test(m)) {
    const isSAT = /sat/.test(m);
    const isACT = /act/.test(m);
    const mathStat = hasStats ? stats.topicStats.find(([k]) => k.includes('Math')) : null;
    const pct = mathStat ? ` (you're currently at **${mathStat[1]}%** in Math)` : '';
    return r(`Math is the most improvable section${pct}. Here's the full playbook:\n\n🔢 **Algebra (highest priority):** Linear equations, systems of equations, inequalities. Always verify by plugging your answer back in.\n\n📐 **Geometry:** Know the Pythagorean theorem, special triangles (30-60-90, 45-45-90), and circle formulas cold. On the ACT, formulas are **NOT** given — memorize them.\n\n🔣 **Advanced Math:** For quadratics, master factoring AND the quadratic formula as a backup. Know that sum of roots = **−b/a** and product = **c/a**.\n\n⚡ **Speed tricks:**\n• Backsolving: plug answer choices back in when algebra feels messy\n• Plug in numbers: replace variables with specific values (like x=2) to test expressions\n• On SAT Module 2, use the calculator aggressively\n\n${isSAT ? '**SAT-specific:** No geometry formula sheet for non-calculator questions. The harder questions are about functions, systems, and non-linear models.' : isACT ? '**ACT-specific:** 60 questions in 60 min — pace is critical. Trig questions appear (SOH-CAH-TOA, unit circle basics).' : ''}`,
      ['How do I improve in SAT – Math?', 'ACT Math pacing tips', 'Geometry strategies', 'How do I manage time?']);
  }

  if (/\b(reading|passage|comprehension|inference|evidence|tone|author.?s purpose|main idea|words in context)\b/.test(m)) {
    const readStat = hasStats ? stats.topicStats.find(([k]) => k.includes('Reading')) : null;
    const pct = readStat ? ` You're at **${readStat[1]}%** in Reading — ` : ' ';
    return r(`${pct}here's the system that eliminates careless mistakes:\n\n📖 **The Golden Rule:** Every correct answer is word-for-word supported somewhere in the passage. If you can't point to the exact line, eliminate it.\n\n⚡ **Time strategy:** Preview the questions first, then read purposefully. Don't re-read the whole passage — scan for where your answer lives.\n\n🔍 **Evidence questions (SAT):** Your line reference must directly *prove* your previous answer — not just be related to the topic. If the logic doesn't flow, go back and reconsider both answers.\n\n❌ **Eliminate traps:**\n• Extreme language: "always," "never," "solely" → almost always wrong\n• Out-of-scope: true in real life but not stated in the passage → wrong\n• Half-right: one part correct but another part wrong → wrong\n\n📝 **Words in context:** Cover the word, predict the meaning from context, then try each choice. Never rely on a memorized definition.`,
      ['SAT Evidence questions', 'How do I manage Reading time?', 'Author\'s purpose questions', 'ACT Reading tips']);
  }

  if (/\b(english|writing|grammar|punctuation|comma|semicolon|apostrophe|parallel|concise|transition|sentence structure)\b/.test(m)) {
    const writeStat = hasStats ? stats.topicStats.find(([k]) => k.includes('Writing') || k.includes('English')) : null;
    const pct = writeStat ? ` You're at **${writeStat[1]}%** in Writing/English.` : '';
    const isACTeng = /act/.test(m) || /english/.test(m);
    return r(`Writing/English is the most rule-based section — master the patterns and the points follow.${pct}\n\n**The 6 rules that cover ~80% of questions:**\n\n1️⃣ **Subject-verb agreement:** Ignore prepositional phrases. "The group of students **was** ready" (group is the subject).\n\n2️⃣ **Parallel structure:** Items in a list must match grammatically. "running, swimming, **and to bike**" → wrong.\n\n3️⃣ **Semicolons:** Only between two complete sentences. Never before a fragment.\n\n4️⃣ **Non-essential clauses:** Must be set off by commas on **both** sides — or removed entirely.\n\n5️⃣ **Conciseness:** The shorter, clearer option is almost always right. "Due to the fact that" → "Because."\n\n6️⃣ **Transitions:** Contrast (however, nevertheless), cause/effect (therefore, thus), addition (furthermore).\n\n${isACTeng ? '**ACT English pace:** 36 seconds per question. "NO CHANGE" is correct ~25% of the time — always evaluate it seriously.' : '**SAT Writing:** Rhetorical questions (add/delete/move content) are 30% of the section. Always ask: does this support the paragraph\'s main idea?'}`,
      ['Comma rule practice', 'SAT vs ACT Grammar differences', 'Transition words tips', 'How do I manage time?']);
  }

  if (/\b(science|act science|data.?rep|research.?summ|conflicting)\b/.test(m)) {
    const sciStat = hasStats ? stats.topicStats.find(([k]) => k.includes('Science')) : null;
    const pct = sciStat ? ` You're at **${sciStat[1]}%** in ACT Science.` : '';
    return r(`Here's the secret about ACT Science: **you don't actually need science knowledge**.${pct}\n\nIt's a data interpretation and reading comprehension test in a lab coat. Approach each type differently:\n\n📊 **Data Representation (38%):** Read graphs and tables directly. Identify the trend, what the axes represent, and any patterns. Don't bring in outside knowledge.\n\n🔬 **Research Summaries (45%):** Ask for each experiment: what changed (independent variable) and what was measured (dependent variable)? What was the control? These questions are often just comparing experiments.\n\n⚔️ **Conflicting Viewpoints (17%):** Read each scientist's view *independently* before touching the questions. Identify the core of each argument. Questions will ask you to match evidence to the right scientist.\n\n🚀 **Speed tip:** The science passage has 5–7 questions. Read the questions *first*, then go to the figures/passage only for what you need. This is the single biggest time-saver.`,
      ['Data Representation strategies', 'Conflicting Viewpoints tips', 'ACT timing help', 'Build me a study plan']);
  }

  if (/\b(time|timing|pacing|fast|slow|run.?out|speed|minutes|seconds.?per|pace)\b/.test(m)) {
    return r(`Pacing is a learned skill — here's exactly what you need to know:\n\n⏱️ **Target pace per question:**\n• SAT Math: ~1 min 35 sec\n• SAT Reading: ~1 min 15 sec\n• SAT Writing: ~45 sec\n• ACT English: **36 sec** (hardest pace on any standardized test)\n• ACT Math: 1 min\n• ACT Reading: 52 sec\n• ACT Science: 52 sec\n\n🔄 **The 90-Second Rule:** If you're stuck on one question past 90 sec, mark it and move on. One stuck question can cascade into missing 3–4 easier ones after it.\n\n✅ **Never leave blanks:** No wrong-answer penalty on either test. Always guess — eliminate 1–2 choices first and pick the best remaining option.\n\n🏋️ **How to fix pacing:** Time every practice session, even short drills. Timing awareness is a muscle. Full practice tests under real conditions are the best training.`,
      ['ACT English is too fast for me', 'SAT Math timing tips', 'How do I manage test anxiety?', 'What are the fastest ways to raise my score?']);
  }

  if (/\b(anxi|nervous|stress|scared|worried|fear|overwhelm|panic|pressure)\b/.test(m)) {
    return r(`Test anxiety is extremely common and completely manageable. Here's what's evidence-backed:\n\n🧠 **Preparation is the #1 cure.** Most anxiety comes from feeling underprepared. Every practice test under real conditions makes the actual test feel more familiar and less threatening.\n\n🌬️ **In-the-moment techniques:**\n• Box breathing before each section: inhale 4 sec, hold 4, exhale 4, hold 4\n• If panic hits mid-section: close your eyes for 5 full seconds — it interrupts the spiral\n• Reframe: "I've seen this question type before"\n\n💭 **Reframe the stakes:** One test score is a data point, not your identity. Most schools now accept multiple attempts and look at your best scores. A second attempt almost always shows improvement.\n\n💤 **The night before:** Do NOT cram. Light review only. Get 8+ hours of sleep and eat breakfast. Sleep deprivation costs you more than any last-minute reviewing gains.`,
      ['How do I build better habits?', 'Build me a study plan', 'Test-day tips', 'What should I study first?']);
  }

  if (/\b(test.?day|day of|morning of|what to bring|checklist|the night before)\b/.test(m)) {
    return r(`Here's your complete test-day checklist:\n\n**The night before:**\n• Light review only — no new material\n• Pack your bag: photo ID, admission ticket, approved calculator (with fresh batteries), pencils, snacks, water\n• Eat a real dinner and get 8+ hours of sleep\n\n**Morning of:**\n• Eat breakfast (protein + complex carbs — eggs + oatmeal is ideal)\n• Arrive 20–30 min early\n• Don't discuss the test with other students before it starts — it only increases anxiety\n\n**During the test:**\n• Bubble in answers as you go (ACT) — don't batch-bubble at the end\n• On the SAT, you can skip and return within a section\n• Use your scratch paper freely — show work for math, mark up passages\n• Guess on everything — **never leave a blank**\n\n**After each section:** Reset mentally. A bad section doesn't ruin your score — how you bounce back does.`,
      ['How do I manage test anxiety?', 'Calculator tips for SAT', 'What to do if I run out of time', 'Build me a study plan']);
  }

  if (/\b(improve|better|score|raise|increase|higher|points|what should i study|where do i start|focus)\b/.test(m)) {
    if (!hasStats) {
      return r(`The most important thing you can do right now is take a **diagnostic test** — either a full practice test or a focused quiz in each section.\n\nWithout data, I'm guessing at your gaps. With data, I can tell you exactly where you're leaving the most points on the table and what to do about it.\n\nStart with the **Practice Quiz**, pick a section, and do 10–15 questions. Then come back and I'll give you a fully personalized plan!`,
        ['Take me to Practice', 'Build me a study plan', 'SAT vs ACT tips', 'Test anxiety help']);
    }
    const topGain = stats.weakAreas[0];
    const topStrong = stats.strongAreas[0];
    const lines = [
      `Based on your **${stats.total} sessions** and **${stats.avgScore}% average**, here's your personalized roadmap:\n`,
      topGain ? `🎯 **Biggest opportunity: ${topGain}** — This is where focused practice will give you the fastest score improvement. Drill this section specifically.` : '',
      topStrong ? `💪 **Keep up ${topStrong}** — You're strong here. Maintain with light practice (1–2 sessions/week) so you don't lose ground.` : '',
      `\n📈 **How to improve fastest:**\n• Review every wrong answer — understand *why* it's wrong, not just what the right answer is\n• Look for patterns in your mistakes (time pressure? knowledge gap? careless errors?)\n• Do **section-specific drills**, not just random mixed quizzes\n• Take a full practice test every 2 weeks under real conditions`,
    ].filter(Boolean).join('\n');
    return r(lines,
      topGain ? [`Tips for ${topGain}`, 'How do I manage test timing?', 'Build me a study plan', 'Full practice test advice'] : ['Build me a study plan', 'Full practice test advice', 'How do I manage time?']);
  }

  if (/\b(vocabulary|words in context|vocab|word meaning)\b/.test(m)) {
    return r(`Vocabulary on the current SAT and ACT is completely different from the old SAT — no more obscure words like "mellifluous" or "obsequious."\n\nBoth tests now test **words in context**: a common word used in a specific way that you need to identify from the passage.\n\n**The cover-and-predict method (always works):**\n1. Cover the underlined word\n2. Read the sentence and predict what word would fit based on context\n3. Compare your prediction to the answer choices — pick the closest match\n4. Plug it back in to confirm it makes sense\n\nDo NOT try to use memorized definitions — context always wins. A word like "distinguish" might mean "identify," "separate," or "make famous" depending on the sentence.`,
      ['SAT Reading strategies', 'Words in context practice', 'How do I manage Reading time?']);
  }

  if (/\b(full test|practice test|diagnostic|timed test)\b/.test(m)) {
    return r(`Full practice tests are the highest-ROI activity in your prep — here's how to extract maximum value:\n\n**Taking the test:**\n• Full real conditions: timer, desk, no phone, no music\n• Do the entire test in one sitting (at least once) to build stamina\n• Use only allowed materials (calculator only on allowed sections)\n\n**After the test (this is where the real work happens):**\n• Score it and log your section scores\n• For every wrong answer: write down WHY you got it wrong (concept gap, careless, time rush)\n• For every right answer you guessed on: review it anyway\n• Identify the 2–3 question types you missed most\n\n**Frequency:** One full test every 2 weeks. Any more and you won't have time to actually learn from them.\n\n**PrepMaster tip:** After a full test here, go back to Practice Quiz and drill the specific section types you missed!`,
      ['How do I review mistakes effectively?', 'Build me a study plan', 'Test anxiety during practice tests', 'How do I manage time?']);
  }

  if (/\b(good|great|perfect|excellent|awesome|doing well|high score|strong)\b/.test(m) && hasStats && stats.avgScore >= 75) {
    return r(`**${stats.avgScore}%** is genuinely strong — you're in the refinement stage now, where the work changes.\n\nAt this level, the points you're missing are almost never from major knowledge gaps. They're from:\n\n🎯 **Precision traps:** Answer choices designed to catch students who "mostly understand" the concept. You need to be exact, not approximate.\n\n⏱️ **Pacing slip:** High scorers often lose points by rushing the last few questions in a section. Practice your finish.\n\n🔍 **The specific 10–15%:** Look hard at your wrong answers. They're probably clustered in 1–2 specific question types. Drill those exclusively until you're above 90% on them.\n\nAt your level, taking 2–3 more full practice tests is the best use of your time. The goal is consistency, not just average.`,
      ['What are the hardest SAT Math topics?', 'How do I get a perfect score?', 'Full practice test advice', 'ACT Science hard questions']);
  }

  if (/\b(resources|book|material|khan|collegeboard|outside|where to find)\b/.test(m)) {
    return r(`Here are the best resources, ranked by value:\n\n🥇 **Free (best bang for buck):**\n• **Khan Academy + College Board** — official SAT partnership, adaptive practice, 8 real past tests. Best free prep available.\n• **ACT.org** — free official ACT practice test\n• **PrepMaster Resources tab** — section-by-section strategy guides\n\n🥈 **Paid (worth it if serious):**\n• Official SAT Study Guide — real past tests from College Board\n• The Real ACT Prep Guide — real past ACT tests\n• Princeton Review or Kaplan — best for concept explanations and strategy\n\n**My take:** Real, official past tests are the gold standard. Third-party materials are great for learning strategy and concepts, but practice on real questions as much as possible.`,
      ['Khan Academy vs PrepMaster', 'Build me a study plan', 'Full practice test advice']);
  }

  // ── Personalized "what should I study" fallback when we have data ──────────
  if (hasStats && stats.weakAreas.length && /\b(what|where|how|help|suggest|recommend|next)\b/.test(m)) {
    return r(`Based on your **${stats.total} sessions** so far:\n\n${stats.weakAreas.map((a,i) => `${['🎯','📌','🔖'][i]||'•'} **${a}** — needs focused work`).join('\n')}\n${stats.strongAreas.length ? '\n' + stats.strongAreas.map(a => `✅ **${a}** — keep maintaining`).join('\n') : ''}\n\nI'd focus your next study session entirely on **${stats.weakAreas[0]}**. Use the Practice Quiz with that section selected and difficulty set to "medium" to start building consistency. Then push to "hard" once you're above 70%.`,
      [`Tips for ${stats.weakAreas[0]}`, 'Build me a study plan', 'How do I manage time?', 'Full practice test advice']);
  }

  // ── Default fallback ───────────────────────────────────────────────────────
  const suggest = hasStats && stats.weakAreas.length
    ? `Based on your sessions, **${stats.weakAreas[0]}** is your biggest opportunity right now — want specific strategies for that?`
    : 'Take a practice quiz first and I can give you advice that\'s actually tailored to *your* gaps.';

  return r(`I want to give you the most useful answer! Could you be more specific?\n\nI can help with:\n• **SAT or ACT Math** — algebra, geometry, advanced math\n• **Reading** — evidence questions, timing, passage strategy\n• **Writing/English** — grammar rules, conciseness, rhetoric\n• **ACT Science** — data interpretation, research summaries\n• **Test timing and pacing** — section by section\n• **Test anxiety** — what actually works\n• **Study plans** — personalized to your timeline\n\n${suggest}`,
    ['SAT Math tips', 'ACT Science tips', 'Reading strategies', 'Build me a study plan']);
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
