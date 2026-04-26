
/* ============================================================ EXPENSE DETAIL SHEET */
function openDetail(exp) {
  const overlay = document.getElementById('detailOverlay');
  const sheet   = document.getElementById('detailSheet');

  document.getElementById('dsIcon').textContent   = exp.icon || '📝';
  document.getElementById('dsAmount').textContent = fmt(exp.amount);
  document.getElementById('dsTime').textContent   = exp.exp_time;
  document.getElementById('dsDate').textContent   = exp.date;

  // Description row
  const descRow = document.getElementById('dsDescRow');
  const descEl  = document.getElementById('dsDesc');
  if (exp.description) {
    descEl.textContent = exp.description;
    descRow.style.display = 'flex';
  } else {
    descRow.style.display = 'none';
  }

  // Category row
  const catRow = document.getElementById('dsCatRow');
  const catEl  = document.getElementById('dsCat');
  const subEl2 = document.getElementById('dsSub');
  if (exp.grp) {
    catEl.textContent  = exp.grp;
    subEl2.textContent = exp.sub || '';
    catRow.style.display = 'flex';
  } else {
    catRow.style.display = 'none';
    subEl2.textContent = exp.description || '';
  }

  // Delete button
  document.getElementById('dsDeleteBtn').onclick = () => {
    deleteExpense(exp.id);
    closeDetail();
  };

  overlay.style.display = 'block';
  sheet.style.display   = 'block';
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    sheet.style.transform = 'translateY(0)';
  });
}

function closeDetail() {
  const overlay = document.getElementById('detailOverlay');
  const sheet   = document.getElementById('detailSheet');
  sheet.style.transform  = 'translateY(100%)';
  overlay.style.opacity  = '0';
  setTimeout(() => {
    sheet.style.display   = 'none';
    overlay.style.display = 'none';
  }, 300);
}

/* ============================================================
   EXPENSE TRACKER — SCRIPT.JS
   Email OTP Auth | Tabs | Dark/Light | Tamil/English | PWA
   ============================================================ */

