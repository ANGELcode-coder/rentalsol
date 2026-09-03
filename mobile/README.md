# SMOOTH Mobile (Flutter)

Flutter app (Android + iOS). Consumes the same API in `../server` (see `../docs/API.md`).

## Setup
```bash
# In the `mobile/` folder:
flutter pub get
flutter run
```

> Note: run `flutter create .` first if platform folders (android/ios) are missing, then overwrite `lib/` with this scaffold.

## Layout
```
lib/
├── main.dart          # app entry + theme
├── screens/           # views (auth, home, listings, booking, jobs...)
├── services/          # API client
├── widgets/           # reusable UI
└── models/            # data models matching API.md shapes
```

Refer to `../docs/TRELLO.md` (MO-* cards) for what to implement.
