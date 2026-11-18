# vinicola.io 티저 SPA

홍콩 기반 프리미엄 와인 구매·보관 컨시어지를 소개하고 구매 경험을 듣는 React 호환 컴포넌트를 경량 Preact 런타임으로 렌더링하는 티저 SPA입니다. 스크롤 스토리는 데스크톱에서 장면을 전환하고, 모바일·동작 줄이기 설정에서는 세 장면을 차례로 읽도록 구성했습니다.

- 설치·빌드: `npm ci` → `npm run build`
- 로컬 확인: `npm run preview` → `http://127.0.0.1:4173`
- 원본: `src/main.jsx`, `src/styles.css`. `scripts/build.mjs`가 esbuild로 `dist/`를 만듭니다. 수정 후 다시 빌드합니다.
- 링크: `public/site.config.js`의 설문·뉴스레터 Google Forms 응답 URL을 각각 입력하고 다시 빌드합니다. 빈 값·`#`·편집 URL은 준비 중 안내로 처리합니다.
- 뉴스레터: 미설정 상태에서는 준비 안내만 보여주며 이메일을 입력받지 않습니다. 유효한 Google Forms 전체 URL은 방문자가 열기를 누른 뒤 페이지 안에 표시하고, 단축 URL은 별도 창으로 연결합니다. 실제 수집 안내·수신 동의·해지 안내는 해당 폼에서 설정합니다.
- 설문 URL이 없을 때 헤더·히어로는 페이지 안의 리서치 안내로 이동합니다. 실제 설문 위치에서는 준비 중 안내를 보여줍니다.
- 문의 이메일이 없으면 문의 링크를 표시하지 않습니다. 사이트 자체에는 응답 저장·추적·결제 기능이 없습니다.
- 배포: `main` 푸시 → GitHub Actions에서 `npm ci`·`npm run build` → `dist/`를 GitHub Pages에 배포합니다. 빌드 결과는 Git으로 관리하지 않습니다.
- 공개 주소: https://vinicola-io.github.io/teaser/ . 현재 설정은 GitHub 기본 주소를 사용하며 도메인·DNS는 변경하지 않습니다.

V와 와인 글라스를 결합한 로고는 `public/assets/logo-symbol.svg`에 있습니다. 보틀·매크로·컬렉션 사진은 차콜과 메를로 조명을 맞춘 AI 연출컷으로, 특정 샤토·빈티지의 실물 사진이나 재고를 표현하지 않습니다. 실제 모델 ID는 이미지 도구에서 반환하지 않았습니다. 제작 프롬프트와 검토 이력은 Git 커밋에 남깁니다.

