# chopnow

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Release signing (Play Store)

Play only accepts App Bundles signed with your **upload key**. The build refuses to produce a
release `.aab` without one (`flutter build appbundle --release` fails fast); local APK / `flutter run
--release` builds still fall back to the debug key.

1. **Generate the key once** (PowerShell; pick strong passwords and store them in a password manager):

   ```powershell
   & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v `
     -keystore "$HOME\chopnow-keys\chopnow-upload.jks" -storetype JKS `
     -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

   (Create the `chopnow-keys` folder first.) **Back up the `.jks` and both passwords in at least two
   separate places** — they can be recovered only through Google's upload-key reset, which is slow.

2. **Create `android/key.properties`** from `android/key.properties.example` (gitignored — never commit it
   or the `.jks`).

3. **Build:** `flutter build appbundle --release` → `build/app/outputs/bundle/release/app-release.aab`.

4. **Register the fingerprints for Google sign-in** (otherwise Google login fails in store builds):
   print them with

   ```powershell
   & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v `
     -keystore "$HOME\chopnow-keys\chopnow-upload.jks" -alias upload
   ```

   and add the SHA-1 and SHA-256 to the Android app in Firebase (Project settings → Your apps).
   Once the app is in Play Console, also add the **App signing key** SHA-1/SHA-256 shown under
   Play Console → App integrity, then download the refreshed `google-services.json`.
