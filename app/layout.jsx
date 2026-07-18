import "./globals.css";

export const metadata = {
  title: "RefactorFlow â€” Build with clarity",
  description: "A calm workspace for turning messy code into confident decisions.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}

