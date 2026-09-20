import React from 'react';
import { Sofa, BedDouble, UtensilsCrossed, Bath, Sparkles, CheckCircle2 } from 'lucide-react';
import { HOUSE_CONTENTS } from '../data/chaletData';

const categoryIcons: Record<string, React.ReactNode> = {
  Sofa: <Sofa className="w-6 h-6 text-[#c5a059]" />,
  BedDouble: <BedDouble className="w-6 h-6 text-[#c5a059]" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-[#c5a059]" />,
  Bath: <Bath className="w-6 h-6 text-[#c5a059]" />,
};

export const HouseContents: React.FC = () => {
  return (
    <section id="house" className="py-20 bg-[#0c1411] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2a23] border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>التجهيزات الداخلية للفيلا</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-4">
            محتويات وتجهيزات الشاليه والفيلا
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            فرش فندقي خمس نجوم تم اختياره بعناية ليلبي كل احتياجات الضيوف، من الصالات الملكية الفسيحة إلى المطابخ المجهزة بالكامل وغرف النوم المعقمة.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {HOUSE_CONTENTS.map((cat, idx) => (
            <div
              key={idx}
              className="bg-[#14221c] border border-[#23382e] rounded-3xl p-6 sm:p-8 hover:border-[#c5a059]/40 transition-all duration-300 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#1a2d24] border border-[#2e473a] flex items-center justify-center flex-shrink-0 shadow-inner">
                  {categoryIcons[cat.iconName] || <Sparkles className="w-6 h-6 text-[#c5a059]" />}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#f4efe6]">
                    {cat.title}
                  </h3>
                  <span className="text-xs text-[#c5a059]">تجهيزات فندقية ملكية</span>
                </div>
              </div>

              <ul className="space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#d6cec0] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
