/**
 * Iraqi Phone Number & Anti-Spam Validation Utilities
 * Enforces authentic Iraqi telecom standards (Zain, Asiacell, Korek)
 * and eliminates bot/fake test submissions.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  operator: 'زين العراق' | 'آسيا سيل' | 'كورك تيليكوم' | 'خط عراقي معتمد' | null;
  error?: string;
}

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
}

// Obvious spam words and placeholder gibberish
const BANNED_NAME_PATTERNS = [
  /^(test|testing|tst|asdf|qwerty|fake|spam|none|null|undefined|sample|demo)$/i,
  /^(تجربة|فحص|تست|وهمي|لا يوجد|تجريبي|تجريب|شسي|بلات|أأأأ|سسسس)$/i,
  /^[0-9]+$/, // Only digits
  /(.)\1{4,}/, // 5 or more repeating characters (e.g., aaaaa or هههههه)
];

/**
 * Normalizes Arabic-Indic (٠-٩) and Persian (۰-۹) numerals into standard ASCII (0-9)
 */
export function normalizeNumerals(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.split(arabicNumerals[i]).join(String(i));
    result = result.split(persianNumerals[i]).join(String(i));
  }
  return result;
}

/**
 * Validates and normalizes Iraqi phone numbers.
 * Supports: 07XXXXXXXX (11 digits) or +9647XXXXXXXX / 009647XXXXXXXX / 9647XXXXXXXX (12 digits excluding +)
 */
export function validateIraqiPhoneNumber(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      operator: null,
      error: 'يرجى إدخال رقم الهاتف العراقي للتواصل وتأكيد الحجز.',
    };
  }

  // Convert any Arabic-Indic digits to ASCII and remove spaces, hyphens, parentheses, and dots
  let digits = normalizeNumerals(rawPhone).replace(/[\s\-\(\)\.]/g, '');

  // Handle leading + or 00
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  } else if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // If starts with 964, convert to local format 07...
  if (digits.startsWith('964')) {
    digits = '0' + digits.substring(3);
  }

  // If user entered without leading 0 (e.g., 7701234567)
  if (digits.length === 10 && digits.startsWith('7')) {
    digits = '0' + digits;
  }

  // Basic numeric check
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      formatted: rawPhone,
      operator: null,
      error: 'يجب أن يحتوي رقم الهاتف على أرقام فقط.',
    };
  }

  // Iraqi mobile numbers must be exactly 11 digits starting with 07
  if (digits.length !== 11) {
    return {
      isValid: false,
      normalized: digits,
      formatted: digits,
      operator: null,
      error: `رقم الهاتف غير مكتمل (${digits.length} أرقام). يجب أن يتكون من 11 رقماً ويبدأ بـ 07 (مثال: 07701234567).`,
    };
  }

  if (!digits.startsWith('07')) {
    return {
      isValid: false,
      normalized: digits,
      formatted: digits,
      operator: null,
      error: 'أرقام الهواتف النقالة في العراق تبدأ حصراً بـ 07 (مثل 077x أو 078x أو 075x).',
    };
  }

  const prefix = digits.substring(0, 3); // 077, 078, 075, 079, 074, 073

  // Identify operator
  let operator: PhoneValidationResult['operator'] = null;
  if (prefix === '078' || prefix === '079') {
    operator = 'زين العراق';
  } else if (prefix === '077') {
    operator = 'آسيا سيل';
  } else if (prefix === '075') {
    operator = 'كورك تيليكوم';
  } else if (['073', '074', '076'].includes(prefix)) {
    operator = 'خط عراقي معتمد';
  } else {
    return {
      isValid: false,
      normalized: digits,
      formatted: digits,
      operator: null,
      error: `مفتاح الشبكة (${prefix}) غير صالح. شبكات العراق المعتمدة: 077 (آسياسيل)، 078/079 (زين)، 075 (كورك).`,
    };
  }

  // Check for fake repeating digits (e.g., 07700000000, 07711111111, 07812345678)
  const rest = digits.substring(3);
  if (/^(\d)\1{7}$/.test(rest)) {
    return {
      isValid: false,
      normalized: digits,
      formatted: digits,
      operator,
      error: 'رقم الهاتف يبدو وهمياً ومكرراً (أرقام متطابقة). يرجى إدخال رقم هاتفك الفعلي.',
    };
  }

  if (rest === '12345678' || rest === '87654321' || rest === '00000000') {
    return {
      isValid: false,
      normalized: digits,
      formatted: digits,
      operator,
      error: 'رقم الهاتف يبدو متسلسلاً أو وهمياً. يرجى إدخال رقم هاتف حقيقي.',
    };
  }

  // Format as readable: 0770 123 4567
  const formatted = `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;

  return {
    isValid: true,
    normalized: digits,
    formatted,
    operator,
  };
}

/**
 * Validates customer name to prevent spam bots and gibberish
 */
export function validateCustomerName(name: string): NameValidationResult {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'يرجى إدخال الاسم الكامل للشخص الحاجز.',
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'الاسم قصير جداً (أقل من 3 أحرف). يرجى كتابة الاسم الثلاثي أو الثنائي الكامل.',
    };
  }

  // Check banned patterns
  for (const pattern of BANNED_NAME_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'يرجى إدخال اسم حقيقي وصحيح بدون رموز أو كلمات تجريبية وهمية.',
      };
    }
  }

  // Check that it contains real letters (Arabic or Latin)
  if (!/[\u0600-\u06FFa-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'يجب أن يحتوي الاسم على أحرف عربية أو إنجليزية حقيقية.',
    };
  }

  return { isValid: true };
}

/**
 * Checks if an existing booking has suspicious/fake traits.
 * Accepts either an object { customerName, customerPhone } or (name, phone).
 */
export function isSuspiciousBooking(
  bookingOrName: { customerName?: string; customerPhone?: string } | string,
  maybePhone?: string
): boolean {
  let customerName = '';
  let customerPhone = '';

  if (typeof bookingOrName === 'string') {
    customerName = bookingOrName;
    customerPhone = maybePhone || '';
  } else if (bookingOrName && typeof bookingOrName === 'object') {
    customerName = bookingOrName.customerName || '';
    customerPhone = bookingOrName.customerPhone || '';
  }

  if (!customerName || !customerPhone) return true;

  const phoneRes = validateIraqiPhoneNumber(customerPhone);
  if (!phoneRes.isValid) return true;

  const nameRes = validateCustomerName(customerName);
  if (!nameRes.isValid) return true;

  return false;
}

/**
 * Normalizes phone for WhatsApp international link (9647XXXXXXXX)
 */
export function toIraqiInternationalNumber(phone: string): string {
  if (!phone) return '9647726187519';
  let cleaned = normalizeNumerals(phone).replace(/[^\d]/g, '');
  if (cleaned.startsWith('00964')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('07')) {
    cleaned = '964' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 10) {
    cleaned = '964' + cleaned;
  }
  return cleaned;
}

/**
 * Formats any stored phone number for clean Iraqi display (e.g., 07726187519 or 0770 123 4567)
 */
export function formatDisplayIraqiPhone(phone: string, formattedWithSpaces = false): string {
  if (!phone) return '07726187519';
  let digits = normalizeNumerals(phone).replace(/[^\d]/g, '');
  if (digits.startsWith('964')) {
    digits = '0' + digits.substring(3);
  } else if (!digits.startsWith('0') && digits.startsWith('7')) {
    digits = '0' + digits;
  }
  if (formattedWithSpaces && digits.length === 11) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }
  return digits;
}

