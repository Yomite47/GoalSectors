import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  if (!isOpen) return null;

  const features = [
    "Unlimited AI Coach requests",
    "Advanced Goal Breakdown",
    "Priority Support",
    "Early access to new features"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 backdrop-blur-md border border-white/30">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Go Premium</h2>
            <p className="text-indigo-100">Supercharge your productivity</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <span className="text-4xl font-extrabold text-gray-900">$1</span>
            <span className="text-gray-500 font-medium">/month</span>
            <p className="text-xs text-gray-400 mt-2">Cancel anytime. Secure checkout via Stripe.</p>
          </div>

          {/* Action */}
          <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            Upgrade Now
          </button>

          <button 
            onClick={onClose}
            className="w-full mt-4 py-2 text-gray-400 font-medium text-sm hover:text-gray-600"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
