import React from 'react';
import { Waves, Sparkles, Shield, ThermometerSun, Eye, Check, Droplets, Camera } from 'lucide-react';
import { POOL_SPECIFICATIONS } from '../data/chaletData';
import { ResortImagesConfig } from '../types';

interface PoolSectionProps {
  imagesConfig?: ResortImagesConfig;
  isImagesLoading?: boolean;
}

export const PoolSection: React.FC<PoolSectionProps> = ({ imagesConfig, isImagesLoading = false }) => {
  const specs = POOL_SPECIFICATIONS;
  const poolImage = imagesConfig?.swimmingPool?.trim() || '';

  return (
    <section id="pool" className="py-20 bg-[#0c1411] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152a36] border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Waves className="w-3.5 h-3.5" />
            <span>المسبح والشلال الصخري</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-4">
            مواصفات المسبح الأولمبي الخاص
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            مسبح خارجي فاخر مصمم بأعلى المعايير العالمية مع شلال مائي هادر، نظام تدفئة حراري متطور للأيام المعتدلة، وفلترة سويسرية على مدار 24 ساعة.
          </p>
        </div>

        {/* Main Pool Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Image & Overlay Highlights */}
          <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-[#23382e] shadow-2xl group bg-[#14221c]">
            {poolImage ? (
              <img
                src={poolImage}
                alt="صورة المسبح الأولمبي من Firestore"
                loading="lazy"
                decoding="async"
                className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-[400px] sm:h-[480px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#13231c] to-[#0c1411]">
                <div className="w-16 h-16 rounded-3xl bg-[#173024] border border-[#2d523e] flex items-center justify-center mb-4 text-cyan-400">
                  <Waves className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#f4efe6] mb-1">المسبح الأولمبي 15×8 متر</h3>
                <p className="text-xs text-[#a39a8c] max-w-sm">
                  {isImagesLoading
                    ? 'جاري جلب صورة المسبح من Firestore...'
                    : 'بانتظار رفع صورة المسبح الفعلية من لوحة الإدارة'}
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1411] via-transparent to-black/20 pointer-events-none" />

            {/* Float badge for measurements */}
            <div className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-[#0c1411]/90 backdrop-blur-md border border-[#2e4639] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-cyan-400 font-semibold block">الأبعاد الهندسية الرسمية</span>
                <p className="text-lg font-bold text-[#f4efe6]">
                  الطول: {specs.lengthMeters} م <span className="text-[#c5a059]">×</span> العرض: {specs.widthMeters} م
                </p>
              </div>
              <div className="text-left border-r border-[#23382e] pr-4">
                <span className="text-xs text-[#a39a8c] block">العمق المتدرج</span>
                <p className="text-sm font-semibold text-[#c5a059]">{specs.depthRange}</p>
              </div>
            </div>
          </div>

          {/* Detailed Specs Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Dimension Gauge Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#14221c] border border-[#23382e] text-center">
                <span className="text-xs text-[#a39a8c] block mb-1">طول المسبح</span>
                <p className="text-2xl font-black text-[#c5a059]">{specs.lengthMeters}م</p>
                <span className="text-[11px] text-[#71695c]">15 متراً واسعاً</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#14221c] border border-[#23382e] text-center">
                <span className="text-xs text-[#a39a8c] block mb-1">عرض المسبح</span>
                <p className="text-2xl font-black text-cyan-400">{specs.widthMeters}م</p>
                <span className="text-[11px] text-[#71695c]">8 أمتار أولمبية</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#14221c] border border-[#23382e] text-center">
                <span className="text-xs text-[#a39a8c] block mb-1">العمق المتدرج</span>
                <p className="text-2xl font-black text-emerald-400">1.6م</p>
                <span className="text-[11px] text-[#71695c]">من 130 إلى 160 سم</span>
              </div>
            </div>

            {/* Spec Features List */}
            <div className="bg-[#14221c] border border-[#23382e] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[#f4efe6] flex items-center gap-2 border-b border-[#23382e] pb-3">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span>الأنظمة والمواصفات التقنية</span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2d24] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <strong className="text-[#f4efe6] block text-xs">مسبح أطفال ملحق:</strong>
                    <span className="text-[#a39a8c] text-xs leading-relaxed">{specs.kidsPool}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2d24] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <strong className="text-[#f4efe6] block text-xs">الفلترة والتعقيم:</strong>
                    <span className="text-[#a39a8c] text-xs leading-relaxed">{specs.filtration}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2d24] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ThermometerSun className="w-4 h-4 text-[#c5a059]" />
                  </div>
                  <div>
                    <strong className="text-[#f4efe6] block text-xs">التدفئة الحرارية:</strong>
                    <span className="text-[#a39a8c] text-xs leading-relaxed">{specs.heating}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2d24] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <strong className="text-[#f4efe6] block text-xs">الإضاءة الليلية:</strong>
                    <span className="text-[#a39a8c] text-xs leading-relaxed">{specs.lighting}</span>
                  </div>
                </div>
              </div>

              {/* Extra bullet checklist */}
              <div className="pt-2 border-t border-[#23382e] space-y-1.5">
                {specs.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#c5beb3]">
                    <Check className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
