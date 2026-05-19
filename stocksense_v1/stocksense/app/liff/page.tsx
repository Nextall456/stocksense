'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { StockSenseScanner } from '@/components/StockSenseScanner';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export default function LiffPage() {
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          setError('LIFF ID ไม่ได้ตั้งค่า');
          setLoading(false);
          return;
        }

        await liff.init({ liffId, withLoginOnExternalBrowser: true });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const userProfile = await liff.getProfile();
        setProfile(userProfile);

        await fetch('/api/auth/line-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
          }),
        });
      } catch (err: any) {
        console.error('LIFF init failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060A0F',
        display: 'grid',
        placeItems: 'center',
        color: '#378ADD',
        fontFamily: 'system-ui',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ fontSize: 24, marginBottom: 10 }}>🎯</div>
          <div style={{ fontSize: 14 }}>กำลังเข้าสู่ระบบผ่าน LINE...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060A0F',
        display: 'grid',
        placeItems: 'center',
        color: '#E24B4A',
        padding: 20,
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: 18, marginBottom: 10 }}>เข้าระบบไม่สำเร็จ</div>
          <div style={{ fontSize: 12, color: '#78909c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return <StockSenseScanner />;
}
