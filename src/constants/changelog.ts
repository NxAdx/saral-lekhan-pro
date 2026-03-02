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
