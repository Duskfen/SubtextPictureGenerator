import "@/styles/globals.scss";
import "@/styles/Controls.scss";
import "@/styles/slider.css";
import "@/styles/switch.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subtext Picture Generator",
  description:
    "Renders an image based on a Subtext article link, to fasten the process of creating a standardized social media appearance",
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
