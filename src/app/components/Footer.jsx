import Link from "next/link";
import { Linkedin, Instagram, Facebook, MessageSquare } from "lucide-react";

// simple "X" icon (Twitter) as inline svg to avoid extra deps
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M18.9 2H21l-6.5 7.4L22 22h-5.6l-4.3-5.7L6 22H3.9l7.1-8.1L2 2h5.7l3.9 5.2L18.9 2Zm-2 18h1.6L7.2 4H5.6l11.3 16Z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Top row: logo/mission + link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
          {/* Brand / mission */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-extrabold tracking-wide text-white">
              Interview<span className="inline-block rotate-10">Mate</span>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-gray-200">
              On a mission to change how the <span className="text-yellow-400 font-semibold">world interviews forever</span>
            </p>
          </div>

          {/* Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            <FooterCol title="Products" links={[
              ["Outsource tech interviews", "components/footer_components/products/outsource_tech_interviews"],
              ["Practice mock questions", "components/footer_components/products/practice_mock_question"],
            ]} />
            <FooterCol title="Solutions" links={[
              ["Product enterprises", "#"],
              ["IT Services", "#"],
              ["IT Staffing", "#"],
              ["Startups", "#"],
              ["Universities/Colleges", "#"],
            ]} />
            <FooterCol title="Resources" links={[
              ["Blogs", "#"],
              ["Case Study", "#"],
              ["Ebooks", "#"],
              ["Whitepapers", "#"],
              ["Sitemap", "#"],
            ]} />
            <FooterCol title="Company" links={[
              ["Why Intervue?", "#"],
              ["Pricing", "components/footer_components/company/pricing"],
              ["Contact us", "contact"],
            ]} />
            {/* <FooterCol title="Compare" links={[
              ["Vs Karat", "#"],
              ["Vs Incruiter", "#"],
              ["Vs Interviewvector", "#"],
              ["Vs Barraiser", "#"],
            ]} /> */}
          </div>
        </div>

        {/* Divider */}
        <hr className="my-10 border-gray-700" />

        {/* Bottom row: socials + copyright */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-3">Follow us</p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="LinkedIn" className="p-2 rounded border border-gray-700 hover:border-gray-400">
                <Linkedin size={18} />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 rounded border border-gray-700 hover:border-gray-400">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="X" className="p-2 rounded border border-gray-700 hover:border-gray-400">
                <XIcon />
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded border border-gray-700 hover:border-gray-400">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <p className="text-gray-400">Intervue © {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Floating chat bubble (optional) */}
      <Link
        href="#"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white text-black shadow-lg hover:scale-105 transition"
        aria-label="Chat"
      >
        <MessageSquare size={20} />
      </Link>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
