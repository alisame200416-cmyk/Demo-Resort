import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  MapPin,
} from 'lucide-react';
import { BookingRecord, ChaletConfig, PricingConfig, ShiftType } from '../types';
import {
  ARABIC_DAYS,
  ARABIC_MONTHS,
  getMonthDays,
  formatDateToISO,
  formatArabicDate,
  getArabicDayName,
} from '../utils/dateHelpers';
import { formatIQD, getShiftPrice, isWeekendDay } from '../utils/bookingStore';
import { BookingModal } from './BookingModal';

interface BookingCalendarProps {
  chaletConfig: ChaletConfig;
  pricingConfig: PricingConfig;
  bookings: Record<string, BookingRecord>;
  onConfirmBooking: (booking: BookingRecord) => void;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  chaletConfig,
  pricingConfig,
  bookings,
  onConfirmBooking,
  isAdminLoggedIn,
  onOpenAdmin,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'night'>('all');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [selectedShiftPrice, setSelectedShiftPrice] = useState<number>(0);

  // Next / Prev Month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Calendar days grid
  const daysGrid = getMonthDays(currentYear, currentMonth);

  // Check if shift is reserved
  const isShiftReserved = (dateStr: string, shift: ShiftType): boolean => {
    const key = `${dateStr}_${shift}`;
    const b = bookings[key];
    return !!b && b.status === 'confirmed';
  };

  const getShiftBookingDetails = (dateStr: string, shift: ShiftType): BookingRecord | undefined => {
    const key = `${dateStr}_${shift}`;
    return bookings[key];
  };

  const handleShiftClick = (dateStr: string, shift: ShiftType, isPast: boolean) => {
    if (isPast) return;

    if (isShiftReserved(dateStr, shift)) {
      if (isAdminLoggedIn) {
        // Admin can quickly open the control panel to inspect or release
        onOpenAdmin();
      }
      return;
    }

    const price = getShiftPrice(dateStr, shift, pricingConfig);
    setSelectedDateStr(dateStr);
    setSelectedShift(shift);
    setSelectedShiftPrice(price);
    setIsModalOpen(true);
  };