/* ── TRANSLATIONS ── */
const I18N = {
  en: {
    loginSub:'Track your spending — simple & private',
    getStarted:'Get Started', yourName:'Your Name', yourEmail:'Email Address',
    sendOtp:'Send OTP', otpNote:"We'll send a 6-digit code to your email",
    checkEmail:'Check Your Email', verifyOtp:'Verify & Login',
    changeEmail:'← Use different email', resendOtp:'Resend OTP',
    welcomeBack:'Welcome back', logout:'Logout',
    tabToday:'Today', tabMonth:'This Month', tabHistory:'History', tabAdd:'Add',
    todaySpent:"Today's Spending", monthSpent:'Monthly Spending',
    byGroup:'By Group', dailyBreakdown:'Daily Breakdown',
    monthlyHistory:'Monthly History', allExpenses:'All Expenses',
    todayList:"Today's Expenses", addExpense:'Add Expense',
    time:'Time', amount:'Amount (₹)', categoryGroup:'Category Group',
    subCategory:'Sub-category', selectGroup:'-- Select Group --',
    selectSub:'-- Select Sub-category --', clearAll:'Clear All',
    noExpenses:'No expenses yet. Add your first one!',
    noExpensesMonth:'No expenses this month.',
    noHistory:'No history yet.', expenses:'expenses', expense:'expense',
    noSpending:'No spending yet 👀',
    confirmLogout:'Log out?', confirmClear:'Delete all expenses for this month?',
    errTime:'Please select a time.', errAmount:'Enter a valid amount > 0.',
    errGroup:'Please select a category group.', errSub:'Please select a sub-category.',
    errName:'Please enter your name.', errEmail:'Please enter a valid email address.',
    sending:'Sending OTP...', verifying:'Verifying...',
  },
  ta: {
    loginSub:'உங்கள் செலவுகளை எளிதாக கண்காணிக்கவும்',
    getStarted:'தொடங்குங்கள்', yourName:'உங்கள் பெயர்', yourEmail:'மின்னஞ்சல் முகவரி',
    sendOtp:'OTP அனுப்பு', otpNote:'6 இலக்க குறியீடு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்படும்',
    checkEmail:'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்', verifyOtp:'சரிபார்த்து உள்நுழைக',
    changeEmail:'← வேறு மின்னஞ்சல் பயன்படுத்து', resendOtp:'OTP மீண்டும் அனுப்பு',
    welcomeBack:'மீண்டும் வரவேற்கிறோம்', logout:'வெளியேறு',
    tabToday:'இன்று', tabMonth:'இந்த மாதம்', tabHistory:'வரலாறு', tabAdd:'சேர்',
    todaySpent:'இன்றைய செலவு', monthSpent:'மாதாந்திர செலவு',
    byGroup:'குழுவின் படி', dailyBreakdown:'தினசரி பகுப்பு',
    monthlyHistory:'மாதாந்திர வரலாறு', allExpenses:'அனைத்து செலவுகள்',
    todayList:'இன்றைய செலவுகள்', addExpense:'செலவு சேர்க்க',
    time:'நேரம்', amount:'தொகை (₹)', categoryGroup:'வகை குழு',
    subCategory:'உட்பிரிவு', selectGroup:'-- குழு தேர்ந்தெடுக்கவும் --',
    selectSub:'-- உட்பிரிவு தேர்ந்தெடுக்கவும் --', clearAll:'அனைத்தையும் நீக்கு',
    noExpenses:'இன்னும் செலவுகள் இல்லை. முதலில் சேர்க்கவும்!',
    noExpensesMonth:'இந்த மாதம் செலவுகள் இல்லை.',
    noHistory:'வரலாறு இல்லை.', expenses:'செலவுகள்', expense:'செலவு',
    noSpending:'இன்னும் செலவு இல்லை 👀',
    confirmLogout:'வெளியேறவா?', confirmClear:'இந்த மாதத்தின் அனைத்து செலவுகளையும் நீக்கவா?',
    errTime:'நேரத்தை தேர்ந்தெடுக்கவும்.', errAmount:'சரியான தொகையை உள்ளிடவும்.',
    errGroup:'வகை குழுவை தேர்ந்தெடுக்கவும்.', errSub:'உட்பிரிவை தேர்ந்தெடுக்கவும்.',
    errName:'உங்கள் பெயரை உள்ளிடவும்.', errEmail:'சரியான மின்னஞ்சலை உள்ளிடவும்.',
    sending:'OTP அனுப்புகிறது...', verifying:'சரிபார்க்கிறது...',
  }
};

