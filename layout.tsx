import "./globals.css";

export const metadata = {
  title: "Delivery Dashboard",
  description: "Project Delivery Tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}