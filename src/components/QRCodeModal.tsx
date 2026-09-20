import React, { useEffect, useState, useRef } from 'react';
import { X, QrCode, Download, Copy, Check, Sparkles, Smartphone, Share2 } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { ChaletConfig } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chaletConfig: ChaletConfig;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  chaletConfig,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://royal-oasis.chalet.iq';

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    QRCodeLib.toDataURL(
      currentUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0c1411',
          light: '#f4efe6',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Maryam-Resort-Basra.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#111e18] border border-[#2e473a] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 text-center max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 left-4 sm:top-5 sm:left-5 p-2 rounded-xl bg-[#182921] border border-[#2d4639] text-[#f4efe6] hover:bg-rose-950/70 hover:text-rose-300 transition-colors cursor-pointer active:scale-95 shadow-md"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182f23] border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>مسح QR السريع للجوال</span>
          </div>
          <h3 className="text-xl font-bold text-[#f4efe6]">
            {chaletConfig.name}
          </h3>
          <p className="text-xs text-[#a39a8c] mt-1">
            امسح الرمز بكاميرا الموبايل لفتح تطبيق الحجز الفوري مباشرة
          </p>
        </div>

        {/* QR Code Render Card */}
        <div className="p-5 rounded-2xl bg-[#f4efe6] shadow-xl inline-block mb-6 border-4 border-[#c5a059]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code for Chalet Booking"
              className="w-56 h-56 mx-auto rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-[#0c1411]">
              <span className="text-xs font-bold">جاري إنشاء رمز QR...</span>
            </div>
          )}
          <div className="mt-2 text-center">
            <span className="text-[11px] font-extrabold text-[#0c1411] tracking-wider block">
              MARYAM RESORT & CHALET (منتجع شاليه مريم)
            </span>
            <span className="text-[9px] text-[#554d3f]">امسح للحجز واكتشاف الفترات المتاحة</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleDownloadQR}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e46] text-[#0c1411] font-bold text-xs sm:text-sm hover:from-[#d5b069] hover:to-[#c5a059] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#c5a059]/20"
          >
            <Download className="w-4 h-4" />
            <span>تحميل بطاقة الـ QR للطباعة أو المشاركة</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl bg-[#182921] border border-[#2d4639] text-[#d6cec0] hover:text-[#f4efe6] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">تم نسخ رابط الموقع بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#c5a059]" />
                <span>نسخ رابط تطبيق الشاليه</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
