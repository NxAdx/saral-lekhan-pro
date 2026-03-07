export interface ChangelogItem {
    version: string;
    date: string;
    changes: {
        en: string[];
        hi: string[];
        mr?: string[];
        bn?: string[];
        te?: string[];
        ta?: string[];
    };
}

export const APP_CHANGELOG: ChangelogItem[] = [
    {
        version: "2.15.2",
        date: "2026-03-07",
        changes: {
            en: [
                "🚀 Updater Test: Bumping version to v2.15.2 to verify the new 'Direct Install' logic.",
                "🛠️ Stability: Final verification of PackageInstaller session flow on production builds.",
            ],
            hi: [
                "🚀 अपडेटर टेस्ट: नए 'डायरेक्ट इंस्टॉल' लॉजिक को सत्यापित करने के लिए v2.15.2 पर स्विच किया गया।",
                "🛠️ स्थिरता: प्रोडक्शन बिल्ड पर PackageInstaller सेशन फ्लो का अंतिम सत्यापन।"
            ],
            mr: [
                "🚀 अपडेटर टेस्ट: नवीन 'डायरेक्ट इन्स्टॉल' लॉजिक तपासण्यासाठी v2.15.2 व्हर्जन रिलीज.",
                "🛠️ स्थिरता: प्रोडक्शन बिल्डवर PackageInstaller सेशन फ्लोची अंतिम पडताळणी।"
            ]
        }
    },
    {
        version: "2.15.1",
        date: "2026-03-07",
        changes: {
            en: [
                "🚀 Advanced Updater: Implemented native 'Direct Install' using Android PackageInstaller API.",
                "🧠 Numeric Versioning: Switched to expert numeric comparison for robust update detection.",
                "🐛 Crash Fix: Resolved app crashes when switching to Bengali, Tamil, and Telugu locales.",
                "🌐 Locale Sync: Fully synchronized all 6 supported languages (EN, HI, MR, BN, TA, TE).",
            ],
            hi: [
                "🚀 एडवांस अपडेटर: एंड्रॉइड PackageInstaller API का उपयोग करके नेटिव 'डायरेक्ट इंस्टॉल' लागू किया गया।",
                "🧠 न्यूमेरिक वर्जनिंग: मजबूत अपडेट डिटेक्शन के लिए एक्सपर्ट न्यूमेरिक तुलना पर स्विच किया गया।",
                "🐛 क्रैश फिक्स: बंगाली, तमिल और तेलुगु भाषाओं में स्विच करने पर ऐप क्रैश होने की समस्या को हल किया गया।",
                "🌐 लोकेल सिंक: सभी 6 समर्थित भाषाओं को पूरी तरह से सिंक्रनाइज़ किया गया।"
            ],
            mr: [
                "🚀 प्रगत अपडेटर: अँड्रॉइड PackageInstaller API वापरून नेटिव्ह 'डायरेक्ट इन्स्टॉल' लागू केले।",
                "🧠 न्यूमेरिक व्हर्जनिंग: अचूक अपडेट तपासणीसाठी एक्सपर्ट न्यूमेरिक तुलना पद्धत वापरली।",
                "🐛 क्रॅश फिक्स: बंगाली, तमिळ आणि तेलगू भाषा बदलताना येणारी अ‍ॅप क्रॅशची समस्या सोडवली।",
                "🌐 लोकेल सिंक: सर्व 6 समर्थित भाषा पूर्णपणे सिंक्रोनाइझ केल्या।"
            ]
        }
    },
    {
        version: "2.15.0",
        date: "2026-03-07",
        changes: {
            en: [
                "✨ Feature Discovery: Replaced the old changelog icon with a new interactive Highlights modal.",
                "⚙️ Settings Redesign: Logical grouping into Aesthetics, Security, Cloud, and Maintenance.",
                "🔤 Font Fix: Applied global `includeFontPadding: false` to solve Devanagari (Marathi/Hindi) clipping.",
                "🚀 Localization: Synchronized and optimized strings across English, Marathi, and Hindi.",
            ],
            hi: [
                "✨ सुविधाओं की खोज: पुराने चेंजलॉग आइकन को नए इंटरेक्टिव हाइलाइट्स मोडल से बदला गया।",
                "⚙️ सेटिंग्स रिडिज़ाइन: सौंदर्यशास्त्र, सुरक्षा, क्लाउड और रखरखाव में तार्किक समूहन।",
                "🔤 फ़ॉन्ट फिक्स: देवनागरी (मराठी/हिंदी) क्लिपिंग को हल करने के लिए `includeFontPadding: false` लागू किया गया।",
                "🚀 स्थानीयकरण: अंग्रेजी, मराठी और हिंदी में अनुकूलित अनुवाद।"
            ],
            mr: [
                "✨ नवीन वैशिष्ट्ये: जुन्या चेंजलॉग आयकॉनच्या जागी नवीन इंटरअॅक्टिव्ह हायलाइट्स मोडल.",
                "⚙️ सेटिंग्ज पुनर्रचना: सौंदर्यशास्त्र, सुरक्षा, क्लाउड आणि देखभाल विभागांमध्ये विभागणी.",
                "🔤 फॉन्ट फिक्स: देवनागरी (मराठी/हिंदी) मजकूर कापला जाण्याची समस्या सोडवण्यासाठी `includeFontPadding: false` लागू केले.",
                "🚀 लोकेलायझेशन: इंग्रजी, मराठी आणि हिंदी भाषांमधील मजकूर सुधारला आणि अपडेट केला."
            ]
        }
    },
    {
        version: "2.14.0",
        date: "2026-03-06",
        changes: {
            en: [
                "🛡️ Recovery UI: Added a manual bypass button if the app hangs for more than 10 seconds.",
                "🔐 Biometric Fail-Safe: Implemented a timeout for the lock screen to prevent it from blocking the app.",
                "🚀 Optimization: Consolidated initialization logic and removed redundant database calls.",
            ],
            hi: [
                "🛡️ रिकवरी UI: यदि ऐप 10 सेकंड से अधिक समय तक हैंग रहता है तो एक मैनुअल बायपास बटन जोड़ा गया।",
                "🔐 बायोमेट्रिक फेल-सेफ: लॉक स्क्रीन को ऐप को ब्लॉक करने से रोकने के लिए टाइमआउट लागू किया गया।",
                "🚀 ऑप्टिमाइज़ेशन: इनिशियलाइज़ेशन लॉजिक को समेकित किया गया और अनावश्यक डेटाबेस कॉल को हटाया गया।",
            ],
            ta: [
                "🛡️ மீட்டெடுப்பு UI: ஆப் 10 வினாடிகளுக்கு மேல் முடங்கினால் மேனுவல் பைபாஸ் பட்டன் சேர்க்கப்பட்டது.",
                "🔐 பயோமெட்ரிக் ஃபெயில்-சேஃப்: லாக் ஸ்கிரீன் ஆப்பைத் தடுப்பதைத் தவிர்க்க காலாவதி நேரம் செயல்படுத்தப்பட்டது.",
                "🚀 மேம்படுத்தல்: துவக்க லாஜிக் ஒருங்கிணைக்கப்பட்டது மற்றும் தேவையற்ற தரவுத்தள அழைப்புகள் நீக்கப்பட்டன.",
            ]
        }
    },
    {
        version: "2.13.2",
        date: "2026-03-06",
        changes: {
            en: [
                "🚀 Fail-Safe UI: Implemented guaranteed rendering after 5s regardless of asset loading status.",
                "🛡️ Deadlock Prevention: Refactored background initialization to prevent race conditions during boot.",
                "📊 Improved Diagnostics: Added surgical logging to identify device-specific startup hangs.",
            ],
            hi: [
                "🚀 फेल-सेफ UI: संपत्ति लोडिंग स्थिति की परवाह किए बिना 5 सेकंड के बाद गारंटीकृत प्रतिपादन लागू किया गया।",
                "🛡️ डेडलॉक रोकथाम: बूट के दौरान रेस स्थितियों को रोकने के लिए पृष्ठभूमि इनिशियलाइज़ेशन को रिफैक्टर किया गया।",
                "📊 बेहतर डायग्नोस्टिक्स: डिवाइस-विशिष्ट स्टार्टअप हैंग की पहचान करने के लिए सर्जिकल लॉगिंग जोड़ी गई।",
            ],
            ta: [
                "🚀 ஃபெயில்-சேஃப் UI: சொத்து ஏற்றுதல் நிலையைக் பொருட்படுத்தாமல் 5 வினாடிகளுக்குப் பிறகு உத்தரவாதம் அளிக்கப்பட்ட ரெண்டரிங் செயல்படுத்தப்பட்டது.",
                "🛡️ டெட்லாக் தடுப்பு: துவக்கத்தின் போது ரேஸ் நிலைமைகளைத் தடுக்க பின்னணி துவக்கம் மீண்டும் உருவாக்கப்பட்டது.",
                "📊 மேம்படுத்தப்பட்ட கண்டறிதல்: சாதன-குறிப்பிட்ட தொடக்க சிக்கல்களைக் கண்டறிய அறுவை சிகிச்சை பதிவு சேர்க்கப்பட்டது.",
            ]
        }
    },
    {
        version: "2.13.1",
        date: "2026-03-06",
        changes: {
            hi: [
                "स्टार्टअप स्थिरता में सुधार किया गया (Grey Screen fix)",
                "ऑफ़लाइन फोंट को एप में शामिल किया गया"
            ],
            en: [
                "Deep Startup stability fixes (Resolves Grey Screen hang)",
                "Bundled core fonts directly into the APK for 100% offline reliability"
            ],
            mr: [
                "स्टार्टअप स्थिरता सुधार (Grey Screen fix)",
                "ऑफलाइन फोंट समाविष्ट केले"
            ]
        }
    },
    {
        version: "2.13.0",
        date: "2026-03-06",
        changes: {
            en: [
                "⚡ Performance Boost: Switched to FlashList for ultra-smooth scrolling through large note collections.",
                "🧠 Efficient Rendering: Implemented component memoization to eliminate unnecessary screen updates.",
                "🛠️ Agent skills: Applied production-grade optimization rules from vercel-react-native-skills.",
                "🚀 Memory Guard: Optimized item recycling to keep the app snappy during long sessions."
            ],
            hi: [
                "⚡ परफॉरमेंस बूस्ट: बड़े नोट कलेक्शन में स्मूथ स्क्रॉलिंग के लिए FlashList का उपयोग।",
                "🧠 कुशल रेंडरिंग: अनावश्यक स्क्रीन अपडेट को रोकने के लिए कंपोनेंट मेमोइज़ेशन।",
                "🛠️ एजेंट स्किल्स: बेहतर कोड के लिए vercel-react-native-skills के नियमों का पालन।",
                "🚀 मेमोरी गार्ड: लंबे सेशन के दौरान ऐप को तेज़ रखने के लिए ऑप्टिमाइज़ेशन।"
            ],
            mr: [
                "⚡ परफॉर्मन्स बूस्ट: मोठ्या नोट कलेक्शनमध्ये स्मूथ स्क्रोलिंगसाठी FlashList चा वापर।",
                "🧠 कार्यक्षम रेंडरिंग: अनावश्यक स्क्रीन अपडेट्स टाळण्यासाठी कंपोनेंट मेमोयझेशन।",
                "🛠️ एजंट स्किल्स: उत्तम कोडसाठी vercel-react-native-skills नियमांचे एकत्रीकरण।",
                "🚀 मेमरी गार्ड: लांब सेशन्स दरम्यान अ‍ॅप वेगवान ठेवण्यासाठी ऑप्टिमायझेशन।"
            ]
        }
    },
    {
        version: "2.12.0",
        date: "2026-03-06",
        changes: {
            en: [
                "✨ Premium Startup: Skeleton loader removed and white flash fixed — app stays themed during boot.",
                "🎨 Simplified Themes: Removed AMOLED mode and 'Light & Dark' palette for a cleaner experience.",
                "🛠️ Smarter Updater: Strict version checking ensures you only get notified for NEW releases.",
                "📱 Themed Modals: All update and system alerts now follow the beautiful themed UI.",
                "🧹 Clean House: Removed legacy components and unused code."
            ],
            hi: [
                "✨ प्रीमियम स्टार्टअप: स्केलेटन लोडर हटाया गया और सफेद फ्लैश फिक्स — स्टार्टअप अब पूरी तरह थीम वाला है।",
                "🎨 सरलीकृत थीम: बेहतर अनुभव के लिए AMOLED मोड और 'Light & Dark' पैलेट को हटाया गया।",
                "🛠️ स्मार्ट अपडेटर: सख्त वर्जन चेकिंग सुनिश्चित करती है कि आपको केवल नई रिलीज की सूचना मिले।",
                "📱 थीम्ड मोडल्स: सभी अपडेट और सिस्टम अलर्ट अब सुंदर थीम्ड UI का पालन करते हैं।",
                "🧹 हाउस क्लीनिंग: पुराने घटकों और अप्रयुक्त कोड को हटाया गया।"
            ],
            mr: [
                "✨ प्रीमियम स्टार्टअप: स्केलेटन लोडर काढला आणि पांढरा फ्लॅश फिक्स — स्टार्टअप आता पूर्णपणे थीम्ड आहे.",
                "🎨 सरलीकृत थीम्स: चांगल्या अनुभवासाठी AMOLED मोड आणि 'Light & Dark' पॅलेट काढून टाकले.",
                "🛠️ स्मार्ट अपडेटर: कडक व्हर्जन चेकिंग सुनिश्चित करते की तुम्हाला फक्त नवीन रिलीजची सूचना मिळेल.",
                "📱 थीम्ड मोडल्स: सर्व अपडेट आणि सिस्टम अलर्ट आता सुंदर थीम्ड UI चे पालन करतात.",
                "🧹 हाउस क्लीनिंग: जुने घटक आणि न वापरलेले कोड काढले."
            ]
        }
    },
    {
        version: "2.10.1",
        date: "2026-03-04",
        changes: {
            en: [
                "Updater fixed: Android installer now launches without hanging at 100%.",
                "Added install permission support for Android package installer flow.",
                "CI now prints SHA-1 and SHA-256 fingerprints for Firebase registration.",
                "Google Sign-In stability improved for production release builds.",
                "Added Google Sign-In fallback retry when strict client config fails on some devices."
            ],
            hi: [
                "Updater fixed: Android installer now launches without hanging at 100%.",
                "Added install permission support for Android package installer flow.",
                "CI now prints SHA-1 and SHA-256 fingerprints for Firebase registration.",
                "Google Sign-In stability improved for production release builds.",
                "Added Google Sign-In fallback retry when strict client config fails on some devices."
            ],
            mr: [
                "Updater fixed: Android installer now launches without hanging at 100%.",
                "Added install permission support for Android package installer flow.",
                "CI now prints SHA-1 and SHA-256 fingerprints for Firebase registration.",
                "Google Sign-In stability improved for production release builds.",
                "Added Google Sign-In fallback retry when strict client config fails on some devices."
            ]
        }
    },
    {
        version: "2.10.0",
        date: "2026-03-04",
        changes: {
            en: [
                "⚡ Instant Launch: Database now pre-loads during splash — no more loading skeleton",
                "🔐 Login Fix: Improved Google Sign-In error handling and SHA fingerprint guidance",
                "🛡️ Crash Guard: App never gets stuck on loading screen, even on DB errors",
                "📋 Updated changelog and documentation for Play Store readiness"
            ],
            hi: [
                "⚡ तुरंत लॉन्च: डेटाबेस अब स्प्लैश के दौरान प्री-लोड होता है — कोई लोडिंग स्क्रीन नहीं",
                "🔐 लॉगिन फिक्स: Google साइन-इन त्रुटि हैंडलिंग और SHA फिंगरप्रिंट मार्गदर्शन में सुधार",
                "🛡️ क्रैश गार्ड: ऐप कभी भी लोडिंग स्क्रीन पर अटकती नहीं है",
                "📋 Play Store तैयारी के लिए अपडेटेड चेंजलॉग और दस्तावेज़"
            ],
            mr: [
                "⚡ त्वरित लॉन्च: डेटाबेस आता स्प्लॅश दरम्यान प्री-लोड होतो — लोडिंग स्क्रीन नाही",
                "🔐 लॉगिन फिक्स: Google साइन-इन त्रुटी हाताळणी आणि SHA फिंगरप्रिंट मार्गदर्शन सुधारले",
                "🛡️ क्रॅश गार्ड: अ‍ॅप कधीही लोडिंग स्क्रीनवर अडकत नाही",
                "📋 Play Store तयारीसाठी अपडेटेड चेंजलॉग आणि दस्तऐवज"
            ]
        }
    },
    {
        version: "2.9.9",
        date: "2026-03-04",
        changes: {
            en: [
                "Drive 403 errors now show clear action steps (including API-disabled guidance).",
                "Release pipeline and update packaging reliability improved.",
                "Stability fixes in startup/auth flow for production builds."
            ],
            hi: [
                "Drive 403 errors now show clear action steps (including API-disabled guidance).",
                "Release pipeline and update packaging reliability improved.",
                "Stability fixes in startup/auth flow for production builds."
            ],
            mr: [
                "Drive 403 errors now show clear action steps (including API-disabled guidance).",
                "Release pipeline and update packaging reliability improved.",
                "Stability fixes in startup/auth flow for production builds."
            ]
        }
    },
    {
        version: "2.9.8",
        date: "2026-03-04",
        changes: {
            en: [
                "Drive re-auth fallback improved for expired sessions.",
                "Removed hardcoded updater UI color to follow active app theme.",
                "Sync and account reconnect messaging made clearer."
            ],
            hi: [
                "Drive re-auth fallback improved for expired sessions.",
                "Removed hardcoded updater UI color to follow active app theme.",
                "Sync and account reconnect messaging made clearer."
            ],
            mr: [
                "Drive re-auth fallback improved for expired sessions.",
                "Removed hardcoded updater UI color to follow active app theme.",
                "Sync and account reconnect messaging made clearer."
            ]
        }
    },
    {
        version: "2.9.7",
        date: "2026-03-04",
        changes: {
            en: [
                "Fixed startup crash caused by undefined catch handling in early boot path.",
                "Improved startup guardrails for edge-case init failures."
            ],
            hi: [
                "Fixed startup crash caused by undefined catch handling in early boot path.",
                "Improved startup guardrails for edge-case init failures."
            ],
            mr: [
                "Fixed startup crash caused by undefined catch handling in early boot path.",
                "Improved startup guardrails for edge-case init failures."
            ]
        }
    },
    {
        version: "2.9.6",
        date: "2026-03-04",
        changes: {
            en: [
                "Startup catch-path hardening to avoid app boot failures on some builds.",
                "Versioning and release metadata consistency updates."
            ],
            hi: [
                "Startup catch-path hardening to avoid app boot failures on some builds.",
                "Versioning and release metadata consistency updates."
            ],
            mr: [
                "Startup catch-path hardening to avoid app boot failures on some builds.",
                "Versioning and release metadata consistency updates."
            ]
        }
    },
    {
        version: "2.9.5",
        date: "2026-03-03",
        changes: {
            en: [
                "Entrypoint and updater installer flow improvements.",
                "Build pipeline fix for Android Gradle wrapper execution in CI.",
                "General release hardening and packaging cleanup."
            ],
            hi: [
                "Entrypoint and updater installer flow improvements.",
                "Build pipeline fix for Android Gradle wrapper execution in CI.",
                "General release hardening and packaging cleanup."
            ],
            mr: [
                "Entrypoint and updater installer flow improvements.",
                "Build pipeline fix for Android Gradle wrapper execution in CI.",
                "General release hardening and packaging cleanup."
            ]
        }
    },
    {
        version: "2.9.4",
        date: "2026-03-03",
        changes: {
            en: [
                "Startup and auth stability refinements.",
                "Updater integration and release notes flow improvements.",
                "Internal reliability fixes across settings and sync surfaces."
            ],
            hi: [
                "Startup and auth stability refinements.",
                "Updater integration and release notes flow improvements.",
                "Internal reliability fixes across settings and sync surfaces."
            ],
            mr: [
                "Startup and auth stability refinements.",
                "Updater integration and release notes flow improvements.",
                "Internal reliability fixes across settings and sync surfaces."
            ]
        }
    },
    {
        version: "2.9.3",
        date: "2026-03-02",
        changes: {
            en: [
                "🛡️ Security Engine: Hardened biometric vaults and offline keys",
                "⚡ Production Speed: Removed legacy components for faster loading",
                "🐛 Bug Fixes: Resolved Drive sync duplication and Sentry reporting",
                "🌐 Global Reach: Enhanced support for newer regional dialects",
                "🎨 UI Polish: Minor layout spacing and typography adjustments"
            ],
            hi: [
                "🛡️ सुरक्षा इंजन: मजबूत बायोमेट्रिक वॉल्ट और ऑफ़लाइन कुंजियाँ",
                "⚡ उत्पादन गति: तेज़ लोडिंग के लिए पुराने घटकों को हटाया गया",
                "🐛 बग फिक्स: ड्राइव सिंक दोहराव और सेंट्री रिपोर्टिंग को हल किया",
                "🌐 वैश्विक पहुंच: नई क्षेत्रीय बोलियों के लिए बेहतर समर्थन",
                "🎨 UI सुधार: मामूली लेआउट रिक्ति और टाइपोग्राफी समायोजन"
            ],
            mr: [
                "🛡️ सुरक्षा इंजिन: मजबूत बायोमेट्रिक वॉल्ट आणि ऑफलाइन की",
                "⚡ उत्पादन गती: वेगवान लोडिंगसाठी जुने घटक काढले",
                "🐛 बग फिक्स: ड्राइव्ह सिंक डुप्लिकेशन आणि सेंट्री रिपोर्टिंग सोडवले",
                "🌐 जागतिक पोहोच: नवीन प्रादेशिक बोलींसाठी वर्धित समर्थन",
                "🎨 UI सुधारणा: किरकोळ लेआउट अंतर आणि टायपोग्राफी समायोजन"
            ]
        }
    },
    {
        version: "2.6.0",
        date: "2026-03-01",
        changes: {
            en: [
                "🔗 Multi-Select: Bulk delete and export notes from Home screen",
                "✍️ Editor Polish: Improved scrolling and list formatting breakout",
                "🖼️ Image Rendering: Premium UI for images in the editor",
                "🔄 Sync Reliability: Instant refresh after backup restoration",
                "✨ UI Consistency: Aligned actions and improved button contrast"
            ],
            hi: [
                "🔗 मल्टी-सिलेक्ट: होम स्क्रीन से नोट्स को बल्क डिलीट और एक्सपोर्ट करें",
                "✍️ एडिटर सुधार: बेहतर स्क्रॉलिंग और लिस्ट फॉर्मेटिंग ब्रेकआउट",
                "🖼️ इमेज रेंडरिंग: एडिटर में इमेज के लिए प्रीमियम UI",
                "🔄 सिंक विश्वसनीयता: बैकअप रिस्टोर के बाद तुरंत रिफ्रेश",
                "✨ UI निरंतरता: बेहतर सुधार और बटन कंट्रास्ट"
            ],
            mr: [
                "🔗 मल्टी-सिलेक्ट: होम स्क्रीनवरून नोट्स बल्क डिलीट आणि एक्सपोर्ट करा",
                "✍️ एडिटर सुधारणा: सुधारित स्क्रोलिंग आणि लिस्ट फॉरमॅटिंग ब्रेकआउट",
                "🖼️ इमेज रेंडरिंग: एडिटरमध्ये इमेजसाठी प्रीमियम UI",
                "🔄 सिंक विश्वासार्हता: बॅकअप रिस्टोरनंतर त्वरित रिफ्रेश",
                "✨ UI सुसंगतता: सुधारित क्रिया आणि बटन कॉन्ट्रास्ट"
            ]
        }
    },
    {
        version: "2.5.0",
        date: "2026-03-01",
        changes: {
            en: [
                "✨ UI Restoration: Restored the classic single-row Home layout",
                "🚀 Performance: Removed redundant features for a faster experience",
                "🎨 Pro Visuals: Refined Bento cards and typography depth",
                "👤 Developer Credits: Updated About section in Settings"
            ],
            hi: [
                "✨ UI बहाली: क्लासिक सिंगल-रो होम लेआउट को फिर से बहाल किया गया",
                "🚀 प्रदर्शन: तेज़ अनुभव के लिए अनावश्यक सुविधाओं को हटाया गया",
                "🎨 प्रो विजुअल्स: बेहतर बेंटो कार्ड और टाइपोग्राफी की गहराई",
                "👤 डेवलपर क्रेडिट: सेटिंग्स में 'अबाउट' अनुभाग अपडेट किया गया"
            ],
            mr: [
                "✨ UI पुनर्संचयन: क्लासिक सिंगल-रो होम लेआउट पुनर्संचयित केले",
                "🚀 कामगिरी: वेगवान अनुभवासाठी अनावश्यक वैशिष्ट्ये काढून टाकली",
                "🎨 प्रो व्हिज्युअल्स: अधिक स्पष्ट बेंटो कार्ड आणि टायपोग्राफी",
                "👤 डेव्हलपर क्रेडिट: सेटिंग्जमध्ये 'अबाउट' विभाग अपडेट केला"
            ]
        }
    },
    {
        version: "2.1.0",
        date: "2026-03-01",
        changes: {
            en: [
                "✨ Added Rich Markdown support (Links & Images)",
                "🖼️ Support for picking images from Gallery",
                "📝 New 'What's New' section in Settings",
                "🎨 UI refinements for Link and Image modals",
                "🐛 Fixed editor scrolling and list font-size issues"
            ],
            hi: [
                "✨ रिच मार्कडाउन समर्थन (लिंक और चित्र) जोड़ा गया",
                "🖼️ गैलरी से चित्र चुनने की सुविधा",
                "📝 सेटिंग्स में नया 'नया क्या है' खंड",
                "🎨 लिंक और चित्र मोडल्स के लिए UI सुधार",
                "🐛 संपादक स्क्रॉलिंग और सूची के फोंट-साइज की समस्याओं को ठीक किया गया"
            ],
            mr: [
                "✨ रिच मार्कडाउन समर्थन (लिंक आणि प्रतिमा) जोडले",
                "🖼️ गॅलरीमधून प्रतिमा निवडण्यासाठी समर्थन",
                "📝 सेटिंग्जमध्ये नवीन 'नवीन काय आहे' विभाग",
                "🎨 लिंक आणि इमेज मोडल्ससाठी UI सुधारणा",
                "🐛 एडिटर स्क्रोलिंग आणि लिस्ट फॉन्ट-साईज समस्यांचे निवारण"
            ]
        }
    },
    {
        version: "2.0.0",
        date: "2026-02-28",
        changes: {
            en: [
                "⭐ Saral Lekhan Plus Release",
                "🔒 Biometric Vault for note security",
                "☁️ Google Drive Sync (Backup & Restore)",
                "✨ Spark AI integration (Smart Title, Summarize)",
                "🏠 All-new Bento-style Home Screen layout"
            ],
            hi: [
                "⭐ सरल लेखन प्लस रिलीज",
                "🔒 नोट सुरक्षा के लिए बायोमेट्रिक वॉल्ट",
                "☁️ गूगल ड्राइव सिंक (बैकअप और रिस्टोर)",
                "✨ स्पार्क एआई एकीकरण (स्मार्ट शीर्षक, सारांश)",
                "🏠 बिल्कुल नया बेंटो-शैली होम स्क्रीन लेआउट"
            ],
            mr: [
                "⭐ सरल लेखन प्लस रिलीज",
                "🔒 नोट सुरक्षिततेसाठी बायोमेट्रिक वॉल्ट",
                "☁️ Google ड्राइव्ह सिंक (बॅकअप आणि रिस्टोअर)",
                "✨ स्पार्क एआय एकत्रीकरण (स्मार्ट शीर्षक, सारांश)",
                "🏠 नवीन बेंटो-शैली होम स्क्रीन लेआउट"
            ]
        }
    }
];
