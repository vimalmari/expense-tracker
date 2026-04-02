/* ============================================================
   DDDV FAMILY EXPENSE TRACKER — SCRIPT.JS
   Tabs: Today / Month / History / Add
   Dark/Light + English/Tamil
   ============================================================ */

/* ── TRANSLATIONS ── */
const I18N = {
  en: {
    appSubtitle:'Family Expense', whoLogging:"Who's logging in today?",
    back:'Back', enterPin:'Enter PIN for', welcomeBack:'Welcome back',
    logout:'Logout', tabToday:'Today', tabMonth:'This Month',
    tabHistory:'History', tabAdd:'Add',
    todaySpent:"Today's Spending", monthSpent:'Monthly Spending',
    byGroup:'By Group', dailyBreakdown:'Daily Breakdown',
    monthlyHistory:'Monthly History', allExpenses:'All Expenses',
    todayList:"Today's Expenses", addExpense:'Add Expense',
    time:'Time', amount:'Amount (₹)', categoryGroup:'Category Group',
    subCategory:'Sub-category', selectGroup:'— Select Group —',
    selectSub:'— Select Sub-category —', clearAll:'Clear All',
    noExpenses:'No expenses yet. Add your first one!',
    noHistory:'No history yet.', wrongPin:'Wrong PIN. Try again.',
    confirmLogout:'Log out?', confirmClear:'Delete all expenses for this month?',
    errTime:'Please select a time.', errAmount:'Enter a valid amount > 0.',
    errGroup:'Please select a category group.', errSub:'Please select a sub-category.',
    noSpending:'No spending yet 👀', expenses:'expenses', expense:'expense',
  },
  ta: {
    appSubtitle:'குடும்ப செலவு', whoLogging:'இன்று யார் உள்நுழைகிறீர்கள்?',
    back:'பின்செல்', enterPin:'PIN உள்ளிடவும்', welcomeBack:'மீண்டும் வரவேற்கிறோம்',
    logout:'வெளியேறு', tabToday:'இன்று', tabMonth:'இந்த மாதம்',
    tabHistory:'வரலாறு', tabAdd:'சேர்',
    todaySpent:'இன்றைய செலவு', monthSpent:'மாதாந்திர செலவு',
    byGroup:'குழுவின் படி', dailyBreakdown:'தினசரி பகுப்பு',
    monthlyHistory:'மாதாந்திர வரலாறு', allExpenses:'அனைத்து செலவுகள்',
    todayList:'இன்றைய செலவுகள்', addExpense:'செலவு சேர்க்க',
    time:'நேரம்', amount:'தொகை (₹)', categoryGroup:'வகை குழு',
    subCategory:'உட்பிரிவு', selectGroup:'— குழு தேர்ந்தெடுக்கவும் —',
    selectSub:'— உட்பிரிவு தேர்ந்தெடுக்கவும் —', clearAll:'அனைத்தையும் நீக்கு',
    noExpenses:'இன்னும் செலவுகள் இல்லை. மேலே சேர்க்கவும்!',
    noHistory:'வரலாறு இல்லை.', wrongPin:'தவறான PIN. மீண்டும் முயற்சிக்கவும்.',
    confirmLogout:'வெளியேறவா?', confirmClear:'இந்த மாதத்தின் அனைத்து செலவுகளையும் நீக்கவா?',
    errTime:'நேரத்தை தேர்ந்தெடுக்கவும்.', errAmount:'சரியான தொகையை உள்ளிடவும் (0-க்கு மேல்).',
    errGroup:'வகை குழுவை தேர்ந்தெடுக்கவும்.', errSub:'உட்பிரிவை தேர்ந்தெடுக்கவும்.',
    noSpending:'இன்னும் செலவு இல்லை 👀', expenses:'செலவுகள்', expense:'செலவு',
  }
};

