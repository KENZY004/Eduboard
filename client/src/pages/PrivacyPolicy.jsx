import React from "react";

const sections = [
  {
    title: "Introduction",
    content:
      "Welcome to EduBoard. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information while using our platform.",
  },
  {
    title: "Information We Collect",
    content:
      "We may collect personal information such as your name, email address, profile information, learning progress, and usage data when you interact with EduBoard.",
  },
  {
    title: "How We Use Your Information",
    content:
      "The information we collect helps us provide educational services, personalize your experience, improve platform performance, respond to support requests, and maintain security.",
  },
  {
    title: "Cookies & Tracking Technologies",
    content:
      "EduBoard may use cookies, local storage, and analytics technologies to remember preferences, improve functionality, analyze platform usage, and enhance your overall experience.",
  },
  {
    title: "Data Sharing",
    content:
      "We do not sell your personal information. We may share data only with trusted service providers that assist in operating the platform or when required by applicable law.",
  },
  {
    title: "Data Security",
    content:
      "We implement reasonable administrative and technical safeguards to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
  },
  {
    title: "Your Rights",
    content:
      "Depending on your location, you may have the right to access, update, correct, or request deletion of your personal information. You may also request information about how your data is processed.",
  },
  {
    title: "Third-Party Services",
    content:
      "EduBoard may integrate with third-party services such as authentication providers, analytics tools, or cloud hosting platforms. These providers operate under their own privacy policies.",
  },
  {
    title: "Children's Privacy",
    content:
      "Our platform is intended for educational purposes. If we become aware that personal information has been collected in violation of applicable laws, we will take appropriate steps to remove it.",
  },
  {
    title: "Policy Updates",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements, or security practices. The latest revision date will always appear on this page.",
  },
  {
    title: "Contact Information",
    content:
      "If you have any questions, concerns, or requests regarding this Privacy Policy, please contact the EduBoard support team at support@eduboard.com.",
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>

          <p className="text-slate-400 text-lg">
            Last Updated: May 2026
          </p>
        </div>

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

export default PrivacyPolicy;