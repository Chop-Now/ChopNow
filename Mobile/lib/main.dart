import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/router/router.dart';
import 'core/services/notification_service.dart';
import 'shared/widgets/notifications/in_app_notification_overlay.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── 1. Initialize Firebase ──────────────────────────────────────────────────
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // ── 2. Initialize push notification service ──────────────────────────────────
  await NotificationService.instance.initialize();

  // ── 3. Lock to portrait orientation ────────────────────────────────────────
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // ── 4. Premium transparent status bar ────────────────────────────────────────
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(
    const ProviderScope(
      child: ChopNowApp(),
    ),
  );
}

class ChopNowApp extends ConsumerWidget {
  const ChopNowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'ChopNow',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      builder: (context, child) {
        // Wrap the entire app in the premium in-app notification overlay
        return NotificationOverlayWrapper(
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
