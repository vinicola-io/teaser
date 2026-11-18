# vinicola.io 티저 SPA

마스터 v4.4의 서비스 조건을 바탕으로 만든 React 단일 페이지입니다. 스크롤 스토리는 데스크톱에서 장면을 전환하고, 모바일·동작 줄이기 설정에서는 세 장면을 차례로 읽도록 구성했습니다.

- 설치·빌드: `npm ci` → `npm run build`
- 로컬 확인: `npm run preview` → `http://127.0.0.1:4173`
- 원본: `src/main.jsx`, `src/styles.css`. `scripts/build.mjs`가 esbuild로 `dist/`를 만듭니다. 수정 후 다시 빌드합니다.
- 링크: `public/site.config.js`의 설문·뉴스레터 Google Forms 응답 URL을 각각 입력하고 다시 빌드합니다. 빈 값·`#`·편집 URL은 준비 중 안내로 처리합니다.
- 뉴스레터: 미설정 상태의 이메일·동의 항목은 비활성 미리보기입니다. 유효한 Google Forms 전체 URL은 방문자가 열기를 누른 뒤 페이지 안에 표시하고, 단축 URL은 별도 창으로 연결합니다. 실제 수집 안내·수신 동의·해지 안내는 해당 폼에서 설정합니다.
- 문의 이메일이 없으면 문의 링크를 표시하지 않습니다. 사이트 자체에는 응답 저장·추적·결제 기능이 없습니다.
- `.openai/hosting.json`은 기존 비공개 Sites의 식별자입니다. 공개 범위는 유지합니다.

V와 와인 글라스를 결합한 로고는 `public/assets/logo-symbol.svg`에 있습니다. 보틀·매크로·컬렉션 사진은 차콜과 메를로 조명을 맞춘 AI 연출컷으로, 특정 샤토·빈티지의 실물 사진이나 재고를 표현하지 않습니다. 실제 모델 ID는 이미지 도구에서 반환하지 않았습니다. 제작 프롬프트와 검토 이력은 Git 커밋에 남깁니다.

한글은 [Noto Sans KR](https://github.com/google/fonts/tree/main/ofl/notosanskr) 현행 문구의 부분집합입니다. 문구에 새로운 한글 글자를 추가할 때 부분집합을 갱신합니다. 라이선스는 `public/assets/OFL-NotoSansKR.txt`에 있습니다.
