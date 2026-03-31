// استدعاء الدوال الأساسية من مكتبة فايربيز
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// ⚠️ قم بنسخ هذا الجزء بالكامل من شاشة فايربيز وضع أرقامك الحقيقية هنا
const firebaseConfig = {
  apiKey: "AIzaSyDZjHYgoQRSto9-Sb1nEVeWkDgD0G4NWTw",
  authDomain: "nekaba2026.firebaseapp.com",
  databaseURL: "https://nekaba2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nekaba2026",
  storageBucket: "nekaba2026.firebasestorage.app",
  messagingSenderId: "605500549585",
  appId: "1:605500549585:web:307bd9ca2fb21f96f218f0",
  measurementId: "G-4GS9CPH6F0"
};

// تهيئة تطبيق فايربيز
const app = initializeApp(firebaseConfig);

// تفعيل قاعدة بيانات Firestore وتصديرها لنستخدمها في باقي ملفات المشروع
export const db = getFirestore(app);