/* ── CATEGORIES ── */
const CATEGORIES = {
  '🍽️ Food & Kitchen':{ icon:'🍽️', color:'var(--food)',
    subs:['Groceries','Vegetables & Fruits','Milk & Dairy','Dining Out','Swiggy / Zomato','Snacks & Beverages','Cooking Gas / LPG','Kitchen Supplies'],
    subs_ta:['மளிகை','காய்கறி & பழம்','பால் & பால் பொருட்கள்','ஹோட்டலில் சாப்பிட','ஸ்விக்கி / ஜொமேட்டோ','சிற்றுண்டி & பானங்கள்','சமையல் எரிவாயு / LPG','சமையல் பொருட்கள்'],
  },
  '🏠 Home & Utilities':{ icon:'🏠', color:'var(--home)',
    subs:['Rent / EMI','Electricity Bill','Water Bill','Internet & Cable','Mobile Recharge','House Maintenance','Furniture & Appliances','Cleaning Supplies'],
    subs_ta:['வாடகை / EMI','மின் கட்டணம்','தண்ணீர் கட்டணம்','இணையம் & கேபிள்','மொபைல் ரீசார்ஜ்','வீட்டு பராமரிப்பு','மரச்சாமான் & கருவிகள்','சுத்தம் செய்யும் பொருட்கள்'],
  },
  '🚌 Transport':{ icon:'🚌', color:'var(--transport)',
    subs:['Petrol / Fuel','Auto / Cab / Uber','Bus / Train Ticket','Vehicle Maintenance','Parking & Toll','Vehicle Insurance'],
    subs_ta:['பெட்ரோல் / எரிபொருள்','ஆட்டோ / கேப் / உபர்','பஸ் / ரயில் டிக்கெட்','வாகன பராமரிப்பு','பார்க்கிங் & தடை கட்டணம்','வாகன காப்பீடு'],
  },
  '💊 Health & Medical':{ icon:'💊', color:'var(--health)',
    subs:['Doctor Visit','Medicines','Lab Tests & Scans','Hospital Bills','Health Insurance','Dental Care','Optical / Glasses','Vitamins & Supplements'],
    subs_ta:['மருத்துவர் வருகை','மருந்துகள்','ஆய்வக சோதனைகள்','மருத்துவமனை கட்டணம்','உடல்நல காப்பீடு','பல் சிகிச்சை','கண் கண்ணாடி','வைட்டமின்கள்'],
  },
  '📚 Education':{ icon:'📚', color:'var(--education)',
    subs:['School / College Fees','Books & Stationery','Coaching / Tuition','Online Courses','School Supplies','Exam Fees'],
    subs_ta:['பள்ளி / கல்லூரி கட்டணம்','புத்தகங்கள் & எழுது பொருட்கள்','கோச்சிங் / ட்யூஷன்','ஆன்லைன் படிப்புகள்','பள்ளி பொருட்கள்','தேர்வு கட்டணம்'],
  },
  '👗 Shopping & Personal':{ icon:'👗', color:'var(--shopping)',
    subs:['Clothing & Footwear','Salon & Grooming','Cosmetics & Skincare','Accessories & Jewellery','Bags & Wallets','Personal Hygiene'],
    subs_ta:['ஆடை & காலணி','சலூன் & அழகுப் பராமரிப்பு','அழகுசாதனம்','நகை & ஆபரணங்கள்','பைகள் & பணப்பைகள்','தனிப்பட்ட சுகாதாரம்'],
  },
  '🎉 Lifestyle & Entertainment':{ icon:'🎉', color:'var(--lifestyle)',
    subs:['Movies & Events','OTT Subscriptions','Gym & Sports','Hobbies & Crafts','Travel & Vacation','Gifts & Celebrations','Eating Out with Friends','Festival Expenses'],
    subs_ta:['திரைப்படம் & நிகழ்வுகள்','OTT சந்தா','ஜிம் & விளையாட்டு','பொழுதுபோக்கு','பயணம் & விடுமுறை','பரிசுகள் & கொண்டாட்டங்கள்','நண்பர்களுடன் சாப்பிட','திருவிழா செலவுகள்'],
  },
  '🙏 Others':{ icon:'🙏', color:'var(--others)',
    subs:['Temple / Donations','Savings / Investment','Loan Repayment','Insurance Premium','Pet Expenses','Miscellaneous'],
    subs_ta:['கோவில் / நன்கொடை','சேமிப்பு / முதலீடு','கடன் திருப்பி செலுத்துதல்','காப்பீட்டு பிரீமியம்','செல்லப்பிராணி செலவுகள்','இதர செலவுகள்'],
  },
};

/* ── STATE ── */
let currentUser    = null;
let selectedMember = null;
let enteredPin     = '';
let allExpenses    = [];          // expenses for current viewed month
let currentMonth   = fmtYearMonth(new Date()); // "YYYY-MM"
let currentLang    = localStorage.getItem('dddv-lang')  || 'en';
let currentTheme   = localStorage.getItem('dddv-theme') || 'dark';
let activeTab      = 'today';