/* ── CATEGORIES ── */
const CATEGORIES = {
  '🍽️ Food & Kitchen':{ icon:'🍽️', color:'var(--food)',
    subs:['Groceries','Vegetables & Fruits','Milk & Dairy','Dining Out','Swiggy / Zomato','Snacks & Beverages','Cooking Gas / LPG','Kitchen Supplies'],
    subs_ta:['மளிகை','காய்கறி & பழம்','பால் & பால் பொருட்கள்','ஹோட்டலில் சாப்பிட','ஸ்விக்கி / ஜொமேட்டோ','சிற்றுண்டி & பானங்கள்','சமையல் எரிவாயு','சமையல் பொருட்கள்'],
  },
  '🏠 Home & Utilities':{ icon:'🏠', color:'var(--home)',
    subs:['Rent / EMI','Electricity Bill','Water Bill','Internet & Cable','Mobile Recharge','House Maintenance','Furniture & Appliances','Cleaning Supplies'],
    subs_ta:['வாடகை / EMI','மின் கட்டணம்','தண்ணீர் கட்டணம்','இணையம் & கேபிள்','மொபைல் ரீசார்ஜ்','வீட்டு பராமரிப்பு','மரச்சாமான்','சுத்தம் செய்யும் பொருட்கள்'],
  },
  '🚌 Transport':{ icon:'🚌', color:'var(--transport)',
    subs:['Petrol / Fuel','Auto / Cab / Uber','Bus / Train Ticket','Vehicle Maintenance','Parking & Toll','Vehicle Insurance'],
    subs_ta:['பெட்ரோல் / எரிபொருள்','ஆட்டோ / கேப் / உபர்','பஸ் / ரயில் டிக்கெட்','வாகன பராமரிப்பு','பார்க்கிங்','வாகன காப்பீடு'],
  },
  '💊 Health & Medical':{ icon:'💊', color:'var(--health)',
    subs:['Doctor Visit','Medicines','Lab Tests & Scans','Hospital Bills','Health Insurance','Dental Care','Optical / Glasses','Vitamins & Supplements'],
    subs_ta:['மருத்துவர் வருகை','மருந்துகள்','ஆய்வக சோதனைகள்','மருத்துவமனை','உடல்நல காப்பீடு','பல் சிகிச்சை','கண் கண்ணாடி','வைட்டமின்கள்'],
  },
  '📚 Education':{ icon:'📚', color:'var(--education)',
    subs:['School / College Fees','Books & Stationery','Coaching / Tuition','Online Courses','School Supplies','Exam Fees'],
    subs_ta:['பள்ளி / கல்லூரி கட்டணம்','புத்தகங்கள்','கோச்சிங் / ட்யூஷன்','ஆன்லைன் படிப்புகள்','பள்ளி பொருட்கள்','தேர்வு கட்டணம்'],
  },
  '👗 Shopping & Personal':{ icon:'👗', color:'var(--shopping)',
    subs:['Clothing & Footwear','Salon & Grooming','Cosmetics & Skincare','Accessories & Jewellery','Bags & Wallets','Personal Hygiene'],
    subs_ta:['ஆடை & காலணி','சலூன் & அழகுப் பராமரிப்பு','அழகுசாதனம்','நகை & ஆபரணங்கள்','பைகள்','தனிப்பட்ட சுகாதாரம்'],
  },
  '🎉 Lifestyle & Entertainment':{ icon:'🎉', color:'var(--lifestyle)',
    subs:['Movies & Events','OTT Subscriptions','Gym & Sports','Hobbies & Crafts','Travel & Vacation','Gifts & Celebrations','Eating Out with Friends','Festival Expenses'],
    subs_ta:['திரைப்படம் & நிகழ்வுகள்','OTT சந்தா','ஜிம் & விளையாட்டு','பொழுதுபோக்கு','பயணம் & விடுமுறை','பரிசுகள்','நண்பர்களுடன் சாப்பிட','திருவிழா செலவுகள்'],
  },
  '🙏 Others':{ icon:'🙏', color:'var(--others)',
    subs:['Temple / Donations','Savings / Investment','Loan Repayment','Insurance Premium','Pet Expenses','Miscellaneous'],
    subs_ta:['கோவில் / நன்கொடை','சேமிப்பு / முதலீடு','கடன் திருப்பி செலுத்துதல்','காப்பீட்டு பிரீமியம்','செல்லப்பிராணி செலவுகள்','இதர செலவுகள்'],
  },
};

/* ── STATE ── */
let currentUser  = null;
let allExpenses  = [];
let currentMonth = fmtYearMonth(new Date());
let currentLang  = localStorage.getItem('et-lang')  || 'en';
let currentTheme = localStorage.getItem('et-theme') || 'dark';
let activeTab    = 'today';
let resendCountdown = null;

