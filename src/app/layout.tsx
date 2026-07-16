import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "okna — Save money on every bill & subscription",
  description:
    "okna is your personal expense-saving assistant. Track, get reminders, spot unused subscriptions, and switch to cheaper plans across every recurring bill — mobile, broadband, OTT, insurance, EMIs and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
