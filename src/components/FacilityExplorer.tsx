import React, { useState } from 'react';
import {
  Waves,
  Trophy,
  Flame,
  Sparkles,
  Smile,
  Gamepad2,
  BedDouble,
  X,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Maximize2,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { FacilityItem, ResortImagesConfig } from '../types';
import { RESORT_FACILITIES, getFacilitiesWithImages } from '../data/chaletData';

interface FacilityExplorerProps {
  onScrollToBooking: () => void;
  imagesConfig?: ResortImagesConfig;
}

const facilityIcons: Record<string, React.ReactNode> = {
  Waves: <Waves className="w-6 h-6 text-[#c5a059]" />,
  Trophy: <Trophy className="w-6 h-6 text-[#c5a059]" />,
  Flame: <Flame className="w-6 h-6 text-[#c5a059]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#c5a059]" />,
  Smile: <Smile className="w-6 h-6 text-[#c5a059]" />,
  Gamepad2: <Gamepad2 className="w-6 h-6 text-[#c5a059]" />,
  BedDouble: <BedDouble className="w-6 h-6 text-[#c5a059]" />,
};

export const FacilityExplorer: React.FC<FacilityExplorerProps> = ({ onScrollToBooking, imagesConfig }) => {
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  const facilities = imagesConfig ? getFacilitiesWithImages(imagesConfig) : RESORT_FACILITIES;

  const openFacilityModal = (facility: FacilityItem) => {
    setSelectedFacility(facility);
  };

  const closeFacilityModal = () => {
    setSelectedFacility(null);
  };

  const handleBookFromModal = () => {
    closeFacilityModal();
    onScrollToBooking();
  };

  return (
    <section id="facilities" className="py-20 bg-[#0f1a15] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#182f23] border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مساحة 2500 م² مجهزة بالكامل</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f4efe6] mb-4">
            استكشف مرافق شاليه مريم التفاعلية
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            اضغط على أي مرفق لاستعراض كامل المواصفات الهندسية الدقيقة، الصور الحية، والتجهيزات المتوفرة لضمان تجربة فندقية لا تُنسى في البصرة.
          </p>
        </div>

        {/* 7 Facilities Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {facilities.map((facility, index) => (
            <div
              key={facility.id}
              onClick={() => openFacilityModal(facility)}
              className={`bg-[#14221c] border border-[#23382e] rounded-3xl overflow-hidden shadow-xl hover:border-[#c5a059]/60 hover:shadow-[#c5a059]/10 transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                index === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div>
                {/* Image Container */}
                <div className={`relative overflow-hidden ${index === 0 ? 'h-64 sm:h-72' : 'h-52'} bg-[#14221c]`}>
                  {facility.imageUrl?.trim() ? (
                    <img
                      src={facility.imageUrl}
                      alt={facility.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#172b21] to-[#101b15]">
                      <div className="w-12 h-12 rounded-2xl bg-[#1b2f25] border border-[#2e473a] flex items-center justify-center mb-2">
                        {facilityIcons[facility.iconName] || <Sparkles className="w-6 h-6 text-[#c5a059]" />}
                      </div>
                      <span className="text-[11px] text-[#8c8273]">بانتظار صورة المرفق من السحابة</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1411] via-[#0c1411]/30 to-transparent pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0c1411]/80 backdrop-blur-md text-[#c5a059] border border-[#c5a059]/40 shadow-md">
                      {facility.badge}
                    </span>
                  </div>

                  {/* Click hint pill */}
                  <div className="absolute bottom-4 left-4 bg-[#0c1411]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#2e473a] text-[11px] text-[#d6cec0] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>اضغط لعرض المواصفات</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1b2f25] border border-[#2e473a] flex items-center justify-center flex-shrink-0 group-hover:border-[#c5a059]/50 transition-colors">
                      {facilityIcons[facility.iconName] || <Sparkles className="w-5 h-5 text-[#c5a059]" />}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#f4efe6] group-hover:text-[#c5a059] transition-colors">
                        {facility.title}
                      </h3>
                      <p className="text-xs text-[#c5a059] font-medium">
                        {facility.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#a39a8c] leading-relaxed line-clamp-3 mb-4">
                    {facility.shortDescription}
                  </p>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="px-6 pb-6 pt-0">
                <div className="w-full py-2.5 rounded-xl bg-[#1a2d23] group-hover:bg-[#c5a059] text-[#c5a059] group-hover:text-[#0c1411] text-xs font-bold transition-all border border-[#2d473a] group-hover:border-[#c5a059] flex items-center justify-center gap-2">
                  <span>عرض التفاصيل والمواصفات الكاملة</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Detail Popup Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#111e18] border border-[#2e473a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header Bar */}
            <div className="relative h-64 sm:h-80 overflow-hidden flex-shrink-0 bg-[#14221c]">
              {selectedFacility.imageUrl?.trim() ? (
                <img
                  src={selectedFacility.imageUrl}
                  alt={selectedFacility.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#192f24] to-[#111e18]">
                  <div className="w-16 h-16 rounded-2xl bg-[#1b2f25] border border-[#2e473a] flex items-center justify-center mb-2">
                    {facilityIcons[selectedFacility.iconName] || <Sparkles className="w-8 h-8 text-[#c5a059]" />}
                  </div>
                  <span className="text-xs text-[#8c8273]">بانتظار قراءة صورة المرفق من Firestore</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111e18] via-[#111e18]/40 to-black/30 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={closeFacilityModal}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-[#0c1411]/80 backdrop-blur-md border border-[#2e473a] text-[#f4efe6] hover:text-[#c5a059] transition-colors cursor-pointer z-10"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Title inside overlay */}
              <div className="absolute bottom-4 right-6 left-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c5a059] text-[#0c1411] mb-2 inline-block">
                  {selectedFacility.badge}
                </span>
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#f4efe6]">
                  {selectedFacility.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#c5a059] mt-1 font-medium">
                  {selectedFacility.subtitle}
                </p>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Detailed Description */}
              <div>
                <h4 className="text-sm font-bold text-[#c5a059] mb-2">نبذة تفصيلية عن المرفق:</h4>
                <p className="text-xs sm:text-sm text-[#d6cec0] leading-relaxed">
                  {selectedFacility.fullDescription}
                </p>
              </div>

              {/* Exact Specs Table */}
              <div className="bg-[#0c1411] border border-[#23382e] rounded-2xl p-5">
                <h4 className="text-xs font-bold text-[#f4efe6] mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#c5a059]" />
                  <span>المواصفات الفنية والهندسية المعتمدة:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedFacility.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#14221c] border border-[#1e3328] flex items-center justify-between"
                    >
                      <span className="text-[#8c8273] font-medium">{spec.label}:</span>
                      <span className="text-[#f4efe6] font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Features Bullet Points */}
              <div>
                <h4 className="text-xs font-bold text-[#c5a059] mb-3">المميزات والتجهيزات المتوفرة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#d6cec0]">
                  {selectedFacility.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#23382e] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleBookFromModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#c5a059]/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>الانتقال للحجز الفوري لهذا المرفق</span>
                </button>

                <button
                  onClick={closeFacilityModal}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#182921] border border-[#2d4639] text-[#a39a8c] hover:text-[#f4efe6] text-xs font-semibold cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
