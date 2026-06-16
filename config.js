const Config = {
  PIPEDREAM_URL: 'https://telegram.mustafaalomar911.workers.dev',
  API_KEY: 'YOUR_API_KEY',

  async sendMessage(text) {
    const response = await fetch(this.PIPEDREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.API_KEY
      },
      body: JSON.stringify({
        action: 'sendMessage',
        text
      })
    });

    const result = await response.json();
    return result.ok;
  },

  async sendPhoto(base64, caption = '') {
    const response = await fetch(this.PIPEDREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.API_KEY
      },
      body: JSON.stringify({
        action: 'sendPhoto',
        image: base64,
        caption
      })
    });

    const result = await response.json();
    return result.ok;
  }
};
