import React, { useState } from 'react';

export default function FAQPage() {
  // --- State Hooks ---
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Static FAQ Data Structure ---
  const faqData = [
    {
      id: 'gs-1',
      category: 'getting-started',
      categoryLabel: 'Getting Started',
      question: 'How do I create a whiteboard session?',
      answer: (
        <>
          Creating a whiteboard session is simple:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Sign up or log in to your EduBoard account.</li>
            <li>Click <strong>Dashboard</strong> from the navbar.</li>
            <li>Hit <strong>"New Board"</strong>, give it a name and choose your subject.</li>
            <li>Your infinite canvas is ready — start drawing, annotating, or uploading!</li>
          </ul>
          As a teacher you'll also get a unique <strong>Room Code</strong> that students can use to join instantly.
        </>
      ),
    },
    {
      id: 'gs-2',
      category: 'getting-started',
      categoryLabel: 'Getting Started',
      question: 'How do students join a session with a room code?',
      answer: (
        <>
          Students don't need to create a board from scratch:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Sign up or log in as a <strong>Student</strong>.</li>
            <li>On the dashboard, click <strong>"Join a Board"</strong>.</li>
            <li>Enter the <strong>Room Code</strong> shared by your teacher.</li>
            <li>You'll instantly enter the live collaborative whiteboard.</li>
          </ul>
          Room codes are case-insensitive and expire when the teacher ends the session.
        </>
      ),
    },
    {
      id: 'gs-3',
      category: 'getting-started',
      categoryLabel: 'Getting Started',
      question: 'Is EduBoard free to use?',
      answer: (
        <>
          Yes! EduBoard offers a <strong>free plan</strong> for both teachers and students with access to core features — infinite canvas, real-time collaboration, drawing tools, and room codes. Premium features (advanced admin controls, export options, etc.) may be available in future plans.
        </>
      ),
    },
    {
      id: 'collab-1',
      category: 'collaboration',
      categoryLabel: 'Collaboration',
      question: 'How does real-time collaboration work?',
      answer: (
        <>
          EduBoard uses <strong>Socket.io</strong> for real-time, bidirectional communication. Here's what that means for you:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Every stroke, shape, or sticky note you draw appears on all participants' screens in milliseconds.</li>
            <li>You can see <strong>live cursors</strong> of all active users on the canvas.</li>
            <li>Changes sync automatically — no need to refresh the page.</li>
          </ul>
          You need a stable internet connection for the best experience, though minor disconnections are handled gracefully.
        </>
      ),
    },
    {
      id: 'collab-2',
      category: 'collaboration',
      categoryLabel: 'Collaboration',
      question: 'How many students can join a single board?',
      answer: (
        <>
          EduBoard supports <strong>unlimited participants</strong> on a single board. Whether it's a small group of 5 or a large class of 100+, everyone can collaborate simultaneously. Performance may vary based on your device and network speed with very large groups.
        </>
      ),
    },
    {
      id: 'collab-3',
      category: 'collaboration',
      categoryLabel: 'Collaboration',
      question: 'Can teachers control what students can do on the board?',
      answer: (
        <>
          Absolutely. EduBoard has a <strong>Role-Based Access</strong> system:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li><strong>Teachers</strong> have full control — draw, erase, lock sections, manage permissions.</li>
            <li><strong>Students</strong> can draw and collaborate by default, but teachers can set boards to <em>view-only</em> mode for presentations.</li>
            <li>Teachers can monitor student activity and participation in real time.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'boards-1',
      category: 'boards',
      categoryLabel: 'Boards & Saving',
      question: 'How do I save my whiteboard?',
      answer: (
        <>
          EduBoard <strong>auto-saves</strong> your board as you work — no manual save needed. You can also:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Access all your boards anytime from the <strong>Dashboard</strong>.</li>
            <li>Use the <strong>Export</strong> option (teacher accounts) to download the board as an image.</li>
            <li>Share a board link directly with others for view access.</li>
          </ul>
          Boards are tied to your account and stored securely in the cloud.
        </>
      ),
    },
    {
      id: 'boards-2',
      category: 'boards',
      categoryLabel: 'Boards & Saving',
      question: 'Can I reuse a board from a previous session?',
      answer: (
        <>
          Yes! All your past boards are saved in your <strong>Dashboard</strong>. You can:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Open and edit any saved board at any time.</li>
            <li>Use a board as a <strong>template</strong> for future lessons.</li>
            <li>Organize boards by class or subject for easy access.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'boards-3',
      category: 'boards',
      categoryLabel: 'Boards & Saving',
      question: 'How do I share a board with others?',
      answer: (
        <>
          There are two ways to share:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li><strong>Room Code</strong> — Share the code with students so they can join the live session.</li>
            <li><strong>Share Link</strong> — Generate a read-only link from the board settings and send it via email or chat.</li>
          </ul>
          Export options (image/PDF) are also available for offline sharing.
        </>
      ),
    },
    {
      id: 'devices-1',
      category: 'devices',
      categoryLabel: 'Devices & Access',
      question: 'What devices and browsers does EduBoard support?',
      answer: (
        <>
          EduBoard is fully responsive and works on:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li><strong>Desktop</strong> — Chrome, Firefox, Edge, Safari (latest versions)</li>
            <li><strong>Tablet</strong> — iPad, Android tablets (touch-friendly canvas)</li>
            <li><strong>Mobile</strong> — iOS and Android smartphones</li>
          </ul>
          For the best drawing experience, we recommend using a <strong>stylus or drawing tablet</strong> on a desktop or iPad. No app download needed — it runs entirely in the browser.
        </>
      ),
    },
    {
      id: 'devices-2',
      category: 'devices',
      categoryLabel: 'Devices & Access',
      question: 'Can I access my boards offline?',
      answer: (
        <>
          Real-time collaboration requires an active internet connection. However, previously saved boards can be <strong>viewed</strong> in limited offline mode if your browser has cached them. For reliable offline access, use the <strong>Export</strong> feature to download a snapshot of your board.
        </>
      ),
    },
    {
      id: 'account-1',
      category: 'account',
      categoryLabel: 'Account & Password',
      question: 'How do I reset my password?',
      answer: (
        <>
          To reset your password:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>Click <strong>"Sign In"</strong> on the EduBoard homepage.</li>
            <li>Select <strong>"Forgot Password?"</strong> below the login form.</li>
            <li>Enter your registered email address.</li>
            <li>Check your inbox for a password reset link (valid for 24 hours).</li>
            <li>Click the link and set a new password.</li>
          </ul>
          If you don't receive the email, check your spam folder or contact <a href="#" className="text-[#9f67ff] hover:underline">support</a>.
        </>
      ),
    },
    {
      id: 'account-2',
      category: 'account',
      categoryLabel: 'Account & Password',
      question: 'Can I change my username or email address?',
      answer: (
        <>
          Yes. Go to your <strong>Profile Settings</strong> (click your avatar in the dashboard) to update your username or email. Changes to your email require a verification link sent to the new address before they take effect.
        </>
      ),
    },
    {
      id: 'account-3',
      category: 'account',
      categoryLabel: 'Account & Password',
      question: 'How do I delete my account?',
      answer: (
        <>
          You can delete your account from <strong>Profile Settings → Danger Zone → Delete Account</strong>. This action is permanent and will remove all your boards and data. We recommend exporting important boards before deletion. For assistance, contact our <a href="#" className="text-[#9f67ff] hover:underline">support team</a>.
        </>
      ),
    },
    {
      id: 'account-4',
      category: 'account',
      categoryLabel: 'Account & Password',
      question: 'Is my data secure on EduBoard?',
      answer: (
        <>
          Yes. EduBoard takes data privacy seriously:
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li>All data is transmitted over <strong>HTTPS</strong>.</li>
            <li>Passwords are hashed — never stored in plain text.</li>
            <li>Boards are private to your account by default.</li>
            <li>We comply with standard data protection practices.</li>
          </ul>
          For details, see our <a href="#" className="text-[#9f67ff] hover:underline">Privacy Policy</a>.
        </>
      ),
    },
  ];

  // --- Filter and Search logic combined ---
  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const uniqueSections = [...new Set(filteredFAQs.map(faq => faq.category))];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeCategory !== 'all') {
      setActiveCategory('all');
    }
  };

  return (
    <div className="bg-[#0a0e1a] text-[#f1f5f9] font-sans antialiased min-h-screen selection:bg-purple-500 selection:text-white">
      
      {/* ─── HERO ───────────────────────────────── */}
      <section className="text-center pt-20 pb-14 px-5 relative overflow-hidden">
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.22)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="inline-block bg-[#7c3aed]/14 border border-[#7c3aed]/18 text-[#9f67ff] text-xs font-semibold tracking-widest uppercase px-3.5 py-1.25 rounded-full mb-5.5 animate-[fadeUp_0.5s_ease_both]">
          Help Center
        </div>
        
        <h1 className="font-['Sora'] font-bold text-[clamp(2rem,5vw,3.2rem)] bg-gradient-to-r from-[#c4b5fd] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent mb-4 leading-[1.15] tracking-tight animate-[fadeUp_0.5s_0.1s_ease_both]">
          Frequently Asked Questions
        </h1>
        
        <p className="text-[#94a3b8] text-base max-w-[520px] mx-auto mb-9 leading-relaxed animate-[fadeUp_0.5s_0.2s_ease_both]">
          Everything you need to know about EduBoard. Can't find an answer? Reach out to our support team.
        </p>

        <div className="max-w-[500px] mx-auto relative animate-[fadeUp_0.5s_0.3s_ease_both]">
          <input
            type="text"
            id="searchInput"
            placeholder="Search questions…"
            autoComplete="off"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#131929] border border-[#7c3aed]/18 rounded-xl pt-3.25 pb-3.25 pr-12 pl-4.5 text-[#f1f5f9] text-sm outline-none transition-all duration-200 focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.25)] placeholder:text-[#64748b]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none text-base">
            🔍
          </span>
        </div>
      </section>

      {/* ─── CATEGORIES FILTER ──────────────────── */}
      <div className="max-w-[860px] mx-auto mb-14 px-5 flex flex-wrap gap-2.5 justify-center">
        {[
          { label: 'All', id: 'all' },
          { label: 'Getting Started', id: 'getting-started' },
          { label: 'Collaboration', id: 'collaboration' },
          { label: 'Boards & Saving', id: 'boards' },
          { label: 'Devices & Access', id: 'devices' },
          { label: 'Account & Password', id: 'account' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setSearchQuery('');
            }}
            className={`text-xs sm:text-sm font-medium px-4.5 py-1.75 rounded-full border cursor-pointer transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                : 'bg-[#131929] border-[#7c3aed]/18 text-[#94a3b8] hover:bg-[#7c3aed] hover:border-[#7c3aed] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── FAQ CONTAINER ──────────────────────── */}
      <div className="max-w-[760px] mx-auto px-5 pb-20">
        {uniqueSections.map((sectionSlug) => {
          const sectionFAQs = filteredFAQs.filter(f => f.category === sectionSlug);
          const sectionTitle = sectionFAQs[0]?.categoryLabel;

          return (
            <div key={sectionSlug} className="mb-12">
              <div className="font-['Sora'] text-xs font-semibold tracking-wider uppercase text-[#9f67ff] mb-4.5 flex items-center gap-2.5">
                {sectionTitle}
                <div className="flex-1 h-px bg-[#7c3aed]/18" />
              </div>

              <div className="space-y-2.5">
                {sectionFAQs.map((faq) => {
                  const isOpen = openIndex === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`bg-[#131929] border rounded-[14px] overflow-hidden transition-all duration-250 ${
                        isOpen 
                          ? 'border-[#7c3aed] shadow-[0_0_0_1px_rgba(124,58,237,0.25),0_4px_24px_rgba(124,58,237,0.12)]' 
                          : 'border-[#7c3aed]/18 hover:border-[#7c3aed]/55'
                      }`}
                    >
                      <button
                        onClick={() => toggleAccordion(faq.id)}
                        aria-expanded={isOpen ? "true" : "false"}
                        className="w-full flex items-center justify-between gap-4 bg-none border-none p-5 text-[#f1f5f9] text-[14.5px] font-medium text-left cursor-pointer transition-colors duration-200"
                      >
                        <span className={isOpen ? 'text-[#9f67ff]' : ''}>{faq.question}</span>
                        <span
                          className={`flex-shrink-0 w-6.5 h-6.5 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                            isOpen 
                              ? 'rotate-45 bg-[#7c3aed] text-white' 
                              : 'bg-[#131929] border border-[#7c3aed]/18 text-[#9f67ff]'
                          }`}
                        >
                          +
                        </span>
                      </button>

                      <div
                        className="transition-[max-height] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
                        style={{ maxHeight: isOpen ? '1000px' : '0px' }}
                      >
                        <div className="px-5 pb-5 text-[#94a3b8] text-sm leading-relaxed border-t border-[#7c3aed]/18 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-15 px-5 text-[#64748b]">
            <span className="text-4xl block mb-3">🔍</span>
            No questions found matching your search.<br />
            Try different keywords or <a href="#" className="text-[#9f67ff] hover:underline">contact support</a>.
          </div>
        )}
      </div>

      {/* ─── CTA SECTION ────────────────────────── */}
      <section className="bg-[#0f1629] border-t border-b border-[#7c3aed]/18 py-15 px-5 text-center">
        <div className="max-w-[540px] mx-auto bg-gradient-to-br from-[#7c3aed]/12 to-[#a855f7]/08 border border-[#7c3aed]/18 rounded-2xl p-8 sm:p-10">
          <h2 className="font-['Sora'] text-2xl font-bold mb-2.5">Still have questions?</h2>
          <p className="text-[#94a3b8] text-sm mb-6">Our support team is happy to help you get started with EduBoard.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border-none text-white text-sm font-semibold px-6 py-2.75 rounded-lg cursor-pointer transition-all duration-150 hover:opacity-88 hover:-translate-y-px">
              Contact Support
            </button>
            <button className="bg-none border border-[#7c3aed]/18 text-[#94a3b8] hover:border-[#7c3aed] hover:text-[#f1f5f9] text-sm font-medium px-6 py-2.75 rounded-lg cursor-pointer transition-colors duration-200">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="bg-[#0a0e1a] border-t border-[#7c3aed]/18 p-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <h4 className="font-['Sora'] text-xs font-semibold text-[#f1f5f9] mb-1.5">Product</h4>
            <a href="features.html" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Features</a>
            <a href="about.html" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">About</a>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Dashboard</a>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-['Sora'] text-xs font-semibold text-[#f1f5f9] mb-1.5">Company</h4>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">About Us</a>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Contact</a>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-['Sora'] text-xs font-semibold text-[#f1f5f9] mb-1.5">Resources</h4>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Documentation</a>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Support</a>
            <a href="faq.html" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">FAQ</a>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-['Sora'] text-xs font-semibold text-[#f1f5f9] mb-1.5">Legal</h4>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Privacy Policy</a>
            <a href="#" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors mb-0.5">Terms of Service</a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#7c3aed]/18 max-w-[1100px] mx-auto text-xs text-[#94a3b8]">
          <div className="flex items-center gap-2 font-['Sora']">
            <div className="w-7 h-7 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded flex items-center justify-center text-[11px] text-white">⚡</div>
            © 2026 EduBoard. All rights reserved.
          </div>
          <div className="flex gap-4 text-base">
            <a href="#" title="GitHub" className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">⌨</a>
            <a href="#" title="Twitter" className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">𝕏</a>
            <a href="#" title="LinkedIn" className="text-[#64748b] hover:text-[#f1f5f9] transition-colors">in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}