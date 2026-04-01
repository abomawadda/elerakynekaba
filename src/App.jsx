import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Users, Landmark, ReceiptText,
  PartyPopper, LineChart, Bell, UserCircle,
  LogOut, Plus, CheckCircle2, FileText,
  AlertCircle, Wallet, PiggyBank, Search,
  Building2, ShieldCheck, UserPlus,
  X, Ticket, Coins, UsersRound, ChevronLeft,
  ChevronRight, ArrowRight, Clock,
  AlertTriangle, CheckSquare, Send,
  Eye, Lock, BarChart3, RefreshCw, CalendarDays
} from 'lucide-react';

// ════════════════════════════════════════════
// 1) الثوابت + أدوات مساعدة
// ════════════════════════════════════════════
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ARABIC_DAYS   = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

const GOV_MAP = {
  '01':'القاهرة','02':'الإسكندرية','03':'بورسعيد','04':'السويس',
  '11':'دمياط','12':'الدقهلية','13':'الشرقية','14':'القليوبية',
  '15':'كفر الشيخ','16':'الغربية','17':'المنوفية','18':'البحيرة',
  '19':'الإسماعيلية','21':'الجيزة','22':'بني سويف','23':'الفيوم',
  '24':'المنيا','25':'أسيوط','26':'سوهاج','27':'قنا',
  '28':'أسوان','29':'الأقصر','31':'البحر الأحمر','32':'الوادي الجديد',
  '33':'مطروح','34':'شمال سيناء','35':'جنوب سيناء','88':'خارج الجمهورية'
};

const WORKFLOW_STEPS = {
  draft:    { label:'مسودة',          color:'text-slate-500',   bg:'bg-slate-100',  icon:FileText },
  review:   { label:'قيد المراجعة',   color:'text-amber-600',   bg:'bg-amber-50',   icon:Eye },
  approved: { label:'معتمد',          color:'text-teal-600',    bg:'bg-teal-50',    icon:CheckCircle2 },
  posted:   { label:'مُرحَّل نهائياً', color:'text-emerald-700', bg:'bg-emerald-50', icon:Send },
};

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// ── (A) تحويل الأرقام إلى كلمات عربية (مبسّط ودقيق عملياً)
const ONES = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];
const TENS_11_19 = ['أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
const TENS = ['','عشرة','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
const HUNDREDS = ['','مائة','مائتان','ثلاثمائة','أربعمائة','خمسمائة','ستمائة','سبعمائة','ثمانمائة','تسعمائة'];
const SCALES = [
  {sing:'', dual:'', plural:''}, // units
  {sing:'ألف', dual:'ألفان', plural:'آلاف'},
  {sing:'مليون', dual:'مليونان', plural:'ملايين'},
  {sing:'مليار', dual:'ملياران', plural:'مليارات'},
];

function trimSpaces(s){ return s.replace(/\s+/g,' ').trim(); }

function groupName(n, scaleIndex) {
  // n: 1..999
  if (scaleIndex === 0) return ''; // no scale for units
  if (n === 1) return SCALES[scaleIndex].sing;
  if (n === 2) return SCALES[scaleIndex].dual;
  if (n >= 3 && n <= 10) return SCALES[scaleIndex].plural;
  return SCALES[scaleIndex].sing;
}

function threeDigitsToWords(n) {
  // 0..999
  if (n === 0) return '';
  const h = Math.floor(n/100);
  const r = n % 100;
  const parts = [];
  if (h) parts.push(HUNDREDS[h]);

  if (r) {
    if (r === 10) parts.push('عشرة');
    else if (r > 10 && r < 20) parts.push(TENS_11_19[r-11]);
    else {
      const t = Math.floor(r/10), o = r%10;
      if (o && t) parts.push(`${ONES[o]} و ${TENS[t]}`);
      else if (t) parts.push(TENS[t]);
      else if (o) {
        // في الوسط نستخدم "واحد" لا "واحدة"، وهي مناسبة للأعداد العامة
        parts.push(ONES[o]);
      }
    }
  }
  return trimSpaces(parts.join(' و '));
}

function integerToArabicWords(num) {
  if (num === 0) return 'صفر';
  const groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }
  const words = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const gVal = groups[i];
    if (!gVal) continue;
    const gWords = threeDigitsToWords(gVal);
    const scale = groupName(gVal, i);
    if (i === 0) { // units
      words.push(gWords);
    } else {
      if (gVal === 1) words.push(scale);
      else if (gVal === 2) words.push(scale);
      else words.push(`${gWords} ${scale}`);
    }
  }
  return trimSpaces(words.join(' و '));
}

// صياغة المبلغ بالجنيه/القرش بصيغة مفهومة
function amountToArabicEGPWords(amount) {
  const n = Number(amount || 0);
  if (!isFinite(n)) return '';
  const abs = Math.abs(n);
  const egp = Math.floor(abs);
  const piasters = Math.round((abs - egp) * 100);

  const egpWords = integerToArabicWords(egp);
  const piWords  = integerToArabicWords(piasters);

  const egpUnit =
    egp === 0 ? 'جنيه مصري'
      : egp === 1 ? 'جنيه مصري واحد'
      : egp === 2 ? 'جنيهان مصريان'
      : 'جنيه مصري';

  const piUnit =
    piasters === 0 ? ''
      : piasters === 1 ? 'قرش مصري واحد'
      : piasters === 2 ? 'قرشان مصريان'
      : 'قرش مصري';

  let sentence = '';
  if (egp === 0 && piasters === 0) {
    sentence = 'صفر جنيه مصري';
  } else if (egp > 0 && piasters === 0) {
    sentence = `${egpWords} ${egpUnit}`;
  } else if (egp === 0 && piasters > 0) {
    sentence = `${piWords} ${piUnit}`;
  } else {
    sentence = `${egpWords} ${egpUnit} و ${piWords} ${piUnit}`;
  }

  return `فقط وقدره (${sentence}) لا غير`;
}

// ── (B) مولدات أرقام السند والشيك (محلية مع تخزين في LocalStorage)
function getTodayKey(dateISO) {
  // dateISO: 'YYYY-MM-DD'
  const [y,m,d] = dateISO.split('-');
  return `${y}${m}${d}`;
}

function peekNextVoucherInfo(dateISO) {
  const dayKey = getTodayKey(dateISO);
  const storageKey = `voucher_counter_${dayKey}`;
  const current = Number(localStorage.getItem(storageKey) || 0);
  const next = current + 1;
  return { dayKey, storageKey, seq: next, voucherNo: `${dayKey}-${String(next).padStart(4,'0')}` };
}

// يُستخدم عند الاعتماد النهائي فقط (تثبيت الرقم)
function commitVoucherIncrement(dayKey) {
  const storageKey = `voucher_counter_${dayKey}`;
  const current = Number(localStorage.getItem(storageKey) || 0);
  localStorage.setItem(storageKey, String(current + 1));
}

function peekNextCheckNumber(startFallback = 10255) {
  const key = 'check_number_seq';
  const current = Number(localStorage.getItem(key) || (startFallback - 1));
  return current + 1;
}

function commitNextCheckNumber() {
  const key = 'check_number_seq';
  const current = Number(localStorage.getItem(key) || 0);
  localStorage.setItem(key, String(current + 1));
}

