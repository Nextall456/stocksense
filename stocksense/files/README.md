# 🎯 AlphaScout — แพ็คเกจ Pre-Launch ครบชุด

## 📦 ไฟล์ทั้งหมดในแพ็คเกจ

| ไฟล์ | หน้าที่ | ใช้เมื่อไหร่ |
|------|---------|--------------|
| `landing.html` | Landing Page Pre-sell | **Deploy วันนี้** |
| `SETUP_GUIDE.md` | คู่มือ Next.js + Supabase | สัปดาห์ที่ 1-2 |
| `lib_supabase.ts` | Code Supabase Client | สัปดาห์ที่ 2 |
| `lib_stocks.ts` | Code Stock APIs + AI | สัปดาห์ที่ 2 |
| `LINE_LIFF_FLOW.md` | คู่มือ LINE LIFF เต็ม | สัปดาห์ที่ 3-4 |
| `alphascout.jsx` | Main Scanner (จากตอนที่แล้ว) | สัปดาห์ที่ 3 |

---

## 🚀 Execution Plan 30 วัน

### Week 1: เก็บ Lead ก่อน (ทำเงินก่อนสร้าง)
- [ ] Deploy `landing.html` ขึ้น Vercel/Netlify (10 นาที)
- [ ] ซื้อ Domain `.app` หรือ `.com` (~฿350/ปี)
- [ ] ลง Pixel: Facebook + TikTok + Google Analytics
- [ ] ทำคลิป TikTok 5 คลิป → ลิงก์มา Landing
- [ ] **เป้าหมาย: เก็บ Lead 200 คน**

### Week 2: สร้าง Backend
- [ ] สร้าง Supabase Project (Singapore region)
- [ ] รัน SQL Schema จาก `SETUP_GUIDE.md`
- [ ] สมัคร Finnhub API (ฟรี)
- [ ] สร้าง Next.js project + Deploy เปล่าขึ้น Vercel
- [ ] เชื่อม `alphascout.jsx` กับ Supabase

### Week 3: LINE Integration
- [ ] สมัคร LINE Developers
- [ ] สร้าง Messaging API Channel
- [ ] สร้าง LINE Login Channel + LIFF
- [ ] ทำ Rich Menu (Canva)
- [ ] Setup Auto Reply
- [ ] ทดสอบ LIFF App

### Week 4: เริ่มขาย
- [ ] สมัคร Omise (สำหรับรับเงิน)
- [ ] หรือ LINE Pay (ในไลน์)
- [ ] เปิด Founding Member 100 ที่นั่ง
- [ ] Push Email/LINE ไปยัง Lead ที่เก็บไว้
- [ ] **เป้าหมาย: ปิดยอด 25 คนแรก = ฿4,975**

---

## 💰 Budget Plan (เริ่มต้น)

| รายการ | ค่าใช้จ่าย |
|--------|-----------|
| Domain (.app) | ~฿1,200/ปี |
| Vercel | ฟรี |
| Supabase | ฟรี |
| Finnhub API | ฟรี |
| LINE OA | ฟรี (จนถึง 1,000 msg) |
| FB Ads (เริ่มต้น) | ~฿3,000 |
| TikTok Ads (เริ่มต้น) | ~฿3,000 |
| **รวม Month 1** | **~฿7,200** |

**ROI:** ปิดได้ 50 Pro = ฿9,950/เดือน → คุ้มทุนเดือนแรก

---

## 🎬 Marketing Hooks (ใช้กับ TikTok/FB)

### Hook 1: ใส่เงิน-ได้กลับ
> "ใส่ 10,000 ในหุ้น NVDA วันนี้ → ได้กลับ 13,500 บาท
> AlphaScout บอกล่วงหน้า คุณกล้าซื้อก่อนคนอื่นมั้ย?"

### Hook 2: AI vs คน
> "นักลงทุนใช้เวลา 3 ชั่วโมงวิเคราะห์หุ้น 1 ตัว
> AI ของเราทำใน 1 วินาที — แม่นกว่า 87%"

### Hook 3: Whale Tracker
> "เงินใหญ่ซื้อ PTT 800 ล้านบาทเมื่อเช้านี้
> คุณยังจะรอให้ขึ้นแล้วค่อยตามมั้ย?"

### Hook 4: FOMO
> "หุ้นเด่นวันนี้ของ AlphaScout ขึ้น +18% แล้ว
> สมาชิกได้แจ้งเตือนก่อน 6 ชั่วโมง · คุณยังไม่ได้สมัคร?"

---

## ❓ ลำดับขั้นต่อไป

1. **ทำเลย:** Deploy `landing.html` ใน 10 นาที
2. **สัปดาห์นี้:** สร้างคอนเทนต์ TikTok 5 คลิป
3. **สัปดาห์หน้า:** Setup Supabase + Next.js
4. **2 สัปดาห์:** Soft Launch ใน LINE
5. **1 เดือน:** ปิดยอด Founding Member 100 คน

---

## 🆘 ติดปัญหาตรงไหน?

แชทมาบอกได้เลย — มีคำถามเฉพาะส่วนไหน เช่น:
- "ติด setup Supabase ตรง RLS"
- "ทำ Rich Menu ยังไงให้สวย"
- "เขียน Cron Job แจ้งเตือน LINE"
- "Connect Omise ยังไง"

ผมจะเขียนโค้ดเฉพาะส่วนให้
