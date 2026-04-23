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
    colorPalette: string;
    livePreview: string;
    previewTitle: string;
    previewSub: string;
    justNow: string;
    aesthetics: string;
    appearanceTheme: string;
    colorScheme: string;
    colorSchemeSub: string;
    amoledMode: string;
    amoledModeSub: string;
    colorSeed: string;
    colorSeedSub: string;
    textSize: string;
    textSizeSub: string;
    dynamicColors: string;
    dynamicColorsSub: string;
    displayLanguage: string;
    displayLanguageSub: string;
    reset: string;
    ok: string;
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
    exportOptions: 'Share / Export',
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
      colorPalette: 'Color Palette',
      livePreview: 'Live Preview',
      previewTitle: 'Design system changes',
      previewSub: 'The app instantly repaints with the new theme colors and smooth bento curves.',
      justNow: 'JUST NOW',
      aesthetics: 'Aesthetics',
      appearanceTheme: 'Appearance Theme',
      colorScheme: 'Color Scheme',
      colorSchemeSub: 'System, Light or Dark',
      amoledMode: 'AMOLED Mode',
      amoledModeSub: 'Pitch black backgrounds in dark mode',
      colorSeed: 'Theme Palette',
      colorSeedSub: 'Choose a primary seed color',
      textSize: 'Text Size',
      textSizeSub: 'Scale application text to your comfort',
      dynamicColors: 'Dynamic Colors',
      dynamicColorsSub: 'Sync with system wallpaper (Android 12+)',
      displayLanguage: 'Display Language',
      displayLanguageSub: 'Choose your preferred language',
      reset: 'Reset',
      ok: 'OK',
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
    exportOptions: 'Share / Export',
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
      colorPalette: 'रंग पैलेट (Color Palette)',
      livePreview: 'लाइव प्रीव्यू',
      previewTitle: 'डिजाइन बदलाव',
      previewSub: 'ऐप तुरंत नए थीम रंगों और स्मूथ बेंटो कर्व्स के साथ खुद को बदल लेता है।',
      justNow: 'अभी-अभी',
      aesthetics: 'सौंदर्यशास्त्र',
      appearanceTheme: 'ऐप की थीम',
      colorScheme: 'रंग योजना',
      colorSchemeSub: 'सिस्टम, लाइट या डार्क',
      amoledMode: 'AMOLED मोड',
      amoledModeSub: 'डार्क मोड में पिच ब्लैक बैकग्राउंड',
      colorSeed: 'रंग पैलेट',
      colorSeedSub: 'एक मुख्य रंग चुनें',
      textSize: 'टेक्स्ट का आकार',
      textSizeSub: 'अपनी सुविधा के अनुसार टेक्स्ट बदलें',
      dynamicColors: 'डायनामिक रंग',
      dynamicColorsSub: 'वॉलपेपर के साथ सिंक करें (Android 12+)',
      displayLanguage: 'डिस्प्ले भाषा',
      displayLanguageSub: 'अपनी पसंद की भाषा चुनें',
      reset: 'रीसेट (Reset)',
      ok: 'ठीक (OK)',
      dataStorage: 'डेटा और स्टोरेज',
      trashDesc: 'हटाए गए नोट्स देखें या पुनर्स्थापित करें',
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
    exportOptions: 'Share / Export',
    exportPdf: 'PDF হিসেবে সংরক্ষণ করুন',
    exportImg: 'ছবি হিসেবে সংরক্ষণ করুন',
    editor: {
      titlePlaceholder: 'শিরোনাম...',
      bodyPlaceholder: 'এখানে লেখা শুরু করুন...',
      done: 'সম্পন্ন ✓',
      saved: 'সংরक्षित ✓',
      deleteNote: 'নোট মুছুন',
      deleteNoteSub: 'আপনি কি এই নোটটি মুছতে চান?',
      cancel: 'বাতিল',
      delete: 'মুছুন',
      chars: 'অক্ষর',
      words: 'শব্দ',
      notFound: 'নোট পাওয়া যায়নি',
    },
    settingsScreen: {
      colorPalette: 'রঙের প্যালেট (Color Palette)',
      livePreview: 'সরাসরি প্রাকদর্শন',
      previewTitle: 'ডিজাইন পরিবর্তন',
      previewSub: 'অ্যপটি তৎক্ষণাৎ নতুন থিম রঙ এবং বেন্তো কার্ভস এর সাথে নিজেকে গুছিয়ে নেয়।',
      justNow: 'এইমাত্র',
      aesthetics: 'নান্দনিকতা',
      appearanceTheme: 'অ্যপ থিম',
      colorScheme: 'রঙের স্কিম',
      colorSchemeSub: 'সিস্টেম, হালকা বা গাঢ়',
      amoledMode: 'AMOLED মোড',
      amoledModeSub: 'ডার্ক মোডে পিচ ব্ল্যাক ব্যাকগ্রাউন্ড',
      colorSeed: 'রঙের প্যালেট',
      colorSeedSub: 'একটি প্রধান রঙ চয়ন করুন',
      textSize: 'টেক্সট সাইজ',
      textSizeSub: 'অ্যাপ্লিকেশন টেক্সট আপনার পছন্দমতো পরিবর্তন করুন',
      dynamicColors: 'ডায়নামিক রঙ',
      dynamicColorsSub: 'ওয়ালপেপারের সাথে সিঙ্ক করুন (Android 12+)',
      displayLanguage: 'ডিসপ্লে ভাষা',
      displayLanguageSub: 'আপনার পছন্দসই ভাষা চয়ন করুন',
      reset: 'রিসেট',
      ok: 'ওকে',
      dataStorage: 'ডেটা এবং স্টোরেজ',
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
    exportOptions: 'Share / Export',
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
      words: 'పদాలు',
      notFound: 'నోట్ కనుగొనబడలేదు',
    },
    settingsScreen: {
      colorPalette: 'రంగు పాలెట్ (Color Palette)',
      livePreview: 'లైవ్ ప్రివ్యూ',
      previewTitle: 'డిజైన్ మార్పులు',
      previewSub: 'యాప్ వెంటనే కొత్త థీమ్ రంగులు మరియు బెంటి కార్వ్స్ తో మారుతుంది.',
      justNow: 'ఇప్పుడే',
      aesthetics: 'సౌందర్యం',
      appearanceTheme: 'యాప్ థీమ్',
      colorScheme: 'రంగు పథకం',
      colorSchemeSub: 'సిస్టమ్, లైట్ లేదా డార్క్',
      amoledMode: 'AMOLED మోడ్',
      amoledModeSub: 'డార్క్ మోడ్‌లో పిచ్ బ్లాక్ బ్యాక్‌గ్రౌండ్',
      colorSeed: 'రంగుల ప్యాలెట్',
      colorSeedSub: 'ప్రధాన రంగును ఎంచుకోండి',
      textSize: 'టెక్స్ట్ పరిమాణం',
      textSizeSub: 'అప్లికేషన్ టెక్స్ట్‌ని మీ సౌలభ్యానికి అనుగుణంగా మార్చుకోండి',
      dynamicColors: 'డైనమిక్ రంగులు',
      dynamicColorsSub: 'వాల్‌పేపర్‌తో సమకాలీకరించండి (Android 12+)',
      displayLanguage: 'భాషను ఎంచుకోండి',
      displayLanguageSub: 'మీకు నచ్చిన భాషను ఎంచుకోండి',
      reset: 'రీసెట్',
      ok: 'సరే',
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
    restore: 'पुनर्रचित करा',
    deleteForever: 'कायमचे हटवा',
    exportOptions: 'Share / Export',
    exportPdf: 'PDF म्हणून निर्यात करा',
    exportImg: 'चित्र म्हणून सेव्ह करा',
    editor: {
      titlePlaceholder: 'शीर्षক...',
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
      colorPalette: 'रंग पॅलेट (Color Palette)',
      livePreview: 'लाईव्ह प्रिव्ह्यू',
      previewTitle: 'डिझाईन बदल',
      previewSub: 'अॅप त्वरित नवीन थीम रंगांसह स्वतःला बदलतो.',
      justNow: 'नुकतेच',
      aesthetics: 'एस्थेटिक्स',
      appearanceTheme: 'अॅप थीम',
      colorScheme: 'रंग योजना',
      colorSchemeSub: 'सिस्टम, लाईट किंवा डार्क',
      amoledMode: 'AMOLED मोड',
      amoledModeSub: 'डार्क मोडमध्ये पिच ब्लॅक बॅकग्राउंड',
      colorSeed: 'रंग पॅलेट',
      colorSeedSub: 'एक मुख्य रंग निवडा',
      textSize: 'मजकूर आकार',
      textSizeSub: 'तुमच्या सोयीनुसार मजकूर आकार बदला',
      dynamicColors: 'डायनॅमिक रंग',
      dynamicColorsSub: 'वॉलपेपरसह सिंक करा (Android 12+)',
      displayLanguage: 'डिस्प्ले भाषा',
      displayLanguageSub: 'तुमची पসংतीची भाषा निवडा',
      reset: 'रीसेट (Reset)',
      ok: 'ठीक (OK)',
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
    exportOptions: 'Share / Export',
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
      words: 'சொற்க சொற்கள்',
      notFound: 'குறிப்பு கிடைக்கவில்லை',
    },
    settingsScreen: {
      colorPalette: 'வண்ணத் தட்டு (Color Palette)',
      livePreview: 'நேரடி முன்னோட்டம்',
      previewTitle: 'வடிவமைப்பு மாற்றங்கள்',
      previewSub: 'பயன்பாடு உடனடியாக புதிய தீம் வண்ணங்களுடன் மாறும்.',
      justNow: 'இப்போது',
      aesthetics: 'அழகியல்',
      appearanceTheme: 'தீம் அமைப்புகள்',
      colorScheme: 'தோற்ற முறை',
      colorSchemeSub: 'சிஸ்டம், ஒளி அல்லது இருள்',
      amoledMode: 'AMOLED முறை',
      amoledModeSub: 'இருள் முறையில் முழுமையான கருப்பு பின்னணி',
      colorSeed: 'வண்ணத் தட்டு',
      colorSeedSub: 'ஒரு முதன்மை நிறத்தைத் தேர்ந்தெடுக்கவும்',
      textSize: 'எழுத்து அளவு',
      textSizeSub: 'பயன்பாட்டின் எழுத்து அளவை மாற்றவும்',
      dynamicColors: 'மாறும் வண்ணங்கள்',
      dynamicColorsSub: 'வால்பேப்பருடன் ஒத்திசைக்கவும் (Android 12+)',
      displayLanguage: 'மொழி அமைப்புகள்',
      displayLanguageSub: 'விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
      reset: 'மீட்டமை',
      ok: 'சரி',
      dataStorage: 'தரவு மற்றும் சேமிப்பு',
      trashDesc: 'நீக்கப்பட்ட குறிப்புகளைப் பார் அல்லது மீட்டமை',
    }
  },
};