# 인앱 결제 영수증 검증 설정 가이드

이 가이드는 iOS App Store Server API와 Android Google Play Developer API를 사용한 영수증 검증을 설정하는 방법을 설명합니다.

## 📱 iOS App Store Server API 설정

### 1. App Store Connect In-App Purchase 키 생성

**⚠️ 필수 권한: Admin 또는 Account Holder 역할 필요** (Developer 권한으로는 불가능)

1. [App Store Connect](https://appstoreconnect.apple.com)에 로그인
2. **Users and Access** → **Integrations** 탭 선택
3. 왼쪽 사이드바에서 **In-App Purchase** 선택
4. **Generate In-App Purchase Key** 클릭
5. 다음 정보 입력:
   - **Name**: 키 이름 (예: "IAP Verification Key")
6. 생성 후 다음 정보를 복사:
   - **Key ID** (예: `2X9R4HXF34`)
   - **Issuer ID** (페이지 상단에 표시)
   - **Download In-App Purchase Key** 버튼을 눌러 `.p8` 파일 다운로드

**참고**: App Store Connect API 키가 아닌, In-App Purchase 전용 키를 생성해야 합니다.

### 2. Private Key 변환

다운로드한 `.p8` 파일을 Base64로 인코딩하거나 그대로 사용:

**옵션 1: Base64로 인코딩 (권장)**
```bash
base64 -i AuthKey_2X9R4HXF34.p8 | tr -d '\n'
```

**옵션 2: PEM 형식 그대로 사용**
```bash
cat AuthKey_2X9R4HXF34.p8
```

### 3. 환경 변수 설정

`.env.local` 파일에 다음 변수 추가:

```env
APPLE_KEY_ID=2X9R4HXF34
APPLE_ISSUER_ID=your-issuer-id
APPLE_PRIVATE_KEY=base64_encoded_key_or_pem_content
APPLE_BUNDLE_ID=com.yourcompany.bonvivant
```

---

## 🤖 Android Google Play Developer API 설정

### 1. Google Cloud Console에서 프로젝트 설정

1. [Google Cloud Console](https://console.cloud.google.com)에 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Library** 선택
4. "Google Play Android Developer API" 검색 후 활성화

### 2. 서비스 계정 생성

1. **APIs & Services** → **Credentials** 선택
2. **Create Credentials** → **Service Account** 선택
3. 다음 정보 입력:
   - **Service account name**: "IAP Verification"
   - **Role**: "Service Account User"
4. **Done** 클릭
5. 생성된 서비스 계정 클릭
6. **Keys** 탭 → **Add Key** → **Create new key** 선택
7. **JSON** 형식 선택 후 다운로드

### 3. Google Play Console 권한 설정

1. [Google Play Console](https://play.google.com/console)에 로그인
2. **Users and permissions** 선택
3. **Invite new users** 클릭
4. 서비스 계정 이메일 입력 (예: `iap-verification@your-project.iam.gserviceaccount.com`)
5. 권한 설정:
   - **Financial data** → **View financial data** 체크
   - **Orders** → **Manage orders and subscriptions** 체크
6. **Invite user** 클릭

### 4. 환경 변수 설정

다운로드한 JSON 키 파일을 Base64로 인코딩:

```bash
base64 -i your-service-account-key.json | tr -d '\n'
```

또는 JSON 문자열 그대로 사용 (작은따옴표로 감싸기):

`.env.local` 파일에 다음 변수 추가:

```env
GOOGLE_SERVICE_ACCOUNT_KEY=base64_encoded_json_or_json_string
ANDROID_PACKAGE_NAME=com.yourcompany.bonvivant
```

---

## 🧪 테스트 환경

### Sandbox 환경

개발 중에는 Sandbox 환경에서 테스트:

- **iOS**: Sandbox 계정으로 로그인 (App Store Connect에서 생성)
- **Android**: 라이센스 테스터 추가 (Google Play Console에서 설정)

코드는 `NODE_ENV`에 따라 자동으로 Sandbox/Production API를 선택합니다.

### 환경별 API 엔드포인트

**iOS:**
- Sandbox: `https://api.storekit-sandbox.itunes.apple.com`
- Production: `https://api.storekit.itunes.apple.com`

**Android:**
- 동일한 API 사용 (서비스 계정으로 인증)

---

## 🔐 보안 주의사항

1. **환경 변수 보호**
   - `.env.local` 파일을 절대 Git에 커밋하지 마세요
   - `.gitignore`에 추가되어 있는지 확인하세요

2. **프로덕션 환경**
   - Vercel, Netlify 등의 대시보드에서 환경 변수 설정
   - 민감한 키는 암호화된 저장소에 보관

3. **키 회전**
   - 정기적으로 API 키 교체 (3-6개월마다)
   - 노출된 키는 즉시 취소하고 재발급

---

## 🐛 문제 해결

### iOS 관련 오류

**"Missing Apple credentials"**
- 환경 변수가 제대로 설정되었는지 확인
- Private Key 형식 확인 (PEM 또는 Base64)

**"Bundle ID mismatch"**
- `APPLE_BUNDLE_ID`가 앱의 실제 Bundle ID와 일치하는지 확인

**"Apple API error"**
- In-App Purchase 키가 활성화되어 있는지 확인
- Admin 또는 Account Holder 권한으로 키를 생성했는지 확인

### Android 관련 오류

**"Missing Google Service Account Key"**
- 환경 변수가 제대로 설정되었는지 확인
- JSON 형식이 올바른지 확인

**"Permission denied"**
- Google Play Console에서 서비스 계정에 권한이 부여되었는지 확인
- 최대 24시간 소요될 수 있음

**"Invalid purchase state"**
- 구매가 취소되었거나 환불되었을 수 있음
- `purchaseState`가 0(구매 완료)인지 확인

---

## 📚 참고 자료

- [Apple App Store Server API 문서](https://developer.apple.com/documentation/appstoreserverapi)
- [Google Play Developer API 문서](https://developers.google.com/android-publisher)
- [react-native-iap 문서](https://react-native-iap.dooboolab.com/)

---

## 💬 지원

문제가 발생하면 팀에 문의하거나 위 문서를 참고하세요.
