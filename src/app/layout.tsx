import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Dîner des Entrepreneurs | Monsieur Chey - Big Five Lubumbashi",
  description: "Une rencontre entre entrepreneurs à Lubumbashi, le samedi 21 novembre 2026 de 15h00 à 19h00 au Big Five, près du Terminus Battant.",
  keywords: ["Dîner des Entrepreneurs", "Monsieur Chey", "Big Five Lubumbashi", "Lubumbashi", "RDC", "Entrepreneuriat", "Speed-networking"],
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Le Dîner des Entrepreneurs | Monsieur Chey - Big Five Lubumbashi",
    description: "Samedi 21 novembre 2026, de 15h00 à 19h00, au Big Five à Lubumbashi. Rencontres, échanges et speed-networking.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark scroll-smooth" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#141516" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Serif+Text:ital@0;1&family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#141516] text-[#a1a1a2] antialiased selection:bg-[#eabe7c] selection:text-[#141516]">
        {children}
      </body>
    </html>
  );
}
