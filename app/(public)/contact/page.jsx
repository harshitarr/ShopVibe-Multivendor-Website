
'use client'
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 animate-fadein-custom border border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center bg-green-100 text-green-600 rounded-full p-3"><Mail size={32} /></span>
          <h1 className="text-3xl font-bold text-green-600">Contact Us</h1>
        </div>
        <p className="mb-6 text-lg text-slate-700">We’d love to hear from you! Whether you have a question, feedback, or need support, our team is here to help.</p>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Get in Touch</h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2"><Mail size={18} className="text-green-600" /><span className="font-semibold">Email:</span> <a href="mailto:support@shopvibe.com" className="text-green-600 underline">support@shopvibe.com</a></li>
            <li className="flex items-center gap-2"><span className="font-semibold">Phone:</span> <a href="tel:+1234567890" className="text-green-600 underline">+1 234 567 890</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2 text-green-700">Our Office</h2>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={18} className="text-green-600" />
            <span>123 Market Street, Suite 456, Cityville, Country 78910</span>
          </div>
        </div>
      </div>
      <style>{`
        .animate-fadein-custom {
          animation: fadein 1.1s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
