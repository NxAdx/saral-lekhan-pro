# सरल लेखन (Saral Lekhan Plus)

<p align="center">
  <img src="assets/ios-light.png" width="120" alt="Saral Lekhan Logo" />
</p>

<p align="center">
  <em>A beautiful, privacy-focused note-taking app with AI writing tools</em>
</p>

<p align="center">
  <a href="https://github.com/NxAdx/saral-lekhan-pro/releases/latest"><img src="https://img.shields.io/github/v/release/NxAdx/saral-lekhan-pro?style=flat-square&color=blue" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/NxAdx/saral-lekhan-pro?style=flat-square" alt="License" /></a>
  <a href="https://github.com/NxAdx/saral-lekhan-pro/actions"><img src="https://img.shields.io/github/actions/workflow/status/NxAdx/saral-lekhan-pro/build-android.yml?style=flat-square" alt="Build" /></a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Rich Text Editor** | Bold, italic, underline, H1/H2, blockquote, lists, checkboxes, code blocks, images, links |
| ✨ **Spark AI** | AI-powered writing with your own Gemini API key — titles, summaries, formatting, custom prompts |
| 🎨 **Themes** | 10+ handcrafted color themes with automatic light/dark mode |
| 🔒 **Privacy First** | No accounts, no tracking, no ads — all data stored locally with optional biometric lock |
| 🌐 **Multi-Language** | Full UI in English, Hindi (हिंदी), and more with Hindi punctuation support |
| 📤 **Export** | Share notes as beautifully formatted PDFs |
| 🗑️ **Trash & Recovery** | Recover deleted notes or empty all trash |
| 🔍 **Find & Replace** | Built-in search and replace in the editor |
| 🏷️ **Tags** | Organize notes with tags for quick search |
| 💾 **Backup & Restore** | Export/import your entire database |

## 📸 Screenshots

<p align="center">
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/1.png" width="200" />
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/2.png" width="200" />
  <img src="fastlane/metadata/android/en-US/images/phoneScreenshots/3.png" width="200" />
</p>

## 📥 Download

| Source | Link |
|--------|------|
| **GitHub Releases** | [Download Latest APK](https://github.com/NxAdx/saral-lekhan-pro/releases/latest) |
| **F-Droid** | _Coming soon_ |

## 🛠️ Build from Source

```bash
# Clone the repo
git clone https://github.com/NxAdx/saral-lekhan-pro.git
cd saral-lekhan-pro

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run start

# Build Android APK
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
```

**Requirements:** Node.js 18+, Java 17, Android SDK 34

## 🏗️ Tech Stack

- **Framework:** React Native + Expo SDK 49
- **Editor:** react-native-pell-rich-editor
- **State:** Zustand
- **Database:** expo-sqlite
- **AI:** Google Gemini API (user-provided key)
- **Build:** GitHub Actions CI/CD

## 🔒 Privacy & Security

- ✅ No analytics or tracking SDKs
- ✅ No Firebase, Sentry, or Crashlytics
- ✅ No ads or monetization SDKs
- ✅ API keys stored in device SecureStore
- ✅ All data stored locally on-device
- ✅ Optional biometric authentication
- ✅ F-Droid compliant

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 💖 Support the Developer

Saral Lekhan is 100% free and open-source. If you love the app, consider supporting its development!

- **UPI (India):** Open the app → Settings → Support The Developer
- **Ko-fi (Global):** [ko-fi.com/aadarshlokhande](https://ko-fi.com/aadarshlokhande)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/NxAdx">Aadarsh Lokhande</a>
</p>
