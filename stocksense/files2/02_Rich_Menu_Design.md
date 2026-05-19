# 🎨 LINE Rich Menu — Design + Setup ครบชุด

## 📐 Specs ทางเทคนิค (สำคัญต้องตรงเป๊ะ)

### ขนาดภาพ
- **ขนาด:** 2500 x 1686 px (Full) หรือ 2500 x 843 px (Half)
- **Format:** JPEG หรือ PNG
- **ขนาดไฟล์:** ไม่เกิน 1 MB
- **สี:** RGB

### Grid Layout (ฉบับแนะนำ)
ใช้ Full Size **2500 x 1686** แบ่ง 6 ช่อง (3 คอลัมน์ × 2 แถว)
```
แต่ละช่อง = 833 x 843 px
```

---

## 🎨 Layout ที่แนะนำสำหรับ AlphaScout

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│   🎯 เปิด          🎁 หุ้นเด่น        🐋 Whale         │
│   AlphaScout       วันนี้             Watch             │
│   [833x843]        [833x843]          [833x843]         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   🔔 ตั้ง          ⭐ อัปเกรด         💬 ติดต่อ        │
│   แจ้งเตือน        Pro                 ทีม              │
│   [833x843]        [833x843]          [833x843]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Coordinate Mapping (สำหรับ JSON)
```
ช่อง 1: (0, 0)    → (833, 843)
ช่อง 2: (833, 0)  → (1666, 843)
ช่อง 3: (1666, 0) → (2500, 843)
ช่อง 4: (0, 843)  → (833, 1686)
ช่อง 5: (833, 843)→ (1666, 1686)
ช่อง 6: (1666, 843)→ (2500, 1686)
```

---

## 🎨 Style Guide

### สีหลัก (ตรงกับ Brand AlphaScout)
```
Background:    #060A0F  (Dark navy)
Primary:       #00FF9D  (Neon green - หลัก)
Secondary:     #00B86B  (Dark green)
Accent:        #FFCA28  (Gold - สำหรับ Premium)
Text:          #E8EAF6  (White)
Muted:         #78909C  (Gray)
```

### Font
- **Heading:** Sarabun Bold หรือ Prompt Bold
- **Body:** Sarabun Regular
- **Mono (ราคา):** JetBrains Mono หรือ Space Mono

### Icon Style
- Outline + Glow effect สีเขียวอ่อน
- ใหญ่พอเห็นชัดในมือถือ (อย่างน้อย 120x120 px ในแต่ละช่อง)

---

## 🛠️ วิธีออกแบบใน Canva (ฟรี + 10 นาที)

### Step 1: เตรียม Canvas
1. เปิด https://canva.com
2. กด **Create design** → **Custom size** → 2500 x 1686 px
3. ตั้งชื่อ "AlphaScout Rich Menu"

### Step 2: ตั้งค่าพื้นฐาน
1. **Background:** สีดำ `#060A0F`
2. ลาก Grid Lines:
   - แนวตั้ง: ที่ 833px และ 1666px
   - แนวนอน: ที่ 843px
3. (เห็นเป็น 6 ช่องเท่าๆกัน)

### Step 3: เพิ่มเส้นแบ่ง (Optional แต่สวย)
- เพิ่มเส้น 2px สีเขียวอ่อนซีดๆ `#00FF9D33` แบ่งช่อง

### Step 4: ใส่ Icon + ข้อความแต่ละช่อง

| ช่อง | Icon | ข้อความ | สี |
|------|------|---------|-----|
| 1 | 🎯 | เปิด<br>AlphaScout | Primary Green |
| 2 | 🎁 | หุ้นเด่น<br>วันนี้ | Gold |
| 3 | 🐋 | Whale<br>Watch | Cyan |
| 4 | 🔔 | ตั้ง<br>แจ้งเตือน | White |
| 5 | ⭐ | อัปเกรด<br>Pro | Gold Glow |
| 6 | 💬 | ติดต่อ<br>ทีม | White |

### Step 5: เพิ่ม Glow Effect
- เลือก Icon → Effects → Glow → สีเขียว `#00FF9D`

