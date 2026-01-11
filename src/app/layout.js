import { AuthProvider } from "@/context/AuthContext";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SupportChat from "./components/SupportChat"; // <--- 1. Import the component
import "./globals.css";

export const metadata = {
  title: "InterviewMate",
  description: "Mock interviews and career support platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <SupportChat />       
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}