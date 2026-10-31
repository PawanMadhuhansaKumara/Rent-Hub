import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {

      profile: {
        addItem: "Add Item",
        editProfile: "Edit Profile",
        trustedSeller: "Trusted Seller",
        trustScore: "Trust Score",
        reviews: "Reviews",
        profileLikes: "Profile Likes",
        myShopItems: "My Shop Items",
        viewAll: "View All Items →",
        recentItems: "Recent Shop Items",
        noItems: "No items added yet. Click \"+ Add Item\" to list your first item!",
        fullName: "Full Name",
        username: "Username",
        phoneNumber: "Phone Number",
        email: "Email",
        location: "Location",
        aboutMe: "About Me",
        save: "Save",
        addNewItem: "Add New Item",
        itemPhoto: "Item Photo",
        clickUpload: "Click to upload item photo",
        itemTitle: "Item Title",
        category: "Category",
        condition: "Condition",
        price: "Price (per day / per month)",
        description: "Description",
        good: "Good",
        brandNew: "Brand New",
        used: "Used",
        available: "available",
        categories: {
          electronics: "Electronics",
          furniture: "Furniture",
          vehicles: "Vehicles",
          tools: "Tools",
          sports: "Sports",
          others: "Others"
        }
      },
      appbar: {
        home: "Home",
        login: "Login",
        register: "Register",
        logout: "Logout",
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
      navigation: {
        home: "Home",
        businessHub: "business Hub",
        myItems: "My Items",
        notifications: "Notifications",
      },
      chat: {
        chatWithSeller: "Chat with Seller",
        messages: "Messages",
        conversations: "conversations",
        noMessagesYet: "No messages yet",
        startChattingNotice: "Start chatting with sellers directly from any item details page!",
        inquireNotice: "Send a message to start inquiring about this item!",
        sellerOfItem: "Seller of item",
        interestedBuyer: "Interested Buyer",
        typeMessagePlaceholder: "Type your message...",
        loadingConversation: "Loading conversation...",
        retry: "Retry",
        with: "With:",
      },
    },
  },

  si: {
    translation: {

      profile: {
        addItem: "භාණ්ඩයක් එකතු කරන්න",
        editProfile: "පැතිකඩ සංස්කරණය",
        trustedSeller: "විශ්වාසදායී විකුණුම්කරු",
        trustScore: "විශ්වාසනීයත්ව අගය",
        reviews: "විචාර",
        profileLikes: "පැතිකඩ මනාප",
        myShopItems: "මගේ භාණ්ඩ",
        viewAll: "සියල්ල බලන්න →",
        recentItems: "මෑතකදී එකතු කළ භාණ්ඩ",
        noItems: "තවම භාණ්ඩ එකතු කර නැත. \"+ භාණ්ඩයක් එකතු කරන්න\" ඔබන්න!",
        fullName: "සම්පූර්ණ නම",
        username: "පරිශීලක නාමය",
        phoneNumber: "දුරකථන අංකය",
        email: "විද්‍යුත් තැපෑල",
        location: "ස්ථානය",
        aboutMe: "මම ගැන",
        save: "සුරකින්න",
        addNewItem: "අලුත් භාණ්ඩයක් එකතු කරන්න",
        itemPhoto: "භාණ්ඩයේ ඡායාරූපය",
        clickUpload: "ඡායාරූපයක් එක් කිරීමට ක්ලික් කරන්න",
        itemTitle: "භාණ්ඩයේ නම",
        category: "වර්ගය",
        condition: "තත්වය",
        price: "මිල (දිනකට / මාසයකට)",
        description: "විස්තරය",
        good: "හොඳ තත්වයේ",
        brandNew: "නලුත්ම",
        used: "භාවිත කළ",
        available: "පවතී",
        categories: {
          electronics: "ඉලෙක්ට්‍රොනික",
          furniture: "ගෘහ භාණ්ඩ",
          vehicles: "වාහන",
          tools: "මෙවලම්",
          sports: "ක්‍රීඩා",
          others: "වෙනත්"
        }
      },

      appbar: {
        home: "මුල් පිටුව",
        login: "පිවිසෙන්න",
        register: "ලියාපදිංචි වන්න",
        logout: "ඉවත් වන්න",
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
      navigation: {
        home: "මුල් පිටුව",
        businessHub: "ව්‍යාපාර මධ්‍යස්ථානය",
        myItems: "මගේ අයිතම",
        notifications: "දැනුම්දීම්",
      },
      chat: {
        chatWithSeller: "විකුණුම්කරු සමඟ කතා කරන්න",
        messages: "පණිවිඩ",
        conversations: "සංවාද",
        noMessagesYet: "තවම පණිවිඩ නොමැත",
        startChattingNotice: "ඕනෑම භාණ්ඩයක විස්තර පිටුවකින් කෙලින්ම විකුණුම්කරු සමඟ කතා කරන්න!",
        inquireNotice: "මෙම භාණ්ඩය පිළිබඳ විමසීමට පණිවිඩයක් යවන්න!",
        sellerOfItem: "භාණ්ඩයේ අයිතිකරු",
        interestedBuyer: "මිලදී ගන්නා පාර්ශ්වය",
        typeMessagePlaceholder: "ඔබගේ පණිවිඩය මෙහි ලියන්න...",
        loadingConversation: "පණිවිඩ පූරණය වෙමින් පවතී...",
        retry: "නැවත උත්සාහ කරන්න",
        with: "සමඟ:",
      },
    },
  },

  ta: {
    translation: {

      profile: {
        addItem: "பொருளைச் சேர்",
        editProfile: "சுயவிவரத்தைத் திருத்து",
        trustedSeller: "நம்பகமான விற்பனையாளர்",
        trustScore: "நம்பிக்கை அட்டை",
        reviews: "மதிப்புரைகள்",
        profileLikes: "சுயவிவர விருப்பங்கள்",
        myShopItems: "என் கடையில் உள்ள பொருட்கள்",
        viewAll: "அனைத்தையும் பார் →",
        recentItems: "சமீபத்திய பொருட்கள்",
        noItems: "பொருட்கள் எதுவும் சேர்க்கப்படவில்லை. \"+ பொருளைச் சேர்\" என்பதைக் கிளிக் செய்க!",
        fullName: "முழு பெயர்",
        username: "பயனர்பெயர்",
        phoneNumber: "தொலைபேசி எண்",
        email: "மின்னஞ்சல்",
        location: "இருப்பிடம்",
        aboutMe: "என்னை பற்றி",
        save: "சேமி",
        addNewItem: "புதிய பொருளைச் சேர்",
        itemPhoto: "பொருள் புகைப்படம்",
        clickUpload: "புகைப்படத்தை பதிவேற்ற கிளிக் செய்யவும்",
        itemTitle: "பொருளின் தலைப்பு",
        category: "வகை",
        condition: "நிலைமை",
        price: "விலை (நாளுக்கு / மாதத்திற்கு)",
        description: "விளக்கம்",
        good: "நல்ல நிலை",
        brandNew: "புதியது",
        used: "பயன்படுத்தப்பட்டது",
        available: "கிடைக்கும்",
        categories: {
          electronics: "மின்சாதனங்கள்",
          furniture: "மரச்சாமான்கள்",
          vehicles: "வாகனங்கள்",
          tools: "கருவிகள்",
          sports: "விளையாட்டு",
          others: "மற்றவை"
        }
      },

      appbar: {
        home: "முகப்பு",
        login: "உள்நுழைவு",
        register: "பதிவு செய்க",
        logout: "வெளியேறு",
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
      navigation: {
        home: "முகப்பு",
        businessHub: "வணிக மையம்",
        myItems: "எனது பொருட்கள்",
        notifications: "அறிவிப்புகள்",
      },
      chat: {
        chatWithSeller: "விற்பனையாளருடன் அரட்டை",
        messages: "செய்திகள்",
        conversations: "உரையாடல்கள்",
        noMessagesYet: "இன்னும் செய்திகள் இல்லை",
        startChattingNotice: "பொருளின் விவரப் பக்கத்திலிருந்து நேரடியாக விற்பனையாளருடன் அரட்டையடிக்கவும்!",
        inquireNotice: "இந்தப் பொருளைப் பற்றி விசாரிக்க ஒரு செய்தியை அனுப்பவும்!",
        sellerOfItem: "பொருளின் விற்பனையாளர்",
        interestedBuyer: "வாங்க விரும்பும் வாடிக்கையாளர்",
        typeMessagePlaceholder: "உங்கள் செய்தியை தட்டச்சு செய்யவும்...",
        loadingConversation: "செய்திகள் ஏற்றப்படுகின்றன...",
        retry: "மீண்டும் முயற்சிக்கவும்",
        with: "உடன்:",
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
