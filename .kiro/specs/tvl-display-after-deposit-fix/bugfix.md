# Bugfix Requirements Document

## Introduction

المستخدمون يواجهون مشكلة حيث أن عدة صفحات في التطبيق تستخدم mock implementations بدلاً من التفاعل الحقيقي مع الـ smart contracts. هذا يؤدي إلى عرض رسائل نجاح وهمية بينما لا تحدث أي transactions حقيقية على الـ blockchain، مما يؤثر على تجربة المستخدم ومصداقية التطبيق على testnet (Arbitrum Sepolia).

السبب الجذري: ثلاث صفحات رئيسية تستخدم mock implementations ولا تتفاعل مع الـ smart contracts:

1. **صفحة Deposit** (`/deposit`): تستخدم mock `setTimeout` ولا تتفاعل نهائياً مع الـ smart contract
2. **صفحة Withdraw** (`/withdraw`): تستخدم mock `STAKED_POSITIONS` array و `setTimeout` للتأكيدات، ولا تستخدم `useStakeFlow.withdraw()`
3. **صفحة Allocation** (`/allocation`): لديها backend integration لكن زر "Optimize My Position" لا ينفذ transactions على الـ blockchain

البنية التحتية الحقيقية موجودة (`useStakeFlow` hook والـ backend API) لكن هذه الصفحات لا تستخدمها بشكل صحيح.

التحليل الفني:
- صفحة `/deposit` تستخدم mock data وتعرض رسالة نجاح وهمية بعد 2 ثانية
- صفحة `/withdraw` تستخدم mock array للـ positions ولا تستدعي `useStakeFlow.withdraw()`
- صفحة `/allocation` تحسب التوزيع الأمثل من الـ backend لكن لا تنفذ التغييرات على الـ blockchain
- الـ hook `useStakeFlow` موجود ويحتوي على integration صحيح مع الـ smart contract لكن غير مستخدم بشكل كامل
- صفحة `/analytics` تعمل بشكل صحيح مع real backend data ويجب الحفاظ عليها
- Component `OnchainTerminal` يستخدم `useStakeFlow` بشكل صحيح ويتفاعل مع الـ contract

## Bug Analysis

### Current Behavior (Defect)

**Deposit Page Issues:**

1.1 WHEN المستخدم يقوم بعمل deposit من صفحة `/deposit` THEN النظام يستخدم mock implementation مع `setTimeout` بدلاً من التفاعل الحقيقي مع الـ smart contract

1.2 WHEN المستخدم يضغط على زر "Execute" في deposit modal THEN النظام ينتظر 2 ثانية فقط ثم يعرض رسالة "Restaked Successfully" بدون إرسال transaction للـ blockchain

1.3 WHEN المستخدم يعود للـ Dashboard بعد رسالة النجاح الوهمية من deposit THEN الـ TVL يظل يعرض 0.00 ETH لأن لم يحدث deposit حقيقي على الـ smart contract

**Withdraw Page Issues:**

1.4 WHEN المستخدم يفتح صفحة `/withdraw` THEN النظام يعرض mock `STAKED_POSITIONS` array بدلاً من قراءة الـ positions الحقيقية من الـ smart contract

1.5 WHEN المستخدم يختار position ويضغط على "Withdraw" THEN النظام يستخدم mock `setTimeout` للتأكيد بدلاً من استدعاء `useStakeFlow.withdraw()`

1.6 WHEN المستخدم يكمل عملية withdraw من صفحة `/withdraw` THEN النظام يعرض رسالة نجاح وهمية بدون إرسال transaction حقيقية للـ blockchain

**Allocation Page Issues:**

1.7 WHEN المستخدم يضغط على زر "Optimize My Position" في صفحة `/allocation` THEN النظام يحسب التوزيع الأمثل من الـ backend لكن لا ينفذ أي transactions على الـ blockchain

1.8 WHEN المستخدم يشاهد التوزيع الأمثل المقترح في `/allocation` THEN النظام لا يوفر طريقة لتنفيذ هذا التوزيع على الـ smart contract

### Expected Behavior (Correct)

**Deposit Page Fixes:**

2.1 WHEN المستخدم يقوم بعمل deposit من صفحة `/deposit` THEN النظام SHALL يستخدم `useStakeFlow` hook لإرسال transaction حقيقية للـ smart contract على Arbitrum Sepolia