  return (
    <section id="booking-calendar" className="py-20 bg-[#0c1411] border-t border-[#1d3027] relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#182f23] border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام الحجز التلقائي المباشر</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f4efe6] mb-3">
            جدول المواعيد والفترات المتاحة
          </h2>
          <p className="text-[#a39a8c] text-xs sm:text-base leading-relaxed">
            يومياً متاح فترتان مستقلتان (صباحية ومسائية). اضغط على أي فترة باللون الأخضر لحجزها فوراً وإرسال التأكيد لمالك الشاليه عبر واتساب.
          </p>
        </div>

        {/* Calendar Card Container */}
        <div className="bg-[#121e19] border border-[#23382e] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
          {/* Top Bar: Month & Year Navigator + Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-[#23382e]">
            {/* Month title and prev/next */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 sm:gap-3">
              <button
                onClick={goToPreviousMonth}
                className="p-2 sm:p-2.5 rounded-xl bg-[#162720] border border-[#2d473a] text-[#d6cec0] hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors cursor-pointer"
                title="الشهر السابق"
                aria-label="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="text-center min-w-[150px] sm:min-w-[200px]">
                <h3 className="text-base sm:text-xl font-bold text-[#f4efe6] flex items-center justify-center gap-1.5 sm:gap-2">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
                  <span>{ARABIC_MONTHS[currentMonth]}</span>
                  <span className="text-[#c5a059]">{currentYear}</span>
                </h3>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 sm:p-2.5 rounded-xl bg-[#162720] border border-[#2d473a] text-[#d6cec0] hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors cursor-pointer"
                title="الشهر القادم"
                aria-label="الشهر القادم"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={goToCurrentMonth}
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1a2d24] text-[#a39a8c] hover:text-[#f4efe6] hover:bg-[#223b2f] border border-[#2e473a] transition-all cursor-pointer whitespace-nowrap"
              >
                اليوم
              </button>
            </div>

            {/* Filter by Shift buttons */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#0c1411] p-1 rounded-xl border border-[#23382e] text-xs font-medium w-full sm:w-auto">
              <button
                onClick={() => setShiftFilter('all')}
                className={`py-1.5 px-2 sm:px-3 rounded-lg transition-all cursor-pointer text-center whitespace-nowrap ${
                  shiftFilter === 'all'
                    ? 'bg-[#c5a059] text-[#0c1411] font-bold shadow-sm'
                    : 'text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setShiftFilter('morning')}
                className={`py-1.5 px-2 sm:px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  shiftFilter === 'morning'
                    ? 'bg-[#c5a059] text-[#0c1411] font-bold shadow-sm'
                    : 'text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>الصباحي</span>
              </button>
              <button
                onClick={() => setShiftFilter('night')}
                className={`py-1.5 px-2 sm:px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                  shiftFilter === 'night'
                    ? 'bg-[#c5a059] text-[#0c1411] font-bold shadow-sm'
                    : 'text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>المسائي</span>
              </button>
            </div>
          </div>

          {/* Legend Guide */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 py-3.5 text-xs border-b border-[#23382e]/60">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50 flex-shrink-0" />
                <span className="text-[#d6cec0]">متاح للحجز الفوري</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-600 shadow-sm shadow-rose-600/50 flex-shrink-0" />
                <span className="text-[#d6cec0]">محجوز مسبقاً</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#25352c] border border-[#395043] flex-shrink-0" />
                <span className="text-[#7f7668]">موعد منتهٍ</span>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-[#c5a059] bg-[#1a2b22] px-2.5 py-1 rounded-lg border border-[#c5a059]/20 font-medium">
              خميس وجمعة وسبت: تسعيرة الويكند
            </div>
          </div>

          {/* Mobile & Tablet Horizontal Scroll Instruction Badge */}
          <div className="lg:hidden flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-[#14231b] border border-emerald-500/40 text-emerald-300 text-xs font-semibold my-3">
            <span className="flex items-center gap-1.5">
              <span>👉</span>
              <span>اسحب جدول التقويم أفقياً لرؤية كافة الأيام والفترات</span>
              <span>👈</span>
            </span>
            <span className="text-[10px] text-[#c5a059] bg-[#0c1411] px-2 py-0.5 rounded border border-[#22362b] font-bold whitespace-nowrap">
              تمرير أفقياً ↔
            </span>
          </div>

          {/* Horizontal Scrollable Calendar Wrapper */}
          <div className="overflow-x-auto pb-4 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-[#233d2e] scrollbar-track-transparent">
            <div className="min-w-[780px] sm:min-w-[820px] lg:min-w-0">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-2 pb-2">
                {ARABIC_DAYS.map((dayName, idx) => {
                  const isWeekend = idx === 4 || idx === 5 || idx === 6; // Thu, Fri, Sat
                  return (
                    <div
                      key={dayName}
                      className={`py-2 px-1 text-xs sm:text-sm font-bold rounded-lg ${
                        isWeekend
                          ? 'text-[#c5a059] bg-[#1a2720]/70'
                          : 'text-[#9c9384] bg-[#0f1a15]'
                      }`}
                    >
                      <span>{dayName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {daysGrid.map((dayObj, index) => {
                  const isWeekend = isWeekendDay(dayObj.date);
                  const morningReserved = isShiftReserved(dayObj.dateStr, 'morning');
                  const nightReserved = isShiftReserved(dayObj.dateStr, 'night');
                  const morningPrice = getShiftPrice(dayObj.dateStr, 'morning', pricingConfig);
                  const nightPrice = getShiftPrice(dayObj.dateStr, 'night', pricingConfig);

                  const morningBooking = getShiftBookingDetails(dayObj.dateStr, 'morning');
                  const nightBooking = getShiftBookingDetails(dayObj.dateStr, 'night');

                  return (
                    <div
                      key={index}
                      className={`min-h-[140px] sm:min-h-[160px] rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between transition-all border ${
                        !dayObj.isCurrentMonth
                          ? 'opacity-30 bg-[#0d1612] border-transparent pointer-events-none'
                          : dayObj.isToday
                          ? 'bg-[#15271f] border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                          : isWeekend
                          ? 'bg-[#14231c] border-[#2b4436]'
                          : 'bg-[#0e1914] border-[#1d3026]'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              dayObj.isToday
                                ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#c5a059] text-[#0c1411] flex items-center justify-center'
                                : isWeekend
                                ? 'text-[#c5a059]'
                                : 'text-[#f4efe6]'
                            }`}
                          >
                            {dayObj.dayNumber}
                          </span>
                          {dayObj.isToday && (
                            <span className="text-[9px] font-bold text-[#c5a059]">
                              (اليوم)
                            </span>
                          )}
                        </div>

                        {isWeekend && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#272115] text-[#c5a059] border border-[#c5a059]/20">
                            ويكند
                          </span>
                        )}
                      </div>

                      {/* Two Shifts Container */}
                      <div className="space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-center">
                        {/* Shift 1: Morning */}
                        {(shiftFilter === 'all' || shiftFilter === 'morning') && (
                          <button
                            type="button"
                            onClick={() => handleShiftClick(dayObj.dateStr, 'morning', dayObj.isPast)}
                            disabled={dayObj.isPast}
                            className={`w-full text-right p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all flex flex-col justify-between relative group ${
                              dayObj.isPast
                                ? 'bg-[#17241d]/50 text-[#5f584d] border border-transparent cursor-not-allowed'
                                : morningReserved
                                ? 'bg-rose-950/70 border border-rose-600/70 text-rose-200 cursor-not-allowed shadow-sm'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-100 hover:border-emerald-400 cursor-pointer shadow-sm hover:shadow-emerald-500/20 active:scale-95'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                <Sun className="w-3 h-3 text-[#eab308] flex-shrink-0" />
                                <span>صباحي</span>
                              </span>

                              {morningReserved ? (
                                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white flex items-center gap-0.5 whitespace-nowrap">
                                  <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>محجوز</span>
                                </span>
                              ) : (
                                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-[#0c1411] flex items-center gap-0.5 whitespace-nowrap">
                                  <span>متاح</span>
                                </span>
                              )}
                            </div>

                            {/* Price Tag or Booked Label */}
                            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] leading-tight">
                              {morningReserved ? (
                                <span className="text-rose-300 text-[9px] truncate max-w-[80px]">
                                  {isAdminLoggedIn && morningBooking
                                    ? morningBooking.customerName
                                    : 'مغلق'}
                                </span>
                              ) : (
                                <span className="font-extrabold text-emerald-300 whitespace-nowrap">
                                  {formatIQD(morningPrice)}
                                </span>
                              )}
                            </div>
                          </button>
                        )}

                        {/* Shift 2: Night */}
                        {(shiftFilter === 'all' || shiftFilter === 'night') && (
                          <button
                            type="button"
                            onClick={() => handleShiftClick(dayObj.dateStr, 'night', dayObj.isPast)}
                            disabled={dayObj.isPast}
                            className={`w-full text-right p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all flex flex-col justify-between relative group ${
                              dayObj.isPast
                                ? 'bg-[#17241d]/50 text-[#5f584d] border border-transparent cursor-not-allowed'
                                : nightReserved
                                ? 'bg-rose-950/70 border border-rose-600/70 text-rose-200 cursor-not-allowed shadow-sm'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-100 hover:border-emerald-400 cursor-pointer shadow-sm hover:shadow-emerald-500/20 active:scale-95'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                <Moon className="w-3 h-3 text-indigo-300 flex-shrink-0" />
                                <span>مسائي</span>
                              </span>

                              {nightReserved ? (
                                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white flex items-center gap-0.5 whitespace-nowrap">
                                  <Lock className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>محجوز</span>
                                </span>
                              ) : (
                                <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-[#0c1411] flex items-center gap-0.5 whitespace-nowrap">
                                  <span>متاح</span>
                                </span>
                              )}
                            </div>

                            {/* Price Tag or Booked Label */}
                            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] leading-tight">
                              {nightReserved ? (
                                <span className="text-rose-300 text-[9px] truncate max-w-[80px]">
                                  {isAdminLoggedIn && nightBooking
                                    ? nightBooking.customerName
                                    : 'مغلق'}
                                </span>
                              ) : (
                                <span className="font-extrabold text-emerald-300 whitespace-nowrap">
                                  {formatIQD(nightPrice)}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Notice at bottom of calendar */}
          <div className="mt-6 p-4 rounded-2xl bg-[#0c1411] border border-[#23382e] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#a39a8c]">
              <Clock className="w-4 h-4 text-[#c5a059]" />
              <span>
                مواعيد الفترات: الصباحي ({chaletConfig.morningShiftHours}) • المسائي ({chaletConfig.nightShiftHours})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={chaletConfig.googleMapsUrl || 'https://maps.app.goo.gl/DtcTahhdrzhLzKMc6'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14221c] border border-[#2e473a] text-xs font-semibold text-[#c5a059] hover:text-[#f4efe6] hover:border-[#c5a059] transition-colors"
                title="موقع الشاليه على خرائط جوجل"
              >
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>موقع الشاليه على الخريطة</span>
              </a>
              <div className="text-[#c5a059] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>قفل فوري للفترة باللون الأحمر فور الحجز</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDateStr={selectedDateStr}
        selectedShift={selectedShift}
        shiftPrice={selectedShiftPrice}
        chaletConfig={chaletConfig}
        onConfirmBooking={onConfirmBooking}
      />
    </section>
  );
};
