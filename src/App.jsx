import React, {
  useState, useEffect, useRef, useCallback,
  createContext, useContext, useMemo
} from 'react';
import {
  LayoutDashboard, Users, Landmark, ReceiptText, PartyPopper, LineChart,
  Bell, UserCircle, LogOut, Plus, CheckCircle2, FileText, AlertCircle,
  Wallet, PiggyBank, Search, Building2, CalendarDays, MessageCircle,
  FileDown, ShieldCheck, UserPlus, X, Ticket, Coins, UsersRound,
  ChevronLeft, ChevronRight, ArrowRight, Clock, AlertTriangle,
  CheckSquare, Send, Eye, Lock, BarChart3, RefreshCw, Sun, Moon,
  Printer, Upload, FileImage, FileCheck, Filter, ZoomIn, Shield,
  TrendingUp, Banknote, Hash, Phone
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS  (module-level)
══════════════════════════════════════════════════════════════ */
const MONTHS   = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS_AR  = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
const GOV_MAP  = {'01':'القاهرة','02':'الإسكندرية','03':'بورسعيد','04':'السويس','11':'دمياط','12':'الدقهلية','13':'الشرقية','14':'القليوبية','15':'كفر الشيخ','16':'الغربية','17':'المنوفية','18':'البحيرة','19':'الإسماعيلية','21':'الجيزة','22':'بني سويف','23':'الفيوم','24':'المنيا','25':'أسيوط','26':'سوهاج','27':'قنا','28':'أسوان','29':'الأقصر','31':'البحر الأحمر','32':'الوادي الجديد','33':'مطروح','34':'شمال سيناء','35':'جنوب سيناء','88':'خارج الجمهورية'};
const WF_STEPS = ['draft','review','approved','posted'];
const WF_CFG   = {
  draft:    {label:'مسودة',          icon:FileText,     color:'gray'},
  review:   {label:'قيد المراجعة',  icon:Eye,          color:'amber'},
  approved: {label:'معتمد',          icon:CheckCircle2, color:'teal'},
  posted:   {label:'مُرحَّل نهائياً',icon:Send,        color:'green'},
};
const AID_RELS = {
  'إعانة زواج':         ['العضو نفسه','ابن','ابنة'],
  'إعانة وفاة':         ['الزوج / الزوجة','أب','أم','ابن','ابنة'],
  'ظروف قهرية / صحية': ['العضو نفسه'],
};
const DEP0  = ['إدارة هندسية','خدمة عملاء','مبيعات','حسابات وموارد بشرية','شئون قانونية','تكنولوجيا المعلومات'];
const JOB0  = ['مدير إدارة','مهندس أول','مهندس','أخصائي','فني','إداري','محاسب'];
const QUAL0 = ['مؤهل عالي','مؤهل فوق متوسط','مؤهل متوسط','بدون مؤهل'];
const ROLE0 = ['رئيس النقابة','نائب الرئيس','أمين الصندوق','الأمين العام','عضو مجلس','إشراف طبي'];
const STAT0 = ['نشط','إجازة','مجمد'];
const DEP_OPTS0 = ['النقابة العامة بالدقهلية','أمين الصندوق','اشتراكات أعضاء','جهة خارجية'];
const CAT0  = ['ضيافة وبوفيه','أدوات مكتبية','انتقالات','صيانة','أخرى'];
const EV_TYPES0 = ['مصيف','رحلة','إفطار رمضاني','مبادرة كتب','خطابات فودافون'];
const RPT_TYPES0 = ['الموقف المالي الشامل (كشف الحساب)','الإعانات المنصرفة — مفصّل بالأعضاء','السلف والعهد المعلقة','قائمة مشتركي فعالية','حركات الخزينة في فترة'];

const SAMPLE_TXN = [
  {date:'2026-03-01',type:'سند إيداع',    amount:12000, party:'النقابة العامة بالدقهلية', status:'posted',   check:'—'},
  {date:'2026-03-05',type:'سند صرف إعانة',amount:3000,  party:'أحمد محمد العراقي',         status:'posted',   check:'10250'},
  {date:'2026-03-08',type:'سند سلفة',      amount:5000,  party:'أمين الصندوق',               status:'posted',   check:'10251'},
  {date:'2026-03-12',type:'سند إيداع',    amount:8000,  party:'اشتراكات أعضاء',             status:'approved', check:'—'},
  {date:'2026-03-15',type:'سند صرف إعانة',amount:2500,  party:'سارة خالد محمود',            status:'review',   check:'10252'},
  {date:'2026-03-20',type:'سند صرف إعانة',amount:4000,  party:'محمود العراقي',              status:'posted',   check:'10253'},
  {date:'2026-03-25',type:'سند إيداع',    amount:15000, party:'اشتراكات أعضاء',             status:'posted',   check:'—'},
];

const cx = (...a) => a.filter(Boolean).join(' ');

/* ══════════════════════════════════════════════════════════════
   THEME CONTEXT  (module-level)
══════════════════════════════════════════════════════════════ */
const ThemeCtx = createContext({dark:true, toggle:()=>{}});
const useTh = () => useContext(ThemeCtx);

/* theme-aware class maps */
const useT = () => {
  const {dark} = useTh();
  return {
    dark,
    page:  dark?'bg-[#0c1220] text-slate-100':'bg-slate-100 text-slate-900',
    card:  dark?'bg-slate-800/70 border-slate-700/80':'bg-white border-slate-200 shadow-sm',
    hdr:   dark?'bg-slate-900/90 border-slate-700/80':'bg-white/95 border-slate-200',
    nav:   dark?'bg-slate-900/95 border-slate-700/80':'bg-white border-slate-200',
    inp:   dark?'bg-slate-900/60 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:ring-teal-400/20':'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500/20',
    sel:   dark?'bg-slate-900/60 border-slate-600 text-slate-100 focus:border-teal-400':'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
    btn:   dark?'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600':'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200',
    text:  dark?'text-slate-100':'text-slate-900',
    sub:   dark?'text-slate-400':'text-slate-600',
    muted: dark?'text-slate-500':'text-slate-500',
    div:   dark?'border-slate-700/80':'border-slate-200',
    sxn:   dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50 border-slate-200',
    row:   dark?'hover:bg-slate-700/30':'hover:bg-slate-50/80',
    b: {
      teal:   dark?'bg-teal-500/10 text-teal-400 border-teal-400/30'   :'bg-teal-50 text-teal-700 border-teal-300',
      rose:   dark?'bg-rose-500/10 text-rose-400 border-rose-400/30'   :'bg-rose-50 text-rose-700 border-rose-300',
      amber:  dark?'bg-amber-500/10 text-amber-400 border-amber-400/30':'bg-amber-50 text-amber-700 border-amber-300',
      sky:    dark?'bg-sky-500/10 text-sky-400 border-sky-400/30'      :'bg-sky-50 text-sky-700 border-sky-300',
      purple: dark?'bg-purple-500/10 text-purple-400 border-purple-400/30':'bg-purple-50 text-purple-700 border-purple-300',
      green:  dark?'bg-green-500/10 text-green-400 border-green-400/30':'bg-green-50 text-green-700 border-green-300',
    },
  };
};

/* ══════════════════════════════════════════════════════════════
   PRINT UTILITIES  (module-level)
══════════════════════════════════════════════════════════════ */
const PRINT_FONT = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');`;
const PRINT_BASE = (title) => `<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="UTF-8"><title>${title}</title>
<style>${PRINT_FONT}
*{font-family:'Cairo',sans-serif;margin:0;padding:0;box-sizing:border-box}
body{padding:32px 42px;color:#1e293b;font-size:13px;line-height:1.6}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:90px;color:rgba(13,148,136,.04);font-weight:800;pointer-events:none;white-space:nowrap;z-index:0}
.hdr{text-align:center;border-bottom:3px double #0d9488;padding-bottom:14px;margin-bottom:20px;position:relative;z-index:1}
.org{font-size:10px;color:#94a3b8;letter-spacing:.5px;margin-bottom:3px}
.doc-title{font-size:22px;font-weight:800;color:#0d9488;margin:4px 0}
.badge{display:inline-block;padding:3px 14px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:20px;font-size:11px;font-weight:700;color:#0f766e;margin-top:5px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0}
.box{padding:9px 12px;border:1px solid #e2e8f0;border-radius:7px;background:#fafafa}
.bl{font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.bv{font-size:13px;font-weight:700;color:#1e293b}
.amt-box{background:linear-gradient(135deg,#f0fdfa,#e6fffa);border:2px solid #0d9488;border-radius:10px;padding:18px;text-align:center;margin:16px 0}
.amt-lbl{font-size:10px;color:#0d9488;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.amt-val{font-size:38px;font-weight:800;color:#0d9488}
.amt-unit{font-size:16px;font-weight:600;margin-right:4px}
.note-box{background:#f8fafc;border-right:3px solid #0d9488;border-radius:0 7px 7px 0;padding:10px 14px;margin:12px 0;font-size:12px;color:#475569}
.check-list{margin:12px 0;font-size:12px}
.check-row{display:flex;align-items:center;gap:8px;padding:4px 0}
.check-box{width:15px;height:15px;border:2px solid #cbd5e1;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;shrink:0}
.pledge{font-size:11px;color:#64748b;border:1px dashed #e2e8f0;padding:10px;border-radius:6px;margin:12px 0;background:#fafafa}
.sigs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:50px}
.sig{text-align:center;border-top:1px solid #e2e8f0;padding-top:8px;font-size:11px;color:#64748b;font-weight:700}
.sig-space{height:40px}
table{width:100%;border-collapse:collapse;font-size:12px;margin:12px 0}
thead tr{background:#f0fdfa}
th{padding:9px 10px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#0f766e}
td{padding:8px 10px;border:1px solid #e2e8f0;text-align:right}
.sum-row{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.sum-box{padding:10px 16px;border-radius:8px;font-weight:700;font-size:13px}
.sum-in{background:#f0fdfa;border:1px solid #99f6e4;color:#059669}
.sum-out{background:#fff1f2;border:1px solid #fecdd3;color:#e11d48}
.sum-net{background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a}
@media print{body{padding:16px 20px}.wm{display:none}}</style></head><body>
<div class="wm">النقابة العامة</div>`;

const printVoucher = ({vType,vNum,date,party,amount,notes,checkNum,extraFields=[]}) => {
  const w = window.open('','_blank','width=900,height=660');
  w.document.write(PRINT_BASE(vType)+`
  <div class="hdr">
    <div class="org">جمهورية مصر العربية — النقابة العامة بمحافظة الدقهلية — إدارة الشؤون المالية</div>
    <div class="doc-title">${vType}</div>
    <div class="badge">رقم السند: ${vNum||'—'}</div>
  </div>
  <div class="grid2">
    <div class="box"><div class="bl">التاريخ</div><div class="bv">${date||'—'}</div></div>
    <div class="box"><div class="bl">${vType.includes('إيداع')?'اسم المودع':'اسم المستفيد / المستلم'}</div><div class="bv">${party||'—'}</div></div>
    ${checkNum?`<div class="box"><div class="bl">رقم الشيك / الحوالة</div><div class="bv">${checkNum}</div></div>`:''}
    ${extraFields.map(f=>`<div class="box"><div class="bl">${f.label}</div><div class="bv">${f.value}</div></div>`).join('')}
  </div>
  <div class="amt-box">
    <div class="amt-lbl">المبلغ الإجمالي</div>
    <div class="amt-val">${Number(amount||0).toLocaleString()}<span class="amt-unit"> ج.م</span></div>
  </div>
  <div class="note-box"><strong>البيان التفصيلي:</strong> ${notes||'بدون بيان'}</div>
  <div class="sigs">
    <div class="sig">أمين الصندوق<div class="sig-space"></div></div>
    <div class="sig">المراجع / المعتمد<div class="sig-space"></div></div>
    <div class="sig">${vType.includes('إيداع')?'المودع':'المستلم / المستفيد'}<div class="sig-space"></div></div>
  </div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script></body></html>`);
  w.document.close();
};

const printAidRequest = ({emp,aidCat,aidRel,incDate,amount,date,notes}) => {
  const w = window.open('','_blank','width=900,height=700');
  const doc1 = aidCat==='إعانة زواج'?'عقد الزواج الرسمي موثّق':aidCat==='إعانة وفاة'?'شهادة الوفاة الرسمية':'التقرير الطبي أو المستند الرسمي';
  w.document.write(PRINT_BASE('طلب صرف إعانة')+`
  <div class="hdr">
    <div class="org">النقابة العامة بمحافظة الدقهلية — إدارة الشؤون الاجتماعية والرعاية</div>
    <div class="doc-title">نموذج طلب صرف إعانة</div>
    <div class="badge">تاريخ الطلب: ${date||'—'}</div>
  </div>
  <table>
    <tr><th width="35%">الرقم الوظيفي</th><td>${emp?.jobId||'—'}</td></tr>
    <tr><th>اسم العضو كاملاً</th><td style="font-weight:700;font-size:14px">${emp?.name||'—'}</td></tr>
    <tr><th>حالة العضوية</th><td>${emp?.membershipStatus||'—'}</td></tr>
    <tr><th>تصنيف الإعانة</th><td style="font-weight:700">${aidCat||'—'}</td></tr>
    <tr><th>صلة القرابة / طبيعة الحالة</th><td>${aidRel||'—'}</td></tr>
    <tr><th>تاريخ الواقعة</th><td>${incDate||'—'}</td></tr>
    <tr><th>المبلغ المطلوب صرفه</th><td style="font-weight:800;font-size:16px;color:#0d9488">${Number(amount||0).toLocaleString()} ج.م</td></tr>
    ${notes?`<tr><th>بيان إضافي</th><td>${notes}</td></tr>`:''}
  </table>
  <div class="check-list">
    <strong style="font-size:12px">المستندات المرفقة مع الطلب:</strong>
    <div class="check-row"><div class="check-box"></div> صورة بطاقة الرقم القومي سارية المفعول</div>
    <div class="check-row"><div class="check-box"></div> ${doc1}</div>
    <div class="check-row"><div class="check-box"></div> كشف خدمة موثّق من جهة العمل</div>
    <div class="check-row"><div class="check-box"></div> صورة كارنيه النقابة</div>
  </div>
  <div class="pledge">
    أُقرّ أنا الموقّع أدناه بأن جميع البيانات والمعلومات المذكورة في هذا النموذج صحيحة وأتحمّل المسئولية القانونية الكاملة عن صحتها، وأُقرّ بأحقيّتي في الحصول على هذه الإعانة وفق لوائح النقابة العامة.
  </div>
  <div class="sigs">
    <div class="sig">توقيع العضو مقدّم الطلب<div class="sig-space"></div></div>
    <div class="sig">اعتماد رئيس النقابة<div class="sig-space"></div></div>
    <div class="sig">اعتماد أمين الصندوق<div class="sig-space"></div></div>
  </div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script></body></html>`);
  w.document.close();
};

const printSettlement = ({expenses,advanceAmount,advanceDate,checkNum}) => {
  const w = window.open('','_blank','width=900,height=660');
  const spent = expenses.reduce((s,e)=>s+(+e.amount||0),0);
  const remaining = advanceAmount - spent;
  const rows = expenses.map((e,i)=>`<tr><td>${i+1}</td><td>${e.date}</td><td>${e.category}</td><td style="color:#e11d48;font-weight:700">${Number(e.amount).toLocaleString()} ج.م</td></tr>`).join('');
  w.document.write(PRINT_BASE('كشف تسوية عهدة نثرية')+`
  <div class="hdr">
    <div class="org">النقابة العامة بمحافظة الدقهلية — إدارة الشؤون المالية</div>
    <div class="doc-title">كشف تسوية عهدة نثرية</div>
    <div class="badge">شيك رقم: ${checkNum||'—'} — بتاريخ ${advanceDate}</div>
  </div>
  <div class="grid3">
    <div class="box"><div class="bl">إجمالي العهدة</div><div class="bv">${Number(advanceAmount).toLocaleString()} ج.م</div></div>
    <div class="box"><div class="bl">إجمالي المنصرف</div><div class="bv" style="color:#e11d48">${Number(spent).toLocaleString()} ج.م</div></div>
    <div class="box"><div class="bl">المتبقي للرد للخزينة</div><div class="bv" style="color:#059669">${Number(remaining).toLocaleString()} ج.م</div></div>
  </div>
  <table><thead><tr><th>#</th><th>تاريخ الفاتورة</th><th>بند الصرف</th><th>المبلغ</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="note-box">إجمالي الفواتير: ${expenses.length} — إجمالي المنصرف: ${Number(spent).toLocaleString()} ج.م — المتبقي للرد: ${Number(remaining).toLocaleString()} ج.م</div>
  <div class="sigs">
    <div class="sig">المسؤول عن العهدة<div class="sig-space"></div></div>
    <div class="sig">المراجع المالي<div class="sig-space"></div></div>
    <div class="sig">أمين الصندوق<div class="sig-space"></div></div>
  </div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script></body></html>`);
  w.document.close();
};

const printReport = ({records,from,to,title}) => {
  const w = window.open('','_blank','width=1000,height=700');
  const totalIn  = records.filter(r=>r.type==='سند إيداع').reduce((s,r)=>s+r.amount,0);
  const totalOut = records.filter(r=>r.type!=='سند إيداع').reduce((s,r)=>s+r.amount,0);
  const rows = records.map((r,i)=>`<tr>
    <td style="color:#64748b">${r.date}</td>
    <td style="font-weight:600">${r.type}</td>
    <td>${r.party}</td>
    <td style="font-weight:700;color:${r.type==='سند إيداع'?'#059669':'#e11d48'}">${Number(r.amount).toLocaleString()} ج.م</td>
    <td style="color:#64748b;font-size:11px">${r.check}</td>
    <td>${r.status==='posted'?'مُرحَّل':r.status==='approved'?'معتمد':r.status==='review'?'قيد المراجعة':'مسودة'}</td>
  </tr>`).join('');
  w.document.write(PRINT_BASE(title||'التقرير المالي')+`
  <div class="hdr">
    <div class="org">النقابة العامة بمحافظة الدقهلية — مركز التقارير المالية</div>
    <div class="doc-title">${title||'التقرير المالي الشامل'}</div>
    <div class="badge">الفترة: ${from||'البداية'} ← ${to||'النهاية'} | إجمالي السجلات: ${records.length}</div>
  </div>
  <table>
    <thead><tr><th>التاريخ</th><th>نوع الحركة</th><th>الجهة</th><th>المبلغ</th><th>الشيك</th><th>الحالة</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="sum-row">
    <div class="sum-box sum-in">إجمالي الإيرادات: ${totalIn.toLocaleString()} ج.م</div>
    <div class="sum-box sum-out">إجمالي المصروفات: ${totalOut.toLocaleString()} ج.م</div>
    <div class="sum-box sum-net">الصافي: ${(totalIn-totalOut).toLocaleString()} ج.م</div>
  </div>
  <script>window.onload=()=>{setTimeout(()=>window.print(),400)}<\/script></body></html>`);
  w.document.close();
};


/* ══════════════════════════════════════════════════════════════
   TOAST  (module-level)
══════════════════════════════════════════════════════════════ */
const Toast = ({message,type='success',onClose}) => {
  useEffect(()=>{const t=setTimeout(onClose,4500);return()=>clearTimeout(t);},[onClose]);
  const C = {
    success:{bg:'bg-emerald-600',ic:<CheckCircle2 size={15}/>},
    error:  {bg:'bg-rose-600',   ic:<AlertCircle  size={15}/>},
    info:   {bg:'bg-sky-600',    ic:<AlertCircle  size={15}/>},
    warning:{bg:'bg-amber-500',  ic:<AlertTriangle size={15}/>},
  }[type]||{bg:'bg-slate-700',ic:<AlertCircle size={15}/>};
  return (
    <div style={{animation:'toast .35s cubic-bezier(.16,1,.3,1) both'}}
      className={cx('fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl max-w-sm',C.bg)}>
      {C.ic}<span>{message}</span>
      <button onClick={onClose} className="mr-2 opacity-60 hover:opacity-100"><X size={13}/></button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ARABIC DATE PICKER  (module-level — so focus is never lost)
══════════════════════════════════════════════════════════════ */
const ADP = ({label,value,onChange,minVal,maxVal,readOnly,className=''}) => {
  const T = useT();
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  const today = useMemo(()=>new Date(),[]);
  const p2 = n => String(n).padStart(2,'0');
  const toISO = (y,m,d) => `${y}-${p2(m+1)}-${p2(d)}`;
  const parse = iso => { if(!iso)return null; const [y,m,d]=iso.split('-').map(Number); return {y,m:m-1,d}; };
  const getDays = (y,m) => new Date(y,m+1,0).getDate();
  const parsed = parse(value);
  const [vY,setVY] = useState(parsed?.y||today.getFullYear());
  const [vM,setVM] = useState(parsed?.m??today.getMonth());
  const years = useMemo(()=>Array.from({length:80},(_,i)=>1985+i),[]);
  const todayISO = toISO(today.getFullYear(),today.getMonth(),today.getDate());
  const firstDay = new Date(vY,vM,1).getDay();
  const numDays  = getDays(vY,vM);
  const isDis = d => { const iso=toISO(vY,vM,d); return (minVal&&iso<minVal)||(maxVal&&iso>maxVal); };
  const display = parsed?`${parsed.d} ${MONTHS[parsed.m]} ${parsed.y}`:'اختر تاريخاً';
  const prevM = () => vM===0?(setVM(11),setVY(y=>y-1)):setVM(m=>m-1);
  const nextM = () => vM===11?(setVM(0),setVY(y=>y+1)):setVM(m=>m+1);

  useEffect(()=>{
    const h = e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);

  return (
    <div className={cx('space-y-1.5 relative',className)} ref={ref}>
      {label&&<label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>{label}</label>}
      <button type="button" disabled={readOnly} onClick={()=>!readOnly&&setOpen(o=>!o)}
        className={cx('w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2',T.inp,
          readOnly&&'opacity-60 cursor-default',open&&'!border-teal-400 !ring-teal-400/20')}>
        <span className={parsed?T.text:T.muted}>{display}</span>
        {!readOnly&&<CalendarDays size={14} className={T.muted}/>}
      </button>
      {open&&(
        <div className={cx('absolute z-[100] mt-1 rounded-2xl border shadow-2xl p-4',T.card,T.div)} style={{minWidth:'17rem',top:'100%'}}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={nextM} className={cx('p-1.5 rounded-lg transition-all border',T.btn)}><ChevronRight size={13}/></button>
            <div className="flex items-center gap-1.5">
              <select value={vM} onChange={e=>setVM(+e.target.value)}
                className={cx('text-xs rounded-lg px-2 py-1 outline-none cursor-pointer border',T.sel)}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
              <select value={vY} onChange={e=>setVY(+e.target.value)}
                className={cx('text-xs rounded-lg px-2 py-1 outline-none cursor-pointer border',T.sel)}>
                {years.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button type="button" onClick={prevM} className={cx('p-1.5 rounded-lg transition-all border',T.btn)}><ChevronLeft size={13}/></button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DAYS_AR.map(d=><div key={d} className={cx('text-center text-[9px] font-bold py-1',T.muted)}>{d[0]}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:numDays},(_,i)=>i+1).map(d=>{
              const iso=toISO(vY,vM,d), sel=value===iso, isToday=iso===todayISO, dis=isDis(d);
              return (
                <button key={d} type="button" disabled={dis}
                  onClick={()=>{if(!dis){onChange(iso);setOpen(false);}}}
                  className={cx('h-7 w-full rounded-lg text-xs font-semibold transition-all',
                    sel?'bg-teal-500 text-white shadow':
                    isToday&&!sel?'border border-teal-400 text-teal-400':
                    dis?'opacity-20 cursor-not-allowed':
                    cx(T.muted,'hover:bg-slate-500/20 cursor-pointer'))}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className={cx('mt-3 pt-3 border-t flex justify-between',T.div)}>
            <button type="button" onClick={()=>{onChange('');setOpen(false);}} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">مسح التاريخ</button>
            <button type="button" onClick={()=>{setVY(today.getFullYear());setVM(today.getMonth());}}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
              <RefreshCw size={9}/> اليوم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FIELD  (module-level — CRITICAL for preventing focus loss)
   
   ⚠️  NEVER define this inside another component!
       Defining components inside other components causes React
       to treat them as new component types on every render,
       which unmounts/remounts the DOM node → losing focus.
══════════════════════════════════════════════════════════════ */
const Field = ({label,value,onChange,placeholder,readOnly,type='text',className='',error,autoFocus}) => {
  const T = useT();
  return (
    <div className={cx('space-y-1.5',className)}>
      {label&&<label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>{label}</label>}
      <input
        type={type}
        value={value??''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={cx('w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2',T.inp,
          readOnly&&'opacity-60 cursor-default',
          error&&'!border-rose-500 !ring-rose-500/20')}
      />
      {error&&<p className="text-xs text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SELECT WITH ADD  (module-level)
══════════════════════════════════════════════════════════════ */
const SWA = ({label,value,onChange,options,setOptions,className='',showAdd=true,disabled=false}) => {
  const T = useT();
  const [adding,setAdding] = useState(false);
  const [nv,setNV] = useState('');
  const ir = useRef(null);

  useEffect(()=>{if(adding&&ir.current)ir.current.focus();},[adding]);

  const commit = useCallback(()=>{
    const t=nv.trim();
    if(!t)return;
    if(setOptions&&!options.includes(t)) setOptions(p=>[...p,t]);
    onChange({target:{value:t}});
    setNV('');setAdding(false);
  },[nv,options,onChange,setOptions]);

  const cancel = useCallback(()=>{setAdding(false);setNV('');},[]);

  if(adding) return (
    <div className={cx('space-y-1.5',className)}>
      {label&&<label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>{label}</label>}
      <div className="flex gap-1.5">
        <input ref={ir} value={nv} onChange={e=>setNV(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter')commit();if(e.key==='Escape')cancel();}}
          placeholder="اكتب العنصر الجديد…"
          className={cx('flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2',T.inp,'!border-teal-400 !ring-teal-400/20')}/>
        <button type="button" onClick={commit} className="px-3 bg-teal-500 text-slate-900 rounded-xl font-bold text-sm hover:bg-teal-400 transition-all shrink-0">حفظ</button>
        <button type="button" onClick={cancel} className={cx('px-3 rounded-xl font-bold text-sm transition-all border shrink-0',T.btn)}><X size={13}/></button>
      </div>
    </div>
  );

  return (
    <div className={cx('space-y-1.5',className)}>
      {label&&<label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>{label}</label>}
      <div className="flex gap-1.5">
        <select value={value??''} onChange={onChange} disabled={disabled}
          className={cx('flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition-all focus:ring-2',T.sel,disabled&&'opacity-50 cursor-not-allowed')}>
          <option value="">— اختر —</option>
          {(options||[]).map((o,i)=><option key={i} value={o}>{o}</option>)}
        </select>
        {showAdd&&!disabled&&(
          <button type="button" onClick={()=>setAdding(true)} title="إضافة عنصر جديد للقائمة"
            className="w-10 rounded-xl border border-teal-400/50 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 flex items-center justify-center transition-all shrink-0">
            <Plus size={15}/>
          </button>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FILE UPLOAD  (module-level)
══════════════════════════════════════════════════════════════ */
const FileUpload = ({label,files,setFiles,accept='*',maxFiles=5}) => {
  const T = useT();
  const ir = useRef(null);
  const [drag,setDrag] = useState(false);
  const addF = fs => setFiles(p=>[...p,...Array.from(fs)].slice(0,maxFiles));
  const ico = n => {
    const ext=n.split('.').pop().toLowerCase();
    if(['jpg','jpeg','png','webp','gif'].includes(ext))return<FileImage size={13} className="text-sky-400 shrink-0"/>;
    if(ext==='pdf')return<FileDown size={13} className="text-rose-400 shrink-0"/>;
    return<FileCheck size={13} className="text-teal-400 shrink-0"/>;
  };
  return (
    <div className="space-y-2">
      {label&&<label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>{label}</label>}
      <div
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);addF(e.dataTransfer.files);}}
        onClick={()=>ir.current?.click()}
        className={cx('border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all',
          drag?'border-teal-400 bg-teal-500/5':
          T.dark?'border-slate-600/70 hover:border-teal-400/50 bg-slate-800/30':'border-slate-300 hover:border-teal-400/50 bg-slate-50')}>
        <Upload size={16} className="text-teal-400 mx-auto mb-1"/>
        <p className={cx('text-xs',T.sub)}>اسحب الملف هنا أو <span className="text-teal-400 font-bold">اختر من جهازك</span></p>
        <p className={cx('text-[10px] mt-0.5',T.muted)}>الحد الأقصى: {maxFiles} ملفات</p>
        <input ref={ir} type="file" multiple accept={accept} className="hidden" onChange={e=>addF(e.target.files)}/>
      </div>
      {files.length>0&&(
        <div className="space-y-1">
          {files.map((f,i)=>(
            <div key={i} className={cx('flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs',T.dark?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-200')}>
              {ico(f.name)}
              <span className={cx('flex-1 truncate font-medium',T.text)}>{f.name}</span>
              <span className={T.muted}>{(f.size/1024).toFixed(0)} ك.ب</span>
              <button type="button" onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))}
                className={cx('hover:text-rose-400 transition-colors shrink-0',T.muted)}><X size={12}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   WORKFLOW COMPONENTS  (module-level)
══════════════════════════════════════════════════════════════ */
const WFBadge = ({status}) => {
  const T = useT();
  const cfg = WF_CFG[status]||WF_CFG.draft;
  const Icon = cfg.icon;
  const cls = {
    gray:  T.dark?'bg-slate-500/10 text-slate-400 border-slate-500/30' :'bg-slate-100 text-slate-600 border-slate-300',
    amber: T.dark?'bg-amber-500/10 text-amber-400 border-amber-500/30':'bg-amber-50 text-amber-700 border-amber-300',
    teal:  T.dark?'bg-teal-500/10 text-teal-400 border-teal-500/30'   :'bg-teal-50 text-teal-700 border-teal-300',
    green: T.dark?'bg-green-500/10 text-green-400 border-green-500/30':'bg-green-50 text-green-700 border-green-300',
  }[cfg.color];
  return <span className={cx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',cls)}><Icon size={10}/>{cfg.label}</span>;
};

const WFStepper = ({status}) => {
  const T = useT();
  const cur = WF_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 flex-wrap">
      {WF_STEPS.map((st,i)=>{
        const done=i<=cur, active=i===cur, cfg=WF_CFG[st];
        return (
          <React.Fragment key={st}>
            <div className="flex flex-col items-center">
              <div className={cx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                done?'bg-teal-500 text-white shadow-lg shadow-teal-500/30':
                T.dark?'bg-slate-700 text-slate-500':'bg-slate-200 text-slate-400')}>
                {i+1}
              </div>
              <span className={cx('text-[9px] mt-1 font-semibold whitespace-nowrap',
                active?'text-teal-400':done?T.sub:T.muted)}>
                {cfg.label}
              </span>
            </div>
            {i<WF_STEPS.length-1&&(
              <div className={cx('h-0.5 w-5 mx-1 mb-4 transition-all',
                i<cur?'bg-teal-500':T.dark?'bg-slate-700':'bg-slate-200')}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FORM SECTION  (module-level — CRITICAL for preventing focus loss)
══════════════════════════════════════════════════════════════ */
const FSec = ({title,sub,children,T}) => (
  <div className="space-y-4">
    <div className={cx('pb-3 border-b',T.div)}>
      <h3 className={cx('font-bold',T.text)}>{title}</h3>
      {sub&&<p className={cx('text-xs mt-0.5',T.muted)}>{sub}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </div>
);


/* ══════════════════════════════════════════════════════════════
   DASHBOARD TAB
══════════════════════════════════════════════════════════════ */
const DashboardTab = ({employeesDB,boardMembers}) => {
  const T = useT();
  const active = employeesDB.filter(e=>e.membershipStatus==='عضو نشط').length;
  const stats = [
    {title:'رصيد البنك',       val:'125,000',unit:'ج.م', Icon:Landmark,  badge:T.b.teal,  sub:'+2,500 هذا الشهر'},
    {title:'العهدة النثرية',   val:'1,500',  unit:'ج.م', Icon:Wallet,    badge:T.b.amber, sub:'رصيد متاح للصرف'},
    {title:'طلبات معلّقة',    val:'5',      unit:'طلب', Icon:Clock,     badge:T.b.rose,  sub:'قيد الاعتماد'},
    {title:'إجمالي الأعضاء',  val:String(employeesDB.length),unit:'عضو',Icon:Users,badge:T.b.sky,sub:`${active} عضو نشط`},
  ];
  return (
    <div className="space-y-7" style={{animation:'fadeIn .35s both'}}>
      <div>
        <h2 className={cx('text-2xl font-bold',T.text)}>لوحة القيادة</h2>
        <p className={cx('text-sm mt-0.5',T.muted)}>الموقف المالي والإداري الراهن — {new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({title,val,unit,Icon,badge,sub},i)=>(
          <div key={i} className={cx('p-5 rounded-2xl border transition-all group',T.card)}>
            <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center mb-4 border group-hover:scale-110 transition-transform',badge)}>
              <Icon size={18}/>
            </div>
            <p className={cx('text-xs font-semibold mb-0.5',T.muted)}>{title}</p>
            <p className={cx('text-2xl font-bold',T.text)}>{val} <span className={cx('text-sm font-normal',T.muted)}>{unit}</span></p>
            <p className={cx('text-xs mt-0.5',T.muted)}>{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={cx('md:col-span-2 p-5 rounded-2xl border',T.card)}>
          <h3 className={cx('font-bold mb-4 flex items-center gap-2',T.text)}><BarChart3 size={14} className="text-teal-400"/> الموقف السريع</h3>
          {[
            {l:'نسبة الأعضاء النشطين',v:Math.round(active/Math.max(employeesDB.length,1)*100),c:'bg-teal-500'},
            {l:'الطاقة الاستيعابية للإعانات (شهري)',v:72,c:'bg-amber-500'},
            {l:'نسبة الاشتراك في آخر فعالية',v:58,c:'bg-purple-500'},
            {l:'نسبة تسوية العهد المفتوحة',v:85,c:'bg-sky-500'},
          ].map((b,i)=>(
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className={T.sub}>{b.l}</span>
                <span className={cx('font-bold',T.text)}>{b.v}%</span>
              </div>
              <div className={cx('h-2 rounded-full overflow-hidden',T.dark?'bg-slate-700':'bg-slate-200')}>
                <div className={cx('h-full rounded-full transition-all',b.c)} style={{width:`${b.v}%`}}/>
              </div>
            </div>
          ))}
        </div>
        <div className={cx('p-5 rounded-2xl border',T.card)}>
          <h3 className={cx('font-bold mb-4 flex items-center gap-2',T.text)}><Clock size={14} className="text-teal-400"/> آخر التحركات</h3>
          {[
            {t:'إيداع نقابة دمياط',         tm:'منذ ساعتين', d:'bg-teal-400', amt:'+12,000'},
            {t:'صرف إعانة وفاة',             tm:'أمس',        d:'bg-rose-400', amt:'-3,000'},
            {t:'تسجيل رحلة شرم الشيخ',       tm:'منذ 3 أيام', d:'bg-amber-400',amt:'+8,000'},
            {t:'تسوية عهدة البوفيه',         tm:'منذ أسبوع',  d:'bg-sky-400',  amt:'-1,200'},
          ].map((r,i)=>(
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className={cx('w-2 h-2 rounded-full shrink-0',r.d)}/>
              <div className="flex-1 min-w-0">
                <p className={cx('text-xs font-semibold truncate',T.text)}>{r.t}</p>
                <p className={cx('text-[10px]',T.muted)}>{r.tm}</p>
              </div>
              <span className={cx('text-xs font-bold shrink-0',r.amt.startsWith('+')?'text-teal-400':'text-rose-400')}>{r.amt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   EMPLOYEES TAB
   ⚠️ All sub-components (Field, SWA, ADP, FSec) are defined at
      module level — this is what prevents the focus-loss bug.
══════════════════════════════════════════════════════════════ */
const EmployeesTab = ({showToast,jumpToAid,globalSearch,activeEvents,onSaveEmployee}) => {
  const T = useT();
  const [q,setQ]       = useState('');
  const [errs,setErrs] = useState({});
  const [showEv,setShowEv]   = useState(false);
  const [selEv,setSelEv]     = useState('');
  const [attachF,setAttachF] = useState([]);
  const [deptO,setDeptO]   = useState(DEP0);
  const [jobO,setJobO]     = useState(JOB0);
  const [qualO,setQualO]   = useState(QUAL0);
  const [evO,setEvO]       = useState((activeEvents||[]).map(e=>`${e.title} — رسوم: ${e.fee} ج.م`));
  const BLANK = {jobId:'',name:'',nationalId:'',birthDate:'',retirementDate:'',gender:'',governorate:'',phone:'',email:'',address:'',department:'',jobTitle:'',hireDate:'',qualification:'',membershipNo:'',joinedDate:'',membershipStatus:'عضو نشط'};
  const [emp,setEmp] = useState(BLANK);

  // ⚠️  Use functional update to avoid stale closures
  const sf = useCallback((k,v)=>setEmp(p=>({...p,[k]:v})),[]);

  const doSearch = useCallback(()=>{
    if(!q.trim()){showToast('أدخل كلمة بحث','warning');return;}
    const f = globalSearch(q.trim());
    if(f){setEmp(f);showToast(`تم استدعاء ملف: ${f.name}`);}
    else showToast('لا يوجد عضو مطابق','warning');
  },[q,globalSearch,showToast]);

  const handleId = useCallback((e)=>{
    const id = e.target.value.replace(/\D/g,'').slice(0,14);
    sf('nationalId',id);
    if(id.length===14){
      const c = id[0]==='2'?'19':id[0]==='3'?'20':null;
      if(!c){showToast('الرقم القومي يبدأ بـ 2 أو 3 فقط','error');return;}
      const yr=c+id.slice(1,3), mo=id.slice(3,5), dy=id.slice(5,7);
      if(+mo<1||+mo>12||+dy<1||+dy>31){showToast('تاريخ ميلاد مستخرج غير منطقي','error');return;}
      setEmp(p=>({...p,nationalId:id,
        birthDate:`${yr}-${mo}-${dy}`,
        retirementDate:`${+yr+60}-${mo}-${dy}`,
        governorate:GOV_MAP[id.slice(7,9)]||'غير معروف',
        gender:+id[12]%2===0?'أنثى':'ذكر',
      }));
      showToast('تم استخراج البيانات آلياً من الرقم القومي','info');
    }
  },[sf,showToast]);

  const validate = useCallback(()=>{
    const e={};
    if(!emp.jobId) e.jobId='مطلوب';
    if(!emp.name)  e.name='مطلوب';
    if(emp.nationalId&&emp.nationalId.length!==14) e.nationalId='يجب أن يكون 14 رقماً';
    setErrs(e);
    return !Object.keys(e).length;
  },[emp]);

  const save = useCallback(()=>{
    if(!validate()){showToast('صحّح الأخطاء المحددة أولاً','error');return;}
    onSaveEmployee(emp);
    showToast(`تم حفظ ملف العضو: ${emp.name}`,'success');
  },[validate,emp,onSaveEmployee,showToast]);

  const isActive = emp.membershipStatus==='عضو نشط';

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      {/* Search bar */}
      <div className={cx('p-5 rounded-2xl border',T.card)}>
        <h2 className={cx('font-bold mb-3 flex items-center gap-2',T.text)}><Search size={14} className="text-teal-400"/> بحث عن عضو</h2>
        <div className="flex gap-2">
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
            placeholder="الرقم الوظيفي، الرقم القومي، أو الاسم الكامل…"
            className={cx('flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2',T.inp)}/>
          <button onClick={doSearch} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">بحث</button>
          <button onClick={()=>{setEmp(BLANK);setQ('');setErrs({});setAttachF([]);}} title="ملف جديد"
            className={cx('px-4 py-2.5 rounded-xl font-bold text-sm transition-all border',T.btn)}><Plus size={15}/></button>
        </div>
      </div>

      {/* Profile card */}
      <div className={cx('p-5 rounded-2xl border',T.card)}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className={cx('w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0',T.dark?'bg-slate-700 border-slate-600 text-slate-400':'bg-slate-100 border-slate-200 text-slate-500')}>
              <UserCircle size={28}/>
            </div>
            <div>
              <h3 className={cx('text-lg font-bold',T.text)}>{emp.name||'ملف جديد'}</h3>
              <p className={cx('text-sm',T.muted)}>{emp.jobId?`رقم وظيفي: ${emp.jobId}`:'أدخل بيانات العضو أو ابحث عنه'}</p>
              {emp.membershipStatus&&(
                <span className={cx('inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full border',
                  emp.membershipStatus==='عضو نشط'?T.b.teal:emp.membershipStatus==='مستقلة'?T.b.rose:T.b.amber)}>
                  {emp.membershipStatus}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {emp.phone&&(
              <a href={`https://wa.me/${emp.phone}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all">
                <MessageCircle size={12}/> واتساب
              </a>
            )}
            <button onClick={()=>{if(!emp.name){showToast('اختر عضواً أولاً','warning');return;}setShowEv(true);}}
              className={cx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all',T.b.purple)}>
              <Ticket size={12}/> اشتراك فعالية
            </button>
            <button onClick={()=>{if(!isActive){showToast('العضو غير نشط — لا يستحق خدمات الإعانة','error');return;}if(!emp.name){showToast('اختر عضواً أولاً','warning');return;}jumpToAid(emp);}}
              className={cx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all',T.b.sky)}>
              <PiggyBank size={12}/> طلب إعانة
            </button>
            <button onClick={save}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-500/20">
              <CheckCircle2 size={12}/> حفظ الملف
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={cx('p-6 rounded-2xl border space-y-8',T.card)}>
        <FSec title="البيانات الأساسية" sub="مستخرجة آلياً من الرقم القومي عند الإدخال" T={T}>
          <Field label="الرقم الوظيفي / الكود" value={emp.jobId} onChange={e=>sf('jobId',e.target.value)} error={errs.jobId}/>
          <Field label="الاسم الرباعي الكامل"   value={emp.name}  onChange={e=>sf('name',e.target.value)}  error={errs.name}/>
          <Field label="الرقم القومي (14 رقماً)" value={emp.nationalId} onChange={handleId} error={errs.nationalId} placeholder="أدخل 14 رقماً…"/>
          <Field label="النوع (آلي)"       value={emp.gender}      readOnly/>
          <ADP   label="تاريخ الميلاد (آلي)" value={emp.birthDate} onChange={()=>{}} readOnly/>
          <Field label="محل الميلاد (آلي)" value={emp.governorate} readOnly/>
        </FSec>

        <FSec title="بيانات التواصل" sub="أرقام الهواتف والبريد والعنوان" T={T}>
          <Field label="موبايل / واتساب" type="tel"   value={emp.phone}   onChange={e=>sf('phone',e.target.value)}   placeholder="01xxxxxxxxx"/>
          <Field label="البريد الإلكتروني" type="email" value={emp.email} onChange={e=>sf('email',e.target.value)}   placeholder="example@mail.com"/>
          <Field label="العنوان الفعلي"   value={emp.address} onChange={e=>sf('address',e.target.value)} className="md:col-span-2 lg:col-span-3"/>
        </FSec>

        <FSec title="التوظيف والمؤهل" sub="بيانات الوظيفة والتعيين والشهادة" T={T}>
          <SWA label="قطاع العمل / الإدارة" value={emp.department}  onChange={e=>sf('department',e.target.value)}  options={deptO}  setOptions={setDeptO}/>
          <SWA label="المسمى الوظيفي"       value={emp.jobTitle}    onChange={e=>sf('jobTitle',e.target.value)}    options={jobO}   setOptions={setJobO}/>
          <ADP label="تاريخ التعيين"        value={emp.hireDate}    onChange={v=>sf('hireDate',v)}/>
          <SWA label="المؤهل الدراسي"       value={emp.qualification} onChange={e=>sf('qualification',e.target.value)} options={qualO} setOptions={setQualO}/>
          <ADP label="تاريخ الإحالة للمعاش (آلي)" value={emp.retirementDate} onChange={()=>{}} readOnly/>
        </FSec>

        <FSec title="البيانات النقابية" sub="رقم العضوية وتاريخ الانضمام والحالة" T={T}>
          <Field label="رقم العضوية النقابية" value={emp.membershipNo} onChange={e=>sf('membershipNo',e.target.value)}/>
          <ADP   label="تاريخ الانضمام"       value={emp.joinedDate}   onChange={v=>sf('joinedDate',v)}/>
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>حالة العضوية</label>
            <select value={emp.membershipStatus} onChange={e=>sf('membershipStatus',e.target.value)}
              className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition-all focus:ring-2',T.sel)}>
              {['عضو نشط','موقوف','مستقلة','معاش'].map(x=><option key={x}>{x}</option>)}
            </select>
          </div>
        </FSec>

        <div className={cx('pt-6 border-t',T.div)}>
          <FileUpload label="مرفقات الملف (بطاقة قومية، مستندات عمل، صور…)" files={attachF} setFiles={setAttachF} maxFiles={8}/>
        </div>
      </div>

      {/* Event modal */}
      {showEv&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={cx('rounded-2xl p-6 max-w-md w-full shadow-2xl border',T.card)} style={{animation:'fadeIn .3s both'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={cx('font-bold',T.text)}>تسجيل اشتراك في فعالية</h3>
              <button onClick={()=>setShowEv(false)} className={cx('p-1.5 rounded-lg border',T.btn)}><X size={14}/></button>
            </div>
            <p className={cx('text-sm mb-4',T.sub)}>تسجيل <span className="text-teal-400 font-bold">{emp.name}</span> في فعالية</p>
            <SWA label="الفعالية المتاحة" value={selEv} onChange={e=>setSelEv(e.target.value)} options={evO} setOptions={setEvO}/>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>{if(!selEv){showToast('اختر فعالية أولاً','warning');return;}showToast('تم التسجيل وإصدار الإيصال');setShowEv(false);setSelEv('');}}
                className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all">تأكيد الاشتراك</button>
              <button onClick={()=>setShowEv(false)} className={cx('flex-1 font-bold py-2.5 rounded-xl text-sm border',T.btn)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════
   BOARD MEMBERS TAB
══════════════════════════════════════════════════════════════ */
const BoardTab = ({showToast,boardMembers,setBoardMembers}) => {
  const T = useT();
  const [showAdd,setShowAdd] = useState(false);
  const [dm,setDm]           = useState(null);
  const [roleO,setRoleO]     = useState(ROLE0);
  const [stO,setStO]         = useState(STAT0);
  const [f,setF]             = useState({name:'',role:'عضو مجلس',status:'نشط',phone:'',joined:''});

  const add = () => {
    if(!f.name.trim()){showToast('الاسم مطلوب','error');return;}
    setBoardMembers(p=>[...p,{id:Date.now(),...f,joined:f.joined||new Date().toISOString().split('T')[0]}]);
    setF({name:'',role:'عضو مجلس',status:'نشط',phone:'',joined:''});
    setShowAdd(false);
    showToast('تمت إضافة عضو مجلس الإدارة');
  };

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className={cx('text-xl font-bold flex items-center gap-2',T.text)}><ShieldCheck size={18} className="text-teal-400"/> مجلس الإدارة</h2>
          <p className={cx('text-sm',T.muted)}>{boardMembers.length} عضو مسجّل</p>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">
          <UserPlus size={14}/> إضافة عضو
        </button>
      </div>

      {showAdd&&(
        <div className={cx('p-5 rounded-2xl border',T.card)} style={{animation:'fadeIn .3s both'}}>
          <h3 className={cx('font-bold text-sm mb-4',T.text)}>بيانات عضو مجلس إدارة جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="الاسم الرباعي" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="اسم العضو…"/>
            <SWA   label="المنصب / الصفة" value={f.role} onChange={e=>setF(p=>({...p,role:e.target.value}))} options={roleO} setOptions={setRoleO}/>
            <SWA   label="الحالة"          value={f.status} onChange={e=>setF(p=>({...p,status:e.target.value}))} options={stO} setOptions={setStO}/>
            <Field label="رقم الهاتف" type="tel" value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))} placeholder="01xxxxxxxxx"/>
            <ADP   label="تاريخ شغل المنصب" value={f.joined} onChange={v=>setF(p=>({...p,joined:v}))}/>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all">حفظ</button>
            <button onClick={()=>setShowAdd(false)} className={cx('px-5 py-2.5 rounded-xl font-bold text-sm border',T.btn)}>إلغاء</button>
          </div>
        </div>
      )}

      <div className={cx('rounded-2xl border overflow-hidden',T.card)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className={cx('border-b',T.div)}>
              <tr className={cx('text-xs uppercase tracking-wide',T.muted)}>
                <th className="p-4">العضو</th><th className="p-4">تاريخ المنصب</th>
                <th className="p-4">الحالة</th><th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {boardMembers.map(m=>(
                <tr key={m.id} className={cx('border-b transition-colors',T.div,T.row)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border',T.b.teal)}>{m.name.charAt(0)}</div>
                      <div><p className={cx('font-bold',T.text)}>{m.name}</p><p className="text-xs text-teal-400">{m.role}</p></div>
                    </div>
                  </td>
                  <td className={cx('p-4 text-xs',T.muted)}>{m.joined}</td>
                  <td className="p-4"><span className={cx('text-xs font-bold px-2.5 py-0.5 rounded-full border',m.status==='نشط'?T.b.teal:T.b.amber)}>{m.status}</span></td>
                  <td className="p-4 text-center">
                    <button onClick={()=>setDm(m)} className={cx('inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all',T.b.amber)}>
                      <Coins size={12}/> المستحقات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dm&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={cx('rounded-2xl p-6 max-w-2xl w-full shadow-2xl border',T.card)} style={{animation:'fadeIn .3s both'}}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className={cx('font-bold',T.text)}>المستحقات والبدلات المالية</h3>
                <p className={cx('text-xs mt-0.5',T.muted)}>العضو: <span className="text-teal-400 font-bold">{dm.name}</span></p>
              </div>
              <button onClick={()=>setDm(null)} className={cx('p-1.5 rounded-lg border',T.btn)}><X size={14}/></button>
            </div>
            <div className={cx('border rounded-xl overflow-hidden',T.div)}>
              <table className="w-full text-sm text-right">
                <thead className={cx('border-b',T.div)}>
                  <tr className={cx('text-xs',T.muted)}>
                    <th className="p-3">التاريخ</th><th className="p-3">البيان</th><th className="p-3">القيمة</th><th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {[{d:'01/03/2026',t:'بدل حضور جلسة مجلس إدارة',v:'500 ج.م',st:'تم الصرف',c:T.b.teal},
                    {d:'15/03/2026',t:'اشتراك مجاني رحلة شرم (إشراف)',v:'1,200 ج.م',st:'ميزة عينية',c:T.b.amber},
                    {d:'28/03/2026',t:'بدل انتقال — مؤتمر الإسكندرية',v:'800 ج.م',st:'قيد الاعتماد',c:T.b.sky},
                  ].map((r,i)=>(
                    <tr key={i} className={cx('border-b transition-colors',T.div,T.row)}>
                      <td className={cx('p-3 text-xs',T.muted)}>{r.d}</td>
                      <td className={cx('p-3 font-medium',T.text)}>{r.t}</td>
                      <td className={cx('p-3 font-bold',T.text)}>{r.v}</td>
                      <td className="p-3"><span className={cx('text-xs px-2 py-0.5 rounded-full border',r.c)}>{r.st}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={()=>{printVoucher({vType:'كشف مستحقات عضو مجلس إدارة',vNum:`BD-${dm.id}`,date:new Date().toLocaleDateString('ar-EG'),party:dm.name,amount:'2500',notes:`بدل حضور + بدل انتقال — ${dm.role}`,checkNum:null});}}
                className={cx('flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all',T.b.teal)}>
                <Printer size={12}/> طباعة الكشف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TREASURY TAB  (with full workflow + print + file upload)
══════════════════════════════════════════════════════════════ */
const TreasuryTab = ({userRole,showToast,prefilledEmployee,nextCheckNum,globalSearch}) => {
  const T = useT();
  const [tt,setTt]     = useState('deposit');
  const [wf,setWf]     = useState('draft');
  const [depO,setDepO] = useState(DEP_OPTS0);
  const [dep,setDep]   = useState(DEP_OPTS0[0]);
  const [aidCat,setAidCat] = useState('');
  const [aidRel,setAidRel] = useState('');
  const [aidQ,setAidQ]     = useState(prefilledEmployee?.jobId||'');
  const [selEmp,setSelEmp] = useState(prefilledEmployee||null);
  const [amt,setAmt]   = useState('');
  const [txD,setTxD]   = useState(new Date().toISOString().split('T')[0]);
  const [incD,setIncD] = useState('');
  const [notes,setNotes] = useState('');
  const [ck,setCk]     = useState(nextCheckNum);
  const [dErr,setDErr] = useState('');
  const [files,setFiles] = useState([]);

  const isAid = tt==='aid', isWit = tt!=='deposit', locked = wf==='posted';

  const checkDates = useCallback((i,t)=>{
    if(i&&t&&i>t){setDErr('تاريخ الواقعة لا يمكن أن يتجاوز تاريخ الحركة');return false;}
    setDErr('');return true;
  },[]);

  const searchEmp = useCallback(()=>{
    if(!aidQ.trim())return;
    const f=globalSearch(aidQ.trim());
    if(!f){showToast('الموظف غير موجود','warning');setSelEmp(null);return;}
    if(f.membershipStatus!=='عضو نشط'){showToast('العضو غير نشط — لا يستحق إعانة','error');setSelEmp(null);return;}
    setSelEmp(f);showToast(`تم تحديد: ${f.name}`);
  },[aidQ,globalSearch,showToast]);

  const advance = useCallback(()=>{
    if(!amt||+amt<=0){showToast('أدخل مبلغاً صحيحاً','warning');return;}
    if(isAid&&!selEmp){showToast('حدّد العضو المستحق للإعانة','warning');return;}
    if(isAid&&!aidCat){showToast('اختر تصنيف الإعانة','warning');return;}
    if(!checkDates(incD,txD)){showToast(dErr,'error');return;}
    const idx=WF_STEPS.indexOf(wf);if(idx>=WF_STEPS.length-1)return;
    const nxt=WF_STEPS[idx+1];
    if(['approved','posted'].includes(nxt)&&userRole!=='treasurer'){showToast('هذه الصلاحية لأمين الصندوق فقط','error');return;}
    setWf(nxt);
    const msgs={review:'تم رفع الطلب للمراجعة ✓',approved:'تم اعتماد الحركة ✓',posted:'تم الترحيل النهائي وقيد الدفتر ✓'};
    showToast(msgs[nxt],nxt==='posted'?'success':'info');
  },[amt,isAid,selEmp,aidCat,checkDates,incD,txD,dErr,wf,userRole,showToast]);

  const reset = ()=>{setTt('deposit');setWf('draft');setAidCat('');setAidRel('');setSelEmp(null);setAidQ('');setAmt('');setNotes('');setIncD('');setFiles([]);showToast('تم مسح النموذج لإدخال جديد','info');};

  const doPrint = ()=>{
    const typeMap={deposit:'سند إيداع',aid:'سند صرف إعانة',advance:'سند سلفة / عهدة نثرية'};
    printVoucher({
      vType:typeMap[tt], vNum:`${new Date().getFullYear()}-${ck}`,
      date:txD, party:isAid?selEmp?.name||'—':dep,
      amount:amt, notes, checkNum:isWit?ck:null,
      extraFields:isAid?[{label:'تصنيف الإعانة',value:aidCat||'—'},{label:'صلة القرابة',value:aidRel||'—'},{label:'تاريخ الواقعة',value:incD||'—'}]:[]
    });
  };

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className={cx('text-xl font-bold flex items-center gap-2',T.text)}><Landmark size={18} className="text-teal-400"/> حركات الخزينة</h2>
          <p className={cx('text-sm mt-0.5',T.muted)}>إنشاء ومراجعة سندات الصرف والإيداع</p>
        </div>
        <button onClick={reset} className={cx('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all',T.btn)}><RefreshCw size={12}/> نموذج جديد</button>
      </div>

      {/* Workflow stepper */}
      <div className={cx('p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',T.card)}>
        <WFStepper status={wf}/>
        <div className="flex items-center gap-3 flex-wrap">
          <WFBadge status={wf}/>
          {wf!=='draft'&&(
            <div className="flex gap-2 flex-wrap">
              <button onClick={doPrint} className={cx('flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all',T.b.teal)}>
                <Printer size={12}/> طباعة السند
              </button>
              {isAid&&selEmp&&(
                <button onClick={()=>printAidRequest({emp:selEmp,aidCat,aidRel,incDate:incD,amount:amt,date:txD,notes})}
                  className={cx('flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all',T.b.sky)}>
                  <Printer size={12}/> إقرار الإعانة
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={cx('p-6 rounded-2xl border space-y-5',T.card)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>نوع الحركة المستندية</label>
            <select value={tt} onChange={e=>{setTt(e.target.value);setWf('draft');}} disabled={locked}
              className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition-all focus:ring-2',T.sel,locked&&'opacity-50')}>
              <option value="deposit">سند إيداع (دائن)</option>
              <option value="aid">سند صرف إعانة (مدين)</option>
              <option value="advance">سند سلفة / عهدة نثرية (مدين)</option>
            </select>
          </div>
          {isWit&&(
            <div className="space-y-1.5">
              <label className={cx('text-xs font-bold uppercase tracking-widest block text-rose-400')}>رقم الشيك</label>
              <input type="number" value={ck} onChange={e=>setCk(e.target.value)} disabled={locked}
                className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2',T.dark?'bg-rose-500/5 border-rose-500/30 text-rose-300 focus:border-rose-400 focus:ring-rose-400/20':'bg-rose-50 border-rose-300 text-rose-700 focus:border-rose-500 focus:ring-rose-500/20',locked&&'opacity-50')}/>
            </div>
          )}
          <ADP label="تاريخ الحركة" value={txD} onChange={v=>{setTxD(v);checkDates(incD,v);}} readOnly={locked}/>
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>المبلغ الإجمالي (ج.م)</label>
            <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="0.00" disabled={locked}
              className={cx('w-full px-4 py-2.5 rounded-xl border text-xl font-bold outline-none focus:ring-2 transition-all',T.inp,locked&&'opacity-50')}/>
          </div>
        </div>

        {!isWit&&(
          <SWA label="جهة الإيداع" value={dep} onChange={e=>setDep(e.target.value)} options={depO} setOptions={setDepO} disabled={locked}/>
        )}

        {isAid&&(
          <div className={cx('p-4 rounded-xl border space-y-4',T.dark?'bg-sky-500/5 border-sky-500/20':'bg-sky-50 border-sky-200')}>
            <p className={cx('text-xs font-bold uppercase tracking-widest',T.dark?'text-sky-400':'text-sky-700')}>تفاصيل الإعانة</p>
            <div className="flex gap-2">
              <input value={aidQ} onChange={e=>setAidQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchEmp()}
                placeholder="ابحث برقم وظيفي أو الاسم للتحديد…" disabled={locked}
                className={cx('flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2',T.inp,locked&&'opacity-50')}/>
              <button onClick={searchEmp} disabled={locked} className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40">بحث</button>
            </div>
            {selEmp&&<p className="text-sm font-bold text-teal-500 flex items-center gap-1.5"><CheckCircle2 size={14}/> {selEmp.name} — رقم وظيفي: {selEmp.jobId}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SWA label="تصنيف الإعانة" value={aidCat} onChange={e=>{setAidCat(e.target.value);setAidRel('');}}
                options={Object.keys(AID_RELS)} setOptions={()=>{}} showAdd={false} disabled={locked}/>
              <div className="space-y-1.5">
                <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>صلة القرابة / طبيعة الحالة</label>
                <select value={aidRel} onChange={e=>setAidRel(e.target.value)} disabled={!aidCat||locked}
                  className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer focus:ring-2',T.sel,(!aidCat||locked)&&'opacity-40')}>
                  <option value="">— اختر —</option>
                  {(AID_RELS[aidCat]||[]).map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="relative">
                <ADP label="تاريخ الواقعة" value={incD} onChange={v=>{setIncD(v);checkDates(v,txD);}} maxVal={txD} readOnly={locked}/>
                {dErr&&<p className="text-xs text-rose-400 mt-0.5">{dErr}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>بيان الحركة التفصيلي</label>
          <textarea rows="2" value={notes} onChange={e=>setNotes(e.target.value)} disabled={locked}
            placeholder="مثال: صرف إعانة زواج للعضو بناءً على طلبه المقدّم بتاريخ…"
            className={cx('w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none focus:ring-2',T.inp,locked&&'opacity-50')}/>
        </div>

        <FileUpload label="المستندات والمرفقات (صور الشيكات، المستندات الداعمة…)" files={files} setFiles={setFiles} maxFiles={6}/>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {!locked&&(
          <button onClick={advance}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20">
            <ArrowRight size={14}/>
            {wf==='draft'?'رفع للمراجعة':wf==='review'?'اعتماد الحركة':'ترحيل نهائي للدفتر'}
          </button>
        )}
        {locked&&(
          <span className={cx('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border',T.b.green)}>
            <Lock size={13}/> مُرحَّل — لا يقبل التعديل
          </span>
        )}
        {!locked&&(
          <button onClick={()=>showToast('تم حفظ المسودة','info')}
            className={cx('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all',T.btn)}>
            <FileText size={13}/> حفظ مسودة
          </button>
        )}
        <button onClick={doPrint}
          className={cx('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all',T.b.teal)}>
          <Printer size={13}/> معاينة وطباعة
        </button>
        {isAid&&selEmp&&(
          <button onClick={()=>printAidRequest({emp:selEmp,aidCat,aidRel,incDate:incD,amount:amt,date:txD,notes})}
            className={cx('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all',T.b.sky)}>
            <Printer size={13}/> طباعة طلب الإعانة
          </button>
        )}
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════
   SETTLEMENT TAB
══════════════════════════════════════════════════════════════ */
const SettlementTab = ({showToast}) => {
  const T = useT();
  const [expenses,setExpenses] = useState([]);
  const [expDate,setExpDate]   = useState(new Date().toISOString().split('T')[0]);
  const [expAmt,setExpAmt]     = useState('');
  const [expCat,setExpCat]     = useState(CAT0[0]);
  const [catO,setCatO]         = useState(CAT0);
  const [files,setFiles]       = useState([]);
  const ADVANCE_DATE = '2026-03-01', ADVANCE = 5000, CHECK = '10254';
  const spent = useMemo(()=>expenses.reduce((s,e)=>s+(+e.amount||0),0),[expenses]);
  const remaining = ADVANCE - spent;

  const add = ()=>{
    if(!expAmt||+expAmt<=0){showToast('أدخل مبلغاً صحيحاً','error');return;}
    if(expDate<ADVANCE_DATE){showToast('التاريخ قبل تاريخ فتح العهدة','error');return;}
    const today=new Date().toISOString().split('T')[0];
    if(expDate>today){showToast('التاريخ في المستقبل!','warning');return;}
    if(spent+(+expAmt)>ADVANCE){showToast(`يتجاوز رصيد العهدة — المتبقي: ${remaining} ج.م`,'error');return;}
    setExpenses(p=>[...p,{id:Date.now(),date:expDate,amount:expAmt,category:expCat,files:[...files]}]);
    setExpAmt('');setFiles([]);
    showToast('تمت إضافة الفاتورة للكشف');
  };

  const doPrint = ()=>printSettlement({expenses,advanceAmount:ADVANCE,advanceDate:ADVANCE_DATE,checkNum:CHECK});

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      <h2 className={cx('text-xl font-bold flex items-center gap-2',T.text)}><ReceiptText size={18} className="text-amber-400"/> تسويات السلف والعهد النثرية</h2>

      <div className={cx('p-5 rounded-2xl border space-y-4',T.card)}>
        <div className="space-y-1.5">
          <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>العهدة المفتوحة (اختر للتسوية)</label>
          <select className={cx('w-full md:w-2/3 px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer',T.sel)}>
            <option>شيك رقم {CHECK} — عهدة بوفيه (5,000 ج.م) — {ADVANCE_DATE}</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{l:'إجمالي العهدة',v:ADVANCE,c:T.text},{l:'إجمالي المنصرف',v:spent,c:'text-rose-400'},{l:'المتبقي للرد',v:remaining,c:'text-teal-400'}].map((it,i)=>(
            <div key={i} className={cx('p-4 rounded-xl border text-center',T.dark?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-200')}>
              <p className={cx('text-[10px] font-semibold mb-1',T.muted)}>{it.l}</p>
              <p className={cx('text-lg font-bold',it.c)}>{Number(it.v).toLocaleString()} ج.م</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={cx('p-5 rounded-2xl border space-y-4',T.card)}>
          <h3 className={cx('font-bold text-sm',T.text)}>إضافة منصرف جديد</h3>
          <ADP label="تاريخ الفاتورة" value={expDate} onChange={setExpDate} minVal={ADVANCE_DATE}/>
          <Field label="المبلغ (ج.م)" type="number" value={expAmt} onChange={e=>setExpAmt(e.target.value)} placeholder="0.00"/>
          <SWA label="بند الصرف" value={expCat} onChange={e=>setExpCat(e.target.value)} options={catO} setOptions={setCatO}/>
          <FileUpload label="صورة الفاتورة / الإيصال" files={files} setFiles={setFiles} accept="image/*,.pdf" maxFiles={3}/>
          <button onClick={add} className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all">
            <Plus size={14}/> إضافة الفاتورة
          </button>
        </div>

        <div className={cx('md:col-span-2 rounded-2xl border overflow-hidden',T.card)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className={cx('border-b',T.div)}>
                <tr className={cx('text-xs uppercase tracking-wide',T.muted)}>
                  <th className="p-4">التاريخ</th><th className="p-4">البند</th><th className="p-4">المبلغ</th><th className="p-4">مرفقات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length===0?(
                  <tr><td colSpan="4" className={cx('p-8 text-center',T.muted)}>لا توجد منصرفات مضافة بعد</td></tr>
                ):expenses.map((e,i)=>(
                  <tr key={i} className={cx('border-b transition-colors',T.div,T.row)}>
                    <td className={cx('p-4 text-xs',T.muted)}>{e.date}</td>
                    <td className={cx('p-4 font-medium',T.text)}>{e.category}</td>
                    <td className="p-4 font-bold text-rose-400">{Number(e.amount).toLocaleString()} ج.م</td>
                    <td className={cx('p-4 text-xs',T.muted)}>{(e.files||[]).length>0?`${e.files.length} ملف`:'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expenses.length>0&&(
            <div className={cx('p-4 border-t flex gap-3',T.div)}>
              <button onClick={()=>showToast('تم إغلاق العهدة وترحيل المتبقي للخزينة','success')}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
                <CheckCircle2 size={14}/> إغلاق العهدة واعتماد التسوية
              </button>
              <button onClick={doPrint} className={cx('flex items-center gap-2 px-4 rounded-xl text-sm font-bold border transition-all',T.b.teal)}>
                <Printer size={13}/> طباعة الكشف
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   EVENTS TAB
══════════════════════════════════════════════════════════════ */
const EventsTab = ({showToast,boardMembers,eventTypes,setEventTypes,globalSearch}) => {
  const T = useT();
  const [selSups,setSelSups]   = useState([]);
  const [parts,setParts]       = useState([]);
  const [pSearch,setPSearch]   = useState('');
  const [fee,setFee]           = useState('');
  const [supFeeO,setSupFeeO]   = useState(['اشتراك مجاني (معفى)','خصم 50%','نفس قيمة العضو']);
  const [supFee,setSupFee]     = useState('اشتراك مجاني (معفى)');
  const [ev,setEv] = useState({title:'',type:'',startDate:'',endDate:'',bookingStart:'',bookingEnd:'',capacity:''});
  const [dErrs,setDErrs] = useState({});

  const valDates = useCallback((data)=>{
    const e={};
    if(data.startDate&&data.endDate&&data.endDate<data.startDate) e.endDate='تاريخ الانتهاء قبل البداية';
    if(data.bookingStart&&data.startDate&&data.bookingStart>data.startDate) e.bookingStart='فتح الحجز بعد بدء الفعالية';
    if(data.bookingEnd&&data.bookingStart&&data.bookingEnd<data.bookingStart) e.bookingEnd='غلق الحجز قبل فتحه';
    if(data.bookingEnd&&data.startDate&&data.bookingEnd>data.startDate) e.bookingEnd='غلق الحجز يجب أن يكون قبل بداية الفعالية';
    setDErrs(e);return!Object.keys(e).length;
  },[]);

  const setF = useCallback((k,v)=>{const u={...ev,[k]:v};setEv(u);valDates(u);},[ev,valDates]);

  const now = new Date().toISOString().split('T')[0];
  const bookOpen   = ev.bookingStart&&ev.bookingEnd&&now>=ev.bookingStart&&now<=ev.bookingEnd;
  const bookClosed = ev.bookingEnd&&now>ev.bookingEnd;
  const isFull     = ev.capacity&&parts.length>=parseInt(ev.capacity);

  const addPart = useCallback(()=>{
    if(isFull){showToast('اكتمل العدد المحدد — التسجيل مغلق','error');return;}
    if(bookClosed){showToast('انتهت فترة الحجز','error');return;}
    if(!pSearch.trim())return;
    const f=globalSearch(pSearch.trim());
    if(f){
      if(f.membershipStatus!=='عضو نشط'){showToast(`${f.name} — عضو غير نشط`,'error');return;}
      if(parts.some(p=>p.id===f.jobId)){showToast(`${f.name} مسجّل مسبقاً`,'warning');return;}
      setParts(p=>[...p,{id:f.jobId,name:f.name}]);
      showToast(`تم تسجيل ${f.name}`);
    } else {
      setParts(p=>[...p,{id:Date.now(),name:pSearch.trim()}]);
    }
    setPSearch('');
  },[isFull,bookClosed,pSearch,globalSearch,parts,showToast]);

  const totalRev = parts.length*(+fee||0);

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      <h2 className={cx('text-xl font-bold flex items-center gap-2',T.text)}><PartyPopper size={18} className="text-purple-400"/> إدارة الفعاليات والمبادرات</h2>

      {ev.bookingStart&&(
        <div className={cx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border',bookOpen?T.b.teal:bookClosed?T.b.rose:T.b.amber)}>
          <div className={cx('w-2 h-2 rounded-full shrink-0',bookOpen?'bg-teal-400 animate-pulse':bookClosed?'bg-rose-400':'bg-amber-400')}/>
          {bookOpen?'الحجز مفتوح الآن':bookClosed?'انتهت فترة الحجز':'لم يُفتح الحجز بعد'}
          {isFull&&<span className="text-rose-400 mr-3">• اكتمل العدد</span>}
        </div>
      )}

      <div className={cx('p-6 rounded-2xl border space-y-5',T.card)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SWA label="نوع الفعالية" value={ev.type} onChange={e=>setF('type',e.target.value)} options={eventTypes} setOptions={setEventTypes}/>
          <Field label="عنوان الفعالية / الوصف" value={ev.title} onChange={e=>setF('title',e.target.value)} placeholder="مثال: رحلة شرم الشيخ السنوية…"/>
        </div>

        <div className={cx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border',T.sxn)}>
          {[{k:'startDate',l:'بدء الفعالية'},{k:'endDate',l:'انتهاء الفعالية'},{k:'bookingStart',l:'فتح الحجز'},{k:'bookingEnd',l:'غلق الحجز'}].map(({k,l})=>(
            <div key={k} className="relative">
              <ADP label={l} value={ev[k]} onChange={v=>setF(k,v)}/>
              {dErrs[k]&&<p className="text-xs text-rose-400 mt-0.5">{dErrs[k]}</p>}
            </div>
          ))}
        </div>

        <div className={cx('grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border',T.dark?'bg-amber-500/5 border-amber-500/20':'bg-amber-50 border-amber-200')}>
          <Field label="الطاقة الاستيعابية (عدد)" value={ev.capacity} onChange={e=>setF('capacity',e.target.value)} type="number" placeholder="الحد الأقصى…"/>
          <Field label="رسوم العضو العادي (ج.م)"  value={fee} onChange={e=>setFee(e.target.value)} type="number" placeholder="0.00"/>
          <SWA label="لائحة رسوم المشرفين" value={supFee} onChange={e=>setSupFee(e.target.value)} options={supFeeO} setOptions={setSupFeeO}/>
        </div>

        <div className="space-y-2">
          <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>هيئة الإشراف (اختيار متعدد)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {boardMembers.map(m=>(
              <label key={m.id} onClick={()=>setSelSups(p=>p.includes(m.id)?p.filter(x=>x!==m.id):[...p,m.id])}
                className={cx('flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all',
                  selSups.includes(m.id)?(T.dark?'bg-teal-500/10 border-teal-400/40':'bg-teal-50 border-teal-300'):
                  (T.dark?'bg-slate-800/30 border-slate-700 hover:border-slate-600':'bg-slate-50 border-slate-200 hover:border-slate-300'))}>
                <div className={cx('w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all',
                  selSups.includes(m.id)?'bg-teal-500 border-teal-500':T.dark?'border-slate-600':'border-slate-300')}>
                  {selSups.includes(m.id)&&<CheckSquare size={10} className="text-white"/>}
                </div>
                <span className={cx('text-sm font-medium',T.text)}>{m.name} <span className={cx('text-xs',T.muted)}>({m.role})</span></span>
              </label>
            ))}
          </div>
        </div>

        <div className={cx('p-4 rounded-xl border transition-all',(isFull||bookClosed)?(T.dark?'border-rose-500/30 bg-rose-500/5':'border-rose-300 bg-rose-50'):T.sxn)}>
          {(isFull||bookClosed)&&<p className="text-xs font-bold text-rose-400 flex items-center gap-1 mb-3"><AlertTriangle size={12}/>{isFull?'اكتمل العدد — التسجيل مغلق':'انتهت فترة الحجز'}</p>}
          <label className={cx('text-xs font-bold uppercase tracking-widest block mb-2',T.muted)}>تسجيل المشتركين (بحث ذكي)</label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className={cx('absolute right-3 top-3 shrink-0',T.muted)} size={13}/>
              <input value={pSearch} onChange={e=>setPSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addPart()}
                placeholder="ابحث برقم وظيفي أو الاسم واضغط Enter…" disabled={isFull||bookClosed}
                className={cx('w-full pr-9 pl-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all',T.inp,(isFull||bookClosed)&&'opacity-40')}/>
            </div>
            <button onClick={addPart} disabled={isFull||bookClosed}
              className="px-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-sm transition-all disabled:opacity-40">إضافة</button>
          </div>
          {parts.length>0&&(
            <div className="flex flex-wrap gap-2 mb-3">
              {parts.map(p=>(
                <div key={p.id} className={cx('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border',T.dark?'bg-slate-700 border-slate-600':'bg-white border-slate-200 shadow-sm')}>
                  <UsersRound size={11} className="text-teal-400 shrink-0"/>
                  <span className={cx('font-semibold',T.text)}>{p.name}</span>
                  <button onClick={()=>setParts(p=>p.filter(x=>x.id!==p.id))} className={cx('hover:text-rose-400 transition-colors',T.muted)}><X size={11}/></button>
                </div>
              ))}
            </div>
          )}
          <div className={cx('flex justify-between text-xs pt-2 border-t',T.div)}>
            <span className={T.muted}>المسجّلون: <span className={cx('font-bold',isFull?'text-rose-400':'text-teal-400')}>{parts.length}</span>{ev.capacity?` / ${ev.capacity}`:''}</span>
            <span className="text-amber-400 font-bold">المتحصلات المتوقعة: {totalRev.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={()=>{if(Object.keys(dErrs).length){showToast('صحّح أخطاء التواريخ أولاً','error');return;}if(!ev.title){showToast('أدخل عنوان الفعالية','warning');return;}showToast('تم اعتماد الفعالية وإرسال التعميم للأعضاء');}}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20">
          <PartyPopper size={14}/> اعتماد وإطلاق الفعالية
        </button>
        <button onClick={()=>{if(!ev.title){showToast('أدخل عنوان الفعالية','warning');return;}printVoucher({vType:`كشف مشتركي فعالية: ${ev.title}`,vNum:`EV-${Date.now()}`,date:ev.startDate||'—',party:`${parts.length} مشترك`,amount:String(totalRev),notes:`الفعالية: ${ev.title} | من: ${ev.startDate||'—'} | تنتهي: ${ev.endDate||'—'}`,checkNum:null});}}
          className={cx('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all',T.b.teal)}>
          <Printer size={13}/> طباعة كشف المشتركين
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   REPORTS TAB  (with real data table + filters + print)
══════════════════════════════════════════════════════════════ */
const ReportsTab = ({showToast}) => {
  const T = useT();
  const [rType,setRType]   = useState('');
  const [rTypeO,setRTypeO] = useState(RPT_TYPES0);
  const [from,setFrom]     = useState('');
  const [to,setTo]         = useState('');
  const [dErr,setDErr]     = useState('');
  const [flt,setFlt]       = useState('');
  const [show,setShow]     = useState(false);

  const chkRange = useCallback((f,t)=>{
    if(f&&t&&t<f){setDErr('تاريخ النهاية قبل البداية');return false;}
    setDErr('');return true;
  },[]);

  const filtered = useMemo(()=>SAMPLE_TXN.filter(r=>{
    if(from&&r.date<from)return false;
    if(to&&r.date>to)return false;
    if(flt&&!r.type.includes(flt)&&!r.party.includes(flt)&&!r.status.includes(flt))return false;
    return true;
  }),[from,to,flt]);

  const totalIn  = useMemo(()=>filtered.filter(r=>r.type==='سند إيداع').reduce((s,r)=>s+r.amount,0),[filtered]);
  const totalOut = useMemo(()=>filtered.filter(r=>r.type!=='سند إيداع').reduce((s,r)=>s+r.amount,0),[filtered]);

  const load = ()=>{if(!chkRange(from,to)){showToast('صحّح نطاق التاريخ','error');return;}setShow(true);showToast('تم تحميل البيانات');};
  const doPrint = ()=>{if(!chkRange(from,to)){showToast('صحّح النطاق','error');return;}printReport({records:filtered,from,to,title:rType||'التقرير المالي الشامل'});};

  return (
    <div className="space-y-5" style={{animation:'fadeIn .35s both'}}>
      <h2 className={cx('text-xl font-bold flex items-center gap-2',T.text)}><LineChart size={18} className="text-sky-400"/> التقارير الذكية</h2>

      <div className={cx('p-6 rounded-2xl border space-y-4 max-w-3xl',T.card)}>
        <SWA label="نوع التقرير" value={rType} onChange={e=>setRType(e.target.value)} options={rTypeO} setOptions={setRTypeO}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative"><ADP label="من تاريخ" value={from} onChange={v=>{setFrom(v);chkRange(v,to);}} maxVal={to||undefined}/></div>
          <div className="relative">
            <ADP label="إلى تاريخ" value={to} onChange={v=>{setTo(v);chkRange(from,v);}} minVal={from||undefined}/>
            {dErr&&<p className="text-xs text-rose-400 mt-0.5">{dErr}</p>}
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={load} className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl text-sm transition-all">
            <ZoomIn size={15}/> عرض البيانات
          </button>
          <button onClick={doPrint} className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
            <Printer size={15}/> طباعة / PDF
          </button>
          <button onClick={()=>{if(!chkRange(from,to)){showToast('صحّح النطاق','error');return;}showToast('جاري تجهيز ملف Excel…','success');}}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all">
            <FileDown size={15}/> تصدير Excel
          </button>
        </div>
      </div>

      {show&&(
        <div className="space-y-4" style={{animation:'fadeIn .3s both'}}>
          <div className="grid grid-cols-3 gap-4">
            {[{l:'إجمالي الإيرادات',v:totalIn,c:'text-teal-400'},{l:'إجمالي المصروفات',v:totalOut,c:'text-rose-400'},{l:'الصافي',v:totalIn-totalOut,c:'text-sky-400'}].map((it,i)=>(
              <div key={i} className={cx('p-4 rounded-xl border text-center',T.card)}>
                <p className={cx('text-xs mb-1',T.muted)}>{it.l}</p>
                <p className={cx('text-lg font-bold',it.c)}>{Number(it.v).toLocaleString()} ج.م</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Filter className={cx('absolute right-3 top-3 shrink-0',T.muted)} size={13}/>
              <input value={flt} onChange={e=>setFlt(e.target.value)} placeholder="بحث في النتائج (نوع، جهة، حالة…)"
                className={cx('w-full pr-9 pl-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all',T.inp)}/>
            </div>
            <button onClick={()=>setFlt('')} className={cx('px-3 rounded-xl border transition-all',T.btn)}><X size={14}/></button>
          </div>
          <div className={cx('rounded-2xl border overflow-hidden',T.card)}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className={cx('border-b',T.div)}>
                  <tr className={cx('text-xs uppercase tracking-wide',T.muted)}>
                    <th className="p-3">التاريخ</th><th className="p-3">النوع</th><th className="p-3">الجهة</th>
                    <th className="p-3">المبلغ</th><th className="p-3">الشيك</th><th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0?(
                    <tr><td colSpan="6" className={cx('p-8 text-center',T.muted)}>لا توجد سجلات مطابقة</td></tr>
                  ):filtered.map((r,i)=>(
                    <tr key={i} className={cx('border-b transition-colors',T.div,T.row)}>
                      <td className={cx('p-3 text-xs',T.muted)}>{r.date}</td>
                      <td className={cx('p-3 font-semibold',T.text)}>{r.type}</td>
                      <td className={cx('p-3',T.sub)}>{r.party}</td>
                      <td className={cx('p-3 font-bold',r.type==='سند إيداع'?'text-teal-400':'text-rose-400')}>{Number(r.amount).toLocaleString()} ج.م</td>
                      <td className={cx('p-3 text-xs',T.muted)}>{r.check}</td>
                      <td className="p-3"><WFBadge status={r.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className={cx('text-xs',T.muted)}>إجمالي السجلات المعروضة: <strong>{filtered.length}</strong> من أصل {SAMPLE_TXN.length}</p>
        </div>
      )}
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */
const LoginPage = ({onLogin}) => {
  const T = useT();
  const {dark,toggle} = useTh();
  // ⚠️ Controlled inputs — this is what was causing the login username bug
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole]         = useState('treasurer');
  const [err,setErr]           = useState('');

  const submit = useCallback(()=>{
    if(!username.trim()){setErr('يرجى إدخال اسم المستخدم');return;}
    if(!password){setErr('يرجى إدخال كلمة المرور');return;}
    setErr('');
    onLogin({name:username.trim(),role});
  },[username,password,role,onLogin]);

  const quickLogin = useCallback((name,r)=>{onLogin({name,role:r});},[onLogin]);

  return (
    <div className={cx('min-h-screen flex items-center justify-center p-4 relative',T.page)}>
      {/* Theme toggle */}
      <button onClick={toggle}
        className={cx('absolute top-4 left-4 p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all',T.btn)}>
        {dark?<Sun size={14}/>:<Moon size={14}/>}
        <span className="hidden sm:inline">{dark?'وضع نهاري':'وضع ليلي'}</span>
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={cx('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border',dark?'bg-teal-500/10 border-teal-500/30':'bg-teal-50 border-teal-200')}>
            <Building2 size={28} className="text-teal-500"/>
          </div>
          <h1 className={cx('text-2xl font-bold',T.text)}>النقابة العامة</h1>
          <p className={cx('text-sm mt-1',T.muted)}>النظام المالي والإداري الموحّد</p>
        </div>

        <div className={cx('rounded-2xl p-6 border space-y-4',T.card)}>
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={e=>setUsername(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              placeholder="أدخل اسمك هنا…"
              autoComplete="username"
              className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all',T.inp)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all',T.inp)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={cx('text-xs font-bold uppercase tracking-widest block',T.muted)}>الصلاحية</label>
            <select value={role} onChange={e=>setRole(e.target.value)}
              className={cx('w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer transition-all',T.sel)}>
              <option value="treasurer">أمين الصندوق (مدير النظام — صلاحيات كاملة)</option>
              <option value="dataEntry">مدخل بيانات (صلاحيات محدودة)</option>
            </select>
          </div>
          {err&&<p className="text-xs text-rose-400 font-semibold">{err}</p>}
          <button onClick={submit}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 mt-2">
            دخول آمن للنظام
          </button>

          <div className={cx('border-t pt-4 mt-2 space-y-2',T.div)}>
            <p className={cx('text-xs text-center mb-3 font-semibold',T.muted)}>⚡ دخول سريع للاختبار</p>
            <button onClick={()=>quickLogin('المدير العام — أمين الصندوق','treasurer')}
              className={cx('w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2',dark?'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20':'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100')}>
              <Shield size={13}/> دخول كأمين الصندوق (أدمن — صلاحيات كاملة)
            </button>
            <button onClick={()=>quickLogin('مدخل البيانات','dataEntry')}
              className={cx('w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2',dark?'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20':'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100')}>
              <UserCircle size={13}/> دخول كمدخل بيانات (صلاحيات محدودة)
            </button>
          </div>
        </div>
        <p className={cx('text-center text-xs mt-4',T.muted)}>نظام إداري خاص — النقابة العامة بمحافظة الدقهلية</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [dark,setDark]   = useState(true);
  const [user,setUser]   = useState(null);
  const [tab,setTab]     = useState('dashboard');
  const [toast,setToast] = useState(null);
  const [prefilled,setPrefilled] = useState(null);
  const [navOpen,setNavOpen]     = useState(false);

  const [employeesDB,setEmployeesDB] = useState([
    {jobId:'1001',name:'أحمد محمد العراقي',  nationalId:'29001011234567',membershipStatus:'عضو نشط',phone:'01001234567',department:'إدارة هندسية',jobTitle:'مهندس أول'},
    {jobId:'1002',name:'سارة خالد محمود',    nationalId:'29205151234568',membershipStatus:'عضو نشط',phone:'01101234568',department:'خدمة عملاء'},
    {jobId:'1003',name:'مصطفى كمال الدين',   nationalId:'28509121234569',membershipStatus:'مستقلة'},
    {jobId:'1004',name:'فاطمة حسن إبراهيم',  nationalId:'30102051234560',membershipStatus:'عضو نشط',phone:'01201234560',department:'حسابات وموارد بشرية'},
  ]);
  const [boardMembers,setBoardMembers] = useState([
    {id:1,name:'أ. أحمد سعيد',    role:'رئيس النقابة',status:'نشط',phone:'01000000001',joined:'2015-05-12'},
    {id:2,name:'م. مصطفى محمود',  role:'عضو مجلس',   status:'نشط',phone:'01100000002',joined:'2018-02-20'},
    {id:3,name:'أ. محمود العراقي', role:'أمين الصندوق',status:'نشط',phone:'01500000003',joined:'2012-08-15'},
  ]);
  const [eventTypes,setEventTypes] = useState(EV_TYPES0);
  const activeEvents = useMemo(()=>[{title:'رحلة شرم الشيخ السنوية',fee:1500},{title:'مبادرة دعم الكتب المدرسية',fee:0}],[]);

  const showToast = useCallback((message,type='success')=>setToast({message,type}),[]);
  const globalSearch = useCallback((q)=>{
    if(!q)return null;
    const lq=q.toLowerCase();
    return employeesDB.find(e=>e.jobId===q||e.nationalId===q||e.name.includes(q)||e.name.toLowerCase().includes(lq));
  },[employeesDB]);
  const saveEmployee = useCallback((data)=>{
    if(!data.jobId)return;
    setEmployeesDB(prev=>prev.find(e=>e.jobId===data.jobId)?prev.map(e=>e.jobId===data.jobId?data:e):[...prev,data]);
  },[]);

  const TABS = [
    {id:'dashboard', label:'الرئيسية',     icon:LayoutDashboard},
    {id:'employees', label:'ملف العضو',    icon:Users},
    {id:'board',     label:'مجلس الإدارة', icon:ShieldCheck},
    {id:'treasury',  label:'الخزينة',      icon:Landmark},
    {id:'settlement',label:'التسويات',     icon:ReceiptText},
    {id:'events',    label:'الفعاليات',    icon:PartyPopper},
    {id:'reports',   label:'التقارير',     icon:LineChart},
  ];

  const themeCtxVal = useMemo(()=>({dark,toggle:()=>setDark(d=>!d)}),[dark]);

  /* CSS-in-JS for animations and global resets */
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    *, *::before, *::after { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes toast  { from{opacity:0;transform:translate(-50%,-14px)} to{opacity:1;transform:translate(-50%,0)} }
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #475569; border-radius: 99px; }
    select option { background: #1e293b; color: #f1f5f9; }
  `;

  const T = (() => {
    /* inline small theme hook for App level (sidebar/header) */
    const d = dark;
    return {
      dark: d,
      page:  d?'bg-[#0c1220] text-slate-100':'bg-slate-100 text-slate-900',
      card:  d?'bg-slate-800/70 border-slate-700/80':'bg-white border-slate-200 shadow-sm',
      hdr:   d?'bg-slate-900/90 border-slate-700/80 backdrop-blur-md':'bg-white/95 border-slate-200 backdrop-blur-md',
      nav:   d?'bg-slate-900/95 border-slate-700/80':'bg-white border-slate-200',
      btn:   d?'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600':'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200',
      text:  d?'text-slate-100':'text-slate-900',
      sub:   d?'text-slate-400':'text-slate-600',
      muted: d?'text-slate-500':'text-slate-500',
      div:   d?'border-slate-700/80':'border-slate-200',
      row:   d?'hover:bg-slate-700/30':'hover:bg-slate-50/80',
      b: { teal: d?'bg-teal-500/10 text-teal-400 border-teal-400/30':'bg-teal-50 text-teal-700 border-teal-300' },
    };
  })();

  if(!user) return (
    <ThemeCtx.Provider value={themeCtxVal}>
      <style>{CSS}</style>
      <LoginPage onLogin={setUser}/>
    </ThemeCtx.Provider>
  );

  const goTab = useCallback((id)=>{setTab(id);setNavOpen(false);},[]);

  return (
    <ThemeCtx.Provider value={themeCtxVal}>
      <style>{CSS}</style>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── HEADER ── */}
      <header className={cx('fixed top-0 w-full h-14 border-b z-40 flex items-center justify-between px-4 md:px-6',T.hdr,T.div)}>
        <div className="flex items-center gap-3">
          <button className={cx('lg:hidden p-1.5 rounded-lg border transition-all',T.btn)} onClick={()=>setNavOpen(o=>!o)} aria-label="القائمة">
            <LayoutDashboard size={16}/>
          </button>
          <div className={cx('w-7 h-7 rounded-lg flex items-center justify-center border shrink-0',dark?'bg-teal-500/10 border-teal-500/30':'bg-teal-50 border-teal-200')}>
            <Building2 size={15} className="text-teal-500"/>
          </div>
          <span className={cx('font-bold text-sm hidden sm:block',T.text)}>النقابة العامة — النظام المالي</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={()=>setDark(d=>!d)} title={dark?'وضع نهاري':'وضع ليلي'}
            className={cx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all',T.btn)}>
            {dark?<Sun size={13}/>:<Moon size={13}/>}
            <span className="hidden sm:inline">{dark?'نهاري':'ليلي'}</span>
          </button>
          {/* Notification */}
          <button onClick={()=>showToast('لا توجد تنبيهات جديدة','info')}
            className={cx('relative p-2 rounded-lg border transition-all',T.btn)}>
            <Bell size={15}/>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"/>
          </button>
          {/* User */}
          <div className={cx('flex items-center gap-2 px-3 py-1.5 rounded-lg border',T.btn)}>
            <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <span className={cx('text-sm font-semibold hidden md:block',T.text)}>{user.name}</span>
          </div>
          <button onClick={()=>{setUser(null);setTab('dashboard');}}
            className={cx('p-2 rounded-lg border hover:text-rose-400 hover:border-rose-400/40 transition-all',T.btn)} title="تسجيل الخروج">
            <LogOut size={15}/>
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      {navOpen&&<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={()=>setNavOpen(false)}/>}

      <div className="flex mt-14 min-h-[calc(100vh-56px)]" dir="rtl">
        {/* ── SIDEBAR ── */}
        <nav className={cx(
          'fixed top-14 bottom-0 right-0 w-52 z-30 flex flex-col p-3 gap-0.5 border-l transition-transform duration-300 overflow-y-auto',
          T.nav, T.div,
          navOpen?'translate-x-0':'translate-x-full',
          'lg:translate-x-0 lg:static lg:h-[calc(100vh-56px)] lg:sticky lg:top-14'
        )}>
          <p className={cx('text-[10px] font-bold uppercase tracking-widest px-3 py-2',T.muted)}>التنقل السريع</p>
          {TABS.map(({id,label,icon:Icon})=>{
            const active=tab===id;
            return (
              <button key={id} onClick={()=>goTab(id)}
                className={cx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-right',
                  active?(dark?'bg-teal-500/10 text-teal-400 border border-teal-500/20':'bg-teal-50 text-teal-700 border border-teal-200'):
                  cx(T.btn,'border border-transparent'))}>
                <Icon size={16} className="shrink-0"/>
                <span>{label}</span>
                {active&&<ChevronLeft size={12} className="mr-auto opacity-50"/>}
              </button>
            );
          })}
          <div className={cx('mt-auto pt-3 border-t',T.div)}>
            <div className={cx('px-3 py-2 rounded-xl text-xs font-semibold border',T.btn)}>
              {user.role==='treasurer'?'🔑 أمين الصندوق':'✏️ مدخل بيانات'}
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main className={cx('flex-1 p-4 md:p-6 overflow-y-auto',T.page)}>
          <div className="max-w-5xl mx-auto">
            {tab==='dashboard'   && <DashboardTab   employeesDB={employeesDB} boardMembers={boardMembers}/>}
            {tab==='employees'   && <EmployeesTab   showToast={showToast} jumpToAid={e=>{setPrefilled(e);setTab('treasury');}} globalSearch={globalSearch} activeEvents={activeEvents} onSaveEmployee={saveEmployee}/>}
            {tab==='board'       && <BoardTab        showToast={showToast} boardMembers={boardMembers} setBoardMembers={setBoardMembers}/>}
            {tab==='treasury'    && <TreasuryTab     userRole={user.role} showToast={showToast} prefilledEmployee={prefilled} nextCheckNum={10255} globalSearch={globalSearch}/>}
            {tab==='settlement'  && <SettlementTab   showToast={showToast}/>}
            {tab==='events'      && <EventsTab       showToast={showToast} boardMembers={boardMembers} eventTypes={eventTypes} setEventTypes={setEventTypes} globalSearch={globalSearch}/>}
            {tab==='reports'     && <ReportsTab      showToast={showToast}/>}
          </div>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
}