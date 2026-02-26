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
    typographyLanguage: string;
    accessibilityFeatures: string;
    pureBlackDb: string;
    pureBlackDbSub: string;
    dynamicAccent: string;
    dynamicAccentSub: string;
    reduceMotion: string;
    reduceMotionSub: string;
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
      typographyLanguage: 'Typography & Language',
      accessibilityFeatures: 'Accessibility & Features',
      pureBlackDb: 'Pure Black Database',
      pureBlackDbSub: 'Force OLED black across all dark modes',
      dynamicAccent: 'Dynamic Accent',
      dynamicAccentSub: 'Pick accent from current wallpaper',
      reduceMotion: 'Reduce Motion',
      reduceMotionSub: 'Disable bouncy spring animations',
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
      typographyLanguage: 'फ़ॉन्ट और भाषा',
      accessibilityFeatures: 'पहुंच और सुविधाएँ',
      pureBlackDb: 'प्योर ब्लैक डेटाबेस',
      pureBlackDbSub: 'डार्क मोड में ओलेड (OLED) ब्लैक लागू करें',
      dynamicAccent: 'डायनामिक रंग',
      dynamicAccentSub: 'वर्तमान वॉलपेपर से रंग चुनें',
      reduceMotion: 'एनिमेशन कम करें',
      reduceMotionSub: 'उछलने वाले एनिमेशन अक्षम करें',
      dataStorage: 'डेटा और स्टोरेज',
      trashDesc: 'हटाए गए नोट देखें या वापस लाएं',
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
      typographyLanguage: 'ফন্ট এবং ভাষা',
      accessibilityFeatures: 'অ্যাক্সেসিবিলিটি এবং বৈশিষ্ট্য',
      pureBlackDb: 'পিওর ব্ল্যাক ডেটাবেস',
      pureBlackDbSub: 'ডার্ক মোডে ওলেড (OLED) ব্ল্যাক প্রয়োগ করুন',
      dynamicAccent: 'ডায়নামিক রঙ',
      dynamicAccentSub: 'বর্তমান ওয়ালপেপার থেকে রঙ বেছে নিন',
      reduceMotion: 'অ্যানিমেশন কমান',
      reduceMotionSub: 'লাফানো অ্যানিমেশন অক্ষম করুন',
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
      typographyLanguage: 'ఫాంట్ మరియు భాష',
      accessibilityFeatures: 'యాక్సెసిబిలిటీ మరియు ఫీచర్స్',
      pureBlackDb: 'ప్యూర్ బ్లాక్ డేటాబేస్',
      pureBlackDbSub: 'డార్క్ మోడ్‌లో OLED బ్లాక్‌ను అమలు చేయండి',
      dynamicAccent: 'డైనమిక్ రంగు',
      dynamicAccentSub: 'ప్రస్తుత వాల్‌పేపర్ నుండి యాక్సెంట్ రంగు ఎంచుకోండి',
      reduceMotion: 'యానిమేషన్ తగ్గించండి',
      reduceMotionSub: 'ఎగిరే యానిమేషన్‌లను డిసేబుల్ చేయండి',
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
      typographyLanguage: 'फॉन्ट आणि भाषा',
      accessibilityFeatures: 'सुविधा आणि प्रवेशयोग्यता',
      pureBlackDb: 'प्युअर ब्लॅक डेटाबेस',
      pureBlackDbSub: 'डार्क मोडमध्ये ओलेड (OLED) ब्लॅक लागू करा',
      dynamicAccent: 'डायनॅमिक रंग',
      dynamicAccentSub: 'सध्याच्या वॉलपेपरवरून रंग निवडा',
      reduceMotion: 'अॅनिमेशन कमी करा',
      reduceMotionSub: 'उड्या मारणारे अॅनिमेशन बंद करा',
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
      typographyLanguage: 'அச்சு மற்றும் மொழி',
      accessibilityFeatures: 'அணுகல் மற்றும் அம்சங்கள்',
      pureBlackDb: 'முழுமையான கருப்பு முறை',
      pureBlackDbSub: 'இருள் முறையில் OLED கருப்பை பயன்படுத்து',
      dynamicAccent: 'மாறும் வண்ணங்கள்',
      dynamicAccentSub: 'தற்போதைய வால்பேப்பரில் இருந்து நிறத்தை எடு',
      reduceMotion: 'அசைவைக் குறை',
      reduceMotionSub: 'துள்ளல் அனிமேஷன்களை முடக்கு',
      dataStorage: 'தரவு மற்றும் சேமிப்பு',
      trashDesc: 'நீக்கப்பட்ட குறிப்புகளைப் பார் அல்லது மீட்டமை',
    }
  },
};