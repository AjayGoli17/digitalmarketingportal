import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ViewModeProvider } from "@/components/context/ViewModeContext";
import { ContentWorkflowProvider } from "@/components/context/ContentWorkflowContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Aura Editorial Agency — Client Portal",
  description:
    "High-end social media management, creative delivery and client sign-off portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased selection:bg-aura-primary/10`}
      >
        <ViewModeProvider>
          <ContentWorkflowProvider>
            <AppShell>{children}</AppShell>
          </ContentWorkflowProvider>
        </ViewModeProvider>
      </body>
    </html>
  );
}
