// This is a React component for your Next.js page.
// It uses TailwindCSS for styling. You can adjust the classes to fit your design.

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800">
      
      {/* === 1. Hero Section === */}
      <section className="text-center py-20 px-6 bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          About Interview Mate
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          Bridging the Gap Between Ambitious Talent and Innovative Companies.
        </p>
      </section>

      {/* === 2. Our Mission Section === */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              Landing your dream job is more than just a good resume. It’s about
              communication, confidence, and connection. We saw countless
              talented students struggling to showcase their skills in a
              high-pressure interview setting.
            </p>
            <p className="text-lg text-gray-700">
              On the other side, we saw companies searching for the right talent
              but buried in applications. **Interview Mate was born to fix
              this.** We create a direct, real-time bridge, helping students
              prove their skills and recruiters find the perfect fit.
            </p>
          </div>
          <div>
            {/* You can place an illustrative image here */}
            {/* Example:  */}
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">[Image: Teamwork or Connection]</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="max-w-5xl mx-auto" />

      {/* === 3. What We Do (For Students & HR) === */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">How We Help</h2>
          <p className="text-lg text-gray-700">
            We provide a dedicated platform for topic-specific, real-time
            interviewing that benefits everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* For Students */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-blue-600 mb-3">
              For Students
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                **Practice Perfection:** Take demo interviews on your own time
                to build confidence.
              </li>
              <li>
                **Real-World Experience:** Participate in live, scheduled
                interviews with real company HRs.
              </li>
              <li>
                **Showcase Your Skills:** Prove your knowledge on the exact
                topics you excel in.
              </li>
              <li>
                **Get Discovered:** Connect directly with companies that are
                actively hiring.
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold text-green-600 mb-3">
              For Company HR
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                **Discover Top Talent:** Move beyond resumes and see candidates
                in action.
              </li>
              <li>
                **Streamline Hiring:** Easily find and schedule candidates for
                topic-specific interviews.
              </li>
              <li>
                **Real-Time Evaluation:** Conduct live video interviews to
                assess skills and cultural fit instantly.
              </li>
              <li>
                **Build Your Talent Pipeline:** Connect with promising students
                before they even graduate.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* === 4. Our Technology Section === */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Our Technology</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          We believe in a seamless experience. Our platform is built using
          modern, advanced technologies like **Next.js** to ensure it is
          fast, reliable, and secure. We focus on providing a crystal-clear,
          real-time video connection so you can focus on the conversation, not
          the connection quality.
        </p>
      </section>

      {/* === 5. Call to Action (CTA) Section === */}
      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Take the Next Step?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Whether you're a student ready to launch your career or a recruiter
          looking for the next great hire, your journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register/student"
            className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
          >
            Sign Up as a Student
          </a>
          <a
            href="/register/company"
            className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
          >
            Register as a Company
          </a>
        </div>
      </section>
    </div>
  );
}