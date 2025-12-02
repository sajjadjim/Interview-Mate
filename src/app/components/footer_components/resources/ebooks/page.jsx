import { BookOpen, Code2, Wrench, Briefcase, Globe2, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Free E-Books & Learning Resources | InterviewMate",
  description:
    "Hand-picked free e-books and online resources to practice programming, engineering, business and non-tech skills.",
};

const categories = [
  {
    id: "programming",
    label: "Programming & Computer Science",
    icon: Code2,
    accent: "from-blue-500 to-indigo-500",
    resources: [
      {
        title: "Eloquent JavaScript (3rd Edition)",
        description: "Modern introduction to JavaScript with exercises and interactive examples.",
        level: "Beginner–Intermediate",
        type: "Online Book (HTML / PDF)",
        link: "https://eloquentjavascript.net/",
      },
      {
        title: "Automate the Boring Stuff with Python",
        description: "Learn Python by building small automation scripts and real-life tools.",
        level: "Beginner",
        type: "Online Book",
        link: "https://automatetheboringstuff.com/",
      },
      {
        title: "CS50 – Introduction to Computer Science",
        description: "Harvard’s famous free CS course – great foundation for interviews.",
        level: "Beginner",
        type: "Free Course + Notes",
        link: "https://cs50.harvard.edu/x/",
      },
      {
        title: "MIT OpenCourseWare – Algorithms",
        description: "Free lecture notes and assignments for algorithms and data structures.",
        level: "Intermediate–Advanced",
        type: "Course Notes / PDFs",
        link: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering Fundamentals",
    icon: Wrench,
    accent: "from-emerald-500 to-teal-500",
    resources: [
      {
        title: "OpenStax Engineering Textbooks",
        description: "Free peer-reviewed textbooks for electrical, mechanical and more.",
        level: "Undergraduate",
        type: "PDF Textbooks",
        link: "https://openstax.org/subjects/science",
      },
      {
        title: "NPTEL Engineering Courses",
        description: "Video lectures from Indian IIT professors on core engineering topics.",
        level: "Undergraduate–Advanced",
        type: "Video + Notes",
        link: "https://nptel.ac.in/courses",
      },
      {
        title: "Khan Academy – Physics & Math",
        description: "Build strong math and physics foundations for technical interviews.",
        level: "Beginner–Intermediate",
        type: "Videos + Practice",
        link: "https://www.khanacademy.org/",
      },
    ],
  },
  {
    id: "business",
    label: "Business, Commercial & Management",
    icon: Briefcase,
    accent: "from-amber-500 to-orange-500",
    resources: [
      {
        title: "OpenStax – Introduction to Business",
        description: "Free textbook covering marketing, finance, HR and operations basics.",
        level: "Beginner",
        type: "PDF Textbook",
        link: "https://openstax.org/details/books/introduction-business",
      },
      {
        title: "Investopedia Guides",
        description: "Clear explanations of finance, accounting, investing and market terms.",
        level: "Beginner–Intermediate",
        type: "Web Articles",
        link: "https://www.investopedia.com/",
      },
      {
        title: "Coursera – Project Management Basics (Audit Free)",
        description: "Learn fundamentals of planning, tracking and delivering projects.",
        level: "Beginner",
        type: "Free Course (Audit)",
        link: "https://www.coursera.org/search?query=project%20management&index=prod_all_launched_products_term_optimization",
      },
    ],
  },
  {
    id: "nontech",
    label: "Non-Tech & Soft Skills",
    icon: Globe2,
    accent: "from-fuchsia-500 to-purple-500",
    resources: [
      {
        title: "Improve Your English Communication Skills",
        description: "Free MOOC tracks focused on speaking confidently in professional settings.",
        level: "Beginner–Intermediate",
        type: "Free Course (Audit)",
        link: "https://www.coursera.org/specializations/improve-english",
      },
      {
        title: "MindTools – Soft Skills Articles",
        description: "Short reads on leadership, teamwork, time management and more.",
        level: "All levels",
        type: "Web Articles",
        link: "https://www.mindtools.com/",
      },
      {
        title: "O’Reilly – Free Open Books (Selected)",
        description: "A small collection of free books on career, culture and productivity.",
        level: "All levels",
        type: "PDF / Online Book",
        link: "https://www.oreilly.com/openbook/",
      },
    ],
  },
];

export default function EbooksPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-12">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">
              Resources • Free E-Books
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              Practice with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                free online books & courses
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              We collected some of the best free resources on the internet so you can
              practice programming, engineering, business and soft skills alongside your
              InterviewMate journey.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  How to use this page
                </p>
                <p className="text-[11px] text-slate-500">
                  Pick a category that matches your goal and start with beginner-friendly
                  resources. Save links or add them to your learning routine.
                </p>
              </div>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1.5">
              <li>• Programming & CS – for coding interviews and logic.</li>
              <li>• Engineering – for technical core subjects.</li>
              <li>• Business & Commercial – for non-tech and management roles.</li>
              <li>• Non-Tech – communication, soft skills and career growth.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section
                key={category.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
              >
                <header className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${category.accent} text-white`}
                    >
                      <Icon size={18} />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {category.label}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Hand-picked free learning resources.
                      </p>
                    </div>
                  </div>
                </header>

                <ul className="space-y-3">
                  {category.resources.map((res) => (
                    <li
                      key={res.title}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-200 transition-colors p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {res.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {res.level}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {res.type}
                          </span>
                        </div>
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
                        >
                          Open resource
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
