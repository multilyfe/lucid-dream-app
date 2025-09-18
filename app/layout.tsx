import "./globals.css";
import ThemeController from "./components/ThemeController";
export const metadata = {
  title: "Lucid Dream Temple RPG",
  description: "Single-file emergent dream journal RPG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeController />
        <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
          {children}
        </div>
      </body>
    </html>
  );
}
