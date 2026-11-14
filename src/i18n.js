import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      search: {
        placeholder: "Search items by name or category...",
      },
      item: {
        condition: "Condition",
        availability: "Availability",
        currency: "LKR",
        viewDetails: "View Details",
        day: "day",
        week: "week",
        month: "month",
        addToRentCart: "Add to Cart",
      },
      /* my items page*/
      myItems: {
        rentedItems: "Rented Items",
        rentRequests: "Rent Requests",
        myItems: "My Items",
      },
      profile: {
        addItem: "Add Item",
        editProfile: "Edit Profile",
        trustedSeller: "Trusted Seller",
        trustScore: "Trust Score",
        reviews: "Reviews",
        profileLikes: "Profile Likes",
        myShopItems: "Shop Items",
        viewAll: "View All Items →",
        recentItems: "Recent Shop Items",
        noItems:
          'No items added yet. Click "+ Add Item" to list your first item!',
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
          others: "Others",
        },
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
        rents: "Rents",
        notifications: "Notifications",
      },
      chat: {
        chatWithSeller: "Chat with Seller",
        messages: "Messages",
        conversations: "conversations",
        noMessagesYet: "No messages yet",
        startChattingNotice:
          "Start chatting with sellers directly from any item details page!",
        inquireNotice: "Send a message to start inquiring about this item!",
        sellerOfItem: "Seller of item",
        interestedBuyer: "Interested Buyer",
        typeMessagePlaceholder: "Type your message...",
        loadingConversation: "Loading conversation...",
        retry: "Retry",
        with: "With:",
      },
      map: {
        mapLocation: "Map Location",
        setShopLocation: "Set Shop Map Location",
        setShopLocationDesc: "Help customers find your store and view distance & directions",
        searchPlaceholder: "Search city, town, or street (e.g. Maharagama, Kandy)...",
        searchBtn: "Search",
        myGpsLocation: "My GPS Location",
        acquiringGps: "Acquiring your GPS location...",
        gpsSuccess: "Current GPS location pinned! You can drag the pin to adjust.",
        gpsError: "Location permission denied or unavailable. Please search for your city or click on the map.",
        locationNotFound: "Location not found. Try entering a nearby major town or landmark.",
        dragPinTip: "Tip: Click anywhere or drag the green pin to position",
        shopLandmarkLabel: "Shop / Landmark Display Name (visible to customers)",
        shopLandmarkPlaceholder: "e.g. Rent-Hub Store, Galle Road, Bambalapitiya",
        coordinates: "Coordinates",
        previewGoogleMaps: "Preview on Google Maps ↗",
        saveLocation: "Save Location",
        cancel: "Cancel",
        viewOnMap: "View Shop on Map",
        viewDistanceRoute: "• View Distance & Route",
        changeMapPin: "Change Map Pin",
        setMapLocation: "Set Map Location",
        updateMapPin: "Update Map Pin",
        liveDistanceRoute: "Live distance and route to store",
        fromYourLocationTo: "From your location to:",
        enableMyGps: "Enable My GPS",
        you: "You",
        shop: "Shop",
        calculating: "Calculating...",
        minsDrive: "mins drive",
        openInGoogleMaps: "Open in Google Maps",
        close: "Close",
        shopMapLocation: "Shop Map Location",
        noMapLocationSet: "No map location set yet",
      },
      itemEdit: {
        editItem: "Edit Item",
        editItemListing: "Edit Item Listing",
        editItemDesc: "Update your item details, pricing, condition, or photos",
        itemPhoto: "Item Photo",
        changeSelectedImage: "Change Selected Image",
        uploadNewImage: "Upload New Image",
        photoHint: "Leave unchanged to keep the current image. PNG, JPG or WebP.",
        itemTitle: "Item Title *",
        titlePlaceholder: "e.g. Sony A7IV Camera with 24-70mm Lens",
        category: "Category",
        condition: "Condition",
        rentalPrice: "Rental Price (LKR) *",
        pricePer: "Price Per",
        perDay: "Per Day",
        perWeek: "Per Week",
        perMonth: "Per Month",
        stockQuantity: "Stock Quantity",
        description: "Description",
        descPlaceholder: "Describe what's included, rules, deposit, or special features...",
        updateItem: "Update Item",
        markAsAvailable: "Mark as Available",
        markAsRentedOut: "Mark as Rented Out",
        titleRequired: "Please enter an item title.",
        priceRequired: "Please enter a valid rental price greater than 0.",
        qtyRequired: "Quantity must be at least 1.",
        updateSuccess: "Item updated successfully!",
        updateFailed: "Failed to update item.",
      },
    },
  },

  si: {
    translation: {
      search: {
        placeholder: "භාණ්ඩ නම හෝ වර්ගය අනුව සොයන්න...",
      },
      item: {
        condition: "තත්ත්වය",
        availability: "ලබාගත හැකි ප්‍රමාණය",
        currency: "රු.",
        viewDetails: "විස්තර බලන්න",
        day: "දිනකට",
        week: "සතියකට",
        month: "මාසයකට",
        addToRentCart: "ලැයිස්තුව​ට එක් කරන්න",
      },
      /* my items page*/
      myItems: {
        rentedItems: "කුලියට ගත් භාණ්ඩ",
        rentRequests: "කුලී ඉල්ලීම්",
        myItems: "මගේ භාණ්ඩ",
      },
      profile: {
        addItem: "භාණ්ඩයක් එකතු කරන්න",
        editProfile: "පැතිකඩ සංස්කරණය",
        trustedSeller: "විශ්වාසදායී විකුණුම්කරු",
        trustScore: "විශ්වාසනීයත්ව අගය",
        reviews: "විචාර",
        profileLikes: "පැතිකඩ මනාප",
        myShopItems: "භාණ්ඩ",
        viewAll: "සියල්ල බලන්න →",
        recentItems: "මෑතකදී එකතු කළ භාණ්ඩ",
        noItems: 'තවම භාණ්ඩ එකතු කර නැත. "+ භාණ්ඩයක් එකතු කරන්න" ඔබන්න!',
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
          others: "වෙනත්",
        },
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
        rents: "කුලී",
        notifications: "දැනුම්දීම්",
      },
      chat: {
        chatWithSeller: "විකුණුම්කරු සමඟ කතා කරන්න",
        messages: "පණිවිඩ",
        conversations: "සංවාද",
        noMessagesYet: "තවම පණිවිඩ නොමැත",
        startChattingNotice:
          "ඕනෑම භාණ්ඩයක විස්තර පිටුවකින් කෙලින්ම විකුණුම්කරු සමඟ කතා කරන්න!",
        inquireNotice: "මෙම භාණ්ඩය පිළිබඳ විමසීමට පණිවිඩයක් යවන්න!",
        sellerOfItem: "භාණ්ඩයේ අයිතිකරු",
        interestedBuyer: "මිලදී ගන්නා පාර්ශ්වය",
        typeMessagePlaceholder: "ඔබගේ පණිවිඩය මෙහි ලියන්න...",
        loadingConversation: "පණිවිඩ පූරණය වෙමින් පවතී...",
        retry: "නැවත උත්සාහ කරන්න",
        with: "සමඟ:",
      },
      map: {
        mapLocation: "සිතියම් ස්ථානය",
        setShopLocation: "වෙළඳසැල් සිතියම් ස්ථානය සකසන්න",
        setShopLocationDesc: "පාරිභෝගිකයින්ට ඔබගේ වෙළඳසැල සොයා ගැනීමට සහ දුර හා ගමන් මාර්ගය බැලීමට උපකාරී වේ",
        searchPlaceholder: "නගරය, ගම හෝ මාර්ගය සොයන්න (උදා: මහරගම, නුවර)...",
        searchBtn: "සොයන්න",
        myGpsLocation: "මගේ GPS ස්ථානය",
        acquiringGps: "ඔබගේ GPS ස්ථානය ලබා ගනිමින් පවතී...",
        gpsSuccess: "වත්මන් GPS ස්ථානය සලකුණු විය! ස්ථානය සකස් කිරීමට pin එක drag කළ හැක.",
        gpsError: "ස්ථාන අවසරය ලබා දී නැත. කරුණාකර නගරය සොයන්න හෝ සිතියම මත click කරන්න.",
        locationNotFound: "ස්ථානය සොයාගත නොහැක. ආසන්න ප්‍රධාන නගරයක් ඇතුළත් කරන්න.",
        dragPinTip: "සටහන: ස්ථානය තේරීමට සිතියම මත click කරන්න හෝ කොළ පැහැති pin එක drag කරන්න",
        shopLandmarkLabel: "වෙළඳසැලේ නම / සලකුණ (පාරිභෝගිකයින්ට පෙනෙන නම)",
        shopLandmarkPlaceholder: "උදා: Rent-Hub Store, ගාලු පාර, බම්බලපිටිය",
        coordinates: "ඛණ්ඩාංක",
        previewGoogleMaps: "Google Maps හි බලන්න ↗",
        saveLocation: "ස්ථානය සුරකින්න",
        cancel: "අවලංගු කරන්න",
        viewOnMap: "සිතියමෙන් බලන්න",
        viewDistanceRoute: "• දුර සහ මාර්ගය බලන්න",
        changeMapPin: "ස්ථානය වෙනස් කරන්න",
        setMapLocation: "සිතියම් ස්ථානය සකසන්න",
        updateMapPin: "ස්ථානය යාවත්කාලීන කරන්න",
        liveDistanceRoute: "වෙළඳසැලට සජීවී දුර සහ මාර්ගය",
        fromYourLocationTo: "ඔබ සිටින ස්ථානයේ සිට:",
        enableMyGps: "GPS සක්‍රිය කරන්න",
        you: "ඔබ",
        shop: "වෙළඳසැල",
        calculating: "ගණනය කරමින්...",
        minsDrive: "මිනිත්තු ධාවනය",
        openInGoogleMaps: "Google Maps මඟින් යන්න",
        close: "වසන්න",
        shopMapLocation: "වෙළඳසැල් සිතියම් ස්ථානය",
        noMapLocationSet: "තවම සිතියම් ස්ථානයක් සකසා නැත",
      },
      itemEdit: {
        editItem: "භාණ්ඩය සංස්කරණය",
        editItemListing: "භාණ්ඩ ලැයිස්තුව සංස්කරණය",
        editItemDesc: "ඔබගේ භාණ්ඩයේ විස්තර, මිල, තත්ත්වය හෝ ඡායාරූප යාවත්කාලීන කරන්න",
        itemPhoto: "භාණ්ඩයේ ඡායාරූපය",
        changeSelectedImage: "තෝරාගත් ඡායාරූපය වෙනස් කරන්න",
        uploadNewImage: "නව ඡායාරූපයක් එක් කරන්න",
        photoHint: "වත්මන් ඡායාරූපය තබා ගැනීමට කිසිවක් නොකරන්න. PNG, JPG හෝ WebP.",
        itemTitle: "භාණ්ඩයේ නම *",
        titlePlaceholder: "උදා: Sony A7IV කැමරාව සහ 24-70mm Lens",
        category: "කාණ්ඩය",
        condition: "තත්ත්වය",
        rentalPrice: "කුලී මිල (රු.) *",
        pricePer: "මිල ගණනය කිරීම",
        perDay: "දිනකට",
        perWeek: "සතියකට",
        perMonth: "මසකට",
        stockQuantity: "ලබා ගත හැකි ප්‍රමාණය",
        description: "විස්තරය",
        descPlaceholder: "අඩංගු දෑ, නීතිරීති හෝ විශේෂ පහසුකම් විස්තර කරන්න...",
        updateItem: "යාවත්කාලීන කරන්න",
        markAsAvailable: "ලබා ගත හැකි ලෙස සලකුණු කරන්න",
        markAsRentedOut: "කුලියට දී ඇති ලෙස සලකුණු කරන්න",
        titleRequired: "කරුණාකර භාණ්ඩයේ නමක් ඇතුළත් කරන්න.",
        priceRequired: "කරුණාකර වලංගු කුලී මිලක් ඇතුළත් කරන්න.",
        qtyRequired: "ප්‍රමාණය අවම වශයෙන් 1ක් විය යුතුය.",
        updateSuccess: "භාණ්ඩයේ තොරතුරු සාර්ථකව යාවත්කාලීන විය!",
        updateFailed: "යාවත්කාලීන කිරීම අසාර්ථක විය.",
      },
    },
  },

  ta: {
    translation: {
      search: {
        placeholder: "பொருளின் பெயர் அல்லது வகையின் அடிப்படையில் தேடுங்கள்...",
      },
      item: {
        condition: "நிலை",
        availability: "கிடைக்கும் அளவு",
        currency: "ரூ.",
        viewDetails: "விவரங்களைப் பார்க்க",
        day: "ஒரு நாளுக்கு",
        week: "ஒரு வாரத்திற்கு",
        month: "ஒரு மாதத்திற்கு",
        addToRentCart: "கூடையில் சேர்",
      },
      /* my items page*/
      myItems: {
        rentedItems: "வாடகைக்கு எடுத்தவை",
        rentRequests: "வாடகைக் கோரிக்கைகள்",
        myItems: "எனது பொருட்கள்",
      },
      profile: {
        addItem: "பொருளைச் சேர்",
        editProfile: "சுயவிவரத்தைத் திருத்து",
        trustedSeller: "நம்பகமான விற்பனையாளர்",
        trustScore: "நம்பிக்கை அட்டை",
        reviews: "மதிப்புரைகள்",
        profileLikes: "சுயவிவர விருப்பங்கள்",
        myShopItems: "கடையில் உள்ள பொருட்கள்",
        viewAll: "அனைத்தையும் பார் →",
        recentItems: "சமீபத்திய பொருட்கள்",
        noItems:
          'பொருட்கள் எதுவும் சேர்க்கப்படவில்லை. "+ பொருளைச் சேர்" என்பதைக் கிளிக் செய்க!',
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
          others: "மற்றவை",
        },
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
        rents: "வாடகைகள்",
        notifications: "அறிவிப்புகள்",
      },
      chat: {
        chatWithSeller: "விற்பனையாளருடன் அரட்டை",
        messages: "செய்திகள்",
        conversations: "உரையாடல்கள்",
        noMessagesYet: "இன்னும் செய்திகள் இல்லை",
        startChattingNotice:
          "பொருளின் விவரப் பக்கத்திலிருந்து நேரடியாக விற்பனையாளருடன் அரட்டையடிக்கவும்!",
        inquireNotice:
          "இந்தப் பொருளைப் பற்றி விசாரிக்க ஒரு செய்தியை அனுப்பவும்!",
        sellerOfItem: "பொருளின் விற்பனையாளர்",
        interestedBuyer: "வாங்க விரும்பும் வாடிக்கையாளர்",
        typeMessagePlaceholder: "உங்கள் செய்தியை தட்டச்சு செய்யவும்...",
        loadingConversation: "செய்திகள் ஏற்றப்படுகின்றன...",
        retry: "மீண்டும் முயற்சிக்கவும்",
        with: "உடன்:",
      },
      map: {
        mapLocation: "வரைபட இருப்பிடம்",
        setShopLocation: "கடை வரைபட இடத்தை அமைக்கவும்",
        setShopLocationDesc: "வாடிக்கையாளர்கள் உங்கள் கடையைக் கண்டறியவும் தொலைவு மற்றும் வழிகளைப் பார்க்கவும் உதவுங்கள்",
        searchPlaceholder: "நகரம் அல்லது தெருவைத் தேடுங்கள் (எ.கா: கண்டி)...",
        searchBtn: "தேடு",
        myGpsLocation: "எனது GPS இடம்",
        acquiringGps: "உங்கள் GPS இருப்பிடத்தைப் பெறுகிறது...",
        gpsSuccess: "தற்போதைய GPS இடம் குறிக்கப்பட்டது! மாற்ற பின்னை இழுக்கவும்.",
        gpsError: "இருப்பிட அனுமதி மறுக்கப்பட்டது. உங்கள் நகரத்தைத் தேடுங்கள்.",
        locationNotFound: "இருப்பிடம் கிடைக்கவில்லை. அருகிலுள்ள பிரதான நகரத்தை உள்ளிடவும்.",
        dragPinTip: "குறிப்பு: வரைபடத்தில் கிளிக் செய்யவும் அல்லது பின்னை நகர்த்தவும்",
        shopLandmarkLabel: "கடை / அடையாளப் பெயர் (வாடிக்கையாளர்களுக்குக் காட்டும்)",
        shopLandmarkPlaceholder: "எ.கா: வாடகை மையம், காலி வீதி",
        coordinates: "ஆயத்தொலைவுகள்",
        previewGoogleMaps: "Google Maps இல் பார்க்க ↗",
        saveLocation: "இடத்தைச் சேமிக்கவும்",
        cancel: "ரத்துசெய்",
        viewOnMap: "வரைபடத்தில் காண்க",
        viewDistanceRoute: "• தொலைவு மற்றும் வழியைக் காண்க",
        changeMapPin: "இடத்தை மாற்றவும்",
        setMapLocation: "வரைபட இடத்தை அமைக்கவும்",
        updateMapPin: "இடத்தைப் புதுப்பிக்கவும்",
        liveDistanceRoute: "கடைக்கான நேரடி தூரம் மற்றும் வழி",
        fromYourLocationTo: "உங்கள் இடத்திலிருந்து:",
        enableMyGps: "எனது GPS இயக்கவும்",
        you: "நீங்கள்",
        shop: "கடை",
        calculating: "கணக்கிடுகிறது...",
        minsDrive: "நிமிட ஓட்டம்",
        openInGoogleMaps: "Google Maps இல் திறக்கவும்",
        close: "மூடு",
        shopMapLocation: "கடை வரைபட இடம்",
        noMapLocationSet: "வரைபட இடம் எதுவும் இன்னும் அமைக்கப்படவில்லை",
      },
      itemEdit: {
        editItem: "பொருளைத் திருத்து",
        editItemListing: "பொருளைத் திருத்துக",
        editItemDesc: "பொருளின் விவரங்கள், விலை, நிலை அல்லது புகைப்படங்களைப் புதுப்பிக்கவும்",
        itemPhoto: "பொருள் புகைப்படம்",
        changeSelectedImage: "படத்தை மாற்றவும்",
        uploadNewImage: "புதிய படத்தைப் பதிவேற்றவும்",
        photoHint: "தற்போதைய படத்தை வைத்திருக்க மாற்ற வேண்டாம். PNG, JPG அல்லது WebP.",
        itemTitle: "பொருளின் தலைப்பு *",
        titlePlaceholder: "எ.கா: சோனி கேமரா",
        category: "வகை",
        condition: "நிலை",
        rentalPrice: "வாடகை விலை (ரூ.) *",
        pricePer: "விலைக் காலம்",
        perDay: "ஒரு நாளைக்கு",
        perWeek: "வாரத்திற்கு",
        perMonth: "மாதத்திற்கு",
        stockQuantity: "கையிருப்பு அளவு",
        description: "விவரம்",
        descPlaceholder: "விவரங்கள், விதிகள் அல்லது சிறப்பம்சங்களை விவரிக்கவும்...",
        updateItem: "புதுப்பிக்கவும்",
        markAsAvailable: "கிடைக்கக்கூடியதாகக் குறிக்கவும்",
        markAsRentedOut: "வாடகைக்கு வழங்கப்பட்டதாகக் குறிக்கவும்",
        titleRequired: "தயவுசெய்து பொருளின் பெயரை உள்ளிடவும்.",
        priceRequired: "சரியான வாடகை விலையை உள்ளிடவும்.",
        qtyRequired: "அளவு குறைந்தது 1 ஆக இருக்க வேண்டும்.",
        updateSuccess: "பொருள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
        updateFailed: "புதுப்பித்தல் தோல்வியடைந்தது.",
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
