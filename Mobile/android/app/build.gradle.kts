import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    // START: FlutterFire Configuration
    id("com.google.gms.google-services")
    // END: FlutterFire Configuration
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    FileInputStream(keystorePropertiesFile).use { stream ->
        keystoreProperties.load(stream)
    }
}

// A Play Store upload (an App Bundle, `flutter build appbundle --release`)
// must be signed with the real upload key. Without this guard a missing or
// half-filled key.properties silently falls back to the debug key below and
// produces a bundle Play rejects only after you've uploaded it. Local
// `flutter run --release` / APK builds keep the debug-key fallback.
val buildsPlayBundle = gradle.startParameter.taskNames.any {
    it.contains("bundle", ignoreCase = true) && it.contains("release", ignoreCase = true)
}
if (buildsPlayBundle) {
    if (!keystorePropertiesFile.exists()) {
        throw GradleException(
            "Release App Bundle needs android/key.properties (see android/key.properties.example " +
                "and the 'Release signing' section of Mobile/README.md). Refusing to sign with the debug key."
        )
    }
    val missing = listOf("storeFile", "storePassword", "keyAlias", "keyPassword")
        .filter { keystoreProperties.getProperty(it).isNullOrBlank() }
    if (missing.isNotEmpty()) {
        throw GradleException("android/key.properties is missing: ${missing.joinToString(", ")}")
    }
    val storePath = keystoreProperties.getProperty("storeFile")
    if (!file(storePath).exists()) {
        throw GradleException(
            "android/key.properties storeFile points to '$storePath', which doesn't exist " +
                "(relative paths are resolved from android/app/)."
        )
    }
}

android {
    namespace = "com.chopnow.chopnow"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties.getProperty("keyAlias")
            keyPassword = keystoreProperties.getProperty("keyPassword")
            storeFile = keystoreProperties.getProperty("storeFile")?.let { path -> file(path) }
            storePassword = keystoreProperties.getProperty("storePassword")
        }
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.chopnow.chopnow"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            signingConfig = if (keystorePropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")
}
