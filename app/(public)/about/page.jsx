
'use client'
import { Sparkle } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 animate-fadein-custom border border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center justify-center bg-green-100 text-green-600 rounded-full p-3"><Sparkle size={32} /></span>
          <h1 className="text-3xl font-bold text-green-600">About ShopVibe</h1>
        </div>
        <p className="mb-6 text-lg text-slate-700">ShopVibe is your one-stop destination for discovering, shopping, and supporting unique stores and products. We empower sellers and delight buyers with a seamless, secure, and enjoyable online shopping experience.</p>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Our Mission</h2>
          <p className="text-slate-600">To connect passionate sellers with enthusiastic buyers, fostering a vibrant marketplace built on trust, innovation, and customer satisfaction.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-600">
            <li>Curated selection of quality products</li>
            <li>Easy and secure checkout</li>
            <li>Responsive customer support</li>
            <li>Empowering small businesses and entrepreneurs</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2 text-green-700">Join the Vibe!</h2>
          <p className="text-slate-600">Whether you’re a shopper or a seller, ShopVibe is here to help you thrive. Thank you for being part of our community!</p>
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
