import { AppLanguage } from '../store/settingsStore';

type AppStrings = {
  appName: string;
  appSub: string;
  searchPlaceholder: string;
  noNotes: string;
  noNotesSub: string;
  noResults: string;
  noResultsSub: string;
  allTag: string;
  newNote: string;
  settings: string;
  trash: string;
  trashEmpty: string;
  trashEmptySub: string;
  restore: string;
  deleteForever: string;
  exportOptions: string;
  exportPdf: string;
  exportImg: string;
  editor: {
    titlePlaceholder: string;
    bodyPlaceholder: string;
    done: string;
    saved: string;
    deleteNote: string;
    deleteNoteSub: string;
    cancel: string;
    delete: string;
    chars: string;
    words: string;
    notFound: string;
  };
  settingsScreen: {
    lookAndFeel: string;
    livePreview: string;
    previewTitle: string;
    previewSub: string;
    justNow: string;
    aesthetics: string;
    appearanceTheme: string;
    nightMode: string;
    nightModeSub: string;
    amoledMode: string;
    amoledModeSub: string;
    colorSeed: string;
    colorSeedSub: string;
    iconShape: string;
    iconShapeSub: string;
    dynamicColors: string;
    dynamicColorsSub: string;
    typographyLanguage: string;
    dataStorage: string;
    trashDesc: string;
  };
};

