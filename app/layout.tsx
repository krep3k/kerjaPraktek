import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Sistem Infrmasi Manajemen SDN SERUA 02",
  description: "Created by krep3k and songpais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={inter.className}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
            try {
              var theme = window.localStorage.getItem('theme-mode');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if(theme === 'light' || theme === 'dark' || theme === 'system') {
                document.documentElement.dataset.theme = theme;
                if(theme === 'dark' || (theme === 'system' && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } else {
                document.documentElement.dataset.theme = 'system';
                if(prefersDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }
            } catch(err) {}
          })();`}
        </Script>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