/* ── HELPERS ── */
function fmtYearMonth(d){ return d.toISOString().slice(0,7); }
function todayStr(){
  return new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function fmt(n){
  return '₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function esc(s){
  const d=document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}
function t(key){ return (I18N[currentLang]&&I18N[currentLang][key])||I18N.en[key]||key; }
function monthDisplayName(ym){
  const [y,m]=ym.split('-');
  const d=new Date(+y,+m-1,1);
  return d.toLocaleString('en-IN',{month:'long',year:'numeric'});
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded',()=>{
  applyTheme(currentTheme,false);
  applyLanguage(currentLang,false);
  buildNumpad();
  populateCategoryGroups();
  showScreen('loginScreen');
  // Set today's time as default
  const now=new Date();
  const hh=String(now.getHours()).padStart(2,'0');
  const mm=String(now.getMinutes()).padStart(2,'0');
  document.getElementById('expTime').value=`${hh}:${mm}`;
});

/* ============================================================ THEME */
function toggleTheme(){
  currentTheme=currentTheme==='dark'?'light':'dark';
  localStorage.setItem('dddv-theme',currentTheme);
  applyTheme(currentTheme,true);
}
function applyTheme(theme,animate){
  const html=document.documentElement;
  if(animate) html.style.transition='background 0.35s ease,color 0.25s ease';
  html.setAttribute('data-theme',theme);
  const icon=document.getElementById('themeIcon');
  if(icon) icon.textContent=theme==='dark'?'☀️':'🌙';
  const mc=document.getElementById('themeColorMeta');
  if(mc) mc.content=theme==='dark'?'#0d0d14':'#f5f3ff';
}

/* ============================================================ LANGUAGE */
function toggleLanguage(){
  currentLang=currentLang==='en'?'ta':'en';
  localStorage.setItem('dddv-lang',currentLang);
  applyLanguage(currentLang,true);
}
function applyLanguage(lang,repopulate){
  document.documentElement.setAttribute('data-lang',lang);
  const label=document.getElementById('langLabel');
  if(label) label.textContent=lang==='en'?'தமிழ்':'English';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(I18N[lang]&&I18N[lang][key]){
      if(el.tagName==='INPUT'&&el.type!=='number') el.placeholder=I18N[lang][key];
      else el.textContent=I18N[lang][key];
    }
  });
  if(repopulate){
    populateCategoryGroups();
    const grp=document.getElementById('catGroup').value;
    if(grp) onGroupChange();
    renderAll();
  }
}

/* ============================================================ LOGIN */
function selectMember(id,name,emoji){
  selectedMember={id,name,emoji};
  enteredPin='';
  document.getElementById('pinForName').textContent=name;
  updatePinDots();
  document.getElementById('pinError').textContent='';
  document.getElementById('memberGrid').style.display='none';
  document.getElementById('pinSection').style.display='flex';
}
function goBackToMembers(){
  enteredPin='';selectedMember=null;
  document.getElementById('memberGrid').style.display='grid';
  document.getElementById('pinSection').style.display='none';
  document.getElementById('pinError').textContent='';
}
function buildNumpad(){
  const pad=document.getElementById('numpad');
  pad.innerHTML='';
  ['1','2','3','4','5','6','7','8','9','','0','⌫'].forEach(k=>{
    const btn=document.createElement('button');
    if(k===''){btn.className='num-btn empty-btn';}
    else if(k==='⌫'){btn.className='num-btn del-btn';btn.textContent=k;btn.addEventListener('click',deleteDigit);}
    else{btn.className='num-btn';btn.textContent=k;btn.addEventListener('click',()=>enterDigit(k));}
    pad.appendChild(btn);
  });
}
function enterDigit(digit){
  if(enteredPin.length>=4) return;
  enteredPin+=digit;
  updatePinDots();
  if(enteredPin.length===4) setTimeout(verifyPin,150);
}
function deleteDigit(){
  enteredPin=enteredPin.slice(0,-1);
  updatePinDots();
}
function updatePinDots(){
  document.querySelectorAll('.dot').forEach((dot,i)=>{
    dot.classList.remove('filled','shake');
    if(i<enteredPin.length) dot.classList.add('filled');
  });
}
async function verifyPin(){
  const res=await fetch('/api/login',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({user_id:selectedMember.id,pin:enteredPin}),
  });
  const data=await res.json();
  if(data.ok){
    currentUser=data.user;
    document.getElementById('userAvatar').textContent=currentUser.emoji;
    document.getElementById('userName').textContent=currentUser.name;
    document.getElementById('memberGrid').style.display='grid';
    document.getElementById('pinSection').style.display='none';
    enteredPin='';
    showScreen('appScreen');
    currentMonth=fmtYearMonth(new Date());
    await loadMonthExpenses();
    renderAll();
    switchTab('today');
  } else {
    const dots=document.querySelectorAll('.dot');
    dots.forEach(d=>{d.classList.remove('filled');d.classList.add('shake');});
    document.getElementById('pinError').textContent=t('wrongPin');
    setTimeout(()=>{dots.forEach(d=>d.classList.remove('shake'));enteredPin='';updatePinDots();},600);
  }
}
async function logout(){
  if(!confirm(t('confirmLogout'))) return;
  await fetch('/api/logout',{method:'POST'});
  currentUser=null;allExpenses=[];
  showScreen('loginScreen');
}

