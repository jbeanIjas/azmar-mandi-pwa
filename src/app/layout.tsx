import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { CartProvider } from "../context/CartContext";
import { LocationProvider } from "../context/LocationContext";
import Cart from "../components/Cart";
import BottomNav from "../components/BottomNav";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const viewport: Viewport = {
  themeColor: '#bd1d4b',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Azmar Mandi - Authentic Arabian Flavors",
  description: "Experience the true taste of Arabia at Azmar Mandi. Order online for delivery or pickup.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Azmar Mandi',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${playfair.variable}`}>
        <LocationProvider>
          <CartProvider>
            {children}
            <BottomNav />
            <Cart />
          </CartProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
