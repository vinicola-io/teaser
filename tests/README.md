# UI 품질 검사

Node24에서 `npm ci`, `npx playwright install --with-deps chromium`, `npm test`를 실행한다. GitHub Actions는 PR과 main push에서 같은 검사를 실행하며, build와 모든 테스트가 성공한 main만 Pages에 배포한다. PR은 배포하지 않는다.

15개 테스트가 desktop1440·tablet768·mobile390, 320px/기본 글자200%·사용자 텍스트 간격, axe의 WCAG A/AA 검사, 키보드·메뉴·dialog·FAQ, 수요조사 상태, 독립 폼 링크, 모션 감소와 no-JS, `/teaser/` 경로·preload 및 PNG fallback을 다룬다. 화면 첨부는 사람이 확인하는 리뷰 자료이며 자동 픽셀 비교가 아니다. 전체 문장의 일치나 운영체제별 픽셀 baseline은 요구하지 않는다.

- 실행 결과: `playwright-report/`, `test-results/results.json`. `npm run test:ui:report`로 HTML 보고서를 연다.
- 3크기 진입 화면, axe 원문(미판정 포함), 실제 브라우저 버전·모션 지원·빌드 자산 크기가 첨부된다. 실패 시 screenshot과 trace를 보존하며 영상과 자동 재시도는 사용하지 않는다.
- 외부 요청은 차단한다. `Fixture` 전용 Google Forms URL은 로컬 HTML로 응답하므로 실제 Google 제출·개인정보 수집·실제 서비스 이용은 검증하지 않는다.
- axe 무위반은 전체 접근성 보증이 아니다. 사진/gradient의 대비 미판정과 화면 미관은 첨부 화면을 검토한다. Lighthouse와 실사용 성능, 실제 Forms 권한/동의/제출은 별도 검증 대상이다.
- PNG 검사는 WebP 미지원 형식 선택을 시뮬레이션한다. WebP의 네트워크 실패 시 자동 PNG 재시도를 보장하는 검사는 아니다.

설치된 로컬 브라우저를 재사용할 때는 `PW_BROWSER_EXECUTABLE_PATH`를 지정한다. 예: `PW_BROWSER_EXECUTABLE_PATH='/absolute/path/to/Chrome for Testing' npm test`. WebKit은 `PW_BROWSER=webkit PW_BROWSER_EXECUTABLE_PATH='/absolute/path/to/pw_run.sh' npm test`로 읽기 검사를 실행할 수 있다. CI는 SDK에 맞는 Chromium을 설치하므로 이 override가 없다.

`PW_TEST_PORT`로 기본4187 포트를 바꿀 수 있다. 테스트 서버는 별도로 `/teaser/`를 mount하며 production preview 서버는 변경하지 않는다. PNG fallback을 포함한 모든 검사는 기본 실행과 CI에서 필수다.

의존성은 2026-11-18 공식 npm registry에서 안정판을 확인해 `@playwright/test1.65.1`, `axe-core4.14.1`로 고정했다. 공식 자료: [Playwright CI](https://playwright.dev/docs/ci-intro), [설정](https://playwright.dev/docs/test-configuration), [axe-core](https://github.com/dequelabs/axe-core).
