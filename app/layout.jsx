import "./globals.css";

export const metadata = {
  title: {
    default: "RefactorFlow | Developer behavior intelligence",
    template: "%s | RefactorFlow",
  },
  description: "Measure how you code, not just whether your solution passed.",
  openGraph: {
    title: "RefactorFlow | Developer behavior intelligence",
    description: "Same answer. Completely different process.",
    siteName: "RefactorFlow",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