/* ============================================================ TABS */
function switchTab(tab){
  activeTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById('panel-'+tab).classList.remove('hidden');
  if(tab==='history') loadHistory();
  if(tab==='month') updateMonthLabel();
}

/* ============================================================ DATA */
async function loadMonthExpenses(){
  const res=await fetch(`/api/expenses?month=${currentMonth}`);
  allExpenses=await res.json();
}

async function changeMonth(dir){
  const [y,m]=currentMonth.split('-').map(Number);
  const d=new Date(y,m-1+dir,1);
  currentMonth=fmtYearMonth(d);
  await loadMonthExpenses();
  updateMonthLabel();
  renderMonthPanel();
}

function updateMonthLabel(){
  const el=document.getElementById('monthLabel');
  if(el) el.textContent=monthDisplayName(currentMonth);
}

async function loadHistory(){
  const res=await fetch('/api/monthly-summary');
  const data=await res.json();
  renderHistory(data);
}

/* ============================================================ RENDER */
function renderAll(){
  renderTodayPanel();
  renderMonthPanel();
  updateMonthLabel();
}

/* ── TODAY ── */
function renderTodayPanel(){
  const today=todayStr();
  const todayExp=allExpenses.filter(e=>e.date===today);

  // Hero
  const total=todayExp.reduce((s,e)=>s+e.amount,0);
  document.getElementById('todayAmount').textContent=fmt(total);
  const cnt=todayExp.length;
  document.getElementById('todayCount').textContent=`${cnt} ${cnt!==1?t('expenses'):t('expense')}`;

  // Date label
  const heroDate=document.getElementById('heroDate');
  if(heroDate) heroDate.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

  // Category pills
  renderCatPills('todayCatSummary', todayExp);

  // List
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
  const c=document.getElementById(containerId);
  c.innerHTML='';
  Object.entries(CATEGORIES).forEach(([g,gd])=>{
    const total=expList.filter(e=>e.grp===g).reduce((s,e)=>s+e.amount,0);
    if(total===0) return;
    const name=(currentLang==='ta')?translateGroupName(g).replace(/^\S+\s/,''):g.replace(/^\S+\s/,'');
    const pill=document.createElement('div');
    pill.className='cat-pill';
    pill.innerHTML=`<span class="cat-pill-icon">${gd.icon}</span><div class="cat-pill-info"><span class="cat-pill-name">${esc(name)}</span><span class="cat-pill-amt" style="color:${gd.color}">${fmt(total)}</span></div>`;
    c.appendChild(pill);
  });
  if(!c.children.length)
    c.innerHTML=`<div class="cat-pill" style="color:var(--ink-muted);font-size:.82rem">${t('noSpending')}</div>`;
}

function renderDailyBreakdown(){
  const container=document.getElementById('dailyList');
  container.innerHTML='';
  // group by date
  const byDate={};
  allExpenses.forEach(e=>{
    if(!byDate[e.date]) byDate[e.date]={total:0,count:0};
    byDate[e.date].total+=e.amount;
    byDate[e.date].count++;
  });
  const dates=Object.keys(byDate).sort((a,b)=>new Date(b)-new Date(a));
  if(dates.length===0){
    container.innerHTML=`<div style="text-align:center;color:var(--ink-faint);font-size:13px;padding:12px">${t('noSpending')}</div>`;
    return;
  }
  dates.forEach(date=>{
    const {total,count}=byDate[date];
    const row=document.createElement('div');
    row.className='daily-row';
    row.innerHTML=`<div><div class="daily-date">${esc(date)}</div><div class="daily-meta">${count} ${count!==1?t('expenses'):t('expense')}</div></div><div class="daily-amt">${fmt(total)}</div>`;
    container.appendChild(row);
  });
}