export const strings: Record<AppLanguage, AppStrings> = {
  En: {
    appName: 'Saral Lekhan',
    appSub: 'NOTES EXPERIENCE',
    searchPlaceholder: 'Search...',
    noNotes: 'No notes yet',
    noNotesSub: 'Press + to write your first note',
    noResults: 'No results found',
    noResultsSub: 'Nothing found for',
    allTag: 'All',
    newNote: 'New Note',
    settings: 'Settings',
    trash: 'Trash',
    trashEmpty: 'Trash is empty',
    trashEmptySub: 'Deleted notes will appear here',
    restore: 'Restore',
    deleteForever: 'Delete Forever',
    exportOptions: 'Export Note',
    exportPdf: 'Export to PDF',
    exportImg: 'Save as Image',
    editor: {
      titlePlaceholder: 'Title...',
      bodyPlaceholder: 'Start writing here...',
      done: 'Done ✓',
      saved: 'Saved ✓',
      deleteNote: 'Delete Note',
      deleteNoteSub: 'Do you want to delete this note?',
      cancel: 'Cancel',
      delete: 'Delete',
      chars: 'chars',
      words: 'words',
      notFound: 'Note not found',
    },
    settingsScreen: {
      lookAndFeel: 'Look & Feel',
      livePreview: 'Live Preview',
      previewTitle: 'Design system changes',
      previewSub: 'The app instantly repaints with the new theme colors and smooth bento curves.',
      justNow: 'JUST NOW',
      aesthetics: 'Aesthetics',
      appearanceTheme: 'Appearance Theme',
      nightMode: 'Night Mode',
      nightModeSub: 'System, Light or Dark',
      amoledMode: 'AMOLED Mode',
      amoledModeSub: 'Pitch black backgrounds in dark mode',
      colorSeed: 'Color Palette',
      colorSeedSub: 'Choose a primary seed color',
      iconShape: 'Icon Shape',
      iconShapeSub: 'Change shapes of buttons and containers',
      dynamicColors: 'Dynamic Colors',
      dynamicColorsSub: 'Sync with system wallpaper (Android 12+)',
      typographyLanguage: 'Typography & Language',
      dataStorage: 'Data & Storage',
      trashDesc: 'View or restore deleted notes',
    }
  },
  Hi: {
    appName: 'सरल लेखन',
    appSub: 'नोट्स अनुभव',
    searchPlaceholder: 'खोजें...',
    noNotes: 'कोई नोट नहीं',
    noNotesSub: '+ दबाएँ और पहला नोट लिखें',
    noResults: 'कोई परिणाम नहीं',
    noResultsSub: 'के लिए कुछ नहीं मिला',
    allTag: 'सभी',
    newNote: 'नया नोट',
    settings: 'सेटिंग्स',
    trash: 'कूड़ादान (Trash)',
    trashEmpty: 'कूड़ादान खाली है',
    trashEmptySub: 'हटाए गए नोट यहाँ दिखाई देंगे',
    restore: 'पुनर्स्थापित करें',
    deleteForever: 'हमेशा के लिए हटाएं',
    exportOptions: 'नोट निर्यात (Export) करें',
    exportPdf: 'PDF के रूप में सहेजें',
    exportImg: 'चित्र (Image) के रूप में सहेजें',
    editor: {
      titlePlaceholder: 'शीर्षक...',
      bodyPlaceholder: 'यहाँ लिखना शुरू करें...',
      done: 'हो गया ✓',
      saved: 'सहेजा ✓',
      deleteNote: 'नोट हटाएं',
      deleteNoteSub: 'इस नोट को हटाना चाहते हैं?',
      cancel: 'रद्द',
      delete: 'हटाएं',
      chars: 'अक्षर',
      words: 'शब्द',
      notFound: 'नोट नहीं मिला',
    },
    settingsScreen: {
      lookAndFeel: 'रूप और अनुभव',
      livePreview: 'लाइव प्रीव्यू',
      previewTitle: 'डिजाइन बदलाव',
      previewSub: 'ऐप तुरंत नए थीम रंगों और स्मूथ बेंटो कर्व्स के साथ खुद को बदल लेता है।',
      justNow: 'अभी-अभी',
      aesthetics: 'सौंदर्यशास्त्र',
      appearanceTheme: 'ऐप की थीम',
      nightMode: 'नाइट मोड',
      nightModeSub: 'सिस्टम, लाइट या डार्क',
      amoledMode: 'AMOLED मोड',
      amoledModeSub: 'डार्क मोड में पिच ब्लैक बैकग्राउंड',
      colorSeed: 'रंग पैलेट',
      colorSeedSub: 'एक मुख्य रंग चुनें',
      iconShape: 'आइकन का आकार',
      iconShapeSub: 'बटन और कंटेनर का आकार बदलें',
      dynamicColors: 'डायनामिक रंग',
      dynamicColorsSub: 'वॉलपेपर के साथ सिंक करें (Android 12+)',
      typographyLanguage: 'फ़ॉन्ट और भाषा',
      dataStorage: 'डेटा और स्टोरेज',
      trashDesc: 'हटवलेल्या नोट्स पहा किंवा परत आणा',
    }
  },
  Bn: {
    appName: 'সরল লিখন',
    appSub: 'নোট অভিজ্ঞতা',
    searchPlaceholder: 'অনুসন্ধান করুন...',
    noNotes: 'কোনো নোট নেই',
    noNotesSub: '+ টিপুন এবং প্রথম নোট লিখুন',
    noResults: 'কোন ফলাফল পাওয়া যায়নি',
    noResultsSub: 'এর জন্য কিছুই পাওয়া যায়নি',
    allTag: 'সব',
    newNote: 'নতুন নোট',
    settings: 'সেটিংস',
    trash: 'ট্র্যাশ',
    trashEmpty: 'ট্র্যাশ খালি',
    trashEmptySub: 'মুছে ফেলা নোট এখানে উপস্থিত হবে',
    restore: 'পুনরুদ্ধার করুন',
    deleteForever: 'চিরতরে মুছে ফেলুন',
    exportOptions: 'নোট রপ্তানি করুন',
    exportPdf: 'PDF হিসেবে সংরক্ষণ করুন',
    exportImg: 'ছবি হিসেবে সংরক্ষণ করুন',
    editor: {
      titlePlaceholder: 'শিরোনাম...',
      bodyPlaceholder: 'এখানে লেখা শুরু করুন...',
      done: 'সম্পন্ন ✓',
      saved: 'সংরক্ষিত ✓',
      deleteNote: 'নোট মুছুন',
      deleteNoteSub: 'আপনি কি এই নোটটি মুছতে চান?',
      cancel: 'বাতিল',
      delete: 'মুছুন',
      chars: 'অক্ষর',
      words: 'শব্দ',
      notFound: 'নোট পাওয়া যায়নি',
    },
    settingsScreen: {
      lookAndFeel: 'রূপ এবং অনুভব',
      livePreview: 'সরাসরি প্রাকদর্শন',
      previewTitle: 'ডিজাইন পরিবর্তন',
      previewSub: 'অ্যপটি তৎক্ষণাৎ নতুন থিম রঙ এবং বেন্তো কার্ভস এর সাথে নিজেকে গুছিয়ে নেয়।',
      justNow: 'এইমাত্র',
      aesthetics: 'নান্দনিকতা',
      appearanceTheme: 'অ্যাপ থিম',
      nightMode: 'নাইট মোড',
      nightModeSub: 'সিস্টেম, লাইট বা ডার্ক',
      amoledMode: 'AMOLED মোড',
      amoledModeSub: 'ডার্ক মোডে পিচ ব্ল্যাক ব্যাকগ্রাউন্ড',
      colorSeed: 'রঙের প্যালেট',
      colorSeedSub: 'একটি প্রধান রঙ চয়ন করুন',
      iconShape: 'আইকন আকৃতি',
      iconShapeSub: 'বোতাম এবং কন্টেইনারের আকৃতি পরিবর্তন করুন',
      dynamicColors: 'ডায়নামিক রঙ',
      dynamicColorsSub: 'ওয়ালপেপারের সাথে সিঙ্ক করুন (Android 12+)',
      typographyLanguage: 'ফন্ট এবং ভাষা',
      dataStorage: 'ডেটা এবং স্টোরেज',
      trashDesc: 'মুছে ফেলা নোটগুলি দেখুন বা ফিরিয়ে আনুন',
    }
  },
  Te: {
    appName: 'సరళ్ లేఖన్',
    appSub: 'నోట్స్ అనుభవం',
    searchPlaceholder: 'శోధించండి...',
    noNotes: 'నోట్స్ లేవు',
    noNotesSub: '+ నొక్కి మీ మొదటి నోట్ రాయండి',
    noResults: 'ఫలితాలు లేవు',
    noResultsSub: 'కోసం ఏమీ కనుగొనబడలేదు',
    allTag: 'అన్ని',
    newNote: 'కొత్త నోట్',
    settings: 'సెట్టింగులు',
    trash: 'ట్రాష్',
    trashEmpty: 'ట్రాష్ ఖాళీగా ఉంది',
    trashEmptySub: 'తొలగించబడిన నోట్స్ ఇక్కడ కనిపిస్తాయి',
    restore: 'పునరుద్ధరించు',
    deleteForever: 'శాశ్వతంగా తొలగించు',
    exportOptions: 'నోట్ ఎగుమతి చేయి',
    exportPdf: 'PDF గా ఎగుమతి చేయి',
    exportImg: 'చిత్రంగా సేవ్ చేయి',
    editor: {
      titlePlaceholder: 'శీర్షిక...',
      bodyPlaceholder: 'ఇక్కడ రాయడం ప్రారంభించండి...',
      done: 'పూర్తయింది ✓',
      saved: 'సేవ్ చేయబడింది ✓',
      deleteNote: 'నోట్ తొలగించు',
      deleteNoteSub: 'ఈ నోట్ తొలగించాలా?',
      cancel: 'రద్దు చేయి',
      delete: 'తొలగించు',
      chars: 'అక్షరాలు',
      words: 'పదాలు',
      notFound: 'నోట్ కనుగొనబడలేదు',
    },
    settingsScreen: {
      lookAndFeel: 'అకారం మరియు అనుభవం',
      livePreview: 'లైవ్ ప్రివ్యూ',
      previewTitle: 'డిజైన్ మార్పులు',
      previewSub: 'యాప్ వెంటనే కొత్త థీమ్ రంగులు మరియు బెంటి కార్వ్స్ తో మారుతుంది.',
      justNow: 'ఇప్పుడే',
      aesthetics: 'సౌందర్యం',
      appearanceTheme: 'యాప్ థీమ్',
      nightMode: 'నైట్ మోడ్',
      nightModeSub: 'సిస్టమ్, లైట్ లేదా డార్క్',
      amoledMode: 'AMOLED మోడ్',
      amoledModeSub: 'డార్క్ మోడ్‌లో పిచ్ బ్లాక్ బ్యాక్‌గ్రౌండ్',
      colorSeed: 'కలర్ ప్యాలెట్',
      colorSeedSub: 'ప్రధాన రంగును ఎంచుకోండి',
      iconShape: 'ఐకాన్ ఆకారం',
      iconShapeSub: 'బటన్లు మరియు కంటైనర్ల ఆకారం మార్చండి',
      dynamicColors: 'డైనమిక్ రంగులు',
      dynamicColorsSub: 'వాల్‌పేపర్‌తో సమకాలీకరించండి (Android 12+)',
      typographyLanguage: 'ఫాంట్ మరియు భాష',
      dataStorage: 'డేటా మరియు స్టోరేజ్',
      trashDesc: 'తొలగించిన నోట్స్ చూడండి లేదా తిరిగి పొందండి',
    }
  },
  Mr: {
    appName: 'सरल लेखन',
    appSub: 'नोट्स अनुभव',
    searchPlaceholder: 'शोधा...',
    noNotes: 'कोणत्याही नोट्स नाहीत',
    noNotesSub: '+ दाबा आणि पहिली नोट लिहा',
    noResults: 'कोणतेही परिणाम आढळले नाहीत',
    noResultsSub: 'साठी काहीही सापडले नाही',
    allTag: 'सर्व',
    newNote: 'नवीन नोट',
    settings: 'सेटिंग्ज',
    trash: 'कचरा',
    trashEmpty: 'कचरा रिकामा आहे',
    trashEmptySub: 'हटवलेल्या नोट्स येथे दिसतील',
    restore: 'पुنर्संचयित करा',
    deleteForever: 'कायमचे हटवा',
    exportOptions: 'नोट निर्यात करा',
    exportPdf: 'PDF म्हणून निर्यात करा',
    exportImg: 'चित्र म्हणून सेव्ह करा',
    editor: {
      titlePlaceholder: 'शीर्षक...',
      bodyPlaceholder: 'येथे लिहिण्यास सुरुवात करा...',
      done: 'झाले ✓',
      saved: 'जतन केले ✓',
      deleteNote: 'नोट हटवा',
      deleteNoteSub: 'तुम्हाला ही नोट हटवायची आहे का?',
      cancel: 'रद्द करा',
      delete: 'हटवा',
      chars: 'अक्षरे',
      words: 'शब्द',
      notFound: 'नोट सापडली नाही',
    },
    settingsScreen: {
      lookAndFeel: 'रूप आणि अनुभव',
      livePreview: 'लाईव्ह प्रिव्ह्यू',
      previewTitle: 'डिझाईन बदल',
      previewSub: 'अॅप त्वरित नवीन थीम रंगांसह स्वतःला बदलतो.',
      justNow: 'नुकतेच',
      aesthetics: 'एस्थेटिक्स',
      appearanceTheme: 'अॅप थीम',
      nightMode: 'नाईट मोड',
      nightModeSub: 'सिस्टम, लाईट किंवा डार्क',
      amoledMode: 'AMOLED मोड',
      amoledModeSub: 'डार्क मोडमध्ये पिच ब्लॅक बॅकग्राउंड',
      colorSeed: 'रंग पॅलेट',
      colorSeedSub: 'एक मुख्य रंग निवडा',
      iconShape: 'आयकनचा आकार',
      iconShapeSub: 'बटणे आणि कंटेनरचा आकार बदला',
      dynamicColors: 'डायनॅमिक रंग',
      dynamicColorsSub: 'वॉलपेपरसह सिंक करा (Android 12+)',
      typographyLanguage: 'फॉन्ट आणि भाषा',
      dataStorage: 'डेटा आणि स्टोरेज',
      trashDesc: 'हटवलेल्या नोट्स पहा किंवा परत आणा',
    }
  },
  Ta: {
    appName: 'சரல் லேகன்',
    appSub: 'குறிப்புகள் அனுபவம்',
    searchPlaceholder: 'தேடு...',
    noNotes: 'எந்த குறிப்புகளும் இல்லை',
    noNotesSub: '+ அழுத்தி முதல் குறிப்பை எழுதவும்',
    noResults: 'முடிவுகள் எதுவும் கிடைக்கவில்லை',
    noResultsSub: 'எதுவும் கிடைக்கவில்லை',
    allTag: 'அனைத்தும்',
    newNote: 'புதிய குறிப்பு',
    settings: 'அமைப்புகள்',
    trash: 'குப்பை',
    trashEmpty: 'குப்பை காலியாக உள்ளது',
    trashEmptySub: 'நீக்கப்பட்ட குறிப்புகள் இங்கே தோன்றும்',
    restore: 'மீட்டமை',
    deleteForever: 'முற்றிலும் நீக்கு',
    exportOptions: 'குறிப்பை ஏற்றுமதி செய்',
    exportPdf: 'PDF-ஆக ஏற்றுமதி செய்',
    exportImg: 'படமாகச் சேமி',
    editor: {
      titlePlaceholder: 'தலைப்பு...',
      bodyPlaceholder: 'இங்கே எழுதத் தொடங்குங்கள்...',
      done: 'முடிந்தது ✓',
      saved: 'சேமிக்கப்பட்டது ✓',
      deleteNote: 'குறிப்பை நீக்கு',
      deleteNoteSub: 'இந்த குறிப்பை நீக்க விரும்புகிறீர்களா?',
      cancel: 'ரத்துசெய்',
      delete: 'நீக்கு',
      chars: 'எழுத்துக்கள்',
      words: 'சொற்கள்',
      notFound: 'குறிப்பு கிடைக்கவில்லை',
    },
    settingsScreen: {
      lookAndFeel: 'தோற்றம்',
      livePreview: 'நேரடி முன்னோட்டம்',
      previewTitle: 'வடிவமைப்பு மாற்றங்கள்',
      previewSub: 'பயன்பாடு உடனடியாக புதிய தீம் வண்ணங்களுடன் மாறும்.',
      justNow: 'இப்போது',
      aesthetics: 'அழகியல்',
      appearanceTheme: 'தீம் அமைப்புகள்',
      nightMode: 'இரவு முறை',
      nightModeSub: 'சிస్టம், ஒளி அல்லது இருள்',
      amoledMode: 'AMOLED முறை',
      amoledModeSub: 'இருள் முறையில் முழுமையான கருப்பு பின்னணி',
      colorSeed: 'வண்ணத் தட்டு',
      colorSeedSub: 'ஒரு முதன்மை நிறத்தைத் தேர்ந்தெடுக்கவும்',
      iconShape: 'ஐகான் வடிவம்',
      iconShapeSub: 'பொத்தான்கள் மற்றும் கொள்கலன்களின் வடிவத்தை மாற்றவும்',
      dynamicColors: 'மாறும் வண்ணங்கள்',
      dynamicColorsSub: 'வால்பேப்பருடன் ஒத்திசைக்கவும் (Android 12+)',
      typographyLanguage: 'அச்சு மற்றும் மொழி',
      dataStorage: 'தரவு மற்றும் சேமிப்பு',
      trashDesc: 'நீக்கப்பட்ட குறிப்புகளைப் பார் அல்லது மீட்டமை',
    }
  },
};