### Step 6: Export
- Download → JPG (Quality: 100%)
- ตรวจขนาดไฟล์ < 1MB (ถ้าใหญ่ ให้ลด Quality เหลือ 80%)

---

## 💻 Setup Rich Menu บน LINE (Code-based)

### Method 1: ใช้ LINE Official Account Manager (ง่ายสุด)

1. เข้า https://manager.line.biz/
2. เลือก OA ของคุณ
3. ไปที่ **Rich menus** → **Create**
4. Upload รูป + ตั้ง Link แต่ละช่อง
5. Set as default

**ข้อจำกัด:** ลิงก์ทำได้แค่ URL/ข้อความ — ถ้าอยากให้ Trigger Bot complex ต้องใช้ API

---

### Method 2: ใช้ API (ยืดหยุ่นสุด)

#### Step 1: สร้าง Rich Menu JSON
สร้างไฟล์ `richmenu.json`:

```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "AlphaScout Main Menu",
  "chatBarText": "เมนู AlphaScout",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "label": "เปิด AlphaScout",
        "uri": "https://liff.line.me/YOUR_LIFF_ID"
      }
    },
    {
      "bounds": { "x": 833, "y": 0, "width": 833, "height": 843 },
      "action": {
        "type": "message",
        "label": "หุ้นเด่นวันนี้",
        "text": "หุ้นเด่นวันนี้"
      }
    },
    {
      "bounds": { "x": 1666, "y": 0, "width": 834, "height": 843 },
      "action": {
        "type": "message",
        "label": "Whale Watch",
        "text": "whale"
      }
    },
    {
      "bounds": { "x": 0, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "label": "ตั้งแจ้งเตือน",
        "uri": "https://liff.line.me/YOUR_LIFF_ID/alerts"
      }
    },
    {
      "bounds": { "x": 833, "y": 843, "width": 833, "height": 843 },
      "action": {
        "type": "uri",
        "label": "อัปเกรด Pro",
        "uri": "https://liff.line.me/YOUR_LIFF_ID/upgrade"
      }
    },
    {
      "bounds": { "x": 1666, "y": 843, "width": 834, "height": 843 },
      "action": {
        "type": "message",
        "label": "ติดต่อทีม",
        "text": "ติดต่อทีม"
      }
    }
  ]
}
```

#### Step 2: สร้าง Rich Menu ผ่าน API

```bash
# 1. สร้าง Rich Menu Structure
curl -X POST https://api.line.me/v2/bot/richmenu \
  -H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @richmenu.json

# Response: { "richMenuId": "richmenu-xxxxxxxxxxxxx" }
```

```bash
# 2. Upload รูป
curl -X POST https://api-data.line.me/v2/bot/richmenu/{RICH_MENU_ID}/content \
  -H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN" \
  -H "Content-Type: image/jpeg" \
  -T richmenu.jpg
```

```bash
# 3. Set as Default
curl -X POST https://api.line.me/v2/bot/user/all/richmenu/{RICH_MENU_ID} \
  -H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN"
```

---

### Method 3: Node.js Script (อัตโนมัติทั้งหมด)

สร้างไฟล์ `setup-richmenu.js`:

