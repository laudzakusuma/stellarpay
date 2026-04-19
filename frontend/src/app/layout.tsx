import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "StellarPay — Borderless Remittance",
  description:
    "Send USDC internationally in 5 seconds for less than $0.01. Split bills on-chain. Built on Stellar.",
  keywords: ["Stellar", "USDC", "remittance", "split bill", "DeFi", "Soroban"],
  authors: [{ name: "StellarPay" }],
  openGraph: {
    title: "StellarPay — Borderless Remittance",
    description: "Send money globally. Split bills transparently.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060B18",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#101828",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F1F5F9",
              fontFamily: "var(--font-outfit)",
            },
          }}
        />
      </body>
    </html>
  );
}
