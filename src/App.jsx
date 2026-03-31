import { useState } from 'react';
// استدعاء الدوال المسؤولة عن إضافة البيانات
import { collection, addDoc } from "firebase/firestore"; 
// استدعاء قاعدة البيانات التي قمنا بتهيئتها في الملف السابق
import { db } from './firebase'; 

function App() {
  // متغيرات لحفظ ما يكتبه المستخدم في الحقول
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  // الدالة التي يتم تنفيذها عند الضغط على زر "حفظ"
  const handleAddMember = async (e) => {
    e.preventDefault(); // لمنع إعادة تحميل الصفحة
    
    try {
      // الكود السحري لإضافة البيانات إلى مجموعة (جدول) باسم "members"
      const docRef = await addDoc(collection(db, "members"), {
        name: memberName,
        phone: memberPhone,
        dateAdded: new Date()
      });
      
      alert("تمت إضافة العضو بنجاح! ID: " + docRef.id);
      
      // تفريغ الحقول بعد النجاح
      setMemberName("");
      setMemberPhone("");
      
    } catch (error) {
      console.error("حدث خطأ أثناء إضافة البيانات: ", error);
      alert("حدث خطأ، راجع شاشة الـ Console");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', direction: 'rtl' }}>
      <h2>إضافة عضو جديد للنقابة</h2>
      
      <form onSubmit={handleAddMember}>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="اسم العضو" 
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="رقم الهاتف" 
            value={memberPhone}
            onChange={(e) => setMemberPhone(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          حفظ البيانات في فايربيز
        </button>
      </form>
    </div>
  );
}

export default App;