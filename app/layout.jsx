import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Runs before first paint so a stored dark preference does not flash light.
const themeScript = `(function(){try{var p=localStorage.getItem("refactorflow-theme-preference");var r;if(p==="dark"||p==="light"){r=p;}else if(p==="system"){r=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}else{r=localStorage.getItem("refactorflow-theme")==="dark"?"dark":"light";}document.documentElement.classList.toggle("dark",r==="dark");}catch(e){}})();`;

export const metadata = {
  metadataBase: new URL(appUrl),
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
