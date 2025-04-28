// ตัวอย่างไฟล์ next.config.mjs
import withPWA from 'next-pwa';

export default withPWA({
  pwa: {
    dest: 'public', // ตั้งค่าที่จะบอกว่าไฟล์ PWA จะถูกเก็บที่ไหน
    disable: process.env.NODE_ENV === 'development', // ปิดการใช้ในโหมด development
    register: true,
    skipWaiting: true,
  },
  reactStrictMode: true, // ทำให้ React ทำงานในโหมด Strict Mode
});
