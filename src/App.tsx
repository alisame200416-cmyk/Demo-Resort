import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FacilityExplorer } from './components/FacilityExplorer';
import { ResortAmenities } from './components/ResortAmenities';
import { PoolSection } from './components/PoolSection';
import { FarmSection } from './components/FarmSection';
import { HouseContents } from './components/HouseContents';
import { GallerySection } from './components/GallerySection';
import { PricingSection } from './components/PricingSection';
import { BookingCalendar } from './components/BookingCalendar';
import { AdminDashboard } from './components/AdminDashboard';
import { QRCodeModal } from './components/QRCodeModal';
import { Footer } from './components/Footer';
import { BookingRecord, ChaletConfig, PricingConfig, ResortImagesConfig } from './types';
import {
  loadBookings,
  saveBookings,
  loadChaletConfig,
  saveChaletConfig,
  loadPricingConfig,
  savePricingConfig,
  loadImagesConfig,
  saveImagesConfig,
  resetDemoData,
} from './utils/bookingStore';
import { isSuspiciousBooking } from './utils/validation';

export default function App() {
  const [chaletConfig, setChaletConfig] = useState<ChaletConfig>(() => loadChaletConfig());
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => loadPricingConfig());
  const [imagesConfig, setImagesConfig] = useState<ResortImagesConfig>(() => loadImagesConfig());
  const [bookings, setBookings] = useState<Record<string, BookingRecord>>(() => loadBookings());

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  // Sync bookings to localStorage as offline fallback
  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  // Handle client confirming a booking
  const handleConfirmBooking = (newBooking: BookingRecord) => {
    const shiftKey = `${newBooking.date}_${newBooking.shift}`;
    setBookings((prev) => {
      const updated = {
        ...prev,
        [shiftKey]: newBooking,
      };
      saveBookings(updated);
      return updated;
    });
  };

  // Handle admin releasing/cancelling a single shift (returns slot to green/available)
  const handleCancelBooking = (shiftKey: string) => {
    setBookings((prev) => {
      const updated = { ...prev };
      delete updated[shiftKey];
      saveBookings(updated);
      return updated;
    });
  };

  // Handle admin purging all suspicious fake bookings in one click
  const handleClearSuspiciousBookings = () => {
    const toDelete: string[] = [];
    setBookings((prev) => {
      const updated: Record<string, BookingRecord> = {};
      Object.entries(prev).forEach(([key, record]) => {
        if (!isSuspiciousBooking(record.customerName, record.customerPhone)) {
          updated[key] = record;
        } else {
          toDelete.push(key);
        }
      });
      saveBookings(updated);
      return updated;
    });
  };

  // Handle admin full calendar reset
  const handleClearAllBookings = () => {
    setBookings({});
    saveBookings({});
  };

  // Handle admin manual reservation
  const handleManualReserve = (newBooking: BookingRecord) => {
    const shiftKey = `${newBooking.date}_${newBooking.shift}`;
    setBookings((prev) => {
      const updated = {
        ...prev,
        [shiftKey]: newBooking,
      };
      saveBookings(updated);
      return updated;
    });
  };

  // Admin login check
  const handleAdminLogin = (enteredPin: string): boolean => {
    if (enteredPin.trim() === chaletConfig.adminPin.trim()) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  const handleUpdateChaletConfig = (newConfig: ChaletConfig) => {
    setChaletConfig(newConfig);
    saveChaletConfig(newConfig);
  };

  const handleUpdatePricingConfig = (newPricing: PricingConfig) => {
    setPricingConfig(newPricing);
    savePricingConfig(newPricing);
  };

  const handleUpdateImagesConfig = (newImages: ResortImagesConfig) => {
    setImagesConfig(newImages);
    saveImagesConfig(newImages);
  };

  const handleResetDemo = () => {
    const confirmed = window.confirm(
      'سيتم حذف جميع تعديلات التجربة من هذا الجهاز وإرجاع Demo إلى البيانات الأصلية. هل تريد المتابعة؟'
    );
    if (!confirmed) return;
    resetDemoData();
    window.location.reload();
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking-calendar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1411] text-[#f4efe6] flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#0c1411]">
      {/* Top Navigation */}
      <Navbar
        chaletConfig={chaletConfig}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenQRCode={() => setIsQRCodeModalOpen(true)}
        onScrollToBooking={scrollToBooking}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Demo-only safety banner */}
      <div className="sticky top-0 z-40 w-full bg-amber-950/95 border-b border-amber-500/30 text-amber-100 px-3 py-2 text-center text-xs sm:text-sm backdrop-blur-md">
        🧪 <strong>وضع التجربة المجاني:</strong> جميع الحجوزات والتعديلات محفوظة على هذا الجهاز فقط، ولا يتم إرسالها إلى Firebase.
        <button onClick={handleResetDemo} className="mr-2 underline underline-offset-2 hover:text-white font-bold">إعادة بيانات التجربة</button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Luxury Hero Banner */}
        <Hero
          chaletConfig={chaletConfig}
          pricingConfig={pricingConfig}
          imagesConfig={imagesConfig}
          onScrollToBooking={scrollToBooking}
          onOpenQRCode={() => setIsQRCodeModalOpen(true)}
        />

        {/* Interactive Facility Explorer with Click-to-View Popup Modals */}
        <FacilityExplorer
          imagesConfig={imagesConfig}
          onScrollToBooking={scrollToBooking}
        />

        {/* Resort Amenities Overview */}
        <ResortAmenities />

        {/* Swimming Pool Specifications */}
        <PoolSection imagesConfig={imagesConfig} />

        {/* Farm Animals & Attractions */}
        <FarmSection imagesConfig={imagesConfig} />

        {/* House / Villa Contents */}
        <HouseContents />

        {/* Photo Gallery & Lightbox */}
        <GallerySection imagesConfig={imagesConfig} />

        {/* Transparent Pricing in Iraqi Dinars (IQD) */}
        <PricingSection
          pricingConfig={pricingConfig}
          chaletConfig={chaletConfig}
          onScrollToBooking={scrollToBooking}
        />

        {/* Automated Interactive Calendar & WhatsApp Booking Engine */}
        <BookingCalendar
          chaletConfig={chaletConfig}
          pricingConfig={pricingConfig}
          bookings={bookings}
          onConfirmBooking={handleConfirmBooking}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />
      </main>

      {/* Footer with Owner controls and contacts */}
      <Footer
        chaletConfig={chaletConfig}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenQRCode={() => setIsQRCodeModalOpen(true)}
        onScrollToBooking={scrollToBooking}
      />

      {/* Secure Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        onClearSuspiciousBookings={handleClearSuspiciousBookings}
        onClearAllBookings={handleClearAllBookings}
        onManualReserve={handleManualReserve}
        chaletConfig={chaletConfig}
        onUpdateChaletConfig={handleUpdateChaletConfig}
        pricingConfig={pricingConfig}
        onUpdatePricingConfig={handleUpdatePricingConfig}
        imagesConfig={imagesConfig}
        onUpdateImagesConfig={handleUpdateImagesConfig}
        cloudStatus="local"
      />

      {/* Mobile QR Code Sharing & Scan Modal */}
      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        chaletConfig={chaletConfig}
      />
    </div>
  );
}
