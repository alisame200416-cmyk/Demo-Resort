import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Users,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookingRecord, ChaletConfig, ShiftType } from '../types';
import { formatArabicDate, getArabicDayName } from '../utils/dateHelpers';
import { formatIQD, generateWhatsAppBookingUrl } from '../utils/bookingStore';
import {
  validateIraqiPhoneNumber,
  validateCustomerName,
  formatDisplayIraqiPhone,
} from '../utils/validation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr: string;
  selectedShift: ShiftType;
  shiftPrice: number;
  chaletConfig: ChaletConfig;
  onConfirmBooking: (booking: BookingRecord) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedDateStr,
  selectedShift,
  shiftPrice,
  chaletConfig,
  onConfirmBooking,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingRecord | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Anti-Spam & Serious Booking Controls
  const [isPledgeAccepted, setIsPledgeAccepted] = useState(true);
  const [securityCode, setSecurityCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');

  // Generate a random 4-digit human verification code when opening modal
  const generateNewSecurityCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSecurityCode(code);
    setUserInputCode('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewSecurityCode();
      setErrorMsg('');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shiftLabel =
    selectedShift === 'morning' ? 'الفترة الصباحية (Shift 1)' : 'الفترة المسائية (Shift 2)';
  const shiftHours =
    selectedShift === 'morning'
      ? chaletConfig.morningShiftHours
      : chaletConfig.nightShiftHours;

  const dayArabicName = getArabicDayName(selectedDateStr);
  const formattedDate = formatArabicDate(selectedDateStr);

  // Live Phone Validation Feedback
  const phoneValidation = validateIraqiPhoneNumber(customerPhone);
  const nameValidation = validateCustomerName(customerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    // 1. Strict Name Validation
    const nameCheck = validateCustomerName(customerName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || 'يرجى إدخال اسم حقيقي وصحيح لصاحب الحجز.');
      return;
    }

    // 2. Strict Iraqi Phone Validation
    const phoneCheck = validateIraqiPhoneNumber(customerPhone);
    if (!phoneCheck.isValid) {
      setErrorMsg(phoneCheck.error || 'يرجى إدخال رقم هاتف عراقي معتمد (07xxxxxxxxx).');
      return;
    }

    // 3. Human Anti-Spam Verification Code Check
    if (userInputCode.trim() !== securityCode) {
      setErrorMsg('رمز التحقق البشري غير مطابق. يرجى كتابة الرمز الأمني المعروض (4 أرقام) لمنع الحجز الآلي.');
      return;
    }

    // 4. Serious Booking Pledge Check
    if (!isPledgeAccepted) {
      setErrorMsg('يرجى الموافقة على تعهد الحجز الجاد لمنع الحجوزات الوهمية.');
      return;
    }

    setIsSubmitting(true);

    // Standardize phone for storage and communication
    const standardizedPhone = phoneCheck.normalized;

    // Generate unique booking ID for Maryam Resort
    const newBooking: BookingRecord = {
      id: 'MY-' + Math.floor(100000 + Math.random() * 900000),
      date: selectedDateStr,
      shift: selectedShift,
      shiftLabel,
      timeRange: shiftHours,
      customerName: customerName.trim(),
      customerPhone: standardizedPhone,
      guestsCount,
      notes: notes.trim(),
      priceIQD: shiftPrice,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      bookedBy: 'client',
    };

    // Step 1: Instantly lock the shift to Reserved (Red) to prevent double booking
    onConfirmBooking(newBooking);

    // Step 2: Generate WhatsApp URL (synchronized with chaletConfig.ownerWhatsApp)
    const url = generateWhatsAppBookingUrl(
      chaletConfig.ownerWhatsApp,
      newBooking,
      dayArabicName,
      formattedDate
    );
    setWhatsAppUrl(url);
    setCompletedBooking(newBooking);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#10b981', '#ffffff', '#eab308'],
      });
    } catch {
      // Ignore in environments without canvas support
    }

    // Attempt automatic WhatsApp redirect (safely guarded in sandboxed environments)
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // Handled gracefully: direct high-contrast button is ready for user click
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setCompletedBooking(null);
    setCustomerName('');
    setCustomerPhone('');
    setUserInputCode('');
    setNotes('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in">
      {/* Backdrop overlay for closing on click outside */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#111e18] border border-[#2e473a] rounded-2xl sm:rounded-3xl shadow-2xl text-right overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Sticky Fixed Modal Header - Always Visible on All Devices */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 sm:p-5 bg-[#0e1914] border-b border-[#23382e] flex-shrink-0 shadow-md">
          <button
            onClick={handleClose}
            type="button"
            className="p-2 rounded-xl bg-[#182921] border border-[#2d4639] text-[#f4efe6] hover:bg-rose-950/70 hover:text-rose-300 hover:border-rose-500/40 transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
            <span className="text-xs sm:hidden font-bold">إلغاء</span>
          </button>
          <div className="text-right flex-1 pr-3">
            <span className="text-[10px] sm:text-xs text-[#c5a059] font-semibold flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>نظام حجز موثق ومحمي</span>
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-[#f4efe6] truncate">
              {completedBooking ? 'تم تأكيد الحجز بنجاح!' : 'تأكيد تفاصيل الحجز الفوري'}
            </h3>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {/* State 1: Form to Book */}
          {!completedBooking ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shift & Date Summary Card */}
            <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e] space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#a39a8c] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#c5a059]" /> التاريخ:
                </span>
                <span className="font-bold text-[#f4efe6]">
                  {formattedDate} ({dayArabicName})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-[#a39a8c] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> الفترة المطلوبة:
                </span>
                <span className="font-bold text-emerald-400">
                  {shiftLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8c8273]">
                <span>التوقيت المعتمد:</span>
                <span>{shiftHours}</span>
              </div>

              <div className="border-t border-[#1f3329] pt-2 flex items-center justify-between text-sm sm:text-base">
                <span className="text-[#c5a059] font-bold">المبلغ الإجمالي بالدينار العراقي:</span>
                <span className="text-lg font-extrabold text-[#c5a059]">
                  {formatIQD(shiftPrice)}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Input: Customer Name with Real-Time Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#d6cec0]">
                  الاسم الكامل للشخص الحاجز <span className="text-[#c5a059]">*</span>
                </label>
                {customerName.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      nameValidation.isValid
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {nameValidation.isValid ? 'اسم صالح وموثق ✓' : 'اسم غير صالح'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: د. علي حيدر التميمي"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-xl bg-[#0c1411] border text-[#f4efe6] text-sm focus:outline-none transition-colors placeholder:text-[#5a6b61] ${
                    customerName.length > 0 && !nameValidation.isValid
                      ? 'border-rose-500/60 focus:border-rose-400'
                      : 'border-[#2d473a] focus:border-[#c5a059]'
                  }`}
                  id="booking-input-name"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b61]" />
              </div>
              <span className="text-[11px] text-[#8c8273] block mt-1">
                يرجى كتابة الاسم الثلاثي أو الثنائي الحقيقي (يُمنع استخدام الأسماء الوهمية أو المستعارة)
              </span>
            </div>

            {/* Input: Customer Phone with Iraqi Operator Detection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#d6cec0]">
                  رقم الهاتف العراقي (واتساب) <span className="text-[#c5a059]">*</span>
                </label>
                {customerPhone.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {phoneValidation.isValid && phoneValidation.operator && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{phoneValidation.operator}</span>
                      </span>
                    )}
                    {!phoneValidation.isValid && customerPhone.length >= 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                        صيغة غير صحيحة
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="0770 123 4567 أو 0780 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full px-4 py-3 pl-10 rounded-xl bg-[#0c1411] border text-[#f4efe6] text-sm focus:outline-none transition-colors placeholder:text-[#5a6b61] text-right font-mono ${
                    customerPhone.length > 3 && !phoneValidation.isValid
                      ? 'border-rose-500/60 focus:border-rose-400'
                      : customerPhone.length > 3 && phoneValidation.isValid
                      ? 'border-emerald-500/60 focus:border-emerald-400'
                      : 'border-[#2d473a] focus:border-[#c5a059]'
                  }`}
                  id="booking-input-phone"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b61]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8c8273] mt-1">
                <span>تنسيق معتمد: 11 رقماً يبدأ بـ 07 (زين / آسياسيل / كورك)</span>
                {customerPhone && (
                  <span dir="ltr" className="font-mono text-xs text-[#a39a8c]">
                    {customerPhone.replace(/[^\d]/g, '').length} / 11
                  </span>
                )}
              </div>
            </div>

            {/* Input: Number of Guests & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#d6cec0] mb-1.5">
                  عدد الأفراد المتوقع
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-[#0c1411] border border-[#2d473a] text-[#f4efe6] text-xs sm:text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b61]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d6cec0] mb-1.5">
                  ملاحظات أو طلبات (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مناسبة عائلية، شواء..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1411] border border-[#2d473a] text-[#f4efe6] text-xs focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#5a6b61]"
                />
              </div>
            </div>

            {/* Anti-Bot Human Security Challenge */}
            <div className="p-3.5 rounded-2xl bg-[#0a130f] border border-[#283e33] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#c5a059] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>التحقق الأمني البشري (Anti-Bot Check)</span>
                </span>
                <button
                  type="button"
                  onClick={generateNewSecurityCode}
                  className="text-[11px] text-[#a39a8c] hover:text-[#c5a059] flex items-center gap-1 transition-colors cursor-pointer"
                  title="تغيير الرمز"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>تحديث الرمز</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-[#14221c] border border-[#c5a059]/40 text-[#c5a059] font-mono font-black text-lg tracking-widest select-none shadow-inner">
                  {securityCode}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    maxLength={4}
                    dir="ltr"
                    placeholder="اكتب الرمز هنا"
                    value={userInputCode}
                    onChange={(e) => setUserInputCode(e.target.value.replace(/[^\d]/g, ''))}
                    className={`w-full px-3 py-2 rounded-xl bg-[#0c1411] border text-center font-mono text-sm tracking-widest text-[#f4efe6] focus:outline-none transition-colors ${
                      userInputCode.length === 4 && userInputCode === securityCode
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                        : 'border-[#2d473a] focus:border-[#c5a059]'
                    }`}
                  />
                </div>
                {userInputCode === securityCode && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-[#71685a]">
                خطوة حماية إلزامية لضمان جدية الطلبات ومنع الحجوزات الوهمية والسبام المؤتمت.
              </p>
            </div>

            {/* Serious Booking Pledge Checkbox */}
            <div
              onClick={() => setIsPledgeAccepted(!isPledgeAccepted)}
              className="p-3 rounded-xl bg-[#0f1b15] border border-[#23382e] flex items-start gap-2.5 cursor-pointer hover:border-[#2e473a] transition-colors select-none"
            >
              <div className="mt-0.5 text-[#c5a059]">
                {isPledgeAccepted ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-[#5a6b61]" />
                )}
              </div>
              <p className="text-xs text-[#d6cec0] leading-relaxed">
                <span className="font-bold text-[#f4efe6]">تعهد الحجز الجاد:</span> أتعهد بأنني عميل حقيقي وجاد، وأوافق على إرسال تفاصيل الحجز وتثبيته فوراً مع إدارة شاليه مريم عبر واتساب.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#d5b069] to-[#b38e46] text-[#0c1411] font-extrabold text-sm sm:text-base hover:from-[#d5b069] hover:to-[#c5a059] transition-all shadow-xl shadow-[#c5a059]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                id="confirm-booking-submit-btn"
              >
                <Sparkles className="w-5 h-5" />
                <span>تأكيد الحجز الموثق وقفل الفترة فوراً</span>
              </button>
              <p className="text-[11px] text-[#8c8273] text-center mt-2">
                يتم قفل الفترة باللون الأحمر بالتقويم لمنع أي تضارب، مع ربط مباشر برقم واتساب الإدارة
              </p>
            </div>
          </form>
        ) : (
          /* State 2: Success Confirmation & Direct WhatsApp trigger */
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-[#f4efe6]">
                تم قفل الفترة وحجز موعدك بنجاح!
              </h4>
              <p className="text-xs text-[#a39a8c] leading-relaxed max-w-sm mx-auto">
                تم تحويل حالة الفترة إلى <span className="text-red-400 font-bold">محجوز (أحمر)</span> على التقويم العام، وتجهيز رسالة واتساب الرسمية لمالك الشاليه.
              </p>
            </div>

            {/* Booking Reference card */}
            <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e] space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#1b2f25] pb-2">
                <span className="text-[#8c8273]">رقم مرجع الحجز الموثق:</span>
                <span className="font-mono font-bold text-[#c5a059]">{completedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8273]">اسم العميل:</span>
                <span className="text-[#f4efe6] font-semibold">{completedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8273]">رقم الهاتف:</span>
                <span className="text-emerald-400 font-mono font-semibold" dir="ltr">
                  {formatDisplayIraqiPhone(completedBooking.customerPhone, true)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8273]">الموعد والفترة:</span>
                <span className="text-emerald-400 font-semibold">{formattedDate} - {shiftLabel}</span>
              </div>
              <div className="flex justify-between border-t border-[#1b2f25] pt-2">
                <span className="text-[#c5a059] font-bold">المبلغ المعتمد:</span>
                <span className="font-bold text-[#c5a059]">{formatIQD(completedBooking.priceIQD)}</span>
              </div>
            </div>

            {/* Direct WhatsApp button */}
            <div className="space-y-3">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                id="whatsapp-direct-link"
              >
                <Phone className="w-5 h-5 fill-white" />
                <span>إرسال تفاصيل الحجز إلى مالك الشاليه عبر واتساب</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-[#14221c] border border-[#2d473a] text-[#d6cec0] hover:text-[#f4efe6] text-xs font-semibold cursor-pointer"
              >
                العودة إلى جدول التقويم
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

