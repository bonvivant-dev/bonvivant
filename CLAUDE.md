# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

봉비방 디지털 매거진 앱. 모노레포 구조로 두 개의 독립 프로젝트가 존재:
- `app/` — React Native + Expo 모바일 앱 (사용자용)
- `web/` — Next.js 어드민 웹 (관리자용)

## Commands

### App (`cd app` 필수)
```bash
npm start              # Expo 개발 서버 시작
npm run android        # Android 기기/에뮬레이터 실행
npm run ios            # iOS 기기/시뮬레이터 실행
npm run lint           # ESLint 실행
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포맷
```

### Web (`cd web` 필수)
```bash
yarn dev               # 개발 서버 시작 (port 3030)
yarn build             # 프로덕션 빌드
yarn lint              # ESLint 실행
yarn lint:fix          # ESLint 자동 수정
```

### EAS 빌드 (앱 배포)
```bash
cd app
eas build --platform android --profile preview     # 내부 테스트용 AAB
eas build --platform android --profile production  # 정식 출시용 AAB
eas build --platform ios --profile production      # iOS 배포
```

## App Architecture

### 파일 구조
```
app/
├── app/                    # expo-router 라우팅 (파일 기반)
│   ├── _layout.tsx         # 루트 레이아웃 + Provider 설정
│   ├── (tabs)/             # 탭 네비게이션
│   ├── magazine/[id]/view  # 매거진 뷰어 라우트
│   ├── login.tsx
│   └── signup.tsx
└── feature/                # 기능별 모듈
    ├── auth/
    ├── magazines/
    ├── notifications/
    └── shared/
```

### Feature 모듈 구조
각 feature는 `components/`, `hooks/`, `contexts/`, `types/` 폴더를 가지며 `index.ts`로 export:
```
feature/magazines/
├── components/       # UI 컴포넌트 (MagazineFullViewer 등)
├── contexts/         # PurchasedMagazinesContext, BookmarksContext
├── hooks/            # useMagazines, usePurchase, usePurchaseRestore 등
├── types/            # Magazine 타입 정의
└── index.ts          # 모든 export 재노출
```

### Provider 계층 (`app/_layout.tsx`)
```
GestureHandlerRootView
└── AuthProvider (Supabase auth 세션 관리)
    └── PurchasedMagazinesProvider + BookmarksProvider
        └── BottomSheetModalProvider
            └── OverlayProvider
                └── PushNotificationProvider
                    └── ToastProvider
```

### 라우팅
- `expo-router` 파일 기반 라우팅
- 딥링크 스킴: `bonvivant://auth-callback` (이메일 인증 콜백)
- 매거진 뷰어: `magazine/[id]/view` → `MagazineFullViewer` 컴포넌트

### 매거진 PDF 뷰어 아키텍처
- `MagazineFullViewer` (`feature/magazines/components/MagazineFullViewer.tsx`)
- Supabase signed URL로 PDF를 직접 WebView에서 fetch (base64 변환 없음)
- WebView 내부에서 pdf.js 3.11.174로 렌더링
- IntersectionObserver 기반 lazy 렌더링 (뷰포트 진입 페이지만 렌더)
- scale: `Math.min(devicePixelRatio, 1.5)` (OOM 방지)

### 인앱 결제 (IAP)
- `react-native-iap` 사용
- 구현: `feature/magazines/hooks/usePurchase.ts`
- 영수증 검증: 클라이언트 1차 → 서버(`/api/purchases/verify`) 2차 → Supabase DB 저장
- 상품 ID는 Supabase `magazines` 테이블의 `product_id`와 반드시 일치

### 환경 변수 (app)
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## Web Architecture

### 파일 구조
```
web/src/
├── app/                    # Next.js App Router
│   ├── admin/              # 관리자 페이지 (users, magazines, purchases, notifications)
│   ├── api/                # API Routes
│   │   ├── purchases/verify/  # IAP 영수증 서버 검증 (Apple + Google)
│   │   ├── magazines/         # 매거진 CRUD, PDF 업로드
│   │   ├── notifications/send # FCM 푸시 알림 발송
│   │   └── seasons/, categories/
│   └── (공개 페이지: about, terms, privacy, refund, support)
├── features/               # 기능별 모듈 (auth, magazine, category, season)
└── shared/                 # 공통 유틸, 컴포넌트, 훅
    └── utils/supabase/     # Supabase 클라이언트 (server/client 분리)
```

### 환경 변수 (web)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
APPLE_KEY_ID, APPLE_ISSUER_ID, APPLE_PRIVATE_KEY, APPLE_BUNDLE_ID
GOOGLE_SERVICE_ACCOUNT_KEY, ANDROID_PACKAGE_NAME
```

## Backend (Supabase)

- **Auth**: 이메일/비밀번호 + Apple OAuth
- **Storage**: `magazines` 버킷, 경로: `{storage_key}/{storage_key}.pdf`
- **주요 테이블**: `magazines` (product_id 포함), `purchases`, `users`

## 코드 규칙

- TypeScript strict 모드 (app, web 모두)
- Path alias: `@/*` → app에서는 `./`, web에서는 `./src/`
- 컴포넌트: `.tsx`, 유틸리티/로직: `.ts`
- 폰트: Pretendard (Regular, Medium, SemiBold, Bold)
