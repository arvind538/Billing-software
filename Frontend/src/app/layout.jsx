import "./globals.css";

import { Space_Grotesk, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from "@/components/Sidebar";



const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "Billing Software",
  description: "Shop billing and invoicing system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <CartProvider>
          <Sidebar />

          {children}
        </CartProvider>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}