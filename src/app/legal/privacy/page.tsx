import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to GoalSectors. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you visit our website 
          and tell you about your privacy rights and how the law protects you.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Data We Collect</h2>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Identity Data:</strong> includes username or similar identifier.</li>
          <li><strong>Contact Data:</strong> includes email address.</li>
          <li><strong>Usage Data:</strong> includes information about how you use our website, products and services (goals, habits, tasks).</li>
          <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. AI Processing</h2>
        <p className="mb-4">
          GoalSectors uses Artificial Intelligence (AI) to provide coaching services. Data you input into the chat interface 
          is processed by our AI providers (e.g., OpenAI) to generate responses. We do not use your personal data to train 
          public AI models without your explicit consent.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
          used or accessed in an unauthorized way, altered or disclosed.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our privacy practices, please contact us at support@goalsectors.com.
        </p>
      </div>
    </div>
  );
}
