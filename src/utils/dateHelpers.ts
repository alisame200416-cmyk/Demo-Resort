export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const ARABIC_DAYS_SHORT = [
  'أحد',
  'إثنين',
  'ثلاثاء',
  'أربعاء',
  'خميس',
  'جمعة',
  'سبت',
];

export const ARABIC_MONTHS = [
  'كانون الثاني (يناير)',
  'شباط (فبراير)',
  'آذار (مارس)',
  'نيسان (أبريل)',
  'أيار (مايو)',
  'حزيران (يونيو)',
  'تموز (يوليو)',
  'آب (أغسطس)',
  'أيلول (سبتمبر)',
  'تشرين الأول (أكتوبر)',
  'تشرين الثاني (نوفمبر)',
  'كانون الأول (ديسمبر)',
];

export function getMonthDays(year: number, month: number): {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  dayOfWeek: number;
  isToday: boolean;
  isPast: boolean;
}[] {
  const result = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Leading days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    const dateStr = formatDateToISO(date);
    result.push({
      date,
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      dayOfWeek: date.getDay(),
      isToday: false,
      isPast: date < today,
    });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateToISO(date);
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isPast = date < today;

    result.push({
      date,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      dayOfWeek: date.getDay(),
      isToday,
      isPast,
    });
  }

  // Trailing days to fill the final week
  const remaining = 7 - (result.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = formatDateToISO(date);
      result.push({
        date,
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        dayOfWeek: date.getDay(),
        isToday: false,
        isPast: false,
      });
    }
  }

  return result;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getArabicDayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return ARABIC_DAYS[date.getDay()];
}

export function formatArabicDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const monthName = ARABIC_MONTHS[m - 1].split(' ')[0];
  return `${d} ${monthName} ${y}`;
}
