import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/provider";
import ClientOnlyToaster from "@/components/actions/Toast";

// Load Nunito font
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata = {
  title: "WELCOME TO BLUEPRINT!",
  description: "All in One Application for project management.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <Providers>
          <ClientOnlyToaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}