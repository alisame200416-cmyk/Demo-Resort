import React from 'react';
import { Tag, Check, Calendar, Sun, Moon, Sparkles } from 'lucide-react';
import { PricingConfig, ChaletConfig } from '../types';
import { formatIQD } from '../utils/bookingStore';

interface PricingSectionProps {
  pricingConfig: PricingConfig;
  chaletConfig: ChaletConfig;
  onScrollToBooking: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  pricingConfig,
  chaletConfig,
  onScrollToBooking,
}) => {
  return (
    <section id="pricing" className="py-20 bg-[#0c1411] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241c10] border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>قائمة الأسعار الرسمية بالدينار العراقي</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-4">
            أسعار الحجز الشفافة والمباشرة
          </h2>
          <p className="text-[#a39a8c] text-sm sm:text-base leading-relaxed">
            أسعار واضحة ومثبتة بالدينار العراقي (IQD). بدون عمولات خفية أو وسطاء، مع تمييز بين أيام الأسبوع العادية وعطل نهاية الأسبوع الرسمية.
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Weekday Plan (الأحد - الأربعاء) */}
          <div className="bg-[#14221c] border border-[#23382e] rounded-3xl p-6 sm:p-8 hover:border-[#c5a059]/40 transition-all duration-300 shadow-xl flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1b2f25] text-emerald-400 border border-emerald-500/20">
                  أيام هادئة وموفرة
                </span>
                <span className="text-xs text-[#8c8273]">الأحد • الإثنين • الثلاثاء • الأربعاء</span>
              </div>

              <h3 className="text-2xl font-bold text-[#f4efe6] mb-2">
                أيام الأسبوع (Weekdays)
              </h3>
              <p className="text-xs text-[#a39a8c] mb-6">
                الخيار الأمثل للعائلات الراغبة في الهدوء والاستجمام التام بأسعار مميزة.
              </p>

              {/* Shifts Pricing Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-6">
                {/* Morning */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1411]/80 border border-[#23382e] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center flex-shrink-0">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">الفترة الصباحية (Shift 1)</h4>
                      <span className="text-[10px] sm:text-[11px] text-[#8c8273]">{chaletConfig.morningShiftHours}</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="text-base sm:text-xl font-extrabold text-[#c5a059] whitespace-nowrap">
                      {formatIQD(pricingConfig.weekdayMorning)}
                    </span>
                  </div>
                </div>

                {/* Night */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1411]/80 border border-[#23382e] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">الفترة المسائية (Shift 2)</h4>
                      <span className="text-[10px] sm:text-[11px] text-[#8c8273]">{chaletConfig.nightShiftHours}</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="text-base sm:text-xl font-extrabold text-[#c5a059] whitespace-nowrap">
                      {formatIQD(pricingConfig.weekdayNight)}
                    </span>
                  </div>
                </div>

                {/* Full Day Promo */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#1a2c22] border border-[#2e473a] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#f4efe6]">عرض اليوم الكامل:</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 whitespace-nowrap">
                    {formatIQD(pricingConfig.weekdayFullDay)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onScrollToBooking}
              className="w-full py-3 rounded-xl bg-[#1e3328] hover:bg-[#253f32] text-[#f4efe6] font-bold text-sm transition-all border border-[#2d473a] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#c5a059]" />
              <span>اختر موعدك في أيام الأسبوع</span>
            </button>
          </div>

          {/* Weekend Plan (الخميس - الجمعة - السبت) */}
          <div className="bg-[#14221c] border-2 border-[#c5a059]/60 rounded-3xl p-6 sm:p-8 hover:border-[#c5a059] transition-all duration-300 shadow-2xl flex flex-col justify-between relative">
            <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-[#c5a059] text-[#0c1411] text-xs font-black shadow-lg">
              الأكثر طلباً • نهاية الأسبوع
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#292212] text-[#c5a059] border border-[#c5a059]/30">
                  عطلات نهاية الأسبوع VIP
                </span>
                <span className="text-xs text-[#c5a059] font-medium">الخميس • الجمعة • السبت</span>
              </div>

              <h3 className="text-2xl font-bold text-[#f4efe6] mb-2">
                عطلة نهاية الأسبوع (Weekend)
              </h3>
              <p className="text-xs text-[#a39a8c] mb-6">
                أجواء احتفالية رائعة للمناسبات الكبيرة، اللقاءات العائلية وعزائم الباربيكيو.
              </p>

              {/* Shifts Pricing Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-6">
                {/* Morning */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1411]/80 border border-[#23382e] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center flex-shrink-0">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">الفترة الصباحية (Shift 1)</h4>
                      <span className="text-[10px] sm:text-[11px] text-[#8c8273]">{chaletConfig.morningShiftHours}</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="text-base sm:text-xl font-extrabold text-[#c5a059] whitespace-nowrap">
                      {formatIQD(pricingConfig.weekendMorning)}
                    </span>
                  </div>
                </div>

                {/* Night */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1411]/80 border border-[#23382e] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-950/30 flex items-center justify-center flex-shrink-0">
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#f4efe6]">الفترة المسائية (Shift 2)</h4>
                      <span className="text-[10px] sm:text-[11px] text-[#8c8273]">{chaletConfig.nightShiftHours}</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <span className="text-base sm:text-xl font-extrabold text-[#c5a059] whitespace-nowrap">
                      {formatIQD(pricingConfig.weekendNight)}
                    </span>
                  </div>
                </div>

                {/* Full Day Promo */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#241d13] border border-[#c5a059]/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#f4efe6]">عرض اليوم الكامل في العطلة:</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#c5a059] whitespace-nowrap">
                    {formatIQD(pricingConfig.weekendFullDay)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onScrollToBooking}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] hover:from-[#d5b069] hover:to-[#c5a059] text-[#0c1411] font-bold text-sm transition-all shadow-lg shadow-[#c5a059]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>احجز عطلتك المميزة الآن</span>
            </button>
          </div>
        </div>

        {/* All inclusive features */}
        <div className="bg-[#14221c] border border-[#23382e] rounded-2xl p-6 max-w-4xl mx-auto">
          <h4 className="text-sm font-bold text-[#c5a059] mb-4 text-center">
            ما تشمله جميع الأسعار أعلاه دون أي تكاليف إضافية:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-[#d6cec0]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>كهرباء مستمرة 24/7 عبر مولدة خاصة</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>تعقيم وفلترة المسبح قبل كل دخول</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>دخول كامل لمزرعة الخيول والحيوانات</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>إنترنت واي فاي فايبر فائق السرعة</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>شواية باربيكيو مع حطب ومناقل مجانية</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>طاولة بلياردو وتنس وألعاب أطفال</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