/* ── HELPERS ── */
function fmtYearMonth(d){ return d.toISOString().slice(0,7); }
function todayStr(){ return new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function fmt(n){ return '₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function esc(s){ const d=document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
function t(key){ return (I18N[currentLang]&&I18N[currentLang][key])||I18N.en[key]||key; }
function monthDisplayName(ym){
  const [y,m]=ym.split('-');
  return new Date(+y,+m-1,1).toLocaleString('en-IN',{month:'long',year:'numeric'});
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', async () => {
  applyTheme(currentTheme, false);
  applyLanguage(currentLang, false);
  populateCategoryGroups();
  setupOtpInputs();

  // Set current time
  const now = new Date();
  document.getElementById('expTime').value =
    `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Check if already logged in
  try {
    const res  = await fetch('/api/me');
    const data = await res.json();
    if (data.ok) {
      currentUser = data.user;
      enterApp();
    } else {
      showScreen('loginScreen');
    }
  } catch(e) {
    showScreen('loginScreen');
  }
});

/* ── PWA SERVICE WORKER ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/sw.js').catch(() => {});
  });
}

/* ============================================================ THEME */
function toggleTheme(){
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('et-theme', currentTheme);
  applyTheme(currentTheme, true);
}
function applyTheme(theme, animate){
  if(animate) document.documentElement.style.transition='background 0.35s ease,color 0.25s ease';
  document.documentElement.setAttribute('data-theme', theme);
  ['themeIcon','themeIconLogin'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.textContent = theme==='dark'?'☀️':'🌙';
  });
  const mc=document.getElementById('themeColorMeta');
  if(mc) mc.content = theme==='dark'?'#0d0d14':'#f5f3ff';
}

/* ============================================================ LANGUAGE */
function toggleLanguage(){
  currentLang = currentLang==='en'?'ta':'en';
  localStorage.setItem('et-lang', currentLang);
  applyLanguage(currentLang, true);
}
function applyLanguage(lang, repopulate){
  document.documentElement.setAttribute('data-lang', lang);
  const label = lang==='en'?'தமிழ்':'English';
  ['langLabel','langLabelLogin'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.textContent = label;
  });
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(I18N[lang]&&I18N[lang][key]){
      if(el.tagName==='INPUT') el.placeholder=I18N[lang][key];
      else el.textContent=I18N[lang][key];
    }
  });
  if(repopulate){
    populateCategoryGroups();
    const grp=document.getElementById('catGroup').value;
    if(grp) onGroupChange();
    if(currentUser) renderAll();
  }
}

/* ============================================================ AUTH — SEND OTP */
async function sendOTP(){
  const nameEl  = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const errEl   = document.getElementById('emailError');
  const btn     = document.getElementById('sendOtpBtn');

  const name  = nameEl.value.trim();
  const email = emailEl.value.trim().toLowerCase();

  errEl.textContent = '';

  if(!name)  { errEl.textContent = t('errName');  nameEl.focus();  return; }
  if(!email || !email.includes('@')) { errEl.textContent = t('errEmail'); emailEl.focus(); return; }

  btn.disabled = true;
  btn.querySelector('span').textContent = t('sending');

  try {
    const res  = await fetch('/api/send-otp', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, name}),
    });
    const data = await res.json();

    if(data.ok){
      document.getElementById('otpSentTo').textContent = email;
      document.getElementById('emailStep').classList.add('hidden');
      document.getElementById('otpStep').classList.remove('hidden');
      // focus first OTP box
      document.querySelectorAll('.otp-box')[0].focus();
      startResendTimer();
    } else {
      errEl.textContent = data.msg || 'Failed to send OTP.';
    }
  } catch(e) {
    errEl.textContent = 'Network error. Please try again.';
  }

  btn.disabled = false;
  btn.querySelector('span').textContent = t('sendOtp');
}

/* ── VERIFY OTP ── */
async function verifyOTP(){
  const errEl = document.getElementById('otpError');
  const btn   = document.getElementById('verifyOtpBtn');
  const email = document.getElementById('userEmail').value.trim().toLowerCase();

  const boxes = document.querySelectorAll('.otp-box');
  const otp   = Array.from(boxes).map(b=>b.value).join('');

  errEl.textContent = '';

  if(otp.length !== 6){ errEl.textContent = 'Please enter the 6-digit OTP.'; return; }

  btn.disabled = true;
  btn.querySelector('span').textContent = t('verifying');

  try {
    const res  = await fetch('/api/verify-otp', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, otp}),
    });
    const data = await res.json();

    if(data.ok){
      currentUser = data.user;
      clearResendTimer();
      enterApp();
    } else {
      errEl.textContent = data.msg || 'Invalid OTP. Try again.';
      boxes.forEach(b=>{ b.value=''; b.classList.add('otp-error'); });
      setTimeout(()=>boxes.forEach(b=>b.classList.remove('otp-error')), 600);
      boxes[0].focus();
    }
  } catch(e) {
    errEl.textContent = 'Network error. Please try again.';
  }

  btn.disabled = false;
  btn.querySelector('span').textContent = t('verifyOtp');
}

function goBackToEmail(){
  document.getElementById('otpStep').classList.add('hidden');
  document.getElementById('emailStep').classList.remove('hidden');
  document.getElementById('otpError').textContent = '';
  document.querySelectorAll('.otp-box').forEach(b=>b.value='');
  clearResendTimer();
}

async function resendOTP(){
  const email = document.getElementById('userEmail').value.trim().toLowerCase();
  const name  = document.getElementById('userName').value.trim();
  document.getElementById('otpError').textContent = '';
  document.querySelectorAll('.otp-box').forEach(b=>b.value='');
  try {
    await fetch('/api/send-otp',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email, name}),
    });
    startResendTimer();
  } catch(e){}
}

/* ── RESEND TIMER ── */
function startResendTimer(){
  let secs = 60;
  const timerEl  = document.getElementById('resendTimer');
  const resendBtn= document.getElementById('resendBtn');
  resendBtn.style.display = 'none';
  timerEl.textContent = `Resend in ${secs}s`;
  clearResendTimer();
  resendCountdown = setInterval(()=>{
    secs--;
    if(secs <= 0){
      clearResendTimer();
      timerEl.textContent = '';
      resendBtn.style.display = 'inline';
    } else {
      timerEl.textContent = `Resend in ${secs}s`;
    }
  }, 1000);
}
function clearResendTimer(){
  if(resendCountdown){ clearInterval(resendCountdown); resendCountdown=null; }
}

/* ── OTP INPUT BOXES SETUP ── */
function setupOtpInputs(){
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, i)=>{
    box.addEventListener('input', e=>{
      // Allow only digits
      box.value = box.value.replace(/\D/g,'').slice(0,1);
      if(box.value && i < boxes.length-1) boxes[i+1].focus();
      // Auto verify when all filled
      const all = Array.from(boxes).map(b=>b.value).join('');
      if(all.length === 6) setTimeout(verifyOTP, 300);
    });
    box.addEventListener('keydown', e=>{
      if(e.key==='Backspace' && !box.value && i > 0) boxes[i-1].focus();
    });
    box.addEventListener('paste', e=>{
      e.preventDefault();
      const txt = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
      boxes.forEach((b,j)=>{ b.value = txt[j]||''; });
      if(txt.length===6) setTimeout(verifyOTP, 300);
    });
  });
}

/* ── ENTER APP ── */
async function enterApp(){
  document.getElementById('userAvatar').textContent = '👤';
  document.getElementById('userNameDisplay').textContent = currentUser.name;
  showScreen('appScreen');
  currentMonth = fmtYearMonth(new Date());
  await loadMonthExpenses();
  renderAll();
  switchTab('today');
}

/* ── LOGOUT ── */
async function logout(){
  if(!confirm(t('confirmLogout'))) return;
  await fetch('/api/logout',{method:'POST'});
  currentUser = null; allExpenses = [];
  document.getElementById('userName').value  = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('emailStep').classList.remove('hidden');
  document.getElementById('otpStep').classList.add('hidden');
  document.querySelectorAll('.otp-box').forEach(b=>b.value='');
  clearResendTimer();
  showScreen('loginScreen');
}

/* ============================================================ TABS */
function switchTab(tab){
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById('panel-'+tab).classList.remove('hidden');
  if(tab==='history') loadHistory();
  if(tab==='month')   updateMonthLabel();
}

/* ============================================================ DATA */
async function loadMonthExpenses(){
  try{
    const res  = await fetch(`/api/expenses?month=${currentMonth}`);
    if(res.status===401){ logout(); return; }
    const data = await res.json();
    allExpenses = Array.isArray(data)?data:[];
  }catch(e){ allExpenses=[]; }
}

async function changeMonth(dir){
  const [y,m] = currentMonth.split('-').map(Number);
  const d     = new Date(y, m-1+dir, 1);
  currentMonth= fmtYearMonth(d);
  await loadMonthExpenses();
  updateMonthLabel();
  renderMonthPanel();
}

function updateMonthLabel(){
  const el=document.getElementById('monthLabel');
  if(el) el.textContent=monthDisplayName(currentMonth);
}

async function loadHistory(){
  try{
    const res  = await fetch('/api/monthly-summary');
    if(res.status===401){ logout(); return; }
    const data = await res.json();
    renderHistory(data);
  }catch(e){ renderHistory([]); }
}

/* ============================================================ RENDER */
function renderAll(){ renderTodayPanel(); renderMonthPanel(); updateMonthLabel(); }

/* ── TODAY ── */
function renderTodayPanel(){
  const today   = todayStr();
  const todayExp= allExpenses.filter(e=>e.date===today);
  const total   = todayExp.reduce((s,e)=>s+e.amount,0);
  document.getElementById('todayAmount').textContent=fmt(total);
  const cnt=todayExp.length;
  document.getElementById('todayCount').textContent=`${cnt} ${cnt!==1?t('expenses'):t('expense')}`;
  const hd=document.getElementById('heroDate');
  if(hd) hd.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  renderCatPills('todayCatSummary', todayExp);
  renderExpenseList('todayList','todayEmpty', todayExp);
}

/* ── MONTH ── */
function renderMonthPanel(){
  const total=allExpenses.reduce((s,e)=>s+e.amount,0);
  document.getElementById('monthAmount').textContent=fmt(total);
  const cnt=allExpenses.length;
  document.getElementById('monthCount').textContent=`${cnt} ${cnt!==1?t('expenses'):t('expense')}`;
  renderCatPills('monthCatSummary', allExpenses);
  renderDailyBreakdown();
  renderExpenseList('monthList','monthEmpty', allExpenses);
}

function renderCatPills(containerId, expList){
  const c=document.getElementById(containerId); c.innerHTML='';
  Object.entries(CATEGORIES).forEach(([g,gd])=>{
    const total=expList.filter(e=>e.grp===g).reduce((s,e)=>s+e.amount,0);
    if(total===0) return;
    const name=(currentLang==='ta')?translateGroupName(g).replace(/^\S+\s/,''):g.replace(/^\S+\s/,'');
    const pill=document.createElement('div'); pill.className='cat-pill';
    pill.innerHTML=`<span class="cat-pill-icon">${gd.icon}</span><div class="cat-pill-info"><span class="cat-pill-name">${esc(name)}</span><span class="cat-pill-amt" style="color:${gd.color}">${fmt(total)}</span></div>`;
    c.appendChild(pill);
  });
  if(!c.children.length)
    c.innerHTML=`<div class="cat-pill" style="color:var(--ink-muted);font-size:.82rem">${t('noSpending')}</div>`;
}

function renderDailyBreakdown(){
  const container=document.getElementById('dailyList'); container.innerHTML='';
  const byDate={};
  allExpenses.forEach(e=>{ if(!byDate[e.date]) byDate[e.date]={total:0,count:0}; byDate[e.date].total+=e.amount; byDate[e.date].count++; });
  const dates=Object.keys(byDate).sort((a,b)=>new Date(b)-new Date(a));
  if(dates.length===0){ container.innerHTML=`<div style="text-align:center;color:var(--ink-faint);font-size:13px;padding:12px">${t('noSpending')}</div>`; return; }
  dates.forEach(date=>{
    const {total,count}=byDate[date];
    const row=document.createElement('div'); row.className='daily-row';
    row.innerHTML=`<div><div class="daily-date">${esc(date)}</div><div class="daily-meta">${count} ${count!==1?t('expenses'):t('expense')}</div></div><div class="daily-amt">${fmt(total)}</div>`;
    container.appendChild(row);
  });
}

function renderExpenseList(listId, emptyId, expList){
  const list=document.getElementById(listId);
  const empty=document.getElementById(emptyId);
  if(expList.length===0){ if(empty) empty.style.display='flex'; list.innerHTML=''; return; }
  if(empty) empty.style.display='none';
  list.innerHTML='';
  expList.forEach(exp=>{
    const li=document.createElement('li'); li.className='expense-item';
    const subLabel = exp.description ? exp.description : (exp.sub || '');
    li.style.cursor = 'pointer';
    li.innerHTML=`
      <div class="expense-icon">${esc(exp.icon)}</div>
      <div class="expense-info">
        <div class="expense-desc">🕐 ${esc(exp.exp_time)} · ${esc(subLabel)}</div>
        <div class="expense-meta">${esc(exp.date)}</div>
      </div>
      <div class="expense-right">
        <span class="expense-amount">${fmt(exp.amount)}</span>
        <button class="del-item-btn" onclick="event.stopPropagation();deleteExpense(${exp.id})">✕</button>
      </div>`;
    li.addEventListener('click', () => openDetail(exp));
    list.appendChild(li);
  });
}

function renderHistory(data){
  const container=document.getElementById('historyList');
  const empty=document.getElementById('historyEmpty');
  container.innerHTML='';
  if(!data||data.length===0){ if(empty) empty.style.display='flex'; return; }
  if(empty) empty.style.display='none';
  data.forEach(row=>{
    const div=document.createElement('div'); div.className='history-row';
    div.innerHTML=`
      <div>
        <div class="history-month">${monthDisplayName(row.year_month)}</div>
        <div class="history-count">${row.count} ${t('expenses')}</div>
      </div>
      <div class="history-amt">${fmt(row.total)}</div>`;
    div.onclick=()=>{ currentMonth=row.year_month; switchTab('month'); loadMonthExpenses().then(()=>renderMonthPanel()); };
    container.appendChild(div);
  });
}

/* ============================================================ ADD EXPENSE */
function populateCategoryGroups(){
  const sel=document.getElementById('catGroup');
  sel.innerHTML=`<option value="">${t('selectGroup')}</option>`;
  Object.keys(CATEGORIES).forEach(g=>{
    const o=document.createElement('option');
    o.value=g; o.textContent=(currentLang==='ta')?translateGroupName(g):g;
    sel.appendChild(o);
  });
}

function translateGroupName(g){
  const map={
    '🍽️ Food & Kitchen':'🍽️ உணவு & சமையலறை',
    '🏠 Home & Utilities':'🏠 வீடு & வசதிகள்',
    '🚌 Transport':'🚌 போக்குவரத்து',
    '💊 Health & Medical':'💊 உடல்நலம் & மருத்துவம்',
    '📚 Education':'📚 கல்வி',
    '👗 Shopping & Personal':'👗 ஷாப்பிங் & தனிப்பட்டது',
    '🎉 Lifestyle & Entertainment':'🎉 வாழ்க்கை முறை & பொழுதுபோக்கு',
    '🙏 Others':'🙏 மற்றவை',
  };
  return map[g]||g;
}

function onGroupChange(){
  const g=document.getElementById('catGroup').value;
  const subField=document.getElementById('subCatField');
  const subSel=document.getElementById('catSub');
  if(!g){ subField.style.display='none'; return; }
  const subs=(currentLang==='ta'&&CATEGORIES[g].subs_ta)?CATEGORIES[g].subs_ta:CATEGORIES[g].subs;
  subSel.innerHTML=`<option value="">${t('selectSub')}</option>`;
  subs.forEach((s,i)=>{ const o=document.createElement('option'); o.value=CATEGORIES[g].subs[i]; o.textContent=s; subSel.appendChild(o); });
  subField.style.display='flex';
}

async function addExpense(){
  const timeEl=document.getElementById('expTime');
  const amtEl=document.getElementById('amount');
  const grpEl=document.getElementById('catGroup');
  const subEl=document.getElementById('catSub');
  const descEl=document.getElementById('expDescription');
  const expTime=timeEl.value, amount=parseFloat(amtEl.value), grp=grpEl.value, sub=subEl.value;
  const description=descEl ? descEl.value.trim() : '';
  if(!expTime){ showError(t('errTime')); timeEl.focus(); return; }
  if(!amount||amount<=0){ showError(t('errAmount')); amtEl.focus(); return; }
  // Category is required only if no description
  if(!description && !grp){ showError(currentLang==='ta'?'வகை தேர்வு செய்யவும் அல்லது விவரம் எழுதவும்':'Select a category or enter a description.'); return; }
  if(grp && !sub){ showError(t('errSub')); subEl.focus(); return; }
  document.getElementById('errorMsg').textContent='';
  const today=todayStr();
  const icon = grp ? CATEGORIES[grp].icon : '📝';
  try{
    const res=await fetch('/api/expenses',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({exp_time:expTime,amount,grp,sub,icon,date:today,description}),
    });
    if(res.status===401){ showError('Session expired.'); setTimeout(()=>logout(),2000); return; }
    const data=await res.json();
    if(data.ok){
      const newExp={id:data.id,user_id:currentUser.id,exp_time:expTime,amount,grp,sub,icon,date:today,year_month:data.year_month||currentMonth,description};
      if(newExp.year_month===currentMonth) allExpenses.unshift(newExp);
      renderAll();
      amtEl.value=''; grpEl.value=''; subEl.value='';
      if(descEl) descEl.value='';
      document.getElementById('subCatField').style.display='none';
      const now=new Date();
      timeEl.value=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      switchTab('today');
    }
  }catch(e){ showError('Network error. Please try again.'); }
}

async function deleteExpense(id){
  try{
    const res=await fetch(`/api/expenses/${id}`,{method:'DELETE'});
    if(res.status===401){ logout(); return; }
    allExpenses=allExpenses.filter(e=>e.id!==id);
    renderAll();
  }catch(e){ showError('Failed to delete.'); }
}

async function clearMonth(){
  if(allExpenses.length===0) return;
  if(!confirm(t('confirmClear'))) return;
  try{
    const res=await fetch(`/api/expenses/clear?month=${currentMonth}`,{method:'DELETE'});
    if(res.status===401){ logout(); return; }
    allExpenses=[];
    renderAll();
  }catch(e){ showError('Failed to clear.'); }
}

function showError(msg){ const el=document.getElementById('errorMsg'); el.textContent=msg; setTimeout(()=>{el.textContent='';},3000); }
function showScreen(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }

/* ============================================================ VOICE INPUT */
let recognition = null;

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('voiceStatus').textContent = 'Voice not supported in this browser.';
    return;
  }

  const micBtn = document.getElementById('micBtn');
  const statusEl = document.getElementById('voiceStatus');

  if (recognition) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = currentLang === 'ta' ? 'ta-IN' : 'en-IN';
  recognition.interimResults = true;
  recognition.continuous = false;

  micBtn.textContent = '⏹️';
  micBtn.style.borderColor = '#e74c3c';
  micBtn.style.color = '#e74c3c';
  statusEl.textContent = currentLang === 'ta' ? 'கேட்கிறது...' : 'Listening...';

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    document.getElementById('expDescription').value = transcript;
  };

  recognition.onend = () => {
    micBtn.textContent = '🎙️';
    micBtn.style.borderColor = 'var(--accent)';
    micBtn.style.color = 'var(--accent)';
    statusEl.textContent = '';
    recognition = null;
  };

  recognition.onerror = (e) => {
    statusEl.textContent = currentLang === 'ta' ? 'பிழை ஏற்பட்டது, மீண்டும் முயற்சிக்கவும்.' : 'Error. Please try again.';
    micBtn.textContent = '🎙️';
    micBtn.style.borderColor = 'var(--accent)';
    micBtn.style.color = 'var(--accent)';
    recognition = null;
  };

  recognition.start();
}
