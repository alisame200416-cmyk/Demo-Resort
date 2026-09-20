import React, { useState } from 'react';
import { QrCode, Shield, Phone, Menu, X, CalendarCheck, Sparkles, MapPin } from 'lucide-react';
import { ChaletConfig } from '../types';
import { toIraqiInternationalNumber, formatDisplayIraqiPhone } from '../utils/validation';

interface NavbarProps {
  chaletConfig: ChaletConfig;
  onOpenAdmin: () => void;
  onOpenQRCode: () => void;
  onScrollToBooking: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  chaletConfig,
  onOpenAdmin,
  onOpenQRCode,
  onScrollToBooking,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'استكشاف المرافق', href: '#facilities' },
    { label: 'المسبح الأولمبي', href: '#pool' },
    { label: 'المحمية والطبيعة', href: '#farm' },
    { label: 'محتويات الشاليه', href: '#house' },
    { label: 'معرض الصور', href: '#gallery' },
    { label: 'قائمة الأسعار', href: '#pricing' },
    { label: 'التقويم والحجز', href: '#booking-calendar', highlight: true },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c1411]/95 backdrop-blur-md border-b border-[#23382e]/80 shadow-lg">
      {/* Top Quick Contact & Inquiry Bar */}
      <div className="bg-[#09110e] border-b border-[#1b2c24] text-[11px] sm:text-xs py-1.5 px-4 text-[#a39a8c]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-1 text-[#c5a059] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>البصرة - أبو الخصيب / حمدان (2500 م²)</span>
            </span>
            <span className="hidden md:inline text-[#3a4f43]">|</span>
            <span className="hidden md:inline text-[#a39a8c]">منتجع عائلي راقٍ وخصوصية تامة</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`tel:${chaletConfig.ownerWhatsApp.replace(/[^\d]/g, '')}`}
              className="flex items-center gap-1 hover:text-[#f4efe6] transition-colors"
              title="اتصال هاتفي مباشر"
            >
              <Phone className="w-3 h-3 text-[#c5a059]" />
              <span dir="ltr" className="font-bold">{formatDisplayIraqiPhone(chaletConfig.ownerWhatsApp)}</span>
            </a>
            <span className="text-[#3a4f43]">|</span>
            <a
              href={`https://wa.me/${toIraqiInternationalNumber(chaletConfig.ownerWhatsApp)}?text=${encodeURIComponent(`السلام عليكم ورحمة الله، أود الاستفسار عن ${chaletConfig.name} في البصرة`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-colors font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>واتساب الاستفسارات والحجز</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
            id="brand-logo-link"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8c6b2d] p-[2px] shadow-md shadow-[#c5a059]/20 group-hover:shadow-[#c5a059]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0c1411] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-[#f4efe6] tracking-tight group-hover:text-[#c5a059] transition-colors">
                {chaletConfig.name}
              </span>
              <span className="text-xs text-[#a39a8c] font-light flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#c5a059]" /> {chaletConfig.city}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  link.highlight
                    ? 'bg-[#192b23] text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#233c30]'
                    : 'text-[#d6cec0] hover:text-[#f4efe6] hover:bg-[#14221c]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3">
            {/* Google Maps Location Button */}
            <a
              href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg border border-[#c5a059]/40 bg-[#16271e] text-[#c5a059] hover:bg-[#1e362a] hover:text-[#f4efe6] transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shadow-[#0c1411]"
              title="موقعنا على الخريطة (Google Maps)"
              id="nav-google-maps-btn"
            >
              <MapPin className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden xl:inline">موقعنا على الخريطة</span>
            </a>

            {/* QR Code Button */}
            <button
              onClick={onOpenQRCode}
              className="p-2.5 rounded-lg border border-[#2e4639] bg-[#14221c] text-[#d6cec0] hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="رمز QR للمشاركة السريعة"
              id="qr-code-nav-btn"
            >
              <QrCode className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden md:inline">مسح QR</span>
            </button>

            {/* Admin Control Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`p-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                isAdminLoggedIn
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'border-[#2e4639] bg-[#14221c] text-[#d6cec0] hover:text-[#c5a059] hover:border-[#c5a059]/40'
              }`}
              title="لوحة تحكم إدارة الشاليه"
              id="admin-nav-btn"
            >
              <Shield className={`w-4 h-4 ${isAdminLoggedIn ? 'text-emerald-400' : 'text-[#c5a059]'}`} />
              <span className="hidden md:inline">
                {isAdminLoggedIn ? 'لوحة المالك (نشطة)' : 'إدارة الشاليه'}
              </span>
            </button>

            {/* Book Now Primary CTA */}
            <button
              onClick={onScrollToBooking}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-xs sm:text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all shadow-md shadow-[#c5a059]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              id="book-now-nav-btn"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>احجز الآن</span>
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Location */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#14221c] border border-[#c5a059]/40 text-[#c5a059]"
              title="موقعنا على الخريطة (Google Maps)"
            >
              <MapPin className="w-4 h-4 text-[#c5a059]" />
            </a>

            <button
              onClick={onOpenQRCode}
              className="p-2 rounded-lg bg-[#14221c] border border-[#2e4639] text-[#c5a059]"
              title="رمز QR"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#14221c] border border-[#2e4639] text-[#d6cec0] hover:text-white"
              aria-label="القائمة"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#23382e] bg-[#0c1411] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.href)}
                className={`text-right px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                  link.highlight
                    ? 'bg-[#192b23] text-[#c5a059] border border-[#c5a059]/30'
                    : 'bg-[#121c17] text-[#d6cec0]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#23382e] flex flex-col gap-2">
            <a
              href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-lg bg-[#16271e] border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#c5a059]" />
              <span>موقعنا على الخريطة (Google Maps)</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToBooking();
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-sm flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>احجز فترتك الآن</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full py-2.5 rounded-lg bg-[#14221c] border border-[#2e4639] text-[#c5a059] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'لوحة تحكم المالك (مفتوحة)' : 'تسجيل دخول المالك (الآدمن)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
