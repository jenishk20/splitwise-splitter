import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Providers, { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";


const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Splitwise Splitter",
  description: "The Easiest Way to Split Receipts with Friends",
  keywords: [
    "splitwise",
    "splitter",
    "split expenses",
    "split receipts",
    "split with friends",
    "split expenses with friends",
    "split receipts with friends",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

// Splitting a bill happens on a phone, at the table. Lock the viewport to the
// device width and let the browser chrome pick up the app background so the
// page doesn't sit under a mismatched bar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#12161f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className}>
        <Providers>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              <Toaster richColors position="top-right" />
              {children}
            </ThemeProvider>
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
