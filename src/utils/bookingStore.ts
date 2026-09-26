import { BookingRecord, ChaletConfig, PricingConfig, ShiftInfo, ShiftType, ResortImagesConfig } from '../types';
import { DEFAULT_CHALET_CONFIG, DEFAULT_PRICING_CONFIG, DEFAULT_RESORT_IMAGES } from '../data/chaletData';
import { toIraqiInternationalNumber } from './validation';

const BOOKINGS_STORAGE_KEY = 'maryam_resort_bookings_v2';
const CONFIG_STORAGE_KEY = 'maryam_resort_config_v2';
const PRICING_STORAGE_KEY = 'maryam_resort_pricing_v2';
const IMAGES_STORAGE_KEY = 'maryam_resort_images_v2';

export const DEMO_STORAGE_KEYS = [
  BOOKINGS_STORAGE_KEY,
  CONFIG_STORAGE_KEY,
  PRICING_STORAGE_KEY,
  IMAGES_STORAGE_KEY,
];

// Seed some initial bookings around current dates so the user immediately sees the green/red shifts in action
export function getInitialSeedBookings(): Record<string, BookingRecord> {
  const today = new Date();
  const seed: Record<string, BookingRecord> = {};

  const makeDateStr = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 1 day from now - night shift booked
  const d1 = makeDateStr(1);
  const id1 = `${d1}_night`;
  seed[id1] = {
    id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
    date: d1,
    shift: 'night',
    shiftLabel: 'الفترة المسائية',
    timeRange: DEFAULT_CHALET_CONFIG.nightShiftHours,
    customerName: 'حيدر الزبيدي',
    customerPhone: '07705543210',
    guestsCount: 15,
    notes: 'حفلة تخرج عائلية مصغرة وتجهيز باربيكيو',
    priceIQD: 300000,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    bookedBy: 'client',
  };

  // 3 days from now - morning shift booked
  const d2 = makeDateStr(3);
  const id2 = `${d2}_morning`;
  seed[id2] = {
    id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
    date: d2,
    shift: 'morning',
    shiftLabel: 'الفترة الصباحية',
    timeRange: DEFAULT_CHALET_CONFIG.morningShiftHours,
    customerName: 'د. علي التميمي',
    customerPhone: '07801234567',
    guestsCount: 10,
    notes: 'استجمام عائلي وسباحة للأطفال',
    priceIQD: 150000,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    bookedBy: 'client',
  };

  // 5 days from now - night shift booked
  const d3 = makeDateStr(5);
  const id3 = `${d3}_night`;
  seed[id3] = {
    id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
    date: d3,
    shift: 'night',
    shiftLabel: 'الفترة المسائية',
    timeRange: DEFAULT_CHALET_CONFIG.nightShiftHours,
    customerName: 'عمر القيسي',
    customerPhone: '07719876543',
    guestsCount: 20,
    notes: 'عزومة مسائية مع شواء خروف',
    priceIQD: 300000,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    bookedBy: 'client',
  };

  return seed;
}

export function loadBookings(): Record<string, BookingRecord> {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedBookings();
      saveBookings(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load bookings from localStorage', e);
    return getInitialSeedBookings();
  }
}

export function saveBookings(bookings: Record<string, BookingRecord>): void {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
}

export function loadChaletConfig(): ChaletConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CHALET_CONFIG,
        ...parsed,
        googleMapsUrl: parsed.googleMapsUrl || DEFAULT_CHALET_CONFIG.googleMapsUrl,
        ownerWhatsApp: ['9647726187519', '07726187519'].includes(String(parsed.ownerWhatsApp || ''))
          ? DEFAULT_CHALET_CONFIG.ownerWhatsApp
          : (parsed.ownerWhatsApp || DEFAULT_CHALET_CONFIG.ownerWhatsApp),
      };
    }
  } catch (e) {
    console.error('Error loading chalet config', e);
  }
  return DEFAULT_CHALET_CONFIG;
}

