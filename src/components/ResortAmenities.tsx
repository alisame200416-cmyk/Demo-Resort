import React from 'react';
import {
  AirVent,
  Waves,
  Sparkles,
  Flame,
  Armchair,
  Wifi,
  Trophy,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { RESORT_AMENITIES } from '../data/chaletData';

const iconMap: Record<string, React.ReactNode> = {
  AirVent: <AirVent className="w-6 h-6 text-[#c5a059]" />,
  Waves: <Waves className="w-6 h-6 text-[#c5a059]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#c5a059]" />,
  Flame: <Flame className="w-6 h-6 text-[#c5a059]" />,
  Armchair: <Armchair className="w-6 h-6 text-[#c5a059]" />,
  Wifi: <Wifi className="w-6 h-6 text-[#c5a059]" />,
  Trophy: <Trophy className="w-6 h-6 text-[#c5a059]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#c5a059]" />,
};

export const ResortAmenities: React.FC = () => {
  return (
    <section id="amenities" className="py-20 bg-[#0f1a15] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172b21] border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خدمات فندقية VIP</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-4">
            مرافق وخدمات المنتجع الفاخر
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            تم تصميم كل ركن في الواحة الملكية ليوفر لك ولعائلتك أعلى درجات الرفاهية والراحة والخصوصية التامة في بيئة نقية ومجهزة بأحدث التجهيزات.
          </p>
        </div>

        {/* Grid of Amenities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESORT_AMENITIES.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-[#14221c]/80 border border-[#23382e] rounded-2xl p-6 hover:border-[#c5a059]/40 hover:bg-[#182a22] transition-all duration-300 group shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1b2f25] border border-[#2d473a] flex items-center justify-center group-hover:scale-105 group-hover:border-[#c5a059]/50 transition-all">
                  {iconMap[amenity.iconName] || <Sparkles className="w-6 h-6 text-[#c5a059]" />}
                </div>
                {amenity.badge && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1b2f25] text-[#c5a059] border border-[#c5a059]/20">
                    {amenity.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#f4efe6] mb-2 group-hover:text-[#c5a059] transition-colors">
                {amenity.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#a39a8c] leading-relaxed">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quality guarantee strip */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#14221c] via-[#1a2c24] to-[#14221c] border border-[#2e4639] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#f4efe6]">
                ضيافة شاملة وكهرباء مستمرة دون انقطاع
              </h4>
              <p className="text-xs text-[#a39a8c]">
                مولدة ديزل صامتة كاتمة للصوت تعمل أوتوماتيكياً مع فريق خدمة وضيافة جاهز لتلبية متطلباتكم.
              </p>
            </div>
          </div>
          <div className="text-xs text-[#c5a059] font-medium border border-[#c5a059]/30 px-4 py-2 rounded-xl bg-[#0c1411]/50 whitespace-nowrap">
            نظافة وتعقيم فندقي بعد كل فترة حجز مباشرة
          </div>
        </div>
      </div>
    </section>
  );
};