2.2 WHEN المستخدم يضغط على زر "Execute" في deposit modal THEN النظام SHALL يطلب من MetaMask تأكيد الـ transaction ويرسلها للـ blockchain

2.3 WHEN deposit transaction يتم إرسالها THEN النظام SHALL يعرض حالة "Transaction Confirming..." وينتظر التأكيد على الـ blockchain

2.4 WHEN deposit transaction يتم تأكيدها بنجاح على الـ blockchain THEN النظام SHALL يعرض رسالة "Restaked Successfully" فقط بعد التأكيد الفعلي

**Withdraw Page Fixes:**

2.5 WHEN المستخدم يفتح صفحة `/withdraw` THEN النظام SHALL يقرأ الـ staked positions الحقيقية من الـ smart contract باستخدام `useStakeFlow` بدلاً من mock array

2.6 WHEN المستخدم يختار position ويضغط على "Withdraw" THEN النظام SHALL يستدعي `useStakeFlow.withdraw()` لإرسال transaction حقيقية للـ blockchain

2.7 WHEN withdraw transaction يتم إرسالها THEN النظام SHALL يطلب تأكيد من MetaMask ويعرض حالة "Transaction Confirming..."

2.8 WHEN withdraw transaction يتم تأكيدها بنجاح THEN النظام SHALL يعرض رسالة نجاح ويحدث الـ positions المعروضة

**Allocation Page Fixes:**

2.9 WHEN المستخدم يضغط على زر "Optimize My Position" في صفحة `/allocation` THEN النظام SHALL يحسب التوزيع الأمثل من الـ backend ثم ينفذ التغييرات على الـ blockchain

2.10 WHEN المستخدم يوافق على التوزيع الأمثل المقترح THEN النظام SHALL يستخدم `useStakeFlow` لإرسال transactions لإعادة توزيع الـ stake على الـ validators

2.11 WHEN allocation transactions يتم تأكيدها بنجاح THEN النظام SHALL يحدث الـ Dashboard والـ TVL ليعكس التوزيع الجديد

**General Fixes:**

2.12 WHEN أي transaction (deposit/withdraw/allocation) يتم تأكيدها بنجاح THEN الـ TVL على الـ Dashboard SHALL يتحدث تلقائياً ليعكس القيمة الجديدة من الـ smart contract

2.13 WHEN المستخدم يعود للـ Dashboard بعد أي عملية ناجحة THEN الـ TVL SHALL يعرض القيمة الصحيحة المحدثة من الـ backend API الذي يقرأ من الـ smart contract

### Unchanged Behavior (Regression Prevention)

**Existing Working Components:**

3.1 WHEN المستخدم يقوم بعمل deposit من `OnchainTerminal` component THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية مع real smart contract integration

3.2 WHEN المستخدم يشاهد صفحة `/analytics` THEN النظام SHALL CONTINUE TO يعرض البيانات الحقيقية من الـ backend بدون أي تغيير

3.3 WHEN المستخدم يشاهد الـ Dashboard THEN النظام SHALL CONTINUE TO يقرأ الـ TVL من الـ backend API الحقيقي

**Validation and Error Handling:**

3.4 WHEN المستخدم يدخل مبلغ أقل من الحد الأدنى (0.01 ETH) في deposit THEN النظام SHALL CONTINUE TO يعرض رسالة خطأ ويمنع الـ deposit

3.5 WHEN المستخدم غير متصل بالـ wallet THEN النظام SHALL CONTINUE TO يعرض رسالة خطأ مناسبة في جميع الصفحات

3.6 WHEN أي transaction تفشل أو يتم رفضها من المستخدم THEN النظام SHALL CONTINUE TO يعرض رسالة خطأ مناسبة ولا يعرض رسالة نجاح

3.7 WHEN المستخدم يشاهد الـ TVL على الـ Dashboard بدون عمل أي عملية THEN النظام SHALL CONTINUE TO يعرض القيمة الصحيحة من الـ backend API

**UI and Navigation:**

3.8 WHEN المستخدم ينتقل بين الصفحات المختلفة THEN النظام SHALL CONTINUE TO يحافظ على نفس تجربة الـ navigation والـ UI

3.9 WHEN المستخدم يشاهد validator details في أي صفحة THEN النظام SHALL CONTINUE TO يعرض المعلومات الصحيحة من الـ backend
