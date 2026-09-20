import React from 'react';
import { Calendar, Phone, Sparkles, Waves, ShieldCheck, Clock, MapPin, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { ChaletConfig, PricingConfig, ResortImagesConfig } from '../types';
import { formatIQD } from '../utils/bookingStore';
import { toIraqiInternationalNumber, formatDisplayIraqiPhone } from '../utils/validation';

interface HeroProps {
  chaletConfig: ChaletConfig;
  pricingConfig: PricingConfig;
  imagesConfig?: ResortImagesConfig;
  isImagesLoading?: boolean;
  onScrollToBooking: () => void;
  onOpenQRCode: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  chaletConfig,
  pricingConfig,
  imagesConfig,
  isImagesLoading = false,
  onScrollToBooking,
  onOpenQRCode,
}) => {
  const bannerImage = imagesConfig?.heroBanner?.trim() || '';

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Background with luxury gradient overlays */}
      <div className="absolute inset-0 z-0">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="صورة شاليه مريم من قاعدة البيانات"
            decoding="async"
            className="w-full h-full object-cover object-center scale-105 filter brightness-50 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#13231b] via-[#0d1713] to-[#0c1411] flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px]" />
            {isImagesLoading && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0c1411]/80 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold backdrop-blur-md">
                <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                <span>جاري استرجاع صورة الواجهة من Firestore...</span>
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1411] via-[#0c1411]/80 to-[#0c1411]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f382a]/30 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top VIP Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b2f24]/90 border border-[#c5a059]/40 text-[#c5a059] text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-[#0c1411]/80 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <span>منتجع عائلي راقٍ وخصوصية تامة بمساحة 2500 متر مربع</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#f4efe6] tracking-tight leading-tight mb-6 max-w-5xl mx-auto">
          {chaletConfig.name}
          <span className="block text-2xl sm:text-3xl md:text-4xl text-[#c5a059] font-medium mt-3 font-serif">
            البصرة - أبو الخصيب / حمدان
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="text-[#d2c9b8] text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
          أرقى منتجع وشاليه سياحي لقضاء أسعد اللحظات العائلية والمناسبات الخاصة في البصرة. مسبح أولمبي 15×8 م مع مسبح أطفال، محمية طيور وحيوانات طبيعية 100 م²، صالة ألعاب بلياردو وهوكي، ملاعب رياضية، وغرفتا نوم ماستر ملكيتان.
        </p>

        {/* Quick Shift Badges Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto mb-8 sm:mb-10 text-right">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#14221c]/90 border border-[#23382e] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#c5a059] text-[11px] sm:text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">الفترة الصباحية (Shift 1)</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#f4efe6]">{chaletConfig.morningShiftHours}</p>
            <p className="text-[10px] sm:text-xs text-[#a39a8c] mt-0.5">تبدأ من {formatIQD(pricingConfig.weekdayMorning)}</p>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#14221c]/90 border border-[#23382e] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#c5a059] text-[11px] sm:text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">الفترة المسائية (Shift 2)</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#f4efe6]">{chaletConfig.nightShiftHours}</p>
            <p className="text-[10px] sm:text-xs text-[#a39a8c] mt-0.5">تبدأ من {formatIQD(pricingConfig.weekdayNight)}</p>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#14221c]/90 border border-[#23382e] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#c5a059] text-[11px] sm:text-xs font-bold mb-1">
              <Waves className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">المسبح ومسبح الأطفال</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#f4efe6]">15م × 8م (130-160سم)</p>
            <p className="text-[10px] sm:text-xs text-[#a39a8c] mt-0.5">+ مسبح أطفال 50 سم</p>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#14221c]/90 border border-[#23382e] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-[#c5a059] text-[11px] sm:text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">حجز فوري مؤتمت</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#f4efe6]" dir="ltr">تأكيد عبر واتساب</p>
            <p className="text-[10px] sm:text-xs text-[#a39a8c] mt-0.5">مباشر وفوري مع المالك</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-3xl mx-auto">
          <button
            onClick={onScrollToBooking}
            className="w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#d5b069] to-[#b38e46] text-[#0c1411] font-bold text-sm sm:text-base shadow-xl shadow-[#c5a059]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="hero-book-btn"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">عرض التقويم وحجز موعدك</span>
          </button>

          <a
            href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#16271e] border-2 border-[#c5a059]/50 text-[#f4efe6] hover:bg-[#1e382b] hover:border-[#c5a059] font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
            id="hero-google-maps-btn"
            title="موقعنا على الخريطة (Google Maps)"
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059] animate-bounce flex-shrink-0" />
            <span className="whitespace-nowrap">موقعنا على الخريطة (Google Maps)</span>
          </a>

          <a
            href={`https://wa.me/${toIraqiInternationalNumber(chaletConfig.ownerWhatsApp)}?text=${encodeURIComponent(`السلام عليكم، أود الاستفسار عن تفاصيل الحجز والأسعار في ${chaletConfig.name} - البصرة`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-[#14221c] border border-[#2e4639] text-[#d6cec0] hover:text-[#c5a059] hover:border-[#c5a059]/50 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="whitespace-nowrap">استفسار واتساب</span>
          </a>
        </div>

        {/* Location snippet */}
        <a
          href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-[#a39a8c] hover:text-[#c5a059] transition-colors mt-8 p-2 rounded-xl bg-[#0c1411]/60 border border-[#23382e]/60 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="underline decoration-dotted">{chaletConfig.location}</span>
          <span className="mx-2">•</span>
          <span>كهرباء مستمرة 24 ساعة عبر مولدة ضخمة خاصة بالمزرعة</span>
          <ExternalLink className="w-3 h-3 text-[#c5a059]" />
        </a>
      </div>
    </section>
  );
};
