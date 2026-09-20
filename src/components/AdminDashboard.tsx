import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Lock,
  Unlock,
  Trash2,
  Phone,
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Settings,
  PlusCircle,
  LogOut,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Upload,
  Camera,
  Loader2,
  Check,
} from 'lucide-react';
import { BookingRecord, ChaletConfig, PricingConfig, ShiftType, ResortImagesConfig } from '../types';
import { formatArabicDate, getArabicDayName } from '../utils/dateHelpers';
import { formatIQD } from '../utils/bookingStore';
import { DEFAULT_RESORT_IMAGES } from '../data/chaletData';
import {
  validateIraqiPhoneNumber,
  isSuspiciousBooking,
  formatDisplayIraqiPhone,
  toIraqiInternationalNumber,
} from '../utils/validation';
import {
  saveChaletConfigToCloud,
  savePricingConfigToCloud,
  saveImagesConfigToCloud,
  saveSingleImageToCloud,
  uploadResortImageFile,
  deleteResortImage,
  saveBookingToCloud,
} from '../lib/firebase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  bookings: Record<string, BookingRecord>;
  onCancelBooking: (shiftKey: string) => void;
  onClearSuspiciousBookings?: () => void;
  onClearAllBookings?: () => void;
  onManualReserve: (booking: BookingRecord) => void;
  chaletConfig: ChaletConfig;
  onUpdateChaletConfig: (config: ChaletConfig) => void;
  pricingConfig: PricingConfig;
  onUpdatePricingConfig: (pricing: PricingConfig) => void;
  imagesConfig: ResortImagesConfig;
  onUpdateImagesConfig: (images: ResortImagesConfig) => void;
  cloudStatus?: 'synced' | 'connecting' | 'local';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLogin,
  onLogout,
  bookings,
  onCancelBooking,
  onClearSuspiciousBookings,
  onClearAllBookings,
  onManualReserve,
  chaletConfig,
  onUpdateChaletConfig,
  pricingConfig,
  onUpdatePricingConfig,
  imagesConfig,
  onUpdateImagesConfig,
  cloudStatus = 'synced',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'manual' | 'settings' | 'images'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<'all' | 'morning' | 'night'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'suspicious' | 'verified' | 'admin'>('all');

  // Manual block/reservation form state
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualShift, setManualShift] = useState<ShiftType>('morning');
  const [manualName, setManualName] = useState('حجز خاص للإدارة / صيانة');
  const [manualPhone, setManualPhone] = useState('07700000000');
  const [manualPrice, setManualPrice] = useState('0');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Inline deletion confirmation state
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Settings form state
  const [tempConfig, setTempConfig] = useState<ChaletConfig>(chaletConfig);
  const [tempPricing, setTempPricing] = useState<PricingConfig>(pricingConfig);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Images form state
  const [tempImages, setTempImages] = useState<ResortImagesConfig>(imagesConfig || DEFAULT_RESORT_IMAGES);
  const [imagesSuccessMsg, setImagesSuccessMsg] = useState('');
  const [isProcessingKey, setIsProcessingKey] = useState<string | null>(null);

  // Sync internal states when external props update
  useEffect(() => {
    setTempConfig(chaletConfig);
  }, [chaletConfig]);

  useEffect(() => {
    setTempPricing(pricingConfig);
  }, [pricingConfig]);

  useEffect(() => {
    if (imagesConfig) {
      setTempImages(imagesConfig);
    }
  }, [imagesConfig]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  // Convert bookings record to list sorted by date descending
  const bookingList: { key: string; record: BookingRecord }[] = Object.entries(bookings)
    .filter(([_, b]) => b.status === 'confirmed')
    .map(([key, record]) => ({ key, record }))
    .sort((a, b) => b.record.date.localeCompare(a.record.date));

  // Filter list with Anti-Spam & Status segmentation
  const bookingListWithStatus = bookingList.map(({ key, record }) => {
    const isSuspicious = isSuspiciousBooking(record.customerName, record.customerPhone);
    const phoneCheck = validateIraqiPhoneNumber(record.customerPhone);
    return {
      key,
      record,
      isSuspicious,
      phoneCheck,
    };
  });

  const suspiciousBookingsCount = bookingListWithStatus.filter((b) => b.isSuspicious).length;

  const filteredBookings = bookingListWithStatus.filter(({ record, isSuspicious }) => {
    const matchesSearch =
      record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customerPhone.includes(searchQuery) ||
      record.date.includes(searchQuery) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesShift = filterShift === 'all' || record.shift === filterShift;

    let matchesStatus = true;
    if (filterStatus === 'suspicious') {
      matchesStatus = isSuspicious;
    } else if (filterStatus === 'verified') {
      matchesStatus = !isSuspicious && record.bookedBy !== 'admin';
    } else if (filterStatus === 'admin') {
      matchesStatus = record.bookedBy === 'admin';
    }

    return matchesSearch && matchesShift && matchesStatus;
  });

  // Quick statistics
  const totalBookingsCount = bookingList.length;
  const totalRevenueIQD = bookingList.reduce((acc, b) => acc + (b.record.priceIQD || 0), 0);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shiftLabel = manualShift === 'morning' ? 'الفترة الصباحية' : 'الفترة المسائية';
    const timeRange =
      manualShift === 'morning'
        ? chaletConfig.morningShiftHours
        : chaletConfig.nightShiftHours;

    const newBooking: BookingRecord = {
      id: 'ADM-' + Math.floor(100000 + Math.random() * 900000),
      date: manualDate,
      shift: manualShift,
      shiftLabel,
      timeRange,
      customerName: manualName.trim(),
      customerPhone: manualPhone.trim(),
      priceIQD: parseInt(manualPrice) || 0,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      bookedBy: 'admin',
    };

    onManualReserve(newBooking);
    setManualSuccessMsg('تم قفل الفترة وتثبيت الحجز اليدوي بنجاح!');
    setTimeout(() => setManualSuccessMsg(''), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateChaletConfig(tempConfig);
    onUpdatePricingConfig(tempPricing);
    setSettingsSuccessMsg('تم حفظ وتحديث الإعدادات والأسعار بنجاح!');
    setTimeout(() => setSettingsSuccessMsg(''), 3500);
  };

  const handleSaveImages = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onUpdateImagesConfig(tempImages);
      await saveImagesConfigToCloud(tempImages);
      setImagesSuccessMsg('تم حفظ وتحديث كافة صور المنتجع في قاعدة بيانات Firestore السحابية بنجاح!');
      setTimeout(() => setImagesSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Failed to save images to cloud:', err);
      setImagesSuccessMsg('حدث خطأ أثناء حفظ الصور في السحابة. يرجى التحقق من اتصال الإنترنت.');
    }
  };

  const handleSingleImageDelete = async (key: keyof ResortImagesConfig) => {
    if (window.confirm('هل تريد حذف هذه الصورة من السحابة والموقع؟')) {
      try {
        await deleteResortImage(key);
        const updated = {
          ...tempImages,
          [key]: '',
        };
        setTempImages(updated);
        onUpdateImagesConfig(updated);
        setImagesSuccessMsg(`تم حذف الصورة بنجاح وتحديث السحابة.`);
        setTimeout(() => setImagesSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Delete image error:', err);
        alert('حدث خطأ أثناء حذف الصورة من السحابة.');
      }
    }
  };

  const handleFileUpload = async (key: keyof ResortImagesConfig, file: File) => {
    try {
      setIsProcessingKey(key);
      // 1. Upload the real binary file via free ImgBB API and save permanent URL to Firestore
      const directImageUrl = await uploadResortImageFile(key, file);

      // 2. Update local state and parent state immediately
      const updated = {
        ...tempImages,
        [key]: directImageUrl,
      };
      setTempImages(updated);
      onUpdateImagesConfig(updated);

      setImagesSuccessMsg('تم رفع الصورة بنجاح عبر ImgBB وحفظ الرابط الدائم في Firestore وتحديث الموقع فوراً!');
      setTimeout(() => setImagesSuccessMsg(''), 4500);
    } catch (err: any) {
      console.error('ImgBB upload error:', err);
      const errMsg = err?.message || 'حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.';
      alert(errMsg);
    } finally {
      setIsProcessingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fade-in">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl bg-[#111e18] border border-[#2e473a] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-[#0c1411] border-b border-[#23382e] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1a2d24] border border-[#2e473a] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-[#f4efe6]">
                  لوحة تحكم إدارة الشاليه (Owner Panel)
                </h2>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>سحابة Firebase متزامنة لحظياً</span>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs text-[#a39a8c] block truncate max-w-[260px] sm:max-w-none">
                التحكم المباشر في الفترات، إلغاء وإطلاق الحجوزات، وضبط الأسعار سحابياً
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onLogout}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1a2b22] hover:bg-rose-950/50 hover:text-rose-300 text-xs font-semibold text-[#a39a8c] border border-[#2d473a] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="تسجيل الخروج من لوحة الإدارة"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تسجيل خروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-2 sm:p-2.5 rounded-xl bg-[#1a2b22] border border-[#2d473a] text-[#f4efe6] hover:bg-rose-950/70 hover:text-rose-300 transition-colors cursor-pointer active:scale-95 shadow-sm"
              aria-label="إغلاق اللوحة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View 1: If NOT logged in -> Password PIN Pad */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#182921] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shadow-lg shadow-[#c5a059]/10">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#f4efe6] mb-2">
                منطقة محمية لمالك الشاليه
              </h3>
              <p className="text-xs text-[#a39a8c]">
                أدخل رمز المرور السري (PIN) للوصول إلى لوحة التحكم وإدارة الحجوزات.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="رمز المرور (الافتراضي: 1234)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#0c1411] border border-[#2e473a] text-center text-lg tracking-widest text-[#f4efe6] focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-xs placeholder:tracking-normal placeholder:text-[#5f6e65]"
                  autoFocus
                  id="admin-pin-input"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>رمز المرور غير صحيح! يرجى المحاولة مجدداً (الافتراضي: 1234)</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all shadow-md shadow-[#c5a059]/20 cursor-pointer"
                id="admin-login-submit"
              >
                دخول إلى لوحة التحكم
              </button>
            </form>

            <div className="p-3 rounded-xl bg-[#14221c] border border-[#23382e] text-[11px] text-[#8c8273]">
              💡 الرمز الافتراضي المبرمج في النظام هو: <span className="font-mono font-bold text-[#c5a059]">1234</span> (يمكنك تغييره من تبويب الإعدادات بعد الدخول).
            </div>
          </div>
        ) : (
          /* View 2: Logged in Dashboard */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e]">
                <span className="text-xs text-[#a39a8c] block mb-1">إجمالي الحجوزات النشطة</span>
                <p className="text-2xl font-black text-emerald-400">{totalBookingsCount}</p>
                <span className="text-[11px] text-[#635c52]">فترات محجوزة ومغلقة</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e]">
                <span className="text-xs text-[#a39a8c] block mb-1">تقدير الإيرادات</span>
                <p className="text-lg sm:text-xl font-black text-[#c5a059] truncate">
                  {formatIQD(totalRevenueIQD)}
                </p>
                <span className="text-[11px] text-[#635c52]">إجمالي المبالغ المسجلة</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e]">
                <span className="text-xs text-[#a39a8c] block mb-1">هاتف الواتساب المربوط</span>
                <p className="text-sm font-bold text-[#f4efe6] truncate" dir="ltr">
                  +{chaletConfig.ownerWhatsApp}
                </p>
                <span className="text-[11px] text-[#635c52]">يستقبل رسائل الحجز</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e]">
                <span className="text-xs text-[#a39a8c] block mb-1">حالة النظام</span>
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تحديث لحظي نشط</span>
                </p>
                <span className="text-[11px] text-[#635c52]">منع حجز مزدوج 100%</span>
              </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="flex border-b border-[#23382e] gap-2 sm:gap-4 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'bookings'
                    ? 'border-[#c5a059] text-[#c5a059]'
                    : 'border-transparent text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>إدارة الحجوزات والإلغاء ({totalBookingsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'manual'
                    ? 'border-[#c5a059] text-[#c5a059]'
                    : 'border-transparent text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>حجز يدوي / حظر موعد للصيانة</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'border-[#c5a059] text-[#c5a059]'
                    : 'border-transparent text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إعدادات الأسعار وواتساب والـ PIN</span>
              </button>

              <button
                onClick={() => setActiveTab('images')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'images'
                    ? 'border-[#c5a059] text-[#c5a059]'
                    : 'border-transparent text-[#a39a8c] hover:text-[#f4efe6]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>إدارة الصور والواجهة (Images)</span>
              </button>
            </div>

            {/* TAB 1: Bookings List with Anti-Spam Controls and One-Click Purge */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {/* Suspicious Anti-Spam Emergency Alert Banner */}
                {suspiciousBookingsCount > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border border-rose-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-300">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-200">
                          تم رصد {suspiciousBookingsCount} حجز وهمي / سبام في النظام!
                        </h4>
                        <p className="text-xs text-rose-300/80">
                          هذه الحجوزات مسجلة بأرقام غير عراقية أو أسماء غير حقيقية ويمكنك بنقرة واحدة إزالتها وتفريغ الفترات للعملاء الجادين.
                        </p>
                      </div>
                    </div>

                    {onClearSuspiciousBookings && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `هل تود حذف وتطهير كافة الحجوزات المشبوهة (${suspiciousBookingsCount}) فوراً وإعادة فتراتها متاحة باللون الأخضر؟`
                            )
                          ) {
                            onClearSuspiciousBookings();
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/50 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>تطهير كافة الحجوزات الوهمية فوراً</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      placeholder="بحث باسم العميل، الهاتف، أو التاريخ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#0c1411] border border-[#23382e] text-xs sm:text-sm text-[#f4efe6] focus:outline-none focus:border-[#c5a059] placeholder:text-[#5f6e65]"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6e65]" />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    {/* Shift Filter */}
                    <select
                      value={filterShift}
                      onChange={(e) => setFilterShift(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-[#0c1411] border border-[#23382e] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="all">كافة الفترات</option>
                      <option value="morning">الفترة الصباحية</option>
                      <option value="night">الفترة المسائية</option>
                    </select>

                    {/* Status Segmentation Pills */}
                    <div className="flex items-center bg-[#0c1411] border border-[#23382e] rounded-xl p-1 text-xs">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'all'
                            ? 'bg-[#1a2d24] text-[#c5a059] font-bold'
                            : 'text-[#a39a8c] hover:text-[#f4efe6]'
                        }`}
                      >
                        الكل ({totalBookingsCount})
                      </button>
                      <button
                        onClick={() => setFilterStatus('verified')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'verified'
                            ? 'bg-[#1a2d24] text-emerald-400 font-bold'
                            : 'text-[#a39a8c] hover:text-[#f4efe6]'
                        }`}
                      >
                        الموثقة
                      </button>
                      <button
                        onClick={() => setFilterStatus('suspicious')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                          filterStatus === 'suspicious'
                            ? 'bg-rose-950 text-rose-300 font-bold'
                            : 'text-[#a39a8c] hover:text-rose-400'
                        }`}
                      >
                        <span>مشبوهة</span>
                        {suspiciousBookingsCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                            {suspiciousBookingsCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setFilterStatus('admin')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          filterStatus === 'admin'
                            ? 'bg-purple-950 text-purple-300 font-bold'
                            : 'text-[#a39a8c] hover:text-[#f4efe6]'
                        }`}
                      >
                        إدارة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table or Empty state */}
                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0c1411] border border-[#23382e]">
                    <Calendar className="w-12 h-12 text-[#2d473a] mx-auto mb-3" />
                    <h4 className="text-base font-bold text-[#f4efe6] mb-1">
                      لا توجد حجوزات مسجلة مطابقة
                    </h4>
                    <p className="text-xs text-[#a39a8c]">
                      {searchQuery
                        ? 'جرّب تعديل كلمات البحث أو الفلتر.'
                        : 'كافة الفترات متاحة حالياً على التقويم باللون الأخضر.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map(({ key, record, isSuspicious, phoneCheck }) => {
                      const dayName = getArabicDayName(record.date);
                      const formattedDate = formatArabicDate(record.date);

                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                            isSuspicious
                              ? 'bg-[#170c0e] border-rose-500/50 hover:border-rose-400'
                              : 'bg-[#0c1411] border-[#23382e] hover:border-[#2e473a]'
                          }`}
                        >
                          {/* Client & Booking details */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[#c5a059]">
                                #{record.id}
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1e2e25] text-emerald-400 border border-emerald-500/20">
                                {record.shiftLabel}
                              </span>

                              {/* Suspicious Alert Badge */}
                              {isSuspicious && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/60 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  <span>حجز مشبوه / هاتف غير عراقي معتمد</span>
                                </span>
                              )}

                              {/* Verified Iraqi Operator Badge */}
                              {!isSuspicious && phoneCheck.isValid && phoneCheck.operator && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium">
                                  {phoneCheck.operator}
                                </span>
                              )}

                              {record.bookedBy === 'admin' && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                                  حجز إدارة / صيانة
                                </span>
                              )}

                              <span className="text-xs text-[#8c8273]">
                                {formattedDate} ({dayName})
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs sm:text-sm pt-0.5">
                              <span className="font-bold text-[#f4efe6] flex items-center gap-1.5">
                                <User className="w-4 h-4 text-[#c5a059]" /> {record.customerName}
                              </span>
                              <span className="text-[#a39a8c] flex items-center gap-1.5 font-mono" dir="ltr">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{formatDisplayIraqiPhone(record.customerPhone, true)}</span>
                              </span>
                            </div>

                            {record.notes && (
                              <p className="text-xs text-[#7d7466] italic">
                                ملاحظة: {record.notes}
                              </p>
                            )}
                          </div>

                          {/* Price & Action Buttons */}
                          <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1f3328]">
                            <div className="text-right lg:text-left pl-2">
                              <span className="text-[10px] text-[#8c8273] block">المبلغ:</span>
                              <span className="text-sm font-bold text-[#c5a059]">
                                {formatIQD(record.priceIQD)}
                              </span>
                            </div>

                            {/* Direct WhatsApp Client Button */}
                            <a
                              href={`https://wa.me/${toIraqiInternationalNumber(record.customerPhone)}?text=${encodeURIComponent(`مرحباً ${record.customerName}، معكم إدارة ${chaletConfig.name} بخصوص حجزكم بتاريخ ${formattedDate} (${record.shiftLabel})`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="مراسلة العميل عبر واتساب"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="hidden sm:inline">واتساب</span>
                            </a>

                            {/* Instant Delete / Cancel Button (Frees slot back to green immediately) */}
                            {deleteConfirmKey === key ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onCancelBooking(key);
                                    setDeleteConfirmKey(null);
                                  }}
                                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 transition-all"
                                  title="تأكيد الحذف النهائي وإتاحة الفترة لتصبح خضراء"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>تأكيد الحذف (تفريغ للأخضر)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmKey(null)}
                                  className="px-2.5 py-2 rounded-xl bg-[#14221c] text-[#a39a8c] hover:text-[#f4efe6] border border-[#2e473a] text-xs cursor-pointer transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmKey(key)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                                  isSuspicious
                                    ? 'bg-rose-900/90 hover:bg-rose-800 border-rose-500 text-white shadow-md shadow-rose-950'
                                    : 'bg-rose-950/60 hover:bg-rose-900 border-rose-500/50 text-rose-200 hover:text-white'
                                }`}
                                title="حذف الحجز فوراً وإتاحة الفترة لتصبح خضراء"
                              >
                                <Trash2 className="w-4 h-4 text-rose-300" />
                                <span>{isSuspicious ? 'حذف الحجز الوهمي (تفريغ للأخضر)' : 'حذف الحجز (تفريغ للأخضر)'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Danger Zone: Full Calendar Reset */}
                {totalBookingsCount > 0 && onClearAllBookings && (
                  <div className="pt-4 border-t border-[#1f3328] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8c8273]">
                    <span>هل تريد بدء موسم جديد أو مسح كافة الحجوزات التجريبية؟</span>
                    {showResetConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClearAllBookings();
                            setShowResetConfirm(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-950/50 transition-all"
                        >
                          تأكيد مسح كافة الحجوزات
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#14221c] border border-[#2e473a] text-[#a39a8c] hover:text-[#f4efe6] text-xs cursor-pointer"
                        >
                          تراجع
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3 py-1.5 rounded-lg border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900 hover:text-white transition-colors cursor-pointer"
                      >
                        إعادة تهيئة التقويم بالكامل (مسح الكل)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Manual Reservation / Block Slot for Maintenance */}
            {activeTab === 'manual' && (
              <div className="bg-[#0c1411] border border-[#23382e] rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
                <div className="border-b border-[#1f3328] pb-3">
                  <h4 className="text-base font-bold text-[#f4efe6]">
                    قفل فترة يدوياً (حجز خاص أو صيانة للمسبح)
                  </h4>
                  <p className="text-xs text-[#a39a8c]">
                    استخدم هذا النموذج لقفل أي يوم وفترة على التقويم فوراً حتى تظهر للمستخدمين باللون الأحمر (محجوز).
                  </p>
                </div>

                {manualSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{manualSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                        تاريخ الحجز
                      </label>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                        الفترة المطلوبة
                      </label>
                      <select
                        value={manualShift}
                        onChange={(e) => setManualShift(e.target.value as ShiftType)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                      >
                        <option value="morning">الفترة الصباحية (Shift 1)</option>
                        <option value="night">الفترة المسائية (Shift 2)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                      اسم العميل / سبب القفل
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="مثال: حجز شخصي للإدارة، أو تنظيف وفلترة المسبح"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        value={manualPhone}
                        onChange={(e) => setManualPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                        المبلغ المسجل (بالدينار العراقي)
                      </label>
                      <input
                        type="number"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-xs sm:text-sm hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    قفل وتثبيت الحجز على التقويم فوراً
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: Chalet Settings & Pricing & PIN */}
            {activeTab === 'settings' && (
              <div className="bg-[#0c1411] border border-[#23382e] rounded-2xl p-6 max-w-3xl mx-auto space-y-6">
                <div className="border-b border-[#1f3328] pb-3">
                  <h4 className="text-base font-bold text-[#f4efe6]">
                    إعدادات الشاليه، أسعار الدينار العراقي، ورمز الدخول
                  </h4>
                  <p className="text-xs text-[#a39a8c]">
                    هذه البيانات قابلة للتعديل والتحديث في أي وقت وتنعكس فوراً على واجهة العميل.
                  </p>
                </div>

                {settingsSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{settingsSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* General settings */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                      معلومات الاتصال والتحكم
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          رقم واتساب المالك لاستقبال الحجوزات (بدون +)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={tempConfig.ownerWhatsApp}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, ownerWhatsApp: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                        <span className="text-[10px] text-[#716a5d] block mt-0.5">
                          مثال للعراق: 9647701234567
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          رمز المرور السري (PIN) للوحة التحكم
                        </label>
                        <input
                          type="text"
                          value={tempConfig.adminPin}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, adminPin: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          ساعات الفترة الصباحية
                        </label>
                        <input
                          type="text"
                          value={tempConfig.morningShiftHours}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, morningShiftHours: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          ساعات الفترة المسائية
                        </label>
                        <input
                          type="text"
                          value={tempConfig.nightShiftHours}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, nightShiftHours: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                        رابط موقع الشاليه على خرائط جوجل (Google Maps Link)
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={tempConfig.googleMapsUrl || ''}
                        onChange={(e) =>
                          setTempConfig({ ...tempConfig, googleMapsUrl: e.target.value })
                        }
                        placeholder="https://maps.app.goo.gl/DtcTahhdrzhLzKMc6"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                      />
                      <span className="text-[10px] text-[#716a5d] block mt-0.5">
                        الرابط الافتراضي: https://maps.app.goo.gl/DtcTahhdrzhLzKMc6 (يتم فتحه فور ضغط الزبائن على أزرار الموقع)
                      </span>
                    </div>
                  </div>

                  {/* Pricing settings */}
                  <div className="space-y-4 pt-4 border-t border-[#1f3328]">
                    <h5 className="text-xs font-bold text-[#c5a059] uppercase tracking-wider">
                      قائمة الأسعار بالدينار العراقي (IQD)
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          أيام الأسبوع - صباحي
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekdayMorning}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekdayMorning: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          أيام الأسبوع - مسائي
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekdayNight}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekdayNight: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#d6cec0] mb-1">
                          أيام الأسبوع - يوم كامل
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekdayFullDay}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekdayFullDay: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#c5a059] mb-1">
                          نهاية الأسبوع - صباحي
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekendMorning}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekendMorning: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#c5a059] mb-1">
                          نهاية الأسبوع - مسائي
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekendNight}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekendNight: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#c5a059] mb-1">
                          نهاية الأسبوع - يوم كامل
                        </label>
                        <input
                          type="number"
                          step={5000}
                          value={tempPricing.weekendFullDay}
                          onChange={(e) =>
                            setTempPricing({
                              ...tempPricing,
                              weekendFullDay: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#14221c] border border-[#2e473a] text-xs text-[#f4efe6] focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all cursor-pointer"
                  >
                    حفظ كافة التعديلات والأسعار
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: Direct File Upload Image Management (Owner Control Panel) */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c1411] border border-[#23382e]">
                  <div>
                    <h3 className="text-base font-bold text-[#f4efe6] flex items-center gap-2">
                      <Upload className="w-5 h-5 text-[#c5a059]" />
                      <span>رفع وتثبيت صور المنتجع عبر ImgBB السحابي المجاني (بدون بطاقة بنكية)</span>
                    </h3>
                    <p className="text-xs text-[#a39a8c] mt-1">
                      يتم رفع ملفات الصور مباشرة عبر خدمة ImgBB المجانية وحفظ الروابط المباشرة في Firestore لتبقى الصور ثابتة دائماً حتى بعد التمرير والتحديث.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveImages}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-xs hover:from-[#d5b069] hover:to-[#c5a059] transition-all shadow-md shadow-[#c5a059]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد وحفظ كافة الصور في Firestore</span>
                    </button>
                  </div>
                </div>

                {/* Success Message Banner */}
                {imagesSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{imagesSuccessMsg}</span>
                  </div>
                )}

                {/* Helper Tips */}
                <div className="p-3.5 rounded-xl bg-[#14221c]/70 border border-[#23382e] text-[11px] sm:text-xs text-[#a39a8c] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-[#f4efe6]">نظام رفع الصور المجاني (ImgBB + Firestore):</strong> عند اختيار صورة من جهازك، يتم رفعها فوراً إلى ImgBB مجاناً دون بطاقة بنكية، ويتم أخذ الرابط المباشر الدائم (https://i.ibb.co/...) وحفظه في قاعدة بيانات Firestore السحابية فوراً لضمان بقائها دائمة وعدم اختفائها أبداً عند التمرير أو تحديث الصفحة!
                  </p>
                </div>

                {/* Form of 10 Direct Upload Image Fields */}
                <form onSubmit={handleSaveImages} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'heroBanner' as const,
                        label: 'صورة الواجهة والبانر الرئيسي (Main Hero Banner)',
                        badge: 'الواجهة الرئيسية',
                        description: 'خلفية الصفحة الترحيبية والبانر الرئيسي للمنتجع في أعلى الموقع',
                        recommended: 'أفقية عريضة 2000 × 1200 px',
                      },
                      {
                        key: 'swimmingPool' as const,
                        label: 'صورة المسبح الأولمبي والشلال (Olympic Pool)',
                        badge: 'المسبح والشلال',
                        description: 'تظهر في قسم مواصفات المسبح، وبطاقة المسبح، وبطاقة المعرض',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'animalSanctuary' as const,
                        label: 'صورة محمية الحيوانات والطيور (Animal Sanctuary)',
                        badge: 'محمية 100 م²',
                        description: 'تظهر في قسم مزرعة الحيوانات والطيور وبطاقة الاستكشاف',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'kidsPlayground' as const,
                        label: 'صورة منطقة ألعاب الأطفال (Kids Play Area)',
                        badge: 'ألعاب الأطفال',
                        description: 'تظهر في بطاقة ألعاب الأطفال الآمنة والحدائق الترفيهية',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'sportsRecreation' as const,
                        label: 'صورة الملاعب والأنشطة الرياضية (Sports Grounds)',
                        badge: 'الملاعب الرياضية',
                        description: 'تظهر في بطاقة ملاعب كرة القدم، الطائرة، وكرة الريشة',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'outdoorBbq' as const,
                        label: 'صورة محطة الشواء والباربيكيو (BBQ Station)',
                        badge: 'ركن الباربيكيو',
                        description: 'تظهر في بطاقة محطة الشواء والفرن الحجري والجلسات الخارجية',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'adultGames' as const,
                        label: 'صورة صالة ألعاب الكبار (Adult Games Hall)',
                        badge: 'بلياردو وهوكي',
                        description: 'تظهر في بطاقة صالة الألعاب المكيفة (بلياردو، تنس، هوكي، فوتوش)',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'masterBedrooms' as const,
                        label: 'صورة غرفتي النوم الماستر (Master Bedrooms)',
                        badge: 'غرفتان ماستر',
                        description: 'أجنحة النوم الملكية المطلة مباشرة على المسبح والحدائق',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'villaExterior' as const,
                        label: 'صورة الواجهة الخارجية والحدائق (Villa & Gardens)',
                        badge: 'المساحة 2500 م²',
                        description: 'تظهر في قسم المعرض وبطاقات بساتين النخيل والحدائق الخضراء',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                      {
                        key: 'nightPool' as const,
                        label: 'صورة إضاءة المسبح الليلية الساحرة (Night Pool)',
                        badge: 'إضاءة ليلية',
                        description: 'تظهر في معرض الصور لأجواء المساء وجلسات المسبح الهادئة',
                        recommended: 'أفقية 1200 × 800 px',
                      },
                    ].map((item) => {
                      const currentVal = tempImages[item.key]?.trim() || '';
                      const hasUploadedImage = Boolean(currentVal);
                      const isUploading = isProcessingKey === item.key;
                      const inputId = `file-upload-${item.key}`;

                      return (
                        <div
                          key={item.key}
                          className="p-4 rounded-2xl bg-[#0c1411] border border-[#23382e] hover:border-[#c5a059]/40 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            {/* Card Top Header */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-[#f4efe6] truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#182f23] text-[#c5a059] border border-[#c5a059]/30 shrink-0">
                                {item.badge}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#8c8273] mb-3 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Hidden Native File Input */}
                            <input
                              id={inputId}
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(item.key, file);
                                }
                                e.target.value = '';
                              }}
                            />

                            {/* Interactive Clickable Thumbnail / Drop Area */}
                            <label
                              htmlFor={inputId}
                              className="relative block w-full h-40 rounded-xl overflow-hidden bg-[#14221c] border border-[#23382e] hover:border-[#c5a059]/70 mb-3 group cursor-pointer transition-colors"
                            >
                              {hasUploadedImage ? (
                                <img
                                  src={currentVal}
                                  alt={item.label}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#101b15]">
                                  <div className="w-10 h-10 rounded-full bg-[#182f23] border border-[#2d4d3a] flex items-center justify-center mb-1 text-[#c5a059]">
                                    <Camera className="w-5 h-5" />
                                  </div>
                                  <span className="text-xs font-bold text-[#d2c9b8]">لم يتم رفع صورة بعد</span>
                                  <span className="text-[10px] text-[#786e60] mt-0.5">انقر لرفع صورة عبر ImgBB مجاناً</span>
                                </div>
                              )}

                              {/* Loading Overlay */}
                              {isUploading ? (
                                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-3 text-center animate-fade-in z-20">
                                  <Loader2 className="w-8 h-8 text-[#c5a059] animate-spin mb-2" />
                                  <span className="text-xs font-bold text-[#f4efe6]">
                                    جاري رفع الصورة إلى ImgBB...
                                  </span>
                                  <span className="text-[10px] text-[#a39a8c] mt-0.5">
                                    يتم استخراج الرابط المباشر وحفظه في Firestore
                                  </span>
                                </div>
                              ) : (
                                /* Normal Hover Overlay */
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2 z-10">
                                  <div className="w-10 h-10 rounded-full bg-black/70 border border-[#c5a059] flex items-center justify-center mb-1 shadow-lg">
                                    <Camera className="w-5 h-5 text-[#c5a059]" />
                                  </div>
                                  <span className="text-xs font-bold text-[#f4efe6] bg-black/70 px-2 py-0.5 rounded">
                                    {hasUploadedImage ? 'انقر لتغيير الصورة' : 'انقر لرفع صورة من جهازك'}
                                  </span>
                                </div>
                              )}

                              {/* Corner Badges */}
                              <div className="absolute top-2 right-2 pointer-events-none z-10">
                                {hasUploadedImage ? (
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-sm backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>محفوظة في السحابة</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-amber-500/30">
                                    بانتظار الصورة
                                  </span>
                                )}
                              </div>

                              <div className="absolute bottom-2 right-2 text-[10px] text-zinc-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none z-10">
                                {item.recommended}
                              </div>
                            </label>

                            {/* Prominent Direct File Upload Button */}
                            <label
                              htmlFor={inputId}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] ${
                                isUploading
                                  ? 'bg-[#182f24] text-[#a39a8c] cursor-wait'
                                  : 'bg-[#1a3025] hover:bg-[#223f30] border border-[#2e473a] hover:border-[#c5a059]/60 text-[#f4efe6]'
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-[#c5a059] animate-spin" />
                                  <span>جاري الرفع إلى ImgBB...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-[#c5a059]" />
                                  <span>
                                    {hasUploadedImage
                                      ? 'استبدال الصورة بملف جديد من الجهاز'
                                      : 'رفع ملف صورة عبر ImgBB مجاناً'}
                                  </span>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Footer action links */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#1d2f26] text-[11px]">
                            {hasUploadedImage ? (
                              <a
                                href={currentVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>معاينة الرابط المباشر (ImgBB)</span>
                              </a>
                            ) : (
                              <span className="text-zinc-600">لا توجد صورة بعد</span>
                            )}

                            {hasUploadedImage && (
                              <button
                                type="button"
                                onClick={() => handleSingleImageDelete(item.key)}
                                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                                title="حذف الصورة من السحابة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف الصورة</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all shadow-lg shadow-[#c5a059]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>حفظ وتأكيد كافة صور المنتجع في Firestore (Save All)</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