function renderExpenseList(listId, emptyId, expList){
  const list=document.getElementById(listId);
  const empty=document.getElementById(emptyId);
  if(expList.length===0){
    if(empty) empty.style.display='flex';
    list.innerHTML='';
    return;
  }
  if(empty) empty.style.display='none';
  list.innerHTML='';
  expList.forEach(exp=>{
    const li=document.createElement('li');
    li.className='expense-item';
    li.innerHTML=`
      <div class="expense-icon">${esc(exp.icon)}</div>
      <div class="expense-info">
        <div class="expense-desc">🕐 ${esc(exp.exp_time)} · ${esc(exp.sub)}</div>
        <div class="expense-meta">${esc(exp.date)}</div>
      </div>
      <div class="expense-right">
        <span class="expense-amount">${fmt(exp.amount)}</span>
        <button class="del-item-btn" title="Delete" onclick="deleteExpense(${exp.id})">✕</button>
      </div>`;
    list.appendChild(li);
  });
}

/* ── HISTORY ── */
function renderHistory(data){
  const container=document.getElementById('historyList');
  const empty=document.getElementById('historyEmpty');
  container.innerHTML='';
  if(!data||data.length===0){
    if(empty) empty.style.display='flex';
    return;
  }
  if(empty) empty.style.display='none';
  data.forEach(row=>{
    const div=document.createElement('div');
    div.className='history-row';
    div.innerHTML=`
      <div>
        <div class="history-month">${monthDisplayName(row.year_month)}</div>
        <div class="history-count">${row.count} ${t('expenses')}</div>
      </div>
      <div class="history-amt">${fmt(row.total)}</div>`;
    div.onclick=()=>{
      currentMonth=row.year_month;
      switchTab('month');
      loadMonthExpenses().then(()=>renderMonthPanel());
    };
    container.appendChild(div);
  });
}

/* ============================================================ ADD EXPENSE */
function populateCategoryGroups(){
  const sel=document.getElementById('catGroup');
  sel.innerHTML=`<option value="">${t('selectGroup')}</option>`;
  Object.keys(CATEGORIES).forEach(g=>{
    const o=document.createElement('option');
    o.value=g;
    o.textContent=(currentLang==='ta')?translateGroupName(g):g;
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
  if(!g){subField.style.display='none';return;}
  const subs=(currentLang==='ta'&&CATEGORIES[g].subs_ta)?CATEGORIES[g].subs_ta:CATEGORIES[g].subs;
  subSel.innerHTML=`<option value="">${t('selectSub')}</option>`;
  subs.forEach((s,i)=>{
    const o=document.createElement('option');
    o.value=CATEGORIES[g].subs[i];
    o.textContent=s;
    subSel.appendChild(o);
  });
  subField.style.display='flex';
}

async function addExpense(){
  const timeEl=document.getElementById('expTime');
  const amtEl=document.getElementById('amount');
  const grpEl=document.getElementById('catGroup');
  const subEl=document.getElementById('catSub');
  const expTime=timeEl.value;
  const amount=parseFloat(amtEl.value);
  const grp=grpEl.value;
  const sub=subEl.value;
  if(!expTime){showError(t('errTime'));timeEl.focus();return;}
  if(!amount||amount<=0){showError(t('errAmount'));amtEl.focus();return;}
  if(!grp){showError(t('errGroup'));grpEl.focus();return;}
  if(!sub){showError(t('errSub'));subEl.focus();return;}
  document.getElementById('errorMsg').textContent='';
  const today=todayStr();
  const res=await fetch('/api/expenses',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({exp_time:expTime,amount,grp,sub,icon:CATEGORIES[grp].icon,date:today}),
  });
  const data=await res.json();
  if(data.ok){
    const newExp={id:data.id,user_id:currentUser.id,exp_time:expTime,amount,grp,sub,icon:CATEGORIES[grp].icon,date:today,year_month:data.year_month||currentMonth};
    // If this expense belongs to currently viewed month, add it
    if(newExp.year_month===currentMonth) allExpenses.unshift(newExp);
    renderAll();
    amtEl.value='';grpEl.value='';subEl.value='';
    document.getElementById('subCatField').style.display='none';
    // Reset time to now
    const now=new Date();
    timeEl.value=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    // Go to today tab to see the result
    switchTab('today');
  }
}

async function deleteExpense(id){
  await fetch(`/api/expenses/${id}`,{method:'DELETE'});
  allExpenses=allExpenses.filter(e=>e.id!==id);
  renderAll();
}

async function clearMonth(){
  if(allExpenses.length===0) return;
  if(!confirm(t('confirmClear'))) return;
  await fetch(`/api/expenses/clear?month=${currentMonth}`,{method:'DELETE'});
  allExpenses=[];
  renderAll();
}

/* ── HELPERS ── */
function showError(msg){
  const el=document.getElementById('errorMsg');
  el.textContent=msg;
  setTimeout(()=>{el.textContent='';},3000);
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
