import 'package:flutter/material.dart';

void main() {
  runApp(const SmoothApp());
}

class SmoothApp extends StatelessWidget {
  const SmoothApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SMOOTH',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1B4D3E),
        ),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('SMOOTH — welcome')),
    );
  }
}
