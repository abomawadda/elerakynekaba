import React, { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from 'react';
/* استدعاء الأيقونات */
import { 
  LayoutDashboard, Users, Landmark, ReceiptText, PartyPopper, LineChart,
  Bell, UserCircle, LogOut, Plus, CheckCircle2, FileText, AlertCircle,
  Wallet, PiggyBank, Search, Building2, CalendarDays, MessageCircle,
  FileDown, ShieldCheck, UserPlus, X, Ticket, Coins, UsersRound,
  ChevronLeft, ChevronRight, ArrowRight, Clock, AlertTriangle,
  CheckSquare, Send, Eye, Lock, BarChart3, RefreshCw, Sun, Moon,
  Printer, Upload, FileImage, FileCheck, Filter, ZoomIn, Shield,
  TrendingUp, Banknote, Hash, Phone, Camera, Edit, Trash2, Save,
  History, Database, Download 
} from 'lucide-react';

/* استدعاء أدوات فايربيز */
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

/* أدوات التنسيق */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cx = (...inputs) => twMerge(clsx(inputs));

/* ══════════════════════════════════════════════════════════════
   إعدادات فايربيز (Firebase Config)
   ══════════════════════════════════════════════════════════════ */
const firebaseConfig = {
    apiKey: "AIzaSyDZjHYgoQRSto9-Sb1nEVeWkDgD0G4NWTw",
    authDomain: "nekaba2026.firebaseapp.com",
    projectId: "nekaba2026",
    storageBucket: "nekaba2026.firebasestorage.app",
    messagingSenderId: "605500549585",
    appId: "1:605500549585:web:307bd9ca2fb21f96f218f0"
};

const app = initializeApp(firebaseConfig);
const mAuth = getAuth(app);
const db = getFirestore(app);

/* ══════════════════════════════════════════════════════════════
   الثوابت (Constants)
   ══════════════════════════════════════════════════════════════ */
const ORG_NAME = "النقابة العامة للاتصالات بالدقهلية - أمانة الصندوق";
const MONTHS   = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const GOV_MAP  = {'01':'القاهرة','02':'الإسكندرية','03':'بورسعيد','04':'السويس','11':'دمياط','12':'الدقهلية','13':'الشرقية','14':'القليوبية','15':'كفر الشيخ','16':'الغربية','17':'المنوفية','18':'البحيرة','19':'الإسماعيلية','21':'الجيزة','22':'بني سويف','23':'الفيوم','24':'المنيا','25':'أسيوط','26':'سوهاج','27':'قنا','28':'أسوان','29':'الأقصر','31':'البحر الأحمر','32':'الوادي الجديد','33':'مطروح','34':'شمال سيناء','35':'جنوب سيناء','88':'خارج الجمهورية'];
const WF_STEPS = ['draft','review','approved','posted'];
const WF_CFG   = {
  draft:    {label:'مسودة',         icon:FileText,     color:'gray'},
  review:   {label:'قيد المراجعة',  icon:Eye,          color:'amber'},
  approved: {label:'معتمد',         icon:CheckCircle2, color:'teal'},
  posted:   {label:'مُرحَّل نهائياً',icon:Send,        color:'green'},
};

const AID_RELS = {
    'إعانة زواج':         ['العضو نفسه','ابن','ابنة'],
    'إعانة وفاة':         ['الزوج / الزوجة','أب','أم','ابن','ابنة'],
    'ظروف قهرية / صحية': ['العضو نفسه'],
};

const DEP0  = ['إدارة هندسية','خدمة عملاء','مبيعات','حسابات وموارد بشرية','شئون قانونية','تكنولوجيا المعلومات'];
const JOB0  = ['مدير إدارة','مهندس أول','مهندس','أخصائي','فني','إداري','محاسب'];
const ROLE0 = ['رئيس النقابة','نائب الرئيس','أمين الصندوق','الأمين العام','عضو مجلس','إشراف طبي'];
const STAT0 = ['نشط','إجازة','مجمد'];
const RPT_TYPES0 = ['الموقف المالي الشامل (كشف الحساب)','الإعانات المنصرفة','السلف والعهد المعلقة','قائمة مشتركي فعالية','كشف بأسماء الأعضاء','إيداعات الخزينة'];

/* ══════════════════════════════════════════════════════════════
   أدوات التنسيق والوضع الليلي (Theme Context)
   ══════════════════════════════════════════════════════════════ */
const ThemeCtx = createContext();

const useT = () => {
    const { dark } = useContext(ThemeCtx);
    return {
        dark,
        page:  dark?'bg-[#0c1220] text-slate-100':'bg-slate-100 text-slate-900',
        card:  dark?'bg-slate-800/70 border-slate-700/80':'bg-white border-slate-200 shadow-sm',
        hdr:   dark?'bg-slate-900/90 border-slate-700/80':'bg-white/95 border-slate-200',
        nav:   dark?'bg-slate-900/95 border-slate-700/80':'bg-white border-slate-200',
        inp:   dark?'bg-slate-900/60 border-slate-600 text-slate-100 focus:border-teal-400':'bg-white border-slate-300 text-slate-900 focus:border-teal-500',
        sel:   dark?'bg-slate-900/60 border-slate-600 text-slate-100':'bg-white border-slate-300 text-slate-900',
        btn:   dark?'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600':'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200',
        text:  dark?'text-slate-100':'text-slate-900',
        sub:   dark?'text-slate-400':'text-slate-600',
        muted: dark?'text-slate-500':'text-slate-500',
        div:   dark?'border-slate-700/80':'border-slate-200',
        b: {
            teal:  dark?'bg-teal-500/10 text-teal-400 border-teal-400/30' :'bg-teal-50 text-teal-700 border-teal-300',
            rose:  dark?'bg-rose-500/10 text-rose-400 border-rose-400/30' :'bg-rose-50 text-rose-700 border-rose-300',
            amber: dark?'bg-amber-500/10 text-amber-400 border-amber-400/30':'bg-amber-50 text-amber-700 border-amber-300',
            sky:   dark?'bg-sky-500/10 text-sky-400 border-sky-400/30'    :'bg-sky-50 text-sky-700 border-sky-300',
        }
    };
};

const getAvatar = (gender, image) => {
    if (image) return image;
    return gender === 'أنثى' 
        ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ec4899"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 14 0v2"/></svg>'
        : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230ea5e9"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 14 0v2"/></svg>';
};

/* ══════════════════════════════════════════════════════════════
   المكونات المساعدة (UI Components)
   ══════════════════════════════════════════════════════════════ */
const Toast = ({message,type='success',onClose}) => {
    useEffect(()=>{const t=setTimeout(onClose,4500);return()=>clearTimeout(t);},[onClose]);
    const T = useT();
    const bg = type==='success'?'bg-emerald-600':'bg-rose-600';
    return (
        <div className={cx('fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl',bg)}>
            {type==='success'?<CheckCircle2 size={15}/>:<AlertCircle size={15}/>}
            <span>{message}</span>
            <button onClick={onClose} className="mr-2 opacity-60"><X size={13}/></button>
        </div>
    );
};

/* ... بقية المكونات الفرعية (Field, SWA, ADP, FileUpload) يتم نقلها بنفس المنطق ... */

/* ══════════════════════════════════════════════════════════════
   شاشات النظام (Tabs)
   ══════════════════════════════════════════════════════════════ */

/* شاشة لوحة القيادة */
const DashboardTab = ({employeesDB, transactions}) => {
    const T = useT();
    const active = employeesDB.filter(e=>e.membershipStatus==='عضو نشط').length;
    const totalDep = transactions.filter(t=>t.status==='posted' && t.type==='سند إيداع').reduce((s,t)=>s+(+t.amount),0);
    const totalWit = transactions.filter(t=>t.status==='posted' && t.type!=='سند إيداع').reduce((s,t)=>s+(+t.amount),0);
    const balance = totalDep - totalWit;

    const stats = [
        {title:'رصيد الخزينة', val:balance.toLocaleString(), unit:'ج.م', Icon:Landmark, badge:T.b.teal},
        {title:'إجمالي الأعضاء', val:String(employeesDB.length), unit:'عضو', Icon:Users, badge:T.b.sky},
    ];

    return (
        <div className="space-y-7 animate-in fade-in duration-350">
            <h2 className={cx('text-2xl font-bold',T.text)}>لوحة القيادة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((s,i)=>(
                    <div key={i} className={cx('p-5 rounded-2xl border',T.card)}>
                        <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center mb-4 border',s.badge)}>
                            <s.Icon size={18}/>
                        </div>
                        <p className={cx('text-xs font-semibold mb-1',T.muted)}>{s.title}</p>
                        <p className={cx('text-2xl font-bold',T.text)}>{s.val} <span className="text-sm font-normal">{s.unit}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ... يتم استكمال باقي الشاشات (EmployeesTab, TreasuryTab, etc.) بنفس الطريقة داخل هذا الملف ... */

/* ══════════════════════════════════════════════════════════════
   المكون الرئيسي (Main App Component)
   ══════════════════════════════════════════════════════════════ */
export default function App() {
    const [dark, setDark] = useState(false);
    const [user, setUser] = useState(null); // هنا يتم تعيين بيانات الدخول
    const [tab, setTab]   = useState('dashboard');
    const [toast, setToast] = useState(null);

    // الحالات الخاصة ببيانات فايربيز
    const [employeesDB, setEmployeesDB] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    const showToast = useCallback((message, type='success') => setToast({message, type}), []);

    // ربط فايربيز لجلب البيانات في الوقت الفعلي
    useEffect(() => {
        const unsubEmp = onSnapshot(collection(db, 'artifacts', 'nekaba2026', 'public', 'data', 'employees'), (s) => setEmployeesDB(s.docs.map(d=>d.data())));
        const unsubTxn = onSnapshot(collection(db, 'artifacts', 'nekaba2026', 'public', 'data', 'transactions'), (s) => setTransactions(s.docs.map(d=>d.data())));
        
        signInAnonymously(mAuth).catch(console.error);

        return () => { unsubEmp(); unsubTxn(); };
    }, []);

    const T = useMemo(() => {
        const d = dark;
        return {
            page:  d?'bg-[#0c1220] text-slate-100':'bg-slate-100 text-slate-900',
            hdr:   d?'bg-slate-900/90 border-slate-700/80':'bg-white/95 border-slate-200',
            nav:   d?'bg-slate-900/95 border-slate-700/80':'bg-white border-slate-200',
            text:  d?'text-slate-100':'text-slate-900',
            div:   d?'border-slate-700/80':'border-slate-200',
        };
    }, [dark]);

    // شاشة الدخول البسيطة للاختبار
    if (!user) return (
        <div className={cx('min-h-screen flex items-center justify-center', dark ? 'bg-[#0c1220]' : 'bg-slate-100')}>
            <button onClick={() => setUser({name: 'محمود العراقي', role: 'treasurer'})} className="bg-teal-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">
                دخول للنظام (محاكاة)
            </button>
        </div>
    );

    return (
        <ThemeCtx.Provider value={{dark, toggle:()=>setDark(!dark)}}>
            <div className={cx('min-h-screen flex flex-col', T.page)}>
                {toast && <Toast {...toast} onClose={()=>setToast(null)} />}

                {/* الشريط العلوي */}
                <header className={cx('fixed top-0 w-full h-14 border-b z-40 flex items-center justify-between px-6', T.hdr)}>
                    <span className="font-black text-teal-600">{ORG_NAME}</span>
                    <div className="flex items-center gap-4">
                        <button onClick={()=>setDark(!dark)} className="p-2 rounded-xl border">
                            {dark ? <Sun size={16}/> : <Moon size={16}/>}
                        </button>
                        <button onClick={()=>setUser(null)} className="text-rose-500"><LogOut size={16}/></button>
                    </div>
                </header>

                <div className="flex mt-14 flex-1">
                    {/* القائمة الجانبية */}
                    <nav className={cx('w-52 border-l p-3 flex flex-col gap-1 sticky top-14 h-[calc(100vh-56px)]', T.nav)}>
                        <button onClick={()=>setTab('dashboard')} className={cx('flex items-center gap-3 p-3 rounded-xl text-sm font-bold', tab==='dashboard'?'bg-teal-500/10 text-teal-500':'')}>
                            <LayoutDashboard size={16}/> الرئيسية
                        </button>
                        <button onClick={()=>setTab('employees')} className={cx('flex items-center gap-3 p-3 rounded-xl text-sm font-bold', tab==='employees'?'bg-teal-500/10 text-teal-500':'')}>
                            <Users size={16}/> ملف الأعضاء
                        </button>
                        <button onClick={()=>setTab('treasury')} className={cx('flex items-center gap-3 p-3 rounded-xl text-sm font-bold', tab==='treasury'?'bg-teal-500/10 text-teal-500':'')}>
                            <Landmark size={16}/> الخزينة
                        </button>
                    </nav>

                    {/* المحتوى الرئيسي */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-5xl mx-auto">
                            {tab === 'dashboard' && <DashboardTab employeesDB={employeesDB} transactions={transactions} />}
                            {/* هنا يتم استدعاء باقي الشاشات بنفس النمط */}
                            {tab === 'employees' && <div className="p-8 text-center border-2 border-dashed rounded-3xl opacity-50 font-bold">شاشة الأعضاء جاهزة للنقل...</div>}
                        </div>
                    </main>
                </div>
            </div>
        </ThemeCtx.Provider>
    );
}