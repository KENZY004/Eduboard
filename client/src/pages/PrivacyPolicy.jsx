import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

        <p className="text-slate-400 mb-10 text-center">
          Last Updated: May 2026
        </p>

        <div className="space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-slate-300 leading-7">
              Welcome to EduBoard. Your privacy is important to us. This Privacy
              Policy explains how we collect, use, and protect your information
              while using our platform.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
            <p className="text-slate-300 leading-7">
              We may collect personal information such as your name, email
              address, profile details, and usage data when you interact with
              EduBoard.
            </p>
          </section>

          {/* Use of Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Use of Information</h2>
            <p className="text-slate-300 leading-7">
              The collected information is used to improve user experience,
              provide support, personalize content, and maintain platform
              security.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
            <p className="text-slate-300 leading-7">
              EduBoard may use cookies and analytics tools to understand user
              behavior and improve performance.
            </p>
          </section>

          {/* Third Party */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Third-Party Services
            </h2>
            <p className="text-slate-300 leading-7">
              We may use trusted third-party services for authentication,
              analytics, and hosting. These services may process your data
              according to their own privacy policies.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">User Rights</h2>
            <p className="text-slate-300 leading-7">
              Users have the right to access, update, or request deletion of
              their personal information whenever applicable.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-slate-300 leading-7">
              If you have any questions regarding this Privacy Policy, please
              contact us at:
            </p>

            <p className="mt-3 text-indigo-400">support@eduboard.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
