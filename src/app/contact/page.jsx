"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send, Loader2, MessageSquare, User, Building2, Paperclip
} from "lucide-react";

/* ---------- animation presets ---------- */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } },
});

const staggerParent = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardChild = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true); setOk(false); setErr("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send");
      setOk(true);
      e.currentTarget.reset();
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <motion.h1
            {...fadeUp(0.05)}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900"
          >
            Let’s talk about your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              career
            </span>
          </motion.h1>
          <motion.p
            {...fadeUp(0.2)}
            className="mt-4 text-lg text-gray-600 max-w-2xl"
          >
            Questions about mock interviews, HR sessions, or partnerships? Drop us a message—our team replies within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Cards + Form */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact cards (stagger enter) */}
        <motion.div
          variants={staggerParent}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="lg:col-span-1 space-y-6"
        >
          <AnimatedCard>
            <ContactCard
              Icon={Mail}
              title="Email"
              lines={["support@interviewmate.app", "hr@interviewmate.app"]}
            />
          </AnimatedCard>

          <AnimatedCard>
            <ContactCard
              Icon={Phone}
              title="Phone / WhatsApp"
              lines={["+880 1XXX-XXXXXX", "+880 1XXX-XXXXXX"]}
            />
          </AnimatedCard>

          <AnimatedCard>
            <ContactCard
              Icon={MapPin}
              title="Office"
              lines={["Dhaka, Bangladesh", "Sun–Thu, 10:00–18:00"]}
            />
          </AnimatedCard>

          <AnimatedCard>
            <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur">
              <h3 className="font-semibold text-gray-900 mb-2">Follow us</h3>
              <p className="text-gray-600">Stay updated with product news and jobs.</p>
              <div className="mt-4 flex gap-3">
                {["LinkedIn", "Instagram", "Facebook", "X"].map((s) => (
                  <a key={s} href="#" className="text-gray-500 hover:text-gray-900 text-sm underline-offset-4 hover:underline">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Form (slide/fade in) */}
        <motion.div
          {...fadeUp(0.1)}
          className="lg:col-span-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center"
              >
                <MessageSquare size={18} />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send us a message</h3>
                <p className="text-sm text-gray-600">We usually respond within one business day.</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Field label="Full name" name="name" type="text" icon={<User size={16} />} placeholder="Your name" />
              <Field label="Email" name="email" type="email" icon={<Mail size={16} />} placeholder="you@example.com" />
              <SelectField label="I am" name="role" options={[
                { value: "student", label: "Student / Graduate" },
                { value: "hr", label: "HR / Recruiter" },
                { value: "company", label: "Company Representative" },
                { value: "other", label: "Other" },
              ]} icon={<Building2 size={16} />} />
              <SelectField label="Topic" name="topic" options={[
                { value: "mock", label: "Mock interview" },
                { value: "hr-session", label: "Real-time HR session" },
                { value: "jobs", label: "Job postings / partnership" },
                { value: "support", label: "Support" },
              ]} />
              <div className="md:col-span-2">
                <Field label="Subject" name="subject" type="text" placeholder="How can we help?" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="relative">
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    placeholder="Write your message..."
                  />
                  <Paperclip className="absolute right-3 bottom-3 text-gray-400" size={18} />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  By submitting, you agree to our Terms and Privacy Policy.
                </p>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 font-semibold shadow hover:opacity-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {loading ? "Sending…" : "Send message"}
                </motion.button>
              </div>

              {ok && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700"
                >
                  ✅ Your message has been sent. We’ll get back to you soon.
                </motion.div>
              )}
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700"
                >
                  ⚠️ {err}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-3xl overflow-hidden border border-gray-200"
          >
            <iframe
              title="Map"
              className="w-full h-72"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.3787596469056!2d90.32034184495217!3d23.876184268180584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8ada2664e21%3A0x3c872fd17bc11ddb!2sDaffodil%20International%20University!5e0!3m2!1sen!2sbd!4v1755290293025!5m2!1sen!2sbd"
            />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

/* ---------- small motion helpers ---------- */
function AnimatedCard({ children }) {
  return (
    <motion.div
      variants={cardChild}
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function ContactCard({ Icon, title, lines = [] }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-white/70 backdrop-blur shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
          <Icon size={18} />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="mt-3 space-y-1 text-gray-600 text-sm">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, icon }) {
  return (
    <motion.div variants={cardChild} initial="initial" whileInView="animate" viewport={{ once: true }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          name={name}
          type={type}
          required
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition ${icon ? "pl-10" : ""}`}
        />
      </div>
    </motion.div>
  );
}

function SelectField({ label, name, options, icon }) {
  return (
    <motion.div variants={cardChild} initial="initial" whileInView="animate" viewport={{ once: true }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <select
          name={name}
          required
          className={`w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition ${icon ? "pl-10" : ""}`}
          defaultValue=""
        >
          <option value="" disabled>Choose an option</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
