import React, { useState, useEffect, useRef } from 'react';
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
} from './utils/bookingStore';
import { isSuspiciousBooking } from './utils/validation';
import {
  subscribeToCloudBookings,
  subscribeToResortCloudData,
  saveBookingToCloud,
  deleteBookingFromCloud,
  clearAllBookingsFromCloud,
  saveChaletConfigToCloud,
  savePricingConfigToCloud,
  saveImagesConfigToCloud,
  isFirebaseConfigured,
} from './lib/firebase';

export default function App() {
  const [chaletConfig, setChaletConfig] = useState<ChaletConfig>(() => loadChaletConfig());
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(() => loadPricingConfig());
  const [imagesConfig, setImagesConfig] = useState<ResortImagesConfig>(() => loadImagesConfig());
  const [bookings, setBookings] = useState<Record<string, BookingRecord>>(() => loadBookings());

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'connecting' | 'local'>('connecting');

  const hasBootstrappedBookingsRef = useRef(false);
  const hasBootstrappedResortRef = useRef(false);

  // Real-time Cloud Synchronization via Firebase Firestore
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setCloudStatus('local');
      return;
    }

    // 1. Subscribe to real-time cloud bookings
    const unsubscribeBookings = subscribeToCloudBookings(
      (cloudBookings) => {
        if (!hasBootstrappedBookingsRef.current) {
          hasBootstrappedBookingsRef.current = true;
          if (cloudBookings && Object.keys(cloudBookings).length > 0) {
            setBookings(cloudBookings);
            saveBookings(cloudBookings);
          } else {
            // First time connecting to new Firestore project: seed initial bookings to cloud
            const initialLocal = loadBookings();
            if (initialLocal && Object.keys(initialLocal).length > 0) {
              Object.entries(initialLocal).forEach(([key, record]) => {
                saveBookingToCloud(key, record).catch(() => {});
              });
            }
          }
        } else {
          // Continuous live authoritative cloud updates
          const updated = cloudBookings || {};
          setBookings(updated);
          saveBookings(updated);
        }
        setCloudStatus('synced');
      },
      (err) => {
        console.warn('Real-time bookings cloud sync warning:', err);
        setCloudStatus('local');
      }
    );

    // 2. Subscribe to real-time cloud chalet configuration, pricing, and images
    const unsubscribeResort = subscribeToResortCloudData(
      (cloudData) => {
        const isFirstRun = !hasBootstrappedResortRef.current;
        hasBootstrappedResortRef.current = true;

        if (cloudData.config) {
          setChaletConfig(cloudData.config);
          saveChaletConfig(cloudData.config);
        } else if (isFirstRun) {
          saveChaletConfigToCloud(chaletConfig).catch(() => {});
        }

        if (cloudData.pricing) {
          setPricingConfig(cloudData.pricing);
          savePricingConfig(cloudData.pricing);
        } else if (isFirstRun) {
          savePricingConfigToCloud(pricingConfig).catch(() => {});
        }

        if (cloudData.images) {
          setImagesConfig(cloudData.images);
          saveImagesConfig(cloudData.images);
        } else if (isFirstRun) {
          saveImagesConfigToCloud(imagesConfig).catch(() => {});
        }
      },
      (err) => {
        console.warn('Real-time resort data cloud sync warning:', err);
      }
    );

    return () => {
      unsubscribeBookings();
      unsubscribeResort();
    };
  }, []);

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

    // Cloud persistence in real-time
    saveBookingToCloud(shiftKey, newBooking).catch((err) =>
      console.warn('Cloud sync error for booking:', err)
    );
  };

  // Handle admin releasing/cancelling a single shift (returns slot to green/available)
  const handleCancelBooking = (shiftKey: string) => {
    setBookings((prev) => {
      const updated = { ...prev };
      delete updated[shiftKey];
      saveBookings(updated);
      return updated;
    });

    // Delete from cloud in real-time
    deleteBookingFromCloud(shiftKey).catch((err) =>
      console.warn('Cloud deletion error for booking:', err)
    );
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

    toDelete.forEach((key) => {
      deleteBookingFromCloud(key).catch(() => {});
    });
  };

  // Handle admin full calendar reset
  const handleClearAllBookings = () => {
    setBookings({});
    saveBookings({});
    clearAllBookingsFromCloud().catch((err) =>
      console.warn('Cloud clear all error:', err)
    );
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

    saveBookingToCloud(shiftKey, newBooking).catch((err) =>
      console.warn('Cloud sync error for manual booking:', err)
    );
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
    saveChaletConfigToCloud(newConfig).catch((err) =>
      console.warn('Failed cloud save config:', err)
    );
  };

  const handleUpdatePricingConfig = (newPricing: PricingConfig) => {
    setPricingConfig(newPricing);
    savePricingConfig(newPricing);
    savePricingConfigToCloud(newPricing).catch((err) =>
      console.warn('Failed cloud save pricing:', err)
    );
  };

  const handleUpdateImagesConfig = (newImages: ResortImagesConfig) => {
    setImagesConfig(newImages);
    saveImagesConfig(newImages);
    saveImagesConfigToCloud(newImages).catch((err) =>
      console.warn('Failed cloud save images:', err)
    );
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
        cloudStatus="synced"
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
