import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/appContext";
import { NavbarWrapper } from "@/components/NavbarWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4fbf7" },
    { media: "(prefers-color-scheme: dark)",  color: "#06150f" }
  ]
};

export const metadata: Metadata = {
  title: "Greenlight | Local climate action barriers",
  description:
    "Greenlight maps the local barriers that make climate action fail, then ranks practical fixes students and communities can verify.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/greenlight-logo.svg", type: "image/svg+xml", sizes: "512x512" }
    ],
    shortcut: "/favicon.svg",
    apple: "/greenlight-logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AppProvider>
          <NavbarWrapper />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
