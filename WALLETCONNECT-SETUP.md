# 🔗 WalletConnect Setup Guide

## المشكلة
```
Origin http://localhost:3001 not found on Allowlist - update configuration on cloud.reown.com
```

## الحل السريع

### 1️⃣ إنشاء WalletConnect Project ID جديد

1. اذهب إلى: https://cloud.reown.com/
2. سجل دخول أو أنشئ حساب جديد
3. اضغط "Create Project"
4. اختر "AppKit" أو "WalletConnect"
5. أدخل تفاصيل المشروع:
   - **Name**: StakeFlow
   - **Description**: Risk-Aware Restaking Protocol
   - **URL**: http://localhost:3001

### 2️⃣ إضافة Allowed Origins

في لوحة تحكم المشروع:
1. اذهب إلى "Settings" → "Allowed Origins"
2. أضف هذه الـ URLs:
   ```
   http://localhost:3000
   http://localhost:3001  
   http://localhost:3002
   https://stakeflow-frontend.vercel.app
   https://stakeflow.netlify.app
   ```

### 3️⃣ تحديث Environment Variables

أنشئ أو حدث ملف `.env.local`:
```bash
# في مجلد frontend
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id" > .env.local
```

### 4️⃣ إعادة تشغيل الخادم

```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد التشغيل
bun run dev
```

## الحل المؤقت (للاختبار السريع)

إذا كنت تريد تجاهل المشكلة مؤقتاً:

### إزالة WalletConnect مؤقتاً:

```typescript
// في src/providers/Providers.tsx
const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
  // بدون projectId
});
```

### أو استخدام Mock Wallet:

```typescript
import { mock } from 'wagmi/connectors';

const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    mock({
      accounts: ['0x1234567890123456789012345678901234567890'],
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});
```

## التحقق من الإصلاح

1. افتح Developer Tools (F12)
2. تحقق من عدم وجود أخطاء في Console
3. جرب الاتصال بالمحفظة
4. تأكد من عمل جميع وظائف Web3

## للإنتاج (Production)

عند النشر، تأكد من إضافة domain الحقيقي:
```
https://your-domain.com
https://your-app.vercel.app
```

## استكشاف الأخطاء

### إذا استمرت المشكلة:
1. تحقق من صحة Project ID
2. تأكد من إضافة جميع الـ origins
3. انتظر 5-10 دقائق للتحديث
4. امسح cache المتصفح
5. جرب في incognito mode

### أخطاء شائعة:
- ❌ Project ID خاطئ
- ❌ Origin غير مضاف للـ allowlist  
- ❌ Cache المتصفح قديم
- ❌ Network blocking WalletConnect

## بدائل أخرى

إذا استمرت المشاكل، يمكن استخدام:
- **MetaMask SDK** مباشرة
- **Web3Modal** بدلاً من RainbowKit
- **Wagmi** بدون WalletConnect
- **Mock connectors** للاختبار

---

**💡 نصيحة:** للهاكاثون، استخدم الحل المؤقت عشان تركز على الـ core functionality بدلاً من مشاكل الـ setup!