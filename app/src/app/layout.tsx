import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import Providers, { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { InfrastructureBanner } from "@/components/infrastructure-banner";

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
              defaultTheme="dark"
              disableTransitionOnChange
            >
              <InfrastructureBanner />
              <Toaster richColors position="top-right" />
              {children}
            </ThemeProvider>
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
