import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropManager - Real Estate Management Platform",
  description: "Find your perfect home or manage your properties with PropManager - India's leading broker-free real estate platform",
  keywords: ["real estate", "rent", "buy", "property", "apartments", "homes", "india"],
  openGraph: {
    title: "PropManager - Real Estate Management Platform",
    description: "Find your perfect home or manage your properties",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout Script */}
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
