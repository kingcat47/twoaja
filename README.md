# 투아자 🏠

둘이 사는 집을 위한 할 일 관리 웹앱

## 기능

- **할 일 관리** — 집안일 등록, 담당자 지정, 마감 기한 설정, 사진 첨부
- **독촉 이메일** — 기한이 다가와도 안 하면 상대방에게 이메일 발송
- **권리 포인트** — 마감을 어기면 상대방이 포인트 획득, 포인트로 전자기기 압수 가능
- **PIN 인증** — 프로필 선택 시 4자리 PIN으로 본인 확인
- **실시간 동기화** — Firebase 기반, 양쪽 기기에서 즉시 반영
- **PWA** — 폰 홈 화면에 앱처럼 추가 가능

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React + TypeScript + Vite |
| 스타일 | SCSS Modules + Framer Motion |
| 상태 관리 | Zustand |
| 데이터베이스 | Firebase Firestore |
| 이미지 업로드 | Cloudinary |
| 이메일 | EmailJS |
| 배포 | Vercel |

## 환경 변수 설정

`.env.example`을 참고해서 `.env` 파일을 생성하세요.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `VITE_FIREBASE_*` | Firebase 프로젝트 설정 |
| `VITE_CLOUDINARY_*` | Cloudinary 이미지 업로드 설정 |
| `VITE_EMAILJS_*` | EmailJS 독촉 메일 설정 |
| `VITE_USER_A_NAME` | 사용자 A 이름 |
| `VITE_USER_A_EMAIL` | 사용자 A 이메일 |
| `VITE_USER_A_PIN` | 사용자 A PIN (비워두면 PIN 없이 입장) |
| `VITE_USER_B_NAME` | 사용자 B 이름 |
| `VITE_USER_B_EMAIL` | 사용자 B 이메일 |
| `VITE_USER_B_PIN` | 사용자 B PIN (비워두면 PIN 없이 입장) |

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 (Vercel)

1. GitHub에 푸시
2. Vercel에서 저장소 연결
3. Environment Variables에 `.env` 내용 입력
4. Deploy
