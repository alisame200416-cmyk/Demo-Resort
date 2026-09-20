import React from 'react';
import { Sparkles, MapPin, Phone, Shield, QrCode, Clock, Heart, ExternalLink } from 'lucide-react';
import { ChaletConfig } from '../types';
import { toIraqiInternationalNumber, formatDisplayIraqiPhone } from '../utils/validation';

interface FooterProps {
  chaletConfig: ChaletConfig;
  onOpenAdmin: () => void;
  onOpenQRCode: () => void;
  onScrollToBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  chaletConfig,
  onOpenAdmin,
  onOpenQRCode,
  onScrollToBooking,
}) => {
  return (
    <footer className="bg-[#080d0b] border-t border-[#1a2d24] text-[#a39a8c] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] p-[2px]">
                <div className="w-full h-full bg-[#0c1411] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#c5a059]" />
                </div>
              </div>
              <span className="text-lg font-bold text-[#f4efe6]">
                {chaletConfig.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#8c8273]">
              الملاذ الفندقي والريفي الفاخر لقضاء أسعد اللحظات العائلية والمناسبات الخاصة في أجواء من الفخامة والخصوصية التامة والهدوء الطبيعي.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenQRCode}
                className="p-2 rounded-lg bg-[#14221c] border border-[#23382e] text-[#c5a059] hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>رمز الـ QR للجوال</span>
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#f4efe6] mb-3">روابط وأقسام المنتجع</h4>
            <ul className="space-y-2">
              <li>
                <a href="#facilities" className="hover:text-[#c5a059] transition-colors">
                  استكشاف المرافق التفاعلية (7 أقسام)
                </a>
              </li>
              <li>
                <a href="#pool" className="hover:text-[#c5a059] transition-colors">
                  مواصفات المسبح الأولمبي (15×8 م)
                </a>
              </li>
              <li>
                <a href="#farm" className="hover:text-[#c5a059] transition-colors">
                  محمية الطيور والحيوانات (100 م²)
                </a>
              </li>
              <li>
                <a href="#house" className="hover:text-[#c5a059] transition-colors">
                  غرف النوم وصالة الألعاب والتجهيزات
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#c5a059] transition-colors">
                  أسعار الفترات بالدينار العراقي (IQD)
                </a>
              </li>
              <li>
                <button
                  onClick={onScrollToBooking}
                  className="text-[#c5a059] font-bold hover:underline cursor-pointer"
                >
                  جدول التقويم والحجز الفوري
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Timings & Shifts */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#f4efe6] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c5a059]" />
              <span>فترات الحجز اليومية</span>
            </h4>
            <div className="p-3 rounded-xl bg-[#0f1a14] border border-[#1d3025] space-y-2">
              <div>
                <span className="font-bold text-[#d6cec0] block">الفترة الصباحية (Shift 1):</span>
                <span className="text-[#a39a8c]">{chaletConfig.morningShiftHours}</span>
              </div>
              <div className="border-t border-[#1b2a21] pt-2">
                <span className="font-bold text-[#d6cec0] block">الفترة المسائية (Shift 2):</span>
                <span className="text-[#a39a8c]">{chaletConfig.nightShiftHours}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Direct Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-[#f4efe6] mb-3">الموقع والتواصل المباشر</h4>
            <p className="flex items-start gap-2 text-[#a39a8c]">
              <MapPin className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
              <span>{chaletConfig.location}</span>
            </p>

            {/* Google Maps Button in Footer */}
            <a
              href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#16271e] border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#1e382b] hover:text-[#f4efe6] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="موقعنا على الخريطة (Google Maps)"
              id="footer-google-maps-btn"
            >
              <MapPin className="w-4 h-4 text-[#c5a059]" />
              <span>موقعنا على الخريطة (Google Maps)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
            </a>

            <p className="flex items-center gap-2 text-[#d6cec0] pt-1">
              <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>رقم الهاتف المباشر: </span>
              <a
                href={`tel:${chaletConfig.ownerWhatsApp.replace(/[^\d]/g, '')}`}
                dir="ltr"
                className="font-bold text-[#c5a059] hover:underline"
              >
                {formatDisplayIraqiPhone(chaletConfig.ownerWhatsApp)}
              </a>
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${toIraqiInternationalNumber(chaletConfig.ownerWhatsApp)}?text=${encodeURIComponent(`السلام عليكم، أود التواصل مع إدارة ${chaletConfig.name} في البصرة`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-950/50"
              >
                <Phone className="w-4 h-4" />
                <span>مراسلة المالك عبر واتساب</span>
              </a>
            </div>
            <div className="pt-1 text-center">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-[#786f63] hover:text-[#c5a059] flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>لوحة تحكم إدارة المنتجع (Owner Admin)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#1a2d24] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#786f63]">
          <p>© {new Date().getFullYear()} {chaletConfig.name} - البصرة، أبو الخصيب / حمدان - كافة الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            <span>نظام الحجز الأوتوماتيكي عبر واتساب ({chaletConfig.ownerWhatsApp})</span>
            <span>•</span>
            <span className="text-[#c5a059]">مساحة 2500 م² في البصرة الفيحاء</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