export function saveChaletConfig(config: ChaletConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving chalet config', e);
  }
}

export function loadPricingConfig(): PricingConfig {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (raw) return { ...DEFAULT_PRICING_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading pricing config', e);
  }
  return DEFAULT_PRICING_CONFIG;
}

export function savePricingConfig(pricing: PricingConfig): void {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing));
  } catch (e) {
    console.error('Error saving pricing config', e);
  }
}

export function loadImagesConfig(): ResortImagesConfig {
  try {
    const raw = localStorage.getItem(IMAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Demo mode intentionally allows local data URLs so uploaded images never
      // need to be sent to a third-party image host or Firebase.
      return { ...DEFAULT_RESORT_IMAGES, ...parsed };
    }
  } catch (e) {
    console.error('Error loading images config', e);
  }
  return DEFAULT_RESORT_IMAGES;
}

export function saveImagesConfig(images: ResortImagesConfig): void {
  try {
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Error saving images config', e);
  }
}

// In Iraq & the region: Thursday (day 4), Friday (day 5), and Saturday (day 6) are considered weekend / peak days.
export function isWeekendDay(date: Date): boolean {
  const day = date.getDay(); // 0 is Sunday, 4 is Thursday, 5 is Friday, 6 is Saturday
  return day === 4 || day === 5 || day === 6;
}

export function getShiftPrice(dateStr: string, shift: ShiftType, pricing: PricingConfig): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const isWeekend = isWeekendDay(date);

  if (isWeekend) {
    return shift === 'morning' ? pricing.weekendMorning : pricing.weekendNight;
  } else {
    return shift === 'morning' ? pricing.weekdayMorning : pricing.weekdayNight;
  }
}

export function formatIQD(amount: number): string {
  return amount.toLocaleString('ar-IQ') + ' د.ع';
}

export function formatIQDEn(amount: number): string {
  return amount.toLocaleString('en-US') + ' IQD';
}

export function generateWhatsAppBookingUrl(
  ownerPhone: string,
  booking: BookingRecord,
  dayArabicName: string,
  formattedDateArabic: string
): string {
  // Normalize owner phone to international format (e.g. 9647726187519)
  const cleanPhone = toIraqiInternationalNumber(ownerPhone);

  const text = `السلام عليكم ورحمة الله وبركاته 🌿✨
أود تأكيد حجز في *شاليه مريم (Maryam Resort) - البصرة* عبر الموقع:

📋 *بيانات الحجز*:
👤 *اسم العميل:* ${booking.customerName}
📱 *رقم هاتف العميل:* ${booking.customerPhone}
📅 *تاريخ الحجز:* ${formattedDateArabic} (${dayArabicName})
⏰ *الفترة المطلوبة:* ${booking.shiftLabel} (${booking.timeRange})
💰 *المبلغ المقدر:* ${booking.priceIQD.toLocaleString('en-US')} دينار عراقي
${booking.guestsCount ? `👥 *عدد الأفراد المتوقع:* ${booking.guestsCount} أشخاص` : ''}
${booking.notes ? `📝 *ملاحظات خاصة:* ${booking.notes}` : ''}
🔖 *رقم مرجع الحجز:* #${booking.id}

الموقع: البصرة، أبو الخصيب / حمدان
يرجى تأكيد الحجز وتثبيت الموعد. شكراً جزيلاً لكم!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}


/** Reset only the local Demo data. This never touches Firebase or any remote service. */
export function resetDemoData(): void {
  try {
    DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to reset Demo data', e);
  }
}

/**
 * Convert an uploaded image to a local, resized data URL. The result is stored
 * only in localStorage in Demo mode; no network upload is performed.
 */
export function readDemoImageFile(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار JPG أو PNG أو WEBP.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.onload = () => {
      const source = new Image();
      source.onerror = () => reject(new Error('تعذر معالجة الصورة.'));
      source.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(source.naturalWidth, source.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر تجهيز مساحة الصورة المحلية.'));
          return;
        }
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      source.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
