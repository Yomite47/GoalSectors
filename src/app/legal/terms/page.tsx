import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using GoalSectors, you accept and agree to be bound by the terms and provision of this agreement. 
          In addition, when using this websites owned or operated services, you and GoalSectors shall be subject to any 
          posted guidelines or rules applicable to such services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Service</h2>
        <p className="mb-4">
          GoalSectors provides an AI-powered productivity tool designed to help users manage goals, habits, and tasks. 
          The Service is provided "as is" and GoalSectors assumes no responsibility for the timeliness, deletion, 
          mis-delivery or failure to store any user communications or personalization settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. AI Disclaimer</h2>
        <p className="mb-4">
          The AI Coach provides suggestions based on your input. These suggestions are for informational and productivity 
          purposes only and should not be considered professional advice (medical, legal, financial, etc.). 
          You are solely responsible for the actions you take based on AI suggestions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. User Conduct</h2>
        <p className="mb-4">
          You agree to not use the Service to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Upload, post, email or otherwise transmit any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of anothers privacy, hateful, or racially, ethnically or otherwise objectionable;</li>
          <li>Harm minors in any way;</li>
          <li>Impersonate any person or entity.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, 
          including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  );
}
