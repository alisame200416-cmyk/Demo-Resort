/**
 * ImgBB Free Image Hosting Integration
 * Provides 100% free image uploads without credit card requirements.
 * Returns direct permanent HTTPS URLs for storing in Firebase Firestore.
 */

// المفتاح مبرمج مسبقاً في النظام ليعمل الرفع تلقائياً وبشكل صامت دون إزعاج المالك
export const HARDCODED_IMGBB_KEY: string = '2d9b62a4f6d3f2ef1c8fa9960241dbd2';

const STORAGE_KEY_IMGBB = 'maryam_resort_imgbb_key';

/**
 * Retrieves the active ImgBB API Key from environment variable,
 * hardcoded constant, or admin localStorage setting.
 */
export function getImgBBApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  if (HARDCODED_IMGBB_KEY && HARDCODED_IMGBB_KEY.trim().length > 0) {
    return HARDCODED_IMGBB_KEY.trim();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_IMGBB);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (e) {
    // Ignore localStorage access errors
  }

  return '';
}

/**
 * Saves ImgBB API key to local storage for quick access without code rebuild
 */
export function saveImgBBApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_IMGBB, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_IMGBB);
    }
  } catch (e) {
    console.warn('Failed to store ImgBB key in localStorage', e);
  }
}

export interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string | number;
    height: string | number;
    size: number;
    time: string | number;
    expiration: string | number;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Uploads a real binary File directly to ImgBB API.
 * Returns the permanent direct image HTTPS URL (e.g. https://i.ibb.co/...)
 */
export async function uploadImageToImgBB(file: File, customApiKey?: string): Promise<string> {
  const apiKey = (customApiKey || getImgBBApiKey()).trim();

  if (!apiKey) {
    throw new Error(
      'مفتاح ImgBB API غير متوفر! يرجى إضافة مفتاحك المجاني في ملف src/utils/imgbb.ts أو إدخاله في لوحة تحكم الإدارة.'
    );
  }

  if (!file || !file.type.startsWith('image/')) {
    throw new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار ملف JPG أو PNG أو WEBP.');
  }

  // ImgBB free upload limit is 32MB per image
  if (file.size > 32 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً. الحد الأقصى المسموح به في ImgBB هو 32 ميغابايت.');
  }

  const formData = new FormData();
  formData.append('image', file);
  if (file.name) {
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
  }

  try {
    const uploadUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = (await response.json()) as ImgBBUploadResponse & {
      error?: { message: string; code: number };
    };

    if (!response.ok || !result.success) {
      const errorMsg = result?.error?.message || `فشل رفع الصورة (كود: ${response.status})`;
      throw new Error(`خطأ في ImgBB: ${errorMsg}`);
    }

    // Direct permanent URL
    const directUrl = result.data.url || result.data.display_url;
    if (!directUrl) {
      throw new Error('لم يتم استلام رابط صورة مباشر من خوادم ImgBB.');
    }

    return directUrl;
  } catch (error: any) {
    console.error('ImgBB API Upload Failed:', error);
    throw new Error(error?.message || 'تعذر الاتصال بخدمة ImgBB. يرجى التحقق من اتصال الإنترنت وصحة مفتاح API.');
  }
}
