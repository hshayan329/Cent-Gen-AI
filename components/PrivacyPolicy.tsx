
import React from 'react';
import { Button } from './ui/Button';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter gradient-text">Privacy Protocol</h1>
        </div>
      </div>

      <div className="glass p-8 md:p-16 rounded-[48px] border-white/5 space-y-10 text-slate-300 leading-relaxed font-medium">
        <div className="text-center border-b border-white/5 pb-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Privacy Policy</h2>
          <p className="text-sky-400 font-black uppercase tracking-widest text-[10px]">Effective Date: 12-02-2026</p>
        </div>

        <section>
          <p className="mb-4">Welcome to Cent Gen AI.</p>
          <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit and use our website and AI services.</p>
          <p className="mt-4">By using Cent Gen AI, you agree to the terms of this Privacy Policy.</p>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-blue-500 pl-4">1. Information We Collect</h3>
          <p>We may collect the following types of information:</p>
          
          <div className="space-y-4 ml-4">
            <div>
              <h4 className="text-white font-bold uppercase text-xs mb-2">1.1 Personal Information</h4>
              <p className="text-sm">When you use our services, register, or make a payment, we may collect:</p>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number (if provided)</li>
                <li>Billing information</li>
                <li>Payment confirmation details</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase text-xs mb-2">1.2 Payment Information</h4>
              <p className="text-sm">Cent Gen AI accepts payments manually via:</p>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                <li>Google payment links</li>
                <li>Credit/Debit cards</li>
                <li>Bank transfers</li>
              </ul>
              <p className="mt-2 text-sm italic">We do not store your full card details on our servers. Payments are processed through secure third-party payment providers. We only receive payment confirmation and limited transaction details.</p>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase text-xs mb-2">1.3 Usage Data</h4>
              <p className="text-sm">We may automatically collect:</p>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Pages visited</li>
                <li>Time spent on our website</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase text-xs mb-2">1.4 AI Input Data</h4>
              <p className="text-sm">When you use our AI tools (such as image generation, content creation, etc.), we may temporarily process:</p>
              <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
                <li>Text prompts</li>
                <li>Uploaded images</li>
                <li>Generated outputs</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-purple-500 pl-4">2. How We Use Your Information</h3>
          <p>We use collected information to:</p>
          <ul className="list-disc ml-6 space-y-2 text-sm">
            <li>Provide and operate our AI services</li>
            <li>Process payments and confirm transactions</li>
            <li>Improve our website and user experience</li>
            <li>Respond to customer support requests</li>
            <li>Prevent fraud and misuse</li>
            <li>Send important updates regarding your account or services</li>
          </ul>
          <p className="font-bold text-white mt-4">We do not sell your personal data to third parties.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-emerald-500 pl-4">3. Data Storage and Security</h3>
          <p>We implement reasonable technical and organizational security measures to protect your information.</p>
          <p>However, no method of internet transmission or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-amber-500 pl-4">4. Third-Party Services</h3>
          <p>We may use trusted third-party services for:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Payment processing</li>
            <li>Website hosting</li>
            <li>Analytics</li>
            <li>AI infrastructure</li>
          </ul>
          <p>These third parties have their own privacy policies and are responsible for protecting your data under their systems.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-indigo-500 pl-4">5. Data Retention</h3>
          <p>We retain personal data only as long as necessary to:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Provide services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p>AI-generated content may be stored temporarily for service improvement and system monitoring.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-rose-500 pl-4">6. Your Rights</h3>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at:</p>
          <p className="font-black text-sky-400">📧 support@centgenai.app</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-cyan-500 pl-4">7. Children's Privacy</h3>
          <p>Cent Gen AI is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-widest border-l-4 border-teal-500 pl-4">8. Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date.</p>
        </section>

        <section className="space-y-4 border-t border-white/5 pt-10">
          <h3 className="text-xl font-black text-white uppercase tracking-widest">9. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <p className="font-black text-white uppercase tracking-widest">Cent Gen AI</p>
            <p className="text-sky-400 font-medium">Email: support@centgenai.app</p>
          </div>
        </section>

        <div className="pt-10 text-center">
          <Button onClick={onBack} className="rounded-2xl px-12 py-4 font-black uppercase tracking-widest text-xs">Acknowledge Policy</Button>
        </div>
      </div>
    </div>
  );
};
