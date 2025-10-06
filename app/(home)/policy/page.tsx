import React from "react";

const policy = [
  {
    title: "1. Information We Collect",
    sections: [
      {
        subtitle: "A. Information You Provide",
        content: [
          "Personal information (name, phone number, email, address) when creating an account or placing orders.",
          "Payment information (credit card, bank details, mobile money, and billing address) for transaction purposes.",
          "Preferences, wish lists, and communication settings you select on our platform.",
          "Direct communications via email, WhatsApp, or contact forms.",
        ],
      },
      {
        subtitle: "B. Information We Collect Automatically",
        content: [
          "Device details (IP address, browser type, OS, referring URLs).",
          "Cookies and tracking technologies for site analytics and usability optimization.",
          "Shopping and browsing history on our site.",
        ],
      },
      {
        subtitle: "C. Optional Data",
        content: [
          "Survey responses and feedback.",
          "Marketing and promotional preferences.",
        ],
      },
    ],
  },
  {
    title: "2. Use of Information",
    content: [
      "Process, fulfill, and deliver your orders.",
      "Communicate about your orders, deliveries, returns, and inquiries.",
      "Personalize your shopping experience and provide tailored recommendations.",
      "Improve our website, products, and services through analytics.",
      "Send you updates or promotional communications (only with your consent).",
      "Detect and prevent fraud or security breaches.",
      "Comply with Ghanaian laws and international e-commerce standards.",
    ],
  },
  {
    title: "3. Sharing of Information",
    content: [
      "With payment processors and logistics partners for order completion.",
      "With authorized customer service staff only for support purposes.",
      "With legal authorities if required to comply with any applicable law or governmental request.",
      "With marketing service providers for outreach (with your explicit consent).",
      "We do NOT sell or rent your personal data to third parties.",
    ],
  },
  {
    title: "4. Data Storage and Security",
    content: [
      "Your data is stored on secure servers, protected by industry-standard encryption and security measures.",
      "We retain your personal information only as long as necessary: to fulfill the purposes outlined, to comply with legal obligations, and for record-keeping.",
      "Access is strictly limited to authorized Pakeru employees and partners bound by confidentiality.",
    ],
  },
  {
    title: "5. International Transfers",
    content: [
      "If we transfer your data outside Ghana (for example, to cloud servers or service providers), we ensure robust data protection standards are upheld as per Ghana’s DPA and global standards.",
    ],
  },
  {
    title: "6. Your Rights",
    content: [
      "Access and request a copy of your personal information.",
      "Rectify or update inaccuracies in your data.",
      "Request erasure of your data where legally applicable.",
      "Withdraw consent for marketing communications at any time.",
      "Object to or restrict data processing in line with local laws.",
      "To exercise these rights, contact us at privacypakeru@gmail.com.",
    ],
  },
  {
    title: "7. Cookies and Tracking",
    content: [
      "Pakeru uses cookies to maintain session security, remember preferences, and track shopping cart contents.",
      "We gather anonymized analytics about site usage.",
      "You can adjust your cookie preferences at any time in your browser settings.",
    ],
  },
  {
    title: "8. Children’s Privacy",
    content: [
      "Our website is not intended for use by individuals under 18 years of age.",
      "We do not knowingly collect personal data from minors. If we learn of such collection, we will take prompt action to delete the information.",
    ],
  },
  {
    title: "9. Updates to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in law, technology, or business operations.",
      "All changes will be posted on this page with a new effective date.",
      "Material changes will be communicated via email or site notification when appropriate.",
    ],
  },
];

export default function Policy() {
  return (
    <div className="w-full md:pt-40 pt-32 flex flex-col items-center px-6 sm:px-8 md:px-16 min-h-screen ">
      <h2 className="font-avenir uppercase  text-xl md:text-3xl">PRIVACY Policy</h2>
      <p className="pt-4 w-full md:w-[80%]  lg:w-[60%] xl:w-[50%] font-avenir text-lg">
        We are dedicated to protecting your privacy and personal data. This
        Privacy Policy explains how we collect, use, store, share, and safeguard
        your information when you use our website, shop with us, or interact
        with our services.
      </p>
        <div className="w-full md:w-[80%] lg:w-[60%] xl:w-[50%] mt-16 space-y-12">
        {policy.map((item, i) => (
          <div key={i}>
            <h3 className="font-avenir text-xl font-semibold mb-4">
              {item.title}
            </h3>

            {/* If section has subsections */}
            {item.sections ? (
              item.sections.map((sec, j) => (
                <div key={j} className="mb-6">
                  <p className="font-avenir font-medium mb-2">
                    {sec.subtitle}
                  </p>
                  <ul className="list-disc ml-6 space-y-1">
                    {sec.content.map((line, k) => (
                      <li key={k} className="font-avenir font-light text-lg">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <ul className="list-disc ml-6 space-y-2">
                {item.content.map((line, j) => (
                  <li key={j} className="font-avenir font-light text-lg">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
