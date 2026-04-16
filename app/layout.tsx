import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import _NavBar from "@/app/components/_navbar";
import _Footer from "@/app/components/_footer";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Vizela Viagens",
  description: "Vizela Viagens",
};

const isAdminMode = process.env.APP_MODE === 'admin';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {!isAdminMode && <_NavBar />}
        <div className={isAdminMode ? '' : 'pt-20'}>{children}</div>
        {!isAdminMode && <_Footer />}
      </body>
    </html>
  );
}
