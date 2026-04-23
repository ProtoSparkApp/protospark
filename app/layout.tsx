import type { Metadata } from "next"
import { Fraunces, Inter, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";

const fontHeading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ProtoSpark | Industrial Hardware Engineering Engine",
  description: "Advanced Agentic Coding & Prototyping Platform. The ultimate tool for electronic component management and project development.",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontHeading.variable,
        fontSans.variable,
        fontMono.variable
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            {children}
          </div>
          <Toaster
            position="bottom-right"
            richColors
            theme="light"
            toastOptions={{
              style: {
                borderRadius: '0px',
                border: '4px solid black',
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '12px',
              },
              className: "brutal-toast",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
