import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import "./globals.css";


export const metadata = {
  title: "InterviewMate",
  description: "Mock interviews and career support platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
