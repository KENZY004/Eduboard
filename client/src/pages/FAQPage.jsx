import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      id: "qs-1",
      category: "getting-started",
      categoryLabel: "Getting Started",
      question: "How do I create a whiteboard session?",
      answer: (
        <>
          Creating a whiteboard session is simple:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Sign up or log in to your Eduboard account.</li>
            <li>Click <strong>Dashboard</strong> from the navbar.</li>
            <li>Click <strong>New Board</strong>, give it a name and choose your subject.</li>
            <li>Your infinite canvas is ready - start drawing, annotating, or uploading!</li>
          </ul>
          As a teacher you'll also get a unique <strong>Room Code</strong> that students can use to join instantly.
        </>
      ),
    },
    {
      id: "qs-2",
      category: "getting-started",
      categoryLabel: "Getting Started",
      question: "Do students join a session with a room code?",
      answer: (
        <>
          Students don't need to create a board from scratch:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Sign up or log in as a <strong>Student</strong>.</li>
            <li>On the dashboard, click <strong>Join a Board</strong>.</li>
            <li>Enter the <strong>Room Code</strong> shared by your teacher.</li>
            <li>You'll instantly enter the live collaborative whiteboard.</li>
          </ul>
          Room codes are case-insensitive and expire when the teacher ends the session.
        </>
      ),
    },
    {
      id: "qs-3",
      category: "getting-started",
      categoryLabel: "Getting Started",
      question: "Is Eduboard free to use?",
      answer: (
        <>
          Yes! Eduboard offers a <strong>free plan</strong> for both teachers and students with access to core features - infinite canvas, real-time collaboration, drawing tools, and room codes. Premium features (advanced admin controls, export options, etc.) may be available in future plans.
        </>
      ),
    },
    {
      id: "collab-1",
      category: "collaboration",
      categoryLabel: "Collaboration",
      question: "How does real-time collaboration work?",
      answer: (
        <>
          Eduboard uses <strong>WebSockets</strong> for real-time, bidirectional communication. Here's what that means for you:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Every stroke, shape, or sticky note you draw appears on all participants' screens in milliseconds.</li>
            <li>You can see <strong>live cursors</strong> of all active users on the canvas.</li>
            <li>Changes sync automatically - no need to refresh the page.</li>
          </ul>
          You need a stable internet connection for the best experience, though minor disconnections are handled gracefully.
        </>
      ),
    },
    {
      id: "collab-2",
      category: "collaboration",
      categoryLabel: "Collaboration",
      question: "How many students can join a single board?",
      answer: (
        <>
          Eduboard supports <strong>unlimited participants</strong> on a single board. Whether it's a small group of 5 or a large class of 100+, everyone can collaborate simultaneously. Performance may vary based on your device and network speed with very large groups.
        </>
      ),
    },
    {
      id: "collab-3",
      category: "collaboration",
      categoryLabel: "Collaboration",
      question: "Can teachers control what students can do on the board?",
      answer: (
        <>
          Absolutely. Eduboard has a <strong>role-based access</strong> system:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li><strong>Teachers</strong> have full control - draw, erase, lock sections, manage permissions.</li>
            <li><strong>Students</strong> can draw and collaborate by default, but teachers can set boards to <em>view-only</em> mode for presentations.</li>
            <li>Teachers can monitor student activity and participation in real time.</li>
          </ul>
        </>
      ),
    },
    {
      id: "boards-1",
      category: "boards",
      categoryLabel: "Boards & Saving",
      question: "How do I save my whiteboard?",
      answer: (
        <>
          Eduboard <strong>auto-saves</strong> your board as you work - no manual save needed. You can also:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Access all your boards anytime from the <strong>Dashboard</strong>.</li>
            <li>Use the <strong>Export</strong> option (teacher accounts) to download the board as an image.</li>
            <li>Share a board link directly with others for view access.</li>
          </ul>
          Boards are tied to your account and stored securely in the cloud.
        </>
      ),
    },
    {
      id: "boards-2",
      category: "boards",
      categoryLabel: "Boards & Saving",
      question: "Can I reuse a board from a previous session?",
      answer: (
        <>
          Yes! All your past boards are saved in your <strong>Dashboard</strong>. You can:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Open and edit any saved board at any time.</li>
            <li>Use a board as a <strong>template</strong> for future lessons.</li>
            <li>Organize boards by class or subject for easy access.</li>
          </ul>
        </>
      ),
    },
    {
      id: "boards-3",
      category: "boards",
      categoryLabel: "Boards & Saving",
      question: "How do I share a board with others?",
      answer: (
        <>
          There are two ways to share:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li><strong>Room Code:</strong> Share the code with students so they can join the live session.</li>
            <li><strong>Share Link:</strong> Generate a read-only link from the board settings and send it via email or chat.</li>
          </ul>
          Export options (Image/PDF) are also available for offline sharing.
        </>
      ),
    },
    {
      id: "devices-1",
      category: "devices",
      categoryLabel: "Devices & Access",
      question: "What devices and browsers does Eduboard support?",
      answer: (
        <>
          Eduboard is fully responsive and works on:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li><strong>Desktops/Laptops</strong> - Chrome, Firefox, Edge, Safari (latest versions).</li>
            <li><strong>Tablets</strong> - iPad, Android tablets (touch-friendly canvas).</li>
            <li><strong>Mobiles</strong> - iOS and Android smartphones.</li>
          </ul>
          For the best drawing experience, we recommend using a <strong>stylus</strong> or drawing tablet/display on a desktop or iPad. No app download needed - it runs entirely in the browser.
        </>
      ),
    },
    {
      id: "devices-2",
      category: "devices",
      categoryLabel: "Devices & Access",
      question: "Can I access my boards offline?",
      answer: (
        <>
          Real-time collaboration requires an active internet connection. However, previously saved boards can be <strong>viewed</strong> in limited offline mode if your browser has cached them. For reliable offline access, use the <strong>Export</strong> feature to download a snapshot of your board.
        </>
      ),
    },
    {
      id: "account-1",
      category: "account",
      categoryLabel: "Account & Password",
      question: "How do I reset my password?",
      answer: (
        <>
          To reset your password:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>Click <strong>"Sign In"</strong> on the Eduboard homepage.</li>
            <li>Select <strong>"Forgot Password?"</strong> below the login form.</li>
            <li>Enter your registered email address.</li>
            <li>Check your inbox for a password reset link (valid for 24 hours).</li>
            <li>Click the link and set a new password.</li>
          </ul>
          If you don't receive the email, check your spam folder or contact our <a href="/contact" className="text-blue-400 hover:underline">support team</a>.
        </>
      ),
    },
    {
      id: "account-2",
      category: "account",
      categoryLabel: "Account & Password",
      question: "Can I change my username or email address?",
      answer: (
        <>
          Yes. Go to your <strong>Profile Settings</strong> (click your avatar in the dashboard) to update your username or email. Changes to your email require a verification link sent to the new address before they take effect.
        </>
      ),
    },
    {
      id: "account-3",
      category: "account",
      categoryLabel: "Account & Password",
      question: "How do I delete my account?",
      answer: (
        <>
          You can delete your account from <strong>Profile Settings &gt; Danger Zone &gt; Delete Account</strong>. This action is permanent and will remove all your boards and data. We recommend exporting important boards before deletion. For assistance, contact our <a href="/contact" className="text-blue-400 hover:underline">support team</a>.
        </>
      ),
    },
    {
      id: "account-4",
      category: "account",
      categoryLabel: "Account & Password",
      question: "Is my data secure on Eduboard?",
      answer: (
        <>
          Yes. Eduboard takes data privacy seriously:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
            <li>All data is transmitted over <strong>HTTPS</strong>.</li>
            <li>Passwords are hashed - never stored in plain text.</li>
            <li>Boards are private to your account by default.</li>
            <li>We comply with standard data protection practices.</li>
          </ul>
          For details, see our <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a>.
        </>
      ),
    },
  ];

  // Filter and Search logic
  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const uniqueCategories = [{ id: "all", label: "All" }, ...new Map(faqData.map(item => [item.category, { id: item.category, label: item.categoryLabel }])).values()];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeCategory !== "all") {
      setActiveCategory("all");
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen selection:bg-purple-500 selection:text-white pb-20">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="text-center pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Glow effect matching Eduboard dark mode */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950/0 to-transparent pointer-events-none"></div>

        <h1 className="font-bold text-[clamp(2.5rem,5vw,4rem)] bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-[1.15] tracking-tight mb-6 relative z-10">
          Frequently Asked Questions
        </h1>

        <p className="text-slate-400 text-lg max-w-[620px] mx-auto mb-10 leading-relaxed relative z-10">
          Everything you need to know about Eduboard. Can't find an answer? Reach out to our support team.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-[600px] mx-auto relative z-10">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-white outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 placeholder:text-slate-500 shadow-xl shadow-black/20"
          />
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div className="max-w-[800px] mx-auto px-4 flex flex-wrap gap-2.5 justify-center mb-12">
        {uniqueCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSearchQuery("");
            }}
            className={`text-sm sm:text-base px-5 py-2.5 rounded-full border cursor-pointer transition-all duration-300 ${
              activeCategory === cat.id
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ LIST */}
      <div className="max-w-[800px] mx-auto px-4 space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <span className="text-4xl block mb-4">🔍</span>
            <h3 className="text-xl font-semibold mb-2">No questions found matching your search.</h3>
            <p className="text-slate-400">
              Try different keywords or <a href="/contact" className="text-blue-400 hover:underline">contact support</a>.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-purple-500/50 shadow-lg shadow-purple-500/10" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 bg-transparent border-none p-5 sm:p-6 text-left cursor-pointer transition-colors duration-300 group"
                >
                  <span className={`text-base sm:text-lg font-semibold transition-colors ${isOpen ? "text-purple-400" : "text-slate-200 group-hover:text-white"}`}>
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 bg-purple-500/20 text-purple-400"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="transition-[max-height] duration-300 ease-in-out overflow-hidden"
                  style={{ maxHeight: isOpen ? "1000px" : "0px" }}
                >
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-slate-400 text-sm sm:text-base leading-relaxed border-t border-slate-800/50 mt-2 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CTA SECTION */}
      <section className="max-w-[800px] mx-auto mt-20 p-8 sm:p-12 text-center bg-slate-900/50 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Still have questions?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            Our support team is happy to help you get started with Eduboard.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/contact" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-none text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg shadow-purple-500/25 hover:-translate-y-1">
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}