import React from "react";

const sections = [
  {
    title: "Introduction",
    content:
      "Welcome to EduBoard. By accessing or using our platform, you agree to comply with these Terms of Service. Please read them carefully before using our services.",
  },
  {
    title: "User Responsibilities",
    content:
      "Users are responsible for maintaining the confidentiality of their accounts, providing accurate information, and using the platform responsibly.",
  },
  {
    title: "Acceptable Usage",
    content:
      "You agree not to misuse the platform, attempt unauthorized access, distribute harmful content, or violate applicable laws while using EduBoard.",
  },
  {
    title: "Privacy & Data Handling",
    content:
      "EduBoard respects your privacy and handles your data securely. Information collected is used only to improve platform functionality and user experience.",
  },
  {
    title: "Third-Party Services",
    content:
      "Our platform may integrate with third-party tools or services. EduBoard is not responsible for the practices or policies of these external services.",
  },
  {
    title: "Limitations of Liability",
    content:
      "EduBoard is provided on an 'as is' basis. We are not liable for any direct, indirect, or incidental damages resulting from the use of our services.",
  },
  {
    title: "Termination Policy",
    content:
      "We reserve the right to suspend or terminate accounts that violate these Terms of Service or misuse the platform.",
  },
  {
    title: "Contact Information",
    content:
      "If you have any questions regarding these Terms of Service, please contact the EduBoard support team.",
  },
];

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using EduBoard services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-3 text-indigo-400">
                {section.title}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
