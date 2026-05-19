import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StockSense - หุ้นเด็ดวันนี้ + นาฬิกานับถอยหลัง",
  description: "แสดงหุ้นเด็ดวันนี้พร้อม AI Verdict และเครื่องมือวิเคราะห์หุ้น",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}