워드마크는 [Noto Serif](https://github.com/google/fonts/tree/main/ofl/notoserif) 글리프를 SVG 경로로 고정했다. 별도 서체 다운로드가 없으며 라이선스는 `public/assets/OFL-NotoSerif.txt`에 있다. 파비콘은 16px용 별도 도형이다.

한글은 [Noto Sans KR](https://github.com/google/fonts/tree/main/ofl/notosanskr) 현행 문구의 부분집합입니다. 문구에 새로운 한글 글자를 추가할 때 부분집합을 갱신합니다. 빌드는 폰트 내용 해시를 파일명과 CSS·preload에 함께 반영해 재방문자의 이전 캐시와 구분합니다. 라이선스는 `public/assets/OFL-NotoSansKR.txt`에 있습니다.

## 디자인·렌더링 기준

2026-11-18 리뷰를 반영해 대비·글자 크기·반응형 구성·스크롤 처리를 보정했다. 아래 기준을 유지한다.

| 항목 | 기준 |
|---|---|
| 화면 구성 | 320px부터 가로 넘침 없이 읽고 조작한다. 기존 760/761px·899/900px·높이649/650px 경계에서 실제 내용이 들어가는 폭·높이를 확인한다. 가로 모드는 별도 구성한다. |
| 본문·보조·주석 | 본문 16~18px/행간 1.65~1.85, 보조 14px, 출처·주석 12px 이상을 기본값으로 삼는다. 이는 프로젝트 가독성 기준이며 WCAG의 최소 글자 크기 규정이 아니다. |
| 제목 | 모바일 36~44px, 태블릿 48~56px, 넓은 화면 64~80px를 출발점으로 한다. 행간 1.22~1.35, 자간 -0.025~-0.04em 안에서 실제 한글 줄을 확인한다. |
| 밝은 배경의 보조색 | `#665c65`를 기본으로 한다. `#f5f5f2`에서 5.85:1, `#eae9e5`에서 5.26:1이다. `opacity`로 의미 있는 글자를 흐리게 하지 않는다. |
| 색 대비 | 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상. 사진·그라데이션은 글자가 실제 놓이는 배경까지 확인한다. AI 연출·요금 등 의미 있는 주석도 같은 원칙을 적용한다. |
| 사진 위 문구 | 본문은 밝은 라벨·림라이트와 겹치지 않게 둔다. 글자 영역을 지키는 스크림을 사용하고, 짧은 주석은 어두운 바탕이나 캡션 영역으로 옮긴다. 사진 전체를 일괄 어둡게 만드는 방식에 의존하지 않는다. |
| 심볼·워드마크 | 헤더의 심볼 상자 32px, 실제 도형 높이 24px 이상을 출발점으로 한다. 16px 파비콘은 별도 굵기·여백으로 검토한다. 워드마크는 기기 서체에 따라 형태가 달라지지 않는 최종 SVG로 고정한다. V·와인잔으로 읽히는지는 사람에게 보여 확인한다. |
| 스크롤·접근성 | 고정 장면은 제목·본문·조작부가 뷰포트 안에 들어갈 때만 사용한다. 너비 1024px·높이 720px 이상에서만 고정 장면을 사용하며, 작은 화면·동작 줄이기는 읽기 순서의 정적 구성을 제공한다. 모드에 따라 제목 탐색 구조가 사라지지 않도록 한다. |
| 버튼·줄바꿈 | 헤더 버튼은 컴포넌트 규칙을 한 곳에서 정의하고 모바일 수용 기준을 명시한다. pending/ready·긴 문구 모두 검사한다. 줄바꿈을 숨겨도 문장 사이 공백은 남긴다. |
| 확대·간격 변경 | 320px 리플로와 텍스트 간격 변경을 확인한다. 실제 브라우저 확대는 별도 수동 확인 대상으로 둔다. 추가 텍스트 200% 스트레스에서 헤더와 와인 카드가 내용에 맞춰 줄을 바꿀 수 있게 한다. CSS 스트레스 결과만으로 WCAG 확대 준수를 판정하지 않는다. |

### 렌더링 기준

- 첫 화면의 대표 이미지를 초기 HTML에서 발견할 수 있게 준비한다. 모바일·태블릿 세로·가로 소스를 구분하고 대표 이미지는 eager/high 우선순위를 유지한다. 초기 HTML의 preload와 picture의 조건을 맞춰 중복 다운로드를 피한다.
- 스크롤 진행률은 해당 요소의 `transform`만 갱신한다. 매 프레임 루트에 상속되는 CSS 변수를 변경하지 않는다. 위치·크기 읽기와 스타일 쓰기는 각 프레임에서 나눠 처리한다.
- blur는 고정 헤더 등 필요한 영역에 제한하고 blur 값 자체는 애니메이션하지 않는다. `will-change`를 모든 이미지에 상시 지정하지 않는다. 실제 GPU·기기 전력 비용은 별도 측정 대상이다.
- 모바일·데스크톱 Lighthouse를 각 3회 기록한다. LCP ≤2.5초, CLS ≤0.1을 개선 목표로 삼고, INP ≤200ms는 실제 상호작용·필드 데이터로 확인한다. TBT를 INP로 표기하지 않는다.
- 성능 점수와 디자인 품질을 구분한다. 첫 로드의 미사용 JS 추정량을 그대로 삭제 가능한 코드량으로 해석하지 않는다. 실제 배포 압축·캐시 응답도 확인한다.
- 760/761px, 899/900px, 높이 649/650px의 기존 경계와 381px ready 버튼을 회귀 검사한다. 자동화는 클릭 직후 값이 아닌 상태 완료 조건을 기다린다.

기준 근거: [WCAG 대비](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [리플로](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [텍스트 확대](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Web Vitals](https://web.dev/articles/vitals).


## 검증 범위

- Chromium 151에서 320~2560px의 26개 화면 크기, 실제 링크 길이의 대체 설정, 텍스트 간격·200% 크기 스트레스를 검사했다. 가로 넘침·JavaScript 오류가 없었다. 844×390·915×412에서 첫 참여 버튼 전체가 보였다.
- Chromium 151·WebKit 26.5의 모바일·태블릿·데스크톱·가로 모드에서 폰트·모달·폭·세 서비스 제목의 접근 가능한 읽기 순서를 확인했다. 설문 URL 검증·메뉴·FAQ·뉴스레터 준비 안내와 실제 링크 분기·이미지 실패·JavaScript 비활성 대체 화면 등 12개 기능 그룹을 통과했다.
- axe-core 4.14.1의 390×844·768×1024·1440×900 자동 검사에서 위반 0건이었다. 사진 위 텍스트는 자동 판정이 불완전하므로 실제 배경·글리프 위치 표본도 확인했다. 자동 검사 통과를 전체 접근성 인증으로 해석하지 않는다.
- 실제 모바일 기기·브라우저 확대·필드 INP·실제 Google Forms 수집 권한과 동의/응답 저장은 검증하지 않았다. 현재 폼 URL은 미설정이다.

### 런타임과 측정

- `scripts/build.mjs`의 alias가 React import를 Preact 11.2.0 호환 계층으로 연결합니다. 실제 React 패키지는 배포하지 않습니다. [공식 호환 안내](https://preactjs.com/guide/v11/getting-started/#aliasing-react-to-preact)를 기준으로 현재 쓰는 기능을 브라우저에서 확인했습니다.
- 메뉴를 연 직후 키보드 포커스는 layout effect로 옮겨, 런타임별 effect 실행 시점 차이에 영향을 받지 않도록 합니다.
- 26개 화면·글자 간격/확대·키보드·모달·준비/연결 상태를 점검했습니다. 설문은 실제 URL이 아직 없어 대체 URL을 차단한 로컬 fixture로만 확인했습니다.
- 공개 GitHub Pages와 로컬 서버의 압축·캐시는 다릅니다. 같은 환경의 3회 측정 중앙값을 비교하고, Lighthouse 점수를 디자인·전환율·필드 INP로 해석하지 않습니다. 이전 측정은 Git 이력에서 확인합니다.


## 상위 프로젝트와 작업 순서

상위 `vinicola.io` 프로젝트는 이 저장소를 `teaser/` Git submodule로 참조합니다. 페이지 변경은 이 저장소에서 커밋·푸시하고, 상위 프로젝트에서 변경된 submodule 커밋을 별도로 기록합니다.

```sh
# 상위 프로젝트를 복제한 뒤
git submodule update --init --recursive

# teaser/ 안에서 작업 브랜치를 확인한 뒤 수정
cd teaser
git switch main
git pull --ff-only
npm ci
npm run build
npm run preview
git add <수정한-파일>
git commit -m "설명 [실제 작성 모델]"
git push origin main

# 상위 프로젝트에서 버전 포인터 기록
cd ..
git add teaser
git commit -m "chore: update teaser submodule"
```

단독 작업은 `git clone git@github.com:vinicola-io/teaser.git`으로 시작합니다. Pages 작업 결과는 저장소 Actions에서 확인합니다. 배포 규칙은 [GitHub 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 따릅니다.
