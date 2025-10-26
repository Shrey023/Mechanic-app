import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: 'Home',
      bookings: 'Bookings',
      earnings: 'Earnings',
      profile: 'Profile',
      settings: 'Settings',
      status: 'Status',
      available: 'Available',
      busy: 'Busy',
      offline: 'Offline',
      startLiveLocation: 'Start Live Location',
      stopLiveLocation: 'Stop Live Location',
      logout: 'Logout',
      pending: 'Pending',
      accepted: 'Accepted',
      completed: 'Completed',
      noBookings: 'No bookings found.',
      language: 'Language',
      darkMode: 'Dark Mode',
      changePassword: 'Change Password',
      contactSupport: 'Contact Support',
      helpFaq: 'Help & FAQs',
    },
  },
  hi: {
    translation: {
      home: 'होम',
      bookings: 'बुकिंग्स',
      earnings: 'कमाई',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      status: 'स्थिति',
      available: 'उपलब्ध',
      busy: 'व्यस्त',
      offline: 'ऑफलाइन',
      startLiveLocation: 'स्थान साझाकरण शुरू करें',
      stopLiveLocation: 'स्थान साझाकरण बंद करें',
      logout: 'लॉगआउट',
      pending: 'लंबित',
      accepted: 'स्वीकृत',
      completed: 'पूर्ण',
      noBookings: 'कोई बुकिंग नहीं मिली।',
      language: 'भाषा',
      darkMode: 'डार्क मोड',
      changePassword: 'पासवर्ड बदलें',
      contactSupport: 'सहायता से संपर्क करें',
      helpFaq: 'सहायता और प्रश्नोत्तर',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
