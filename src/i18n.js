import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appbar: {
        home: "Home",
        login: "Login",
        register: "Register",
      },

      home: {
        title: "Welcome to Rent Hub",
        description: "Find what you need easily.",
      },

      login: {
        title: "Welcome Back 👋",
        subtitle: "Log in to access your Rent Hub account",

        phoneNumber: "Phone Number",
        phonePlaceholder: "07XXXXXXXX",

        password: "Password",

        button: "Login",
        loggingIn: "Logging in...",

        or: "OR",

        googleButton: "Connect with Google",

        googleMessage:
          "Google Client ID එක App.js එකට configure කර Google OAuth පහසුවෙන් සම්බන්ධ කළ හැක.",

        noAccount: "Don't have an account?",
        registerNow: "Register Now",

        loginSuccess: "Login Successful!",
        loginFailed: "Login failed!",
        serverError: "Failed to connect to the server.",
      },

      register: {
        title: "Rent Hub - Register 📝",
        subtitle: "Enter your details to create an account",

        profilePicture: "Profile Picture *",
        addPhoto: "Add Photo",

        fullName: "Full Name *",
        fullNamePlaceholder: "ex: Pawan Madhuhansa",

        phoneNumber: "Phone Number *",
        phonePlaceholder: "07XXXXXXXX",

        nicNumber: "NIC Number *",
        nicPlaceholder: "ex: 199512345678 or 951234567V",

        email: "Email - Optional",
        emailPlaceholder: "example@mail.com",

        address: "Address *",
        addressPlaceholder: "Enter your permanent address",

        nearestCity: "Nearest City *",
        cityPlaceholder: "ex: Colombo / Kandy",

        accountType: "Account Type",
        both: "Both (Can rent and own items)",
        renter: "Renter (Can only rent items)",
        owner: "Owner (Can only list items)",

        verificationDocuments: "Verification Documents",

        nicFront: "NIC Photo (Front) *",
        nicBack: "NIC Photo (Back) *",

        password: "Password *",
        confirmPassword: "Confirm Password *",

        uploading: "Uploading & Registering...",
        registerButton: "Register",

        alreadyAccount: "Already have an account?",
        login: "Login",

        passwordMismatch: "Passwords do not match!",

        photosRequired:
          "Profile Picture, NIC Front, and NIC Back photos are all required!",

        registrationSuccess:
          "Registration Successful! Please login to continue.",

        registrationFailed: "Registration Failed.",

        serverError:
          "Failed to connect to the server. Please check if the backend is running.",
      },

      languagePopup: {
        title: "Select Language",
        english: "English",
        sinhala: "සිංහල",
        continue: "Continue",
      },
    },
  },

  si: {
    translation: {
      appbar: {
        home: "මුල් පිටුව",
        login: "පිවිසෙන්න",
        register: "ලියාපදිංචි වන්න",
      },

      home: {
        title: "Rent Hub වෙත සාදරයෙන් පිළිගනිමු",
        description: "ඔබට අවශ්‍ය දේ පහසුවෙන් සොයා ගන්න.",
      },

      login: {
        title: "නැවත සාදරයෙන් පිළිගනිමු 👋",
        subtitle: "ඔබගේ Rent Hub ගිණුමට ප්‍රවේශ වීමට පිවිසෙන්න",

        phoneNumber: "දුරකථන අංකය",
        phonePlaceholder: "07XXXXXXXX",

        password: "මුරපදය",

        button: "පිවිසෙන්න",
        loggingIn: "පිවිසෙමින්...",

        or: "හෝ",

        googleButton: "Google සමඟ සම්බන්ධ වන්න",

        googleMessage:
          "Google Client ID එක App.js එකට configure කර Google OAuth සම්බන්ධ කළ හැක.",

        noAccount: "ගිණුමක් නැද්ද?",
        registerNow: "දැන් ලියාපදිංචි වන්න",

        loginSuccess: "පිවිසීම සාර්ථකයි!",
        loginFailed: "පිවිසීම අසාර්ථකයි!",
        serverError: "Server එකට සම්බන්ධ වීමට නොහැක.",
      },
      register: {
        title: "Rent Hub - ලියාපදිංචි වන්න 📝",
        subtitle: "ගිණුමක් සෑදීමට ඔබගේ තොරතුරු ඇතුළත් කරන්න",

        profilePicture: "Profile Picture *",
        addPhoto: "ඡායාරූපයක් එක් කරන්න",

        fullName: "සම්පූර්ණ නම *",
        fullNamePlaceholder: "උදා: Pawan Madhuhansa",

        phoneNumber: "දුරකථන අංකය *",
        phonePlaceholder: "07XXXXXXXX",

        nicNumber: "NIC අංකය *",
        nicPlaceholder: "උදා: 199512345678 හෝ 951234567V",

        email: "විද්‍යුත් තැපෑල - අත්‍යාවශ්‍ය නොවේ",
        emailPlaceholder: "example@mail.com",

        address: "ලිපිනය *",
        addressPlaceholder: "ඔබගේ ස්ථිර ලිපිනය ඇතුළත් කරන්න",

        nearestCity: "ආසන්නතම නගරය *",
        cityPlaceholder: "උදා: Colombo / Kandy",

        accountType: "ගිණුම් වර්ගය",
        both: "දෙකම (කුලියට ගත හැකි සහ භාණ්ඩ ලබා දිය හැක)",
        renter: "කුලීකරුවෙකු (භාණ්ඩ කුලියට පමණක් ගත හැක)",
        owner: "හිමිකරුවෙකු (භාණ්ඩ පමණක් ලබා දිය හැක)",

        verificationDocuments: "තහවුරු කිරීමේ ලේඛන",

        nicFront: "NIC ඡායාරූපය (ඉදිරිපස) *",
        nicBack: "NIC ඡායාරූපය (පිටුපස) *",

        password: "මුරපදය *",
        confirmPassword: "මුරපදය තහවුරු කරන්න *",

        uploading: "Upload කරමින් ලියාපදිංචි වෙමින්...",
        registerButton: "ලියාපදිංචි වන්න",

        alreadyAccount: "දැනටමත් ගිණුමක් තිබේද?",
        login: "පිවිසෙන්න",

        passwordMismatch: "මුරපද දෙක සමාන නොවේ!",

        photosRequired:
          "Profile Picture, NIC Front සහ NIC Back ඡායාරූප තුනම අවශ්‍ය වේ!",

        registrationSuccess: "ලියාපදිංචිය සාර්ථකයි! ඉදිරියට යාමට Login කරන්න.",

        registrationFailed: "ලියාපදිංචිය අසාර්ථකයි.",

        serverError:
          "Server එකට සම්බන්ධ වීමට නොහැක. Backend එක ක්‍රියාත්මකදැයි පරීක්ෂා කරන්න.",
      },
      languagePopup: {
        title: "භාෂාව තෝරන්න",
        english: "English",
        sinhala: "සිංහල",
        continue: "ඉදිරියට",
      },
    },
  },

  ta: {
    translation: {
      appbar: {
        home: "முகப்பு",
        login: "உள்நுழைவு",
        register: "பதிவு செய்க",
      },

      home: {
        title: "Rent Hub-க்கு வரவேற்கிறோம்",
        description: "உங்களுக்கு தேவையானவற்றை எளிதாகக் கண்டறியுங்கள்.",
      },

      login: {
        title: "மீண்டும் வரவேற்கிறோம் 👋",
        subtitle: "உங்கள் Rent Hub கணக்கை அணுக உள்நுழையவும்",

        phoneNumber: "தொலைபேசி எண்",
        phonePlaceholder: "07XXXXXXXX",

        password: "கடவுச்சொல்",

        button: "உள்நுழைவு",
        loggingIn: "உள்நுழைகிறது...",

        or: "அல்லது",

        googleButton: "Google உடன் இணைக்கவும்",

        googleMessage:
          "Google Client ID-ஐ App.js-ல் configure செய்து Google OAuth-ஐ எளிதாக இணைக்கலாம்.",

        noAccount: "கணக்கு இல்லையா?",
        registerNow: "இப்போது பதிவு செய்க",

        loginSuccess: "உள்நுழைவு வெற்றிகரமாக முடிந்தது!",
        loginFailed: "உள்நுழைவு தோல்வியடைந்தது!",
        serverError: "Server-க்கு இணைக்க முடியவில்லை.",
      },

      register: {
        title: "Rent Hub - பதிவு செய்க 📝",
        subtitle: "கணக்கை உருவாக்க உங்கள் தகவல்களை உள்ளிடவும்",

        profilePicture: "சுயவிவரப் படம் *",
        addPhoto: "புகைப்படத்தைச் சேர்க்கவும்",

        fullName: "முழுப் பெயர் *",
        fullNamePlaceholder: "உதா: Pawan Madhuhansa",

        phoneNumber: "தொலைபேசி எண் *",
        phonePlaceholder: "07XXXXXXXX",

        nicNumber: "NIC எண் *",
        nicPlaceholder: "உதா: 199512345678 அல்லது 951234567V",

        email: "மின்னஞ்சல் - விருப்பத்தேர்வு",
        emailPlaceholder: "example@mail.com",

        address: "முகவரி *",
        addressPlaceholder: "உங்கள் நிரந்தர முகவரியை உள்ளிடவும்",

        nearestCity: "அருகிலுள்ள நகரம் *",
        cityPlaceholder: "உதா: Colombo / Kandy",

        accountType: "கணக்கு வகை",
        both: "இரண்டும் (வாடகைக்கு எடுக்கவும் பொருட்களை வழங்கவும் முடியும்)",
        renter: "வாடகையாளர் (பொருட்களை வாடகைக்கு மட்டும் எடுக்க முடியும்)",
        owner: "உரிமையாளர் (பொருட்களை மட்டும் வழங்க முடியும்)",

        verificationDocuments: "சரிபார்ப்பு ஆவணங்கள்",

        nicFront: "NIC புகைப்படம் (முன்பக்கம்) *",
        nicBack: "NIC புகைப்படம் (பின்பக்கம்) *",

        password: "கடவுச்சொல் *",
        confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும் *",

        uploading: "பதிவேற்றப்பட்டு பதிவு செய்யப்படுகிறது...",
        registerButton: "பதிவு செய்க",

        alreadyAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
        login: "உள்நுழைவு",

        passwordMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை!",

        photosRequired:
          "Profile Picture, NIC Front மற்றும் NIC Back ஆகிய மூன்று புகைப்படங்களும் அவசியம்!",

        registrationSuccess: "பதிவு வெற்றிகரமாக முடிந்தது! தொடர உள்நுழையவும்.",

        registrationFailed: "பதிவு தோல்வியடைந்தது.",

        serverError:
          "Server-க்கு இணைக்க முடியவில்லை. Backend இயங்குகிறதா என்பதைச் சரிபார்க்கவும்.",
      },

      languagePopup: {
        title: "மொழியைத் தேர்ந்தெடுக்கவும்",
        english: "ஆங்கிலம்",
        sinhala: "சிங்களம்",
        tamil: "தமிழ்",
        continue: "தொடரவும்",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,

  lng: localStorage.getItem("language") || "en",

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