// ════════════════════════════════════════════
// 2) التوست
// ════════════════════════════════════════════
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success:{ bg:'bg-emerald-600', icon:<CheckCircle2 size={18}/> },
    error:  { bg:'bg-rose-600',    icon:<AlertCircle size={18}/> },
    info:   { bg:'bg-sky-600',     icon:<AlertCircle size={18}/> },
    warning:{ bg:'bg-amber-500',   icon:<AlertTriangle size={18}/> },
  }[type] || { bg:'bg-slate-600', icon:<AlertCircle size={18}/> };
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-2xl ${cfg.bg} animate-slide-down`}>
      {cfg.icon} <span>{message}</span>
      <button onClick={onClose} className="mr-2 opacity-70 hover:opacity-100"><X size={16}/></button>
    </div>
  );
};

// ════════════════════════════════════════════
// 3) منتقي التاريخ العربي
// ════════════════════════════════════════════
const ArabicDatePicker = ({ label, value, onChange, minValue, maxValue, readOnly, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parseISO = (iso) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m: m - 1, d };
  };

  const toISO = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const parsed = parseISO(value);
  const today  = new Date();

  const [viewY, setViewY] = useState(parsed?.y || today.getFullYear());
  const [viewM, setViewM] = useState(parsed?.m ?? today.getMonth());

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDisabled = (y, m, d) => {
    const iso = toISO(y, m, d);
    if (minValue && iso < minValue) return true;
    if (maxValue && iso > maxValue) return true;
    return false;
  };

  const handleSelect = (d) => {
    if (isDisabled(viewY, viewM, d)) return;
    onChange(toISO(viewY, viewM, d));
    setOpen(false);
  };

  const displayLabel = () => {
    if (!parsed) return 'اختر تاريخاً';
    return `${parsed.d} ${ARABIC_MONTHS[parsed.m]} ${parsed.y}`;
  };

  const daysInMonth  = getDaysInMonth(viewY, viewM);
  const firstWeekDay = new Date(viewY, viewM, 1).getDay();
  const years = Array.from({ length: 80 }, (_, i) => 1990 + i);

  const prevMonth = () => { if (viewM === 0) { setViewM(11); setViewY(y => y - 1); } else setViewM(m => m - 1); };
  const nextMonth = () => { if (viewM === 11) { setViewM(0); setViewY(y => y + 1); } else setViewM(m => m + 1); };

  return (
    <div className={`space-y-1.5 ${className}`} ref={ref}>
      {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all
          ${readOnly ? 'bg-slate-800/40 border-slate-700 text-slate-400 cursor-default' : 'bg-slate-800/60 border-slate-600 text-slate-100 hover:border-teal-400 cursor-pointer'}
          ${open ? 'border-teal-400 ring-2 ring-teal-400/20' : ''}`}
      >
        <span className={parsed ? 'text-slate-100 font-semibold' : 'text-slate-500'}>{displayLabel()}</span>
        {!readOnly && <CalendarDays size={16} className="text-slate-400 shrink-0"/>}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-4 w-72 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300"><ChevronRight size={16}/></button>
            <div className="flex items-center gap-2">
              <select value={viewM} onChange={e => setViewM(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 text-slate-100 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer">
                {ARABIC_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={viewY} onChange={e => setViewY(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 text-slate-100 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300"><ChevronLeft size={16}/></button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-1">
            {ARABIC_DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-500 py-1">{d.charAt(0)}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstWeekDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const iso = toISO(viewY, viewM, d);
              const isSelected = value === iso;
              const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());
              const disabled = isDisabled(viewY, viewM, d);
              return (
                <button key={d} onClick={() => handleSelect(d)} disabled={disabled}
                  className={`h-8 w-full rounded-lg text-xs font-semibold transition-all
                    ${isSelected ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : ''}
                    ${isToday && !isSelected ? 'border border-teal-400 text-teal-400' : ''}
                    ${!isSelected && !isToday && !disabled ? 'text-slate-300 hover:bg-slate-700' : ''}
                    ${disabled ? 'text-slate-600 cursor-not-allowed' : 'cursor-pointer'}`}
                >{d}</button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
            <button onClick={() => { onChange(''); setOpen(false); }} className="text-xs text-slate-500 hover:text-rose-400 transition-colors">مسح التاريخ</button>
            <button onClick={() => { const now = new Date(); setViewY(now.getFullYear()); setViewM(now.getMonth()); }}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"><RefreshCw size={10}/> اليوم</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// 4) حقول + مؤشرات سير العمل
// ════════════════════════════════════════════
const Field = ({ label, value, onChange, placeholder, readOnly, type = 'text', className = '', error }) => (
  <div className={`space-y-1.5 relative ${className}`}>
    {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
    <input type={type} value={value || ''} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
        ${readOnly ? 'bg-slate-800/40 border-slate-700 text-slate-400 cursor-default' : 'bg-slate-800/60 border-slate-600 text-slate-100 placeholder-slate-500 hover:border-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20'}
        ${error ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
    {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
    <select value={value || ''} onChange={onChange}
      className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none hover:border-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all cursor-pointer">
      <option value="">— اختر —</option>
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  </div>
);

const WorkflowBadge = ({ status }) => {
  const cfg = WORKFLOW_STEPS[status] || WORKFLOW_STEPS.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border border-current/20`}>
      <Icon size={12}/> {cfg.label}
    </span>
  );
};

const WorkflowStepper = ({ status }) => {
  const steps = ['draft', 'review', 'approved', 'posted'];
  const currentIdx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const cfg = WORKFLOW_STEPS[s];
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s}>
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-700 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${active ? 'text-teal-400' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 mb-4 transition-all ${i < currentIdx ? 'bg-teal-500' : 'bg-slate-700'}`}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ════════════════════════════════════════════
// 5) لوحة القيادة
// ════════════════════════════════════════════
const DashboardTab = ({ employeesDB, boardMembers }) => {
  const activeCount  = employeesDB.filter(e => e.membershipStatus === 'عضو نشط').length;
  const retiredCount = employeesDB.filter(e => e.membershipStatus === 'معاش').length;

  const stats = [
    { title:'رصيد البنك', value:'125,000', unit:'ج.م', icon:Landmark,   color:'teal',   sub:'+2,500 هذا الشهر' },
    { title:'العهدة النثرية', value:'1,500', unit:'ج.م', icon:Wallet,    color:'amber',  sub:'رصيد متاح' },
    { title:'طلبات معلّقة', value:'5',       unit:'طلب', icon:Clock,     color:'rose',   sub:'قيد الاعتماد' },
    { title:'إجمالي الأعضاء', value:String(employeesDB.length), unit:'عضو', icon:Users, color:'sky', sub:`${activeCount} نشط — ${retiredCount} معاش` },
  ];

  const colorMap = {
    teal:  { bg:'bg-teal-500/10',  text:'text-teal-400',  ring:'ring-teal-400/20' },
    amber: { bg:'bg-amber-500/10', text:'text-amber-400', ring:'ring-amber-400/20' },
    rose:  { bg:'bg-rose-500/10',  text:'text-rose-400',  ring:'ring-rose-400/20' },
    sky:   { bg:'bg-sky-500/10',   text:'text-sky-400',   ring:'ring-sky-400/20' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">لوحة القيادة</h2>
        <p className="text-slate-500 mt-1 text-sm">الموقف المالي والإداري الراهن</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const c = colorMap[s.color];
          return (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-all group">
              <div className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <Icon size={20} className={c.text}/>
              </div>
              <p className="text-slate-500 text-xs font-semibold mb-1">{s.title}</p>
              <p className="text-2xl font-bold text-slate-100">{s.value} <span className="text-sm text-slate-500 font-normal">{s.unit}</span></p>
              <p className="text-xs text-slate-600 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-teal-400"/> الموقف السريع</h3>
          <div className="space-y-3">
            {[
              { label:'نسبة الأعضاء النشطين', val: Math.round(activeCount / Math.max(employeesDB.length,1) * 100), color:'bg-teal-500' },
              { label:'الطاقة الاستيعابية للإعانات (شهري)', val:72, color:'bg-amber-500' },
              { label:'الاشتراك في آخر فعالية', val:58, color:'bg-sky-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-slate-300 font-bold">{item.val}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{width:`${item.val}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Clock size={16} className="text-teal-400"/> آخر التحركات</h3>
          <div className="space-y-3">
            {[
              { text:'إيداع نقابة دمياط', time:'منذ ساعتين', type:'deposit' },
              { text:'صرف إعانة وفاة', time:'أمس', type:'aid' },
              { text:'تسجيل رحلة شرم', time:'3 أيام', type:'event' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.type === 'deposit' ? 'bg-teal-400' : item.type === 'aid' ? 'bg-rose-400' : 'bg-amber-400'}`}/>
                <div>
                  <p className="text-sm text-slate-300 font-medium">{item.text}</p>
                  <p className="text-xs text-slate-600">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// 6) ملف العضو
// ════════════════════════════════════════════
const EmployeesTab = ({ showToast, jumpToAid, globalSearch, activeEvents, onSaveEmployee }) => {
  const [q, setQ] = useState('');
  const [errors, setErrors] = useState({});
  const [emp, setEmp] = useState({
    jobId:'', name:'', nationalId:'', birthDate:'', retirementDate:'',
    gender:'', governorate:'', phone:'', email:'', address:'',
    department:'', jobTitle:'', hireDate:'', membershipNo:'',
    joinedDate:'', membershipStatus:'عضو نشط'
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');

  const doSearch = useCallback(() => {
    if (!q.trim()) { showToast('أدخل كلمة بحث', 'warning'); return; }
    const found = globalSearch(q.trim());
    if (found) { setEmp(prev => ({...prev, ...found})); showToast(`تم استدعاء ملف: ${found.name}`, 'success'); }
    else showToast('لا يوجد عضو مطابق', 'warning');
  }, [q, globalSearch, showToast]);

  const handleIdChange = (e) => {
    const id = e.target.value.replace(/\D/g, '').slice(0, 14);
    setEmp(prev => ({ ...prev, nationalId: id }));
    if (id.length === 14) {
      const century = id[0] === '2' ? '19' : id[0] === '3' ? '20' : null;
      if (!century) { showToast('رقم قومي غير صحيح — يبدأ بـ 2 أو 3', 'error'); return; }
      const year = century + id.substring(1, 3);
      const month = id.substring(3, 5);
      const day   = id.substring(5, 7);
      const govCode = id.substring(7, 9);
      const genderDigit = parseInt(id[12]);
      if (parseInt(month) < 1 || parseInt(month) > 12 || parseInt(day) < 1 || parseInt(day) > 31) {
        showToast('تاريخ ميلاد مستخرج من الرقم القومي غير منطقي', 'error'); return;
      }
      const birthISO = `${year}-${month}-${day}`;
      const retirementISO = `${parseInt(year) + 60}-${month}-${day}`;
      setEmp(prev => ({
        ...prev, birthDate: birthISO, retirementDate: retirementISO,
        governorate: GOV_MAP[govCode] || 'غير معروف',
        gender: genderDigit % 2 === 0 ? 'أنثى' : 'ذكر'
      }));
      showToast('تم استخراج البيانات آلياً من الرقم القومي', 'info');
    }
  };

  const validate = () => {
    const e = {};
    if (!emp.jobId)    e.jobId = 'مطلوب';
    if (!emp.name)     e.name  = 'مطلوب';
    if (emp.nationalId && emp.nationalId.length !== 14) e.nationalId = 'يجب أن يكون 14 رقماً';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) { showToast('يرجى تصحيح الأخطاء أولاً', 'error'); return; }
    onSaveEmployee(emp);
    showToast('تم حفظ ملف العضو بنجاح', 'success');
  };

  const canUseServices = emp.membershipStatus === 'عضو نشط';

  const Section = ({ title, sub, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
        <div>
          <h3 className="font-bold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <h2 className="text-slate-300 font-bold mb-3 flex items-center gap-2"><Search size={16} className="text-teal-400"/> بحث عن عضو</h2>
        <div className="flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="الرقم الوظيفي، الرقم القومي، أو الاسم…"
            className="flex-1 px-4 py-2.5 bg-slate-700/60 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"/>
          <button onClick={doSearch} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">بحث</button>
          <button onClick={() => { setEmp({ jobId:'',name:'',nationalId:'',birthDate:'',retirementDate:'',gender:'',governorate:'',phone:'',email:'',address:'',department:'',jobTitle:'',hireDate:'',membershipNo:'',joinedDate:'',membershipStatus:'عضو نشط' }); setQ(''); setErrors({}); }} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-sm transition-all" title="ملف جديد">
            <Plus size={16}/>
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400">
            <UserCircle size={30}/>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{emp.name || 'ملف جديد'}</h3>
            <p className="text-sm text-slate-500">{emp.jobId ? `رقم وظيفي: ${emp.jobId}` : 'أدخل بيانات العضو'}</p>
            <div className="mt-1.5">
              {emp.membershipStatus && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border
                  ${emp.membershipStatus === 'عضو نشط' ? 'bg-teal-500/10 text-teal-400 border-teal-400/30' :
                    emp.membershipStatus === 'مستقلة' ? 'bg-rose-500/10 text-rose-400 border-rose-400/30' :
                    'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {emp.membershipStatus}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {emp.phone && (
            <a href={`https://wa.me/${emp.phone}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all">
              واتساب
            </a>
          )}
          <button onClick={() => {
            if (!emp.name) { showToast('اختر عضواً أولاً', 'warning'); return; }
            setShowEventModal(true);
          }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-xl text-xs font-bold transition-all">
            <Ticket size={14}/> اشتراك بفعالية
          </button>
          <button onClick={() => {
            if (emp.membershipStatus !== 'عضو نشط') { showToast('العضو غير نشط — لا يستحق الخدمات', 'error'); return; }
            if (!emp.name) { showToast('اختر عضواً أولاً', 'warning'); return; }
            jumpToAid(emp);
          }} className="flex items-center gap-1.5 px-3 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 rounded-xl text-xs font-bold transition-all">
            <PiggyBank size={14}/> طلب إعانة
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
            <CheckCircle2 size={14}/> حفظ الملف
          </button>
        </div>
      </div>

      {/* Form sections */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-8">
        <Section title="البيانات الأساسية" sub="مستخرجة تلقائياً من الرقم القومي">
          <Field label="الرقم الوظيفي / الكود" value={emp.jobId} onChange={e => setEmp({...emp, jobId: e.target.value})} error={errors.jobId}/>
          <Field label="الاسم الرباعي" value={emp.name} onChange={e => setEmp({...emp, name: e.target.value})} error={errors.name}/>
          <Field label="الرقم القومي (14 رقم)" value={emp.nationalId} onChange={handleIdChange} error={errors.nationalId} placeholder="أدخل 14 رقماً"/>
          <Field label="النوع (آلي)" value={emp.gender} readOnly/>
          <ArabicDatePicker label="تاريخ الميلاد (آلي)" value={emp.birthDate} onChange={()=>{}} readOnly/>
          <Field label="محل الميلاد (آلي)" value={emp.governorate} readOnly/>
        </Section>

        <Section title="بيانات التواصل" sub="أرقام الهواتف والعناوين">
          <Field label="رقم الموبايل (واتساب)" type="tel" value={emp.phone} onChange={e => setEmp({...emp, phone: e.target.value})} placeholder="01xxxxxxxxx"/>
          <Field label="البريد الإلكتروني" type="email" value={emp.email} onChange={e => setEmp({...emp, email: e.target.value})} placeholder="example@mail.com"/>
          <Field label="العنوان الفعلي" value={emp.address} onChange={e => setEmp({...emp, address: e.target.value})} className="md:col-span-2 lg:col-span-3"/>
        </Section>

        <Section title="التوظيف والمؤهل" sub="الوظيفة والتعيين">
          <Select label="قطاع العمل / الإدارة" value={emp.department} onChange={e => setEmp({...emp, department: e.target.value})} options={['إدارة هندسية','خدمة عملاء','مبيعات','حسابات وموارد بشرية','شئون قانونية','تكنولوجيا المعلومات']}/>
          <Select label="المسمى الوظيفي" value={emp.jobTitle} onChange={e => setEmp({...emp, jobTitle: e.target.value})} options={['مدير إدارة','مهندس أول','مهندس','أخصائي','فني','إداري','محاسب']}/>
          <ArabicDatePicker label="تاريخ التعيين" value={emp.hireDate} onChange={v => setEmp({...emp, hireDate: v})}/>
          <ArabicDatePicker label="تاريخ الإحالة للمعاش (آلي)" value={emp.retirementDate} onChange={()=>{}} readOnly/>
        </Section>

        <Section title="البيانات النقابية" sub="العضوية والحالة">
          <Field label="رقم العضوية النقابية" value={emp.membershipNo} onChange={e => setEmp({...emp, membershipNo: e.target.value})}/>
          <ArabicDatePicker label="تاريخ الانضمام" value={emp.joinedDate} onChange={v => setEmp({...emp, joinedDate: v})}/>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">حالة العضوية</label>
            <select value={emp.membershipStatus} onChange={e => setEmp({...emp, membershipStatus: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none hover:border-slate-500 focus:border-teal-400 transition-all cursor-pointer">
              {['عضو نشط','موقوف','مستقلة','معاش'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Section>
      </div>

      {/* Event modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-100">اشتراك في فعالية</h3>
              <button onClick={() => setShowEventModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><X size={16}/></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">تسجيل <span className="text-teal-400 font-bold">{emp.name}</span> في فعالية</p>
            <Select label="الفعالية المتاحة" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
              options={activeEvents.map(ev => `${ev.title} — رسوم: ${ev.fee} ج.م`)}/>
            <div className="flex gap-3 mt-6">
              <button onClick={() => {
                if (!selectedEvent) { showToast('اختر فعالية أولاً', 'warning'); return; }
                showToast('تم تسجيل الاشتراك وإصدار الإيصال', 'success');
                setShowEventModal(false); setSelectedEvent('');
              }} className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all">تأكيد</button>
              <button onClick={() => setShowEventModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl text-sm transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// 7) مجلس الإدارة
// ════════════════════════════════════════════
const BoardMembersTab = ({ showToast, boardMembers, setBoardMembers }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [duesModal, setDuesModal] = useState(null);
  const [form, setForm] = useState({ name:'', role:'عضو مجلس', status:'نشط', phone:'', joined:'' });

  const handleAdd = () => {
    if (!form.name.trim()) { showToast('الاسم مطلوب', 'error'); return; }
    setBoardMembers(prev => [...prev, { id: Date.now(), ...form, joined: form.joined || new Date().toISOString().split('T')[0] }]);
    setForm({ name:'', role:'عضو مجلس', status:'نشط', phone:'', joined:'' });
    setShowAdd(false);
    showToast('تمت إضافة عضو مجلس الإدارة', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><ShieldCheck size={20} className="text-teal-400"/> مجلس الإدارة</h2>
          <p className="text-slate-500 text-sm mt-1">{boardMembers.length} عضو مسجّل</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">
          <UserPlus size={16}/> إضافة عضو
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-800/60 border border-teal-400/30 rounded-2xl p-5 animate-fade-in space-y-4">
          <h3 className="font-bold text-slate-200 text-sm">بيانات عضو جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="الاسم الرباعي" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم العضو…"/>
            <Select label="الصفة / المنصب" value={form.role} onChange={e => setForm({...form, role: e.target.value})} options={['رئيس النقابة','نائب الرئيس','أمين الصندوق','الأمين العام','عضو مجلس','إشراف طبي']}/>
            <Select label="الحالة" value={form.status} onChange={e => setForm({...form, status: e.target.value})} options={['نشط','إجازة','مجمد']}/>
            <Field label="رقم الهاتف" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01xxxxxxxxx"/>
            <ArabicDatePicker label="تاريخ شغل المنصب" value={form.joined} onChange={v => setForm({...form, joined: v})}/>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">حفظ</button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-sm transition-all">إلغاء</button>
          </div>
        </div>
      )}

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="border-b border-slate-700">
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="p-4">العضو</th>
              <th className="p-4">تاريخ المنصب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {boardMembers.map(m => (
              <tr key={m.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{m.name}</p>
                      <p className="text-xs text-teal-400">{m.role}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-xs">{m.joined}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border
                    ${m.status === 'نشط' ? 'bg-teال-500/10 text-teal-400 border-teal-400/30' : 'bg-amber-500/10 text-amber-400 border-amber-400/30'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => setDuesModal(m)} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all">
                    <Coins size={13}/> المستحقات
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {duesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-slate-100">المستحقات والبدلات</h3>
                <p className="text-xs text-slate-500 mt-0.5">العضو: <span className="text-teal-400 font-bold">{duesModal.name}</span></p>
              </div>
              <button onClick={() => setDuesModal(null)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><X size={16}/></button>
            </div>
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-700/50 border-b border-slate-700">
                  <tr className="text-xs text-slate-500">
                    <th className="p-3">التاريخ</th><th className="p-3">البيان</th><th className="p-3">القيمة</th><th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {[
                    { date:'01/03/2026', desc:'بدل حضور جلسة مجلس إدارة', val:'500 ج.م', status:'تم الصرف', color:'teal' },
                    { date:'15/03/2026', desc:'اشتراك مجاني — رحلة شرم الشيخ', val:'1,200 ج.م', status:'ميزة عينية', color:'amber' },
                    { date:'28/03/2026', desc:'بدل انتقال — مؤتمر الإسكندرية', val:'800 ج.م', status:'قيد الاعتماد', color:'rose' },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-slate-700/20">
                      <td className="p-3 text-slate-400 text-xs">{r.date}</td>
                      <td className="p-3 text-slate-300 font-medium">{r.desc}</td>
                      <td className={`p-3 font-bold text-${r.color}-400`}>{r.val}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${r.color}-500/10 text-${r.color}-400 border border-${r.color}-400/30`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// 8) الخزينة — مع توليد رقم سند + رقم شيك + مبلغ بالحروف
// ════════════════════════════════════════════
const TreasuryTab = ({ userRole, showToast, prefilledEmployee, globalSearch }) => {
  const [trxType, setTrxType]         = useState('deposit');   // deposit | aid | advance
  const [wfStatus, setWfStatus]       = useState('draft');     // draft | review | approved | posted

  // الحقول المالية
  const [amount, setAmount]           = useState('');
  const [txDate, setTxDate]           = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes]             = useState('');

  // السند/الشيك
  const [{ voucherNo, dayKey }, setVoucherMeta] = useState(() => {
    const info = peekNextVoucherInfo(new Date().toISOString().split('T')[0]);
    return { voucherNo: info.voucherNo, dayKey: info.dayKey };
  });
  const [checkNum, setCheckNum]       = useState('');          // يُولّد تلقائياً للسحوبات

  // الإعانات
  const [aidCategory, setAidCategory] = useState('');
  const [aidRelation, setAidRelation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [aidEmpQuery, setAidEmpQuery] = useState(prefilledEmployee?.jobId || '');
  const [selectedAidEmp, setSelectedAidEmp] = useState(prefilledEmployee || null);
  const [dateError, setDateError]     = useState('');

  const isWithdrawal = trxType !== 'deposit';
  const isAid        = trxType === 'aid';

  const AID_RELATIONS = {
    'إعانة زواج':        ['العضو نفسه','ابن','ابنة'],
    'إعانة وفاة':        ['الزوج / الزوجة','أب','أم','ابن','ابنة'],
    'ظروف قهرية / صحية':['العضو نفسه'],
  };

  // تحديث رقم السند المتوقع عند تغيير تاريخ الحركة (طالما مسودة)
  useEffect(() => {
    if (wfStatus !== 'draft') return;
    const info = peekNextVoucherInfo(txDate);
    setVoucherMeta({ voucherNo: info.voucherNo, dayKey: info.dayKey });
  }, [txDate, wfStatus]);

  // توليد رقم شيك تلقائياً عند اختيار نوع سحب
  useEffect(() => {
    if (wfStatus !== 'draft') return;
    if (isWithdrawal && !checkNum) {
      const nextCheck = peekNextCheckNumber(10255);
      setCheckNum(String(nextCheck));
    }
    if (!isWithdrawal) setCheckNum('');
  }, [trxType, wfStatus]); // eslint-disable-line

  const searchAidEmp = () => {
    if (!aidEmpQuery.trim()) return;
    const found = globalSearch(aidEmpQuery.trim());
    if (!found) { showToast('الموظف غير موجود', 'warning'); setSelectedAidEmp(null); return; }
    if (found.membershipStatus !== 'عضو نشط') { showToast('العضو غير نشط — لا يستحق الإعانة', 'error'); setSelectedAidEmp(null); return; }
    setSelectedAidEmp(found);
    showToast(`تم تحديد: ${found.name}`, 'success');
  };

  const validateDates = () => {
    if (incidentDate && txDate && incidentDate > txDate) {
      setDateError('تاريخ الواقعة لا يمكن أن يكون بعد تاريخ الحركة');
      return false;
    }
    setDateError('');
    return true;
  };

  const canAdvanceWf = () => {
    if (!amount || parseFloat(amount) <= 0) { showToast('أدخل مبلغاً صحيحاً أولاً', 'warning'); return false; }
    if (isAid && !selectedAidEmp) { showToast('يجب تحديد العضو المستحق للإعانة', 'warning'); return false; }
    if (isAid && !aidCategory) { showToast('اختر تصنيف الإعانة', 'warning'); return false; }
    if (!validateDates()) { showToast(dateError, 'error'); return false; }
    return true;
  };

  const advanceWorkflow = () => {
    if (!canAdvanceWf()) return;
    const flow = ['draft','review','approved','posted'];
    const idx = flow.indexOf(wfStatus);
    if (idx < flow.length - 1) {
      const next = flow[idx + 1];

      // صلاحيات الاعتماد والترحيل
      if ((next === 'approved' || next === 'posted') && userRole !== 'treasurer') {
        showToast('صلاحية الاعتماد/الترحيل للأمين فقط', 'error'); return;
      }

      // عند الاعتماد: ثبّت رقم السند وزِد عداد الشيك إذا سحب
      if (next === 'approved') {
        commitVoucherIncrement(dayKey); // تثبيت هذا الرقم
        if (isWithdrawal) {
          commitNextCheckNumber(); // زيادة عداد الشيك
        }
      }

      setWfStatus(next);
      const msgs = { review:'تم رفع الطلب للمراجعة', approved:'تم اعتماد الحركة', posted:'تم الترحيل النهائي — قيد في دفتر الأستاذ' };
      showToast(msgs[next], next === 'posted' ? 'success' : 'info');
    }
  };

  const resetForm = () => {
    setTrxType('deposit'); setWfStatus('draft'); setAidCategory(''); setAidRelation('');
    setSelectedAidEmp(null); setAidEmpQuery(''); setAmount(''); setNotes(''); setIncidentDate('');
    // تحديث السند الجديد
    const info = peekNextVoucherInfo(new Date().toISOString().split('T')[0]);
    setVoucherMeta({ voucherNo: info.voucherNo, dayKey: info.dayKey });
    setCheckNum('');
    showToast('تم مسح النموذج', 'info');
  };

  const amountWords = amountToArabicEGPWords(parseFloat(amount || 0));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Landmark size={20} className="text-teal-400"/> حركات الخزينة</h2>
          <p className="text-slate-500 text-sm mt-1">إنشاء ومراجعة سندات الصرف والإيداع</p>
        </div>
        <button onClick={resetForm} className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-bold transition-all">
          <RefreshCw size={13}/> نموذج جديد
        </button>
      </div>

      {/* Workflow */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <WorkflowStepper status={wfStatus}/>
        <WorkflowBadge status={wfStatus}/>
      </div>

      {/* Voucher core */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
        {/* Line 1: type, voucher, date */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">نوع الحركة</label>
            <select value={trxType} onChange={e => { setTrxType(e.target.value); setWfStatus('draft'); }}
              disabled={wfStatus !== 'draft'}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none focus:border-teal-400 transition-all cursor-pointer disabled:opacity-50">
              <option value="deposit">سند إيداع (دائن)</option>
              <option value="aid">سند صرف إعانة (مدين)</option>
              <option value="advance">سند سلفة / عهدة (مدين)</option>
            </select>
          </div>

          <Field label="رقم السند (تلقائي)" value={voucherNo} readOnly className="md:col-span-1"/>
          <div className="relative md:col-span-1">
            <ArabicDatePicker label="تاريخ الحركة" value={txDate} onChange={v => { setTxDate(v); validateDates(); }} readOnly={wfStatus !== 'draft'}/>
          </div>

          {isWithdrawal ? (
            <Field label="رقم الشيك (تلقائي)" value={checkNum} onChange={e => setCheckNum(e.target.value)} readOnly={true} />
          ) : (
            <div />
          )}
        </div>

        {/* Line 2: amount + amount in words */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">المبلغ الإجمالي (ج.م)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" disabled={wfStatus !== 'draft'}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-xl font-bold outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all disabled:opacity-50"/>
            <p className="mt-2 text-xs text-amber-400 font-bold italic">{amount ? amountWords : '— المبلغ بالحروف سيظهر هنا —'}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">بيان الحركة (وصف تفصيلي)</label>
            <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} disabled={wfStatus === 'posted'}
              placeholder="مثال: صرف إعانة زواج بناءً على طلب العضو…"
              className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all resize-none disabled:opacity-50"/>
          </div>
        </div>

        {/* Aid details */}
        {isAid && (
          <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-4">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">تفاصيل الإعانة</p>
            <div className="flex gap-2">
              <input value={aidEmpQuery} onChange={e => setAidEmpQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchAidEmp()}
                placeholder="ابحث بالرقم الوظيفي أو الاسم…" disabled={wfStatus !== 'draft'}
                className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl text-sm outline-none focus:border-sky-400 transition-all disabled:opacity-50"/>
              <button onClick={searchAidEmp} disabled={wfStatus !== 'draft'} className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold rounded-xl text-sm transition-all disabled:opacity-50">بحث</button>
            </div>
            {selectedAidEmp && (
              <div className="flex items-center gap-2 text-sm text-teal-400 font-bold">
                <CheckCircle2 size={16}/> {selectedAidEmp.name} — رقم وظيفي: {selectedAidEmp.jobId}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="تصنيف الإعانة" value={aidCategory} onChange={e => { setAidCategory(e.target.value); setAidRelation(''); }}
                options={Object.keys(AID_RELATIONS)}/>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">صلة القرابة</label>
                <select value={aidRelation} onChange={e => setAidRelation(e.target.value)} disabled={!aidCategory || wfStatus !== 'draft'}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none focus:border-teal-400 transition-all disabled:opacity-40 cursor-pointer">
                  <option value="">— اختر —</option>
                  {aidCategory && AID_RELATIONS[aidCategory]?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="relative">
                <ArabicDatePicker label="تاريخ الواقعة" value={incidentDate} onChange={v => { setIncidentDate(v); validateDates(); }}
                  maxValue={txDate} readOnly={wfStatus !== 'draft'}/>
                {dateError && <p className="text-xs text-rose-400 mt-0.5">{dateError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {wfStatus !== 'posted' && (
          <button onClick={advanceWorkflow}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20">
            <ArrowRight size={16}/>
            {wfStatus === 'draft'    ? 'رفع للمراجعة' :
             wfStatus === 'review'   ? 'اعتماد الحركة (تثبيت رقم السند/الشيك)' :
             wfStatus === 'approved' ? 'ترحيل نهائي'   : ''}
          </button>
        )}
        {wfStatus === 'posted' && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold">
            <Lock size={16}/> مُرحَّل — لا يمكن التعديل
          </div>
        )}
        {wfStatus !== 'posted' && (
          <button onClick={() => showToast('تم حفظ المسودة', 'info')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-sm transition-all">
            <FileText size={15}/> حفظ مسودة
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// 9) التسويات
// ════════════════════════════════════════════
const SettlementTab = ({ showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [expDate, setExpDate]   = useState(new Date().toISOString().split('T')[0]);
  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat]     = useState('ضيافة وبوفيه');
  const advanceDate = '2026-03-01';
  const advanceAmount = 5000;
  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const remaining  = advanceAmount - totalSpent;

  const addExpense = () => {
    if (!expAmount || parseFloat(expAmount) <= 0) { showToast('أدخل مبلغاً صحيحاً', 'error'); return; }
    if (expDate < advanceDate) { showToast('تاريخ الفاتورة لا يمكن أن يسبق تاريخ فتح العهدة', 'error'); return; }
    if (expDate > new Date().toISOString().split('T')[0]) { showToast('تاريخ الفاتورة في المستقبل!', 'warning'); return; }
    if (totalSpent + parseFloat(expAmount) > advanceAmount) { showToast(`المبلغ يتجاوز رصيد العهدة (المتبقي: ${remaining} ج.م)`, 'error'); return; }
    setExpenses(prev => [...prev, { id: Date.now(), date: expDate, amount: expAmount, category: expCat }]);
    setExpAmount('');
    showToast('تمت إضافة الفاتورة', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><ReceiptText size={20} className="text-amber-400"/> تسويات السلف والعهد</h2>
        <p className="text-slate-500 text-sm mt-1">تفريغ الفواتير وإغلاق العهد المفتوحة</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
        <Select label="العهدة المفتوحة" value="شيك رقم 10254 — عهدة بوفيه (5,000 ج.م) — 01 مارس 2026"
          onChange={()=>{}} options={['شيك رقم 10254 — عهدة بوفيه (5,000 ج.م) — 01 مارس 2026']}/>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'إجمالي العهدة',   val:`${advanceAmount} ج.م`, color:'slate' },
            { label:'إجمالي المنصرف',  val:`${totalSpent} ج.م`,    color:'rose' },
            { label:'المتبقي للرد',    val:`${remaining} ج.م`,     color:'teal' },
          ].map((s, i) => (
            <div key={i} className={`p-4 rounded-xl text-center border
              ${s.color === 'rose' ? 'bg-rose-500/5 border-rose-500/20' : s.color === 'teal' ? 'bg-teal-500/5 border-teal-500/20' : 'bg-slate-700/50 border-slate-600'}`}>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-lg font-bold ${s.color === 'rose' ? 'text-rose-400' : s.color === 'teal' ? 'text-teal-400' : 'text-slate-300'}`}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm">إضافة منصرف</h3>
          <div className="relative">
            <ArabicDatePicker label="تاريخ الفاتورة" value={expDate} onChange={setExpDate} minValue={advanceDate}/>
          </div>
          <Field label="المبلغ (ج.م)" type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00"/>
          <Select label="بند الصرف" value={expCat} onChange={e => setExpCat(e.target.value)} options={['ضيافة وبوفيه','أدوات مكتبية','انتقالات','أخرى']}/>
          <button onClick={addExpense} className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all">
            <Plus size={16}/> إضافة
          </button>
        </div>

        <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead className="border-b border-slate-700">
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4">التاريخ</th><th className="p-4">البند</th><th className="p-4">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {expenses.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-600">لا توجد منصرفات بعد</td></tr>
              ) : expenses.map((e, i) => (
                <tr key={i} className="hover:bg-slate-700/20">
                  <td className="p-4 text-slate-400 text-xs">{e.date}</td>
                  <td className="p-4 text-slate-300">{e.category}</td>
                  <td className="p-4 font-bold text-rose-400">{e.amount} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length > 0 && (
            <div className="p-4 border-top border-slate-700">
              <button onClick={() => showToast('تم إغلاق العهدة وترحيل المتبقي للخزينة', 'success')}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
                <CheckCircle2 size={16}/> إغلاق العهدة واعتماد التسوية
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// 10) الفعاليات
// ════════════════════════════════════════════
const EventsTab = ({ showToast, boardMembers, eventTypes, setEventTypes, globalSearch }) => {
  const [newTypeName, setNewTypeName] = useState('');
  const [showAddType, setShowAddType] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [pSearch, setPSearch]           = useState('');
  const [selectedSups, setSelectedSups] = useState([]);
  const [memberFee, setMemberFee]       = useState('');
  const [supFeeRule, setSupFeeRule]     = useState('free');
  const [eventData, setEventData] = useState({ title:'', type:'', startDate:'', endDate:'', bookingStart:'', bookingEnd:'', capacity:'' });
  const [dateErrors, setDateErrors] = useState({});

  const validateEventDates = (data) => {
    const errs = {};
    if (data.startDate && data.endDate && data.endDate < data.startDate) errs.endDate = 'تاريخ الانتهاء قبل البداية';
    if (data.bookingStart && data.startDate && data.bookingStart > data.startDate) errs.bookingStart = 'فتح الحجز بعد بدء الفعالية';
    if (data.bookingEnd && data.bookingStart && data.bookingEnd < data.bookingStart) errs.bookingEnd = 'غلق الحجز قبل فتحه';
    if (data.bookingEnd && data.startDate && data.bookingEnd > data.startDate) errs.bookingEnd = 'غلق الحجز يجب أن يكون قبل أو عند بدء الفعالية';
    setDateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const setField = (key, val) => {
    const updated = { ...eventData, [key]: val };
    setEventData(updated);
    validateEventDates(updated);
  };

  const now = new Date().toISOString().split('T')[0];
  const isBookingOpen  = eventData.bookingStart && eventData.bookingEnd && now >= eventData.bookingStart && now <= eventData.bookingEnd;
  const isBookingClosed = eventData.bookingEnd && now > eventData.bookingEnd;
  const isFull = eventData.capacity && participants.length >= parseInt(eventData.capacity);

  const addParticipant = () => {
    if (isFull) { showToast('اكتمل العدد — التسجيل مغلق', 'error'); return; }
    if (isBookingClosed) { showToast('فترة الحجز انتهت', 'error'); return; }
    if (!pSearch.trim()) return;
    const found = globalSearch(pSearch.trim());
    if (found) {
      if (found.membershipStatus !== 'عضو نشط') { showToast(`${found.name} — عضو غير نشط`, 'error'); return; }
      if (participants.some(p => p.id === found.jobId)) { showToast(`${found.name} مسجّل مسبقاً`, 'warning'); return; }
      setParticipants(prev => [...prev, { id: found.jobId, name: found.name }]);
      showToast(`تم تسجيل ${found.name}`, 'success');
    } else {
      setParticipants(prev => [...prev, { id: Date.now(), name: pSearch.trim() }]);
    }
    setPSearch('');
  };

  const totalRevenue = participants.length * parseFloat(memberFee || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><PartyPopper size={20} className="text-purple-400"/> إدارة الفعاليات</h2>
        <p className="text-slate-500 text-sm mt-1">الرحلات، المبادرات، والفعاليات الاجتماعية</p>
      </div>

      {eventData.bookingStart && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border
          ${isBookingOpen ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
            isBookingClosed ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isBookingOpen ? 'bg-teal-400 animate-pulse' : isBookingClosed ? 'bg-rose-400' : 'bg-amber-400'}`}/>
          {isBookingOpen ? 'الحجز مفتوح الآن' : isBookingClosed ? 'فترة الحجز انتهت' : 'الحجز لم يُفتح بعد'}
          {isFull && <span className="mr-3 text-rose-400 font-bold">• اكتمل العدد</span>}
        </div>
      )}

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">نوع الفعالية</label>
            <div className="flex gap-2">
              {!showAddType ? (
                <>
                  <select value={eventData.type} onChange={e => setField('type', e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none focus:border-teal-400 transition-all cursor-pointer">
                    <option value="">— اختر —</option>
                    {eventTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => setShowAddType(true)} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-all"><Plus size={16}/></button>
                </>
              ) : (
                <div className="flex-1 flex gap-2 animate-fade-in">
                  <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder="نوع جديد…"
                    className="flex-1 px-4 py-2.5 bg-slate-800/60 border border-teal-400 text-slate-100 rounded-xl text-sm outline-none" autoFocus/>
                  <button onClick={() => { if (newTypeName.trim()) { setEventTypes(p => [...p, newTypeName.trim()]); setNewTypeName(''); setShowAddType(false); showToast('تمت إضافة النوع', 'success'); }}} className="px-3 bg-teal-500 text-slate-900 rounded-xl font-bold text-sm">حفظ</button>
                  <button onClick={() => setShowAddType(false)} className="px-3 bg-slate-700 text-slate-300 rounded-xl font-bold text-sm">✕</button>
                </div>
              )}
            </div>
          </div>
          <Field label="عنوان الفعالية" value={eventData.title} onChange={e => setField('title', e.target.value)} placeholder="مثال: رحلة شرم الشيخ السنوية"/>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-700/20 border border-slate-700 rounded-xl">
          {[
            { key:'startDate',    label:'بدء الفعالية',    errKey:'startDate' },
            { key:'endDate',      label:'انتهاء الفعالية', errKey:'endDate' },
            { key:'bookingStart', label:'فتح الحجز',       errKey:'bookingStart' },
            { key:'bookingEnd',   label:'غلق الحجز',       errKey:'bookingEnd' },
          ].map(f => (
            <div key={f.key} className="relative">
              <ArabicDatePicker label={f.label} value={eventData[f.key]} onChange={v => setField(f.key, v)}/>
              {dateErrors[f.errKey] && <p className="text-xs text-rose-400 mt-0.5">{dateErrors[f.errKey]}</p>}
            </div>
          ))}
        </div>

        {/* Financials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <Field label="الطاقة الاستيعابية (عدد)" value={eventData.capacity} onChange={e => setField('capacity', e.target.value)} type="number" placeholder="الحد الأقصى"/>
          <Field label="رسوم العضو العادي (ج.م)" value={memberFee} onChange={e => setMemberFee(e.target.value)} type="number" placeholder="0.00"/>
          <Select label="لائحة رسوم المشرفين" value={supFeeRule} onChange={e => setSupFeeRule(e.target.value)}
            options={['اشتراك مجاني (معفى)','خصم 50%','نفس قيمة العضو']}/>
        </div>

        {/* Supervisors */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">هيئة الإشراف</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {boardMembers.map(m => (
              <label key={m.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
                ${selectedSups.includes(m.id) ? 'bg-teal-500/10 border-teal-400/40 text-teal-300' : 'bg-slate-700/30 border-slate-700 text-slate-400 hover:bg-slate-700/50'}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                  ${selectedSups.includes(m.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-600'}`}
                  onClick={() => setSelectedSups(p => p.includes(m.id) ? p.filter(x => x !== m.id) : [...p, m.id])}>
                  {selectedSups.includes(m.id) && <CheckSquare size={10} className="text-white"/>}
                </div>
                <span className="text-sm font-medium">{m.name} <span className="text-xs opacity-60">({m.role})</span></span>
              </label>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div className={`space-y-3 p-4 rounded-xl border transition-all ${isFull || isBookingClosed ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-700 bg-slate-700/20'}`}>
          {(isFull || isBookingClosed) && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <AlertTriangle size={14}/>
              {isFull ? 'اكتمل العدد المحدد — لا يمكن إضافة مشتركين جدد' : 'انتهت فترة الحجز'}
            </div>
          )}
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">المشتركون</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 text-slate-500" size={14}/>
              <input value={pSearch} onChange={e => setPSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && addParticipant()}
                placeholder="ابحث بالرقم الوظيفي أو الاسم…" disabled={isFull || isBookingClosed}
                className="w-full pr-9 pl-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl text-sm outline-none focus:border-teal-400 transition-all disabled:opacity-40"/>
            </div>
            <button onClick={addParticipant} disabled={isFull || isBookingClosed}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">إضافة</button>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-full text-sm text-slate-300 animate-fade-in">
                  <UsersRound size={12} className="text-teal-400"/> <span className="font-semibold">{p.name}</span>
                  <button onClick={() => setParticipants(prev => prev.filter(x => x.id !== p.id))} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={12}/></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs pt-2 border-t border-slate-700">
            <span className="text-slate-500">المسجّلون: <span className={`font-bold ${isFull ? 'text-rose-400' : 'text-teal-400'}`}>{participants.length}</span>{eventData.capacity ? ` / ${eventData.capacity}` : ''}</span>
            <span className="text-amber-400 font-bold">إجمالي المتحصلات المتوقعة: {totalRevenue.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <button onClick={() => {
        if (Object.keys(dateErrors).length > 0) { showToast('صحّح أخطاء التواريخ أولاً', 'error'); return; }
        if (!eventData.title) { showToast('أدخل عنوان الفعالية', 'warning'); return; }
        showToast('تم اعتماد الفعالية وإرسال التعميم', 'success');
      }} className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20">
        <PartyPopper size={16}/> اعتماد وإطلاق الفعالية
      </button>
    </div>
  );
};

// ════════════════════════════════════════════
// 11) التقارير
// ════════════════════════════════════════════
const ReportsTab = ({ showToast }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [dateError, setDateError] = useState('');

  const validateRange = (from, to) => {
    if (from && to && to < from) { setDateError('تاريخ النهاية قبل تاريخ البداية'); return false; }
    setDateError(''); return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><LineChart size={20} className="text-sky-400"/> التقارير الذكية</h2>
        <p className="text-slate-500 text-sm mt-1">استخراج تقارير مالية وإدارية بصيغ متعددة</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5 max-w-2xl">
        <Select label="نوع التقرير" value="" onChange={() => {}}
          options={['الموقف المالي الشامل (كشف الحساب)','الإعانات المنصرفة — مفصّل بالأعضاء','السلف والعهد المعلقة','قائمة المشتركين في فعالية','حركات الخزينة في فترة']}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <ArabicDatePicker label="من تاريخ" value={fromDate} onChange={v => { setFromDate(v); validateRange(v, toDate); }} maxValue={toDate || undefined}/>
          </div>
          <div className="relative">
            <ArabicDatePicker label="إلى تاريخ" value={toDate} onChange={v => { setToDate(v); validateRange(fromDate, v); }} minValue={fromDate || undefined}/>
            {dateError && <p className="text-xs text-rose-400 mt-0.5">{dateError}</p>}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => { if (!validateRange(fromDate, toDate)) { showToast('صحّح نطاق التاريخ', 'error'); return; } showToast('جاري تجهيز ملف PDF…', 'info'); }}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
            تصدير PDF
          </button>
          <button onClick={() => { if (!validateRange(fromDate, toDate)) { showToast('صحّح نطاق التاريخ', 'error'); return; } showToast('جاري تجهيز ملف Excel…', 'success'); }}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
            تصدير Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════
// 12) التطبيق الرئيسي
// ════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast]       = useState(null);
  const [prefilled, setPrefilled] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [employeesDB, setEmployeesDB] = useState([
    { jobId:'1001', name:'أحمد محمد العراقي',  nationalId:'29001011234567', membershipStatus:'عضو نشط', phone:'01001234567' },
    { jobId:'1002', name:'سارة خالد محمود',     nationalId:'29205151234568', membershipStatus:'عضو نشط', phone:'01101234568' },
    { jobId:'1003', name:'مصطفى كمال الدين',    nationalId:'28509121234569', membershipStatus:'مستقلة' },
  ]);

  const [boardMembers, setBoardMembers] = useState([
    { id:1, name:'أ. أحمد سعيد',    role:'رئيس النقابة', status:'نشط', phone:'01000000000', joined:'2015-05-12' },
    { id:2, name:'م. مصطفى محمود',  role:'عضو مجلس',     status:'نشط', phone:'01100000000', joined:'2018-02-20' },
    { id:4, name:'أ. محمود العراقي', role:'أمين الصندوق', status:'نشط', phone:'01500000000', joined:'2012-08-15' },
  ]);

  const [eventTypes, setEventTypes] = useState(['مصيف','رحلة','إفطار رمضاني','مبادرة كتب','خطابات فودافون']);
  const activeEvents = [{ title:'رحلة شرم الشيخ السنوية', fee:1500 }, { title:'مبادرة دعم الكتب المدرسية', fee:0 }];

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const globalSearch = useCallback((q) => {
    if (!q) return null;
    const lq = q.toLowerCase();
    return employeesDB.find(e => e.jobId === q || e.nationalId === q || e.name.includes(q) || e.name.toLowerCase().includes(lq));
  }, [employeesDB]);

  const handleSaveEmployee = useCallback((data) => {
    if (!data.jobId) return;
    setEmployeesDB(prev => {
      const exists = prev.find(e => e.jobId === data.jobId);
      return exists ? prev.map(e => e.jobId === data.jobId ? data : e) : [...prev, data];
    });
  }, []);

  const TABS = [
    { id:'dashboard', label:'الرئيسية',    icon:LayoutDashboard },
    { id:'employees', label:'ملف العضو',   icon:Users },
    { id:'board',     label:'مجلس الإدارة', icon:ShieldCheck },
    { id:'treasury',  label:'الخزينة',     icon:Landmark },
    { id:'settlement',label:'التسويات',    icon:ReceiptText },
    { id:'events',    label:'الفعاليات',   icon:PartyPopper },
    { id:'reports',   label:'التقارير',    icon:LineChart },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'); * { font-family: 'Cairo', sans-serif; }`}</style>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={26} className="text-teal-400"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">النقابة العامة</h1>
            <p className="text-slate-500 text-sm mt-1">النظام المالي والإداري</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); setUser({ name: e.target.username.value || 'مستخدم', role: e.target.role.value }); }}
            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
            <Field label="اسم المستخدم" placeholder="أدخل اسمك"/>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">كلمة المرور</label>
              <input name="pw" type="password" placeholder="••••••••" required
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">الصلاحية</label>
              <select name="role" className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 text-slate-100 rounded-xl text-sm outline-none focus:border-teal-400 transition-all cursor-pointer">
                <option value="treasurer">أمين الصندوق (مدير النظام)</option>
                <option value="dataEntry">مدخل بيانات (صلاحيات محدودة)</option>
              </select>
            </div>
            <input name="username" type="hidden" defaultValue="مستخدم"/>
            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 mt-2">
              دخول آمن للنظام
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-12px); } to { opacity:1; transform:translate(-50%,0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#1e293b; }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:99px; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Header */}
      <header className="fixed top-0 w-full h-14 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-40 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-700 text-slate-400" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <LayoutDashboard size={18}/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-center justify-center">
              <Building2 size={15} className="text-teal-400"/>
            </div>
            <span className="font-bold text-slate-200 text-sm hidden sm:block">النقابة العامة — النظام المالي</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => showToast('لا توجد تنبيهات جديدة', 'info')} className="relative p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
            <Bell size={17}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"/>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-700">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">{user.name.charAt(0)}</div>
            <span className="text-sm font-semibold text-slate-300 hidden sm:block">{user.name}</span>
          </div>
          <button onClick={() => setUser(null)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"><LogOut size={17}/></button>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1 mt-14">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

        <nav className={`fixed top-14 bottom-0 right-0 w-52 bg-slate-800/95 border-l border-slate-700 z-30 flex flex-col p-3 gap-1 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:w-52 lg:flex lg:h-[calc(100vh-56px)] lg:sticky`}>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-2">التنقل السريع</p>
          {[
            { id:'dashboard', label:'الرئيسية',    icon:LayoutDashboard },
            { id:'employees', label:'ملف العضو',   icon:Users },
            { id:'board',     label:'مجلس الإدارة', icon:ShieldCheck },
            { id:'treasury',  label:'الخزينة',     icon:Landmark },
            { id:'settlement',label:'التسويات',    icon:ReceiptText },
            { id:'events',    label:'الفعاليات',   icon:PartyPopper },
            { id:'reports',   label:'التقارير',    icon:LineChart },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}>
                <Icon size={17}/>
                <span>{tab.label}</span>
                {active && <ChevronLeft size={14} className="mr-auto opacity-60"/>}
              </button>
            );
          })}
          <div className="mt-auto pt-3 border-t border-slate-700">
            <div className="px-3 py-2 text-xs text-slate-600 font-semibold">
              <p>{user.role === 'treasurer' ? '🔑 أمين الصندوق' : '✏️ مدخل بيانات'}</p>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto min-h-[calc(100vh-56px)]">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'dashboard' && <DashboardTab employeesDB={employeesDB} boardMembers={boardMembers}/>}
            {activeTab === 'employees' && <EmployeesTab showToast={showToast} jumpToAid={emp => { setPrefilled(emp); setActiveTab('treasury'); }} globalSearch={globalSearch} activeEvents={activeEvents} onSaveEmployee={handleSaveEmployee}/>}
            {activeTab === 'board'     && <BoardMembersTab showToast={showToast} boardMembers={boardMembers} setBoardMembers={setBoardMembers}/>}
            {activeTab === 'treasury'  && <TreasuryTab userRole={user.role} showToast={showToast} prefilledEmployee={prefilled} globalSearch={globalSearch}/>}
            {activeTab === 'settlement'&& <SettlementTab showToast={showToast}/>}
            {activeTab === 'events'    && <EventsTab showToast={showToast} boardMembers={boardMembers} eventTypes={eventTypes} setEventTypes={setEventTypes} globalSearch={globalSearch}/>}
            {activeTab === 'reports'   && <ReportsTab showToast={showToast}/>}
          </div>
        </main>
      </div>
    </div>
  );
}