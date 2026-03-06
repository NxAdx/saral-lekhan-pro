export interface ChangelogItem {
    version: string;
    date: string;
    changes: {
        en: string[];
        hi: string[];
        mr: string[];
    };
}

export const APP_CHANGELOG: ChangelogItem[] = [
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
