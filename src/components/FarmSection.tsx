import React from 'react';
import { Sparkles, Heart, Compass, Check } from 'lucide-react';
import { FARM_ATTRACTIONS, getFarmAttractionsWithImages } from '../data/chaletData';
import { ResortImagesConfig } from '../types';

interface FarmSectionProps {
  imagesConfig?: ResortImagesConfig;
}

export const FarmSection: React.FC<FarmSectionProps> = ({ imagesConfig }) => {
  const attractions = imagesConfig ? getFarmAttractionsWithImages(imagesConfig) : FARM_ATTRACTIONS;

  return (
    <section id="farm" className="py-20 bg-[#0f1a15] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182f23] border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>الحياة الريفية والحيوانات الأليفة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-4">
            مزرعة الحيوانات والطبيعة الخضراء
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            تمتع بتجربة ريفية نادرة داخل المزرعة، حيث تلتقي أصالة الخيول العربية بطيور الطاووس وبحيرة البط وبساتين النخيل العراقية الشامخة.
          </p>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {attractions.map((attraction) => (
            <div
              key={attraction.id}
              className="bg-[#14221c] border border-[#23382e] rounded-3xl overflow-hidden hover:border-[#c5a059]/40 transition-all duration-300 group shadow-lg flex flex-col sm:flex-row"
            >
              {/* Image side */}
              <div className="sm:w-1/2 relative h-56 sm:h-auto overflow-hidden bg-[#14221c]">
                {attraction.imageUrl?.trim() ? (
                  <img
                    src={attraction.imageUrl}
                    alt={attraction.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#182f23] to-[#101c16]">
                    <div className="w-12 h-12 rounded-2xl bg-[#1d3528] border border-[#2d523e] flex items-center justify-center mb-2 text-emerald-400">
                      <Compass className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] text-[#8c8273]">بانتظار صورة المحمية من Firestore</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#0c1411]/80 backdrop-blur-md text-[#c5a059] border border-[#c5a059]/30">
                    {attraction.tag}
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="sm:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#f4efe6] mb-1 group-hover:text-[#c5a059] transition-colors">
                    {attraction.name}
                  </h3>
                  <p className="text-xs text-[#c5a059] font-medium mb-3">
                    {attraction.subtitle}
                  </p>
                  <p className="text-xs text-[#a39a8c] leading-relaxed mb-4">
                    {attraction.description}
                  </p>
                </div>

                <div className="border-t border-[#23382e] pt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#8c8273] block mb-1">
                    الأنشطة المتاحة:
                  </span>
                  {attraction.activities.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#d6cec0]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Child Safety & Family Note */}
        <div className="mt-10 p-5 rounded-2xl bg-[#17271f] border border-[#2d473a] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs sm:text-sm text-[#d6cec0]">
            <strong className="text-[#f4efe6] block mb-0.5">آمنة 100% للأطفال ومناسبة لجلسات التصوير</strong>
            جميع الحيوانات والطيور مفحوصة بيطرياً ومطعمة بإشراف دوري، مع مرشد متفرغ لمساعدة الأطفال في ركوب الخيل وإطعام الحيوانات بكل أمان.
          </div>
        </div>
      </div>
    </section>
  );
};
