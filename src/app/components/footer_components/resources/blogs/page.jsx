export const metadata = {
  title: "Interview Blogs | InterviewMate",
  description: "Interview tips, job hunting guides, and career growth blogs.",
};

const blogs = [
  {
    id: 1,
    title: "How to Prepare for Your First Technical Interview",
    excerpt:
      "From understanding the job description to solving live coding challenges, here’s a simple roadmap for your next technical interview.",
    tag: "Interview Tips",
    readTime: "8 min read",
    date: "2025-02-10",
    image:
      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    title: "The Ultimate Resume Checklist for Freshers",
    excerpt:
      "HRs spend less than 10 seconds scanning your resume. Make sure you pass the first filter with this simple resume checklist.",
    tag: "Resume & CV",
    readTime: "6 min read",
    date: "2025-01-28",
    image:
      "https://images.pexels.com/photos/5940710/pexels-photo-5940710.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    title: "Body Language Secrets for Online Interviews",
    excerpt:
      "Camera angle, lighting, and micro-expressions matter more than you think. Learn how to show confidence in virtual interviews.",
    tag: "Soft Skills",
    readTime: "5 min read",
    date: "2025-01-12",
    image:
      "https://images.pexels.com/photos/3985162/pexels-photo-3985162.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    title: "How HRs Shortlist Candidates in 2025",
    excerpt:
      "Get inside the HR mind: ATS filters, portfolio links, and what really makes them click on your profile.",
    tag: "HR Insights",
    readTime: "7 min read",
    date: "2025-01-05",
    image:
      "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    title: "Ace Remote Job Interviews From Your Bedroom",
    excerpt:
      "No fancy setup needed. Just a stable connection, good communication, and these 6 remote interview hacks.",
    tag: "Remote Jobs",
    readTime: "6 min read",
    date: "2024-12-22",
    image:
      "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 6,
    title: "Why Mock Interviews Boost Your Confidence 3×",
    excerpt:
      "Practice reduces anxiety and increases your offer chances. See how structured mock interviews change everything.",
    tag: "Mock Interviews",
    readTime: "4 min read",
    date: "2024-12-10",
    image:
      "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export default function BlogsPage() {
  const [featured, ...rest] = blogs;

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
              Blog • InterviewMate
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Learn how to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                crack your next interview
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              Curated guides, tips, and HR insights to help you prepare
              confidently for technical, HR, and remote interviews.
            </p>
          </div>

          {/* Small summary card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Why read these blogs?
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• Understand how HR and recruiters really think.</li>
              <li>• Learn how to present your skills with confidence.</li>
              <li>• Get practical advice for online and onsite interviews.</li>
            </ul>
            <p className="text-[11px] text-slate-400">
              New articles are added regularly based on real candidate
              experiences from InterviewMate.
            </p>
          </div>
        </div>
      </section>

      {/* Featured blog */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="grid md:grid-cols-[1.6fr_1.2fr] gap-6 items-stretch">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl shadow-sm bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-white/15 backdrop-blur border border-white/20 mb-2">
                {featured.tag}
              </span>
              <h2 className="text-lg md:text-xl font-semibold leading-snug">
                {featured.title}
              </h2>
              <p className="text-xs text-slate-100/90 mt-1 line-clamp-2">
                {featured.excerpt}
              </p>
              <p className="mt-2 text-[11px] text-slate-200">
                {new Date(featured.date).toLocaleDateString()} ·{" "}
                {featured.readTime}
              </p>
            </div>
          </div>

          {/* Highlight list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-700">
              Latest highlights
            </p>
            <div className="space-y-3">
              {rest.slice(0, 3).map((blog) => (
                <article
                  key={blog.id}
                  className="flex gap-3 items-start border-b last:border-b-0 border-slate-100 pb-3 last:pb-0"
                >
                  <div className="flex-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 mb-1">
                      {blog.tag}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {blog.readTime}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All blogs grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            All interview blogs
          </h2>
          <p className="text-[11px] text-slate-500">
            Showing {blogs.length} articles
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur">
                    {blog.tag}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-slate-600 mb-2 line-clamp-3">
                  {blog.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                  <span>{blog.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
