// config.js - الإصدار الجديد (لا يحتوي على توكن)
const Config = {
  // رابط الـ Pipedream الجديد (نفس الرابط، لكن التعامل معه اختلف)
  PIPEDREAM_URL: 'https://eo3djhokj3ty6kt.m.pipedream.net',

  // إرسال رسالة نصية عبر Pipedream
  async sendMessage(text) {
    try {
      const response = await fetch(this.PIPEDREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          text: text
        })
      });
      const result = await response.json();
      if (!result.success) console.error('فشل إرسال رسالة:', result.error);
      return result.success;
    } catch (e) {
      console.error('خطأ في إرسال رسالة:', e);
      return false;
    }
  },

  // إرسال صورة عبر Pipedream
  async sendPhoto(blob, caption = '') {
    try {
      // تحويل Blob إلى Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // إزالة المقدمة data:image/...
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
      if (!result.success) console.error('فشل إرسال صورة:', result.error);
      return result.success;
    } catch (e) {
      console.error('خطأ في إرسال صورة:', e);
      return false;
    }
  }
};
