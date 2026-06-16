// config.js - وسيط آمن للإرسال عبر Pipedream
const Config = {
  PIPEDREAM_URL: 'telegram.mustafaalomar911.workers.dev',

  async sendMessage(text) {
    try {
      const maxLength = 4000;
      
      // تقسيم الرسالة إذا كانت طويلة
      if (text.length > maxLength) {
        const parts = [];
        for (let i = 0; i < text.length; i += maxLength) {
          parts.push(text.substring(i, i + maxLength));
        }
        
        for (let i = 0; i < parts.length; i++) {
          const response = await fetch(this.PIPEDREAM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sendMessage',
              text: parts[i]
            })
          });
          const result = await response.json();
          if (!result.success) {
            console.error('فشل إرسال جزء من الرسالة:', result.error);
          }
          // تأخير بين الأجزاء
          if (i < parts.length - 1) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
        return true;
      }
      
      // رسالة عادية (أقل من 4000 حرف)
      const response = await fetch(this.PIPEDREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          text: text
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        console.error('فشل إرسال رسالة:', result.error);
      }
      return result.success;
      
    } catch (e) {
      console.error('خطأ في إرسال رسالة:', e);
      return false;
    }
  },

  async sendPhoto(blob, caption = '') {
    try {
      // تحويل Blob إلى Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // استخراج الجزء النقي من Base64
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const response = await fetch(this.PIPEDREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendPhoto',
          image: base64,
          caption: caption
        })
      });
      
      const result = await response.json();
      if (!result.success) {
        console.error('فشل إرسال صورة:', result.error);
      }
      return result.success;
      
    } catch (e) {
      console.error('خطأ في إرسال صورة:', e);
      return false;
    }
  }
};
