# Project vinicola.io · 티저

한국 거주 와인 애호가에게 홍콩 기반 구매·보관 컨시어지 구상을 소개하고, Google Forms로 구매 경험을 듣는 SPA입니다. 현재는 **사업 준비와 수요 조사 단계**이며 실제 와인 서비스나 거래 신청은 운영하지 않습니다. 뉴스레터는 별도 선택입니다.

공개 페이지: [vinicola.io 티저](https://vinicola-io.github.io/teaser/)

## 개발과 연결

Node 버전은 `.nvmrc`, 의존성은 `package-lock.json`을 기준으로 합니다.

```sh
npm ci
npm run build
npm run preview
```

로컬 주소는 `http://127.0.0.1:4173`입니다. `src/main.jsx`와 `src/styles.css`를 수정한 뒤 다시 빌드합니다. React 호환 컴포넌트를 Preact로 실행하고, 빌드 시 본문을 HTML로 만들어 JavaScript 없이도 서비스 구상·와인 예시·FAQ를 읽을 수 있습니다. `dist/`는 생성물이므로 커밋하지 않습니다.

`public/site.config.js`에 설문·뉴스레터의 Google Forms **응답 URL을 각각** 설정합니다. 빈 값·`#`·편집 URL은 준비 안내로 처리합니다. 현재는 두 URL 모두 미설정이며 이메일도 받지 않습니다. 전체 Forms URL의 뉴스레터는 방문자가 열기를 누른 뒤 iframe을 표시하고, 단축 URL은 별도 창으로 연결합니다. 각 폼에서 목적·보관 기간·문의처·동의를 안내하며 설문·후속 대화·구독 동의를 전용하지 않습니다. 페이지 자체에는 응답 저장·추적·결제 기능이 없습니다.

## 디자인 기준

| 항목 | 적용 기준 |
|---|---|
| 공통 글자 척도 | `html:100%`로 사용자 기본값을 존중합니다. 본문 `1.0625rem`, 주석 `.8125rem`, 주요 동작 `.875rem`을 공통 토큰으로 관리합니다. |
| 유동 제목 | `clamp(최소 rem, rem + vw, 최대 rem)`으로 화면 폭과 기본 글자 크기를 함께 반영합니다. 모바일 Hero는 `clamp(2rem, .875rem + 5.2vw, 3.2rem)`입니다. |
| 부품 비례 | 버튼 안쪽 여백과 간격은 `em`, 공통 높이·주요 여백은 `rem`을 사용합니다. 테두리·이미지 픽셀까지 일괄 변환하지 않습니다. 중첩된 `em` 글자 크기로 배율이 누적되지 않도록 합니다. |
| 가독성 | 본문 행간 1.7 전후, 한글 어절과 실제 줄바꿈을 확인합니다. 긴 제목은 좁은 화면·확대 시 필요한 위치에서 줄을 바꿀 수 있습니다. 320px·글자 확대·간격 변경을 함께 점검합니다. |
| 대비와 깊이 | 메를로 주변광·어두운 바탕·투명 피사체를 분리합니다. 밝은 섹션은 아이보리 그라데이션을 사용합니다. 본문은 단색으로 두며 일반 글자 4.5:1, 큰 글자 3:1을 기준으로 실제 배경에서 확인합니다. |
| 문체 | 짧고 정중한 설명과 선택권을 우선합니다. 과장된 수식·효과 보장·미확인 신뢰 주장을 넣지 않습니다. 구매·보관·수령·환매는 검토할 구상으로 설명합니다. |
| 동작 | 제목은 처음부터 읽을 수 있으며 설명·CTA·수요 조사 고지는 변형하지 않습니다. 빛 연출은 3.8초 한 번 실행하고 멈춤/재생을 제공합니다. 동작 줄이기·JavaScript 비활성에서는 정적으로 읽을 수 있습니다. |

Hero는 일반 문서 흐름입니다. 큰 화면에서 지원하는 브라우저만 native scroll timeline을 사용합니다. 본문 스토리의 고정 장면은 너비 1024px·높이 720px 이상에서만 적용하며, 그 외에는 세 장면을 순서대로 보여줍니다. 반복되는 큰 blur 애니메이션과 터치 스크롤 가로채기는 사용하지 않습니다.

근거: [상대 단위](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length), [반응형 타이포그래피](https://web.dev/learn/design/typography), [200% 텍스트 확대](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html). 상대 단위 사용이나 자동 검사 통과만으로 전체 접근성 준수를 판정하지 않습니다.

## 이미지와 폰트

Hero는 **투명 WebP + CSS 배경**입니다. 같은 비율의 PNG를 `<picture>`의 형식 호환 대체로 두어, 지원하는 브라우저는 WebP만 받습니다. PNG는 WebP의 네트워크 오류를 자동 복구하는 용도가 아닙니다. preload의 `type`·`srcset`·`sizes`를 실제 source와 맞췄습니다.

| 배포용 Hero | 실제 파일 크기 | 용도 |
|---|---:|---|
| WebP 320×480 | 16,684 B | 작은 표시 영역 |
| WebP 480×720 | 28,610 B | 중간 표시 영역 |
| WebP 900×1350 | 76,998 B | 높은 픽셀 밀도 |
| PNG 480×720 / 900×1350 | 194,950 / 665,053 B | 투명도를 보존하는 형식 호환 대체 |

브라우저가 화면과 DPR에 맞는 소스를 고릅니다. 투명화 자체가 용량 절감을 보장하지 않으므로, 기존 WebP와 용량·표현을 비교해 선택했습니다. 본문의 불투명 사진은 기존 WebP를 유지하고 로고는 SVG로 제공합니다. 선택되지 않은 PNG까지 내려받지 않는지 테스트에서 확인합니다. 형식 선택 근거: [MDN picture](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture), [이미지 형식](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types).

보틀·잔·매크로·컬렉션은 **상표 없는 AI 연출 이미지**이며 실제 상품·재고·보관 시설의 증거가 아닙니다. Hero는 기존 연출컷의 배경 제거 편집본입니다. 이미지 도구가 실제 모델 ID를 반환하지 않아 특정 모델명을 표기하지 않습니다. 제작 프롬프트와 수정 이유는 Git에 남깁니다.

한글은 [Noto Sans KR](https://github.com/google/fonts/tree/main/ofl/notosanskr)의 문구 부분집합입니다. 새 한글 문구를 넣으면 글리프 포함 여부를 확인하고 갱신합니다. 워드마크는 [Noto Serif](https://github.com/google/fonts/tree/main/ofl/notoserif)의 SVG 경로이며 추가 폰트를 요청하지 않습니다. 라이선스는 `public/assets/OFL-*.txt`에 있습니다. 빌드는 폰트·JS·CSS의 내용 해시로 캐시를 구분합니다.

## 빌드 후 UI/UX 검사와 배포

[Playwright Test](https://playwright.dev/docs/intro)와 [axe-core](https://github.com/dequelabs/axe-core)를 개발 의존성으로 고정했습니다. 일반 설치에서는 한 번 브라우저를 설치합니다. 이미 설치된 실행 파일을 쓰려면 `PW_CHROMIUM_EXECUTABLE_PATH`를 지정할 수 있습니다.

```sh
npx playwright install chromium
npm test
npm run test:ui:report
```

`npm test`는 **빌드 → UI 검사**, `npm run test:ui`는 이미 빌드된 `dist/`를 검사합니다. 테스트 서버는 실제 배포와 같은 `/teaser/` 경로를 사용합니다. WebKit 추가 확인은 `PW_BROWSER=webkit`과 `PW_WEBKIT_EXECUTABLE_PATH`를 지정합니다. 테스트는 외부 Forms를 로컬 fixture로 대체하며 실제 응답을 제출하지 않습니다.

- 모바일·태블릿·데스크톱 구성, 320px 리플로와 200% 기본 글자 크기.
- 키보드 메뉴·본문 바로가기·모달 포커스 복원·FAQ.
- 설문/뉴스레터의 준비·연결 상태, URL 검증, 선택 동의의 분리.
- 동작 줄이기, JavaScript 비활성, 초기 HTML·Pages 자산 경로·이미지 preload·PNG 대체.
- axe의 WCAG A/AA 자동 검사, 화면 캡처와 브라우저 버전 기록.

`.github/workflows/pages.yml`은 PR과 `main` 푸시에서 **설치 → 빌드 → 검사**를 실행합니다. 검사가 실패하면 Pages 업로드와 배포를 진행하지 않습니다. PR에서는 테스트만 실행합니다. 성공한 `main`만 배포하며, 화면·axe 원문·실패 trace·HTML 리포트는 Actions artifact에서 7일간 확인합니다. 테스트와 개발 의존성은 공개 사이트의 브라우저 번들에 포함하지 않습니다.

화면 캡처는 사람이 비교할 검토 자료이며 자동 픽셀 비교는 아닙니다. 문구의 품격·사진 위 실제 대비·실기기 확대·터치 감각은 별도로 확인합니다. 실제 Google Forms 권한·동의/저장·실사용 INP·캠페인 전환율은 아직 검증하지 않았습니다. 성능은 같은 환경에서 모바일·데스크톱을 각각 3회 측정한 중앙값으로 비교합니다.

## Git 관리

이 저장소의 `main`에서 관련 소스만 커밋·푸시한 뒤 [Actions](https://github.com/vinicola-io/teaser/actions)에서 검사와 배포 결과를 확인합니다. 상위 프로젝트는 이후 `teaser/` submodule 포인터를 별도로 커밋합니다. 상위의 사업·리서치 문서를 이 공개 저장소에 넣지 않습니다. 과거 검토와 수정 이력은 Git에서 관리합니다.