```javascript
import fs from 'fs';
import fetch from 'node-fetch';

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const IMAGE_PATH = './richmenu.jpg';

async function setupRichMenu() {
  // 1. Create Rich Menu structure
  console.log('📐 Creating rich menu structure...');
  const richMenu = JSON.parse(fs.readFileSync('./richmenu.json', 'utf8'));

  const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(richMenu),
  });

  const { richMenuId } = await createRes.json();
  console.log('✅ Created:', richMenuId);

  // 2. Upload image
  console.log('📤 Uploading image...');
  const imageData = fs.readFileSync(IMAGE_PATH);

  const uploadRes = await fetch(
    `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'image/jpeg',
      },
      body: imageData,
    }
  );

  if (!uploadRes.ok) {
    console.error('❌ Upload failed:', await uploadRes.text());
    return;
  }
  console.log('✅ Image uploaded');

  // 3. Set as default
  console.log('⚙️ Setting as default...');
  const defaultRes = await fetch(
    `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    }
  );

  if (defaultRes.ok) {
    console.log('🎉 Done! Rich Menu is now active');
  }
}

setupRichMenu().catch(console.error);
```

รันด้วย:
```bash
LINE_CHANNEL_ACCESS_TOKEN=your_token node setup-richmenu.js
```

---

## 🎨 Multi-Menu Strategy (Advanced)

มี Rich Menu คนละแบบสำหรับลูกค้าแต่ละ Tier:

| Tier | Menu Layout |
|------|-------------|
| **Free** | เปิด App / Daily Pick / **อัปเกรด Pro** (เน้น) |
| **Pro** | เปิด App / Daily Pick / Whale Watch / ตั้งเตือน / Settings / VIP Chat |
| **Elite** | เปิด App / Daily Pick / Whale Watch / Backtest / 1-on-1 / VIP Group |

### Code: เปลี่ยน Rich Menu ตาม Tier

```typescript
// app/api/user/upgrade/route.ts
export async function POST(req: Request) {
  const { lineUserId, newTier } = await req.json();

  const richMenuIds = {
    free: 'richmenu-aaa',
    pro: 'richmenu-bbb',
    elite: 'richmenu-ccc',
  };

  // Link user to specific menu
  await fetch(
    `https://api.line.me/v2/bot/user/${lineUserId}/richmenu/${richMenuIds[newTier]}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    }
  );

  return Response.json({ ok: true });
}
```

---

## 🎁 BONUS: Template ภาพ Rich Menu (ASCII Mockup)

นี่คือสิ่งที่ภาพควรดูเหมือน:

```
╔═══════════════════════╦═══════════════════════╦═══════════════════════╗
║                       ║                       ║                       ║
║         🎯            ║          🎁           ║          🐋           ║
║                       ║                       ║                       ║
║       เปิด            ║       หุ้นเด่น         ║         Whale          ║
║    AlphaScout         ║       วันนี้           ║         Watch         ║
║                       ║                       ║                       ║
║   ─────────────       ║   ─────────────       ║   ─────────────       ║
║   Live Scanner        ║   AI Pick Today       ║   ตามรอยเงินใหญ่      ║
║                       ║                       ║                       ║
╠═══════════════════════╬═══════════════════════╬═══════════════════════╣
║                       ║                       ║                       ║
║         🔔            ║          ⭐           ║          💬           ║
║                       ║                       ║                       ║
║         ตั้ง           ║      อัปเกรด          ║       ติดต่อ           ║
║      แจ้งเตือน         ║         Pro            ║          ทีม           ║
║                       ║                       ║                       ║
║   ─────────────       ║   ─────────────       ║   ─────────────       ║
║   ไม่พลาดโอกาส        ║   เหลือ 27 ที่นั่ง     ║   Live Chat           ║
║                       ║                       ║                       ║
╚═══════════════════════╩═══════════════════════╩═══════════════════════╝
```

---

## 🎯 Quick Tools List

| ทำอะไร | ใช้เครื่องมือ | ราคา |
|--------|-----------|------|
| Design | Canva | ฟรี |
| Icon | Iconify, Flaticon | ฟรี |
| Color Picker | Coolors.co | ฟรี |
| Font | Google Fonts | ฟรี |
| Test Mockup | LINE Rich Menu Designer | ฟรี |
| Upload | LINE OA Manager หรือ Node.js | ฟรี |

---

## ⚠️ Common Issues + Fix

| ปัญหา | แก้ |
|------|-----|
| Image ใหญ่เกิน 1MB | Export Quality 80% หรือใช้ TinyJPG บีบไฟล์ |
| Click ไม่ตรงช่อง | ตรวจ Coordinate ใน JSON ให้ตรงกับภาพ |
| ไม่โชว์ Menu | Set Default ลืม หรือ User ไม่เคย Add Friend |
| Menu โหลดช้า | ใช้ JPG ดีกว่า PNG (ขนาดเล็กกว่า) |

---

## 🎬 Tutorial Resource

- LINE Official Doc: https://developers.line.biz/en/docs/messaging-api/using-rich-menus/
- LINE Designer Tool (Free): https://www.linebiz.com/jp/manual/OfficialAccountManager/richmenus-designer/
- Canva Tutorial: ค้นใน YouTube "Canva LINE Rich Menu"
