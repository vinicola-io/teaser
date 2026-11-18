import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { normalizeSettings } from "./settings.js";
import { HeroLight, useHeroLight } from "./hero-light.jsx";
import { useHeroEntrance } from "./hero-entrance.js";

const SettingsContext = createContext(normalizeSettings());
const asset = (name) => `./assets/${name}`;
const chapters = [
  {
    id: "selection",
    label: "구매",
    title: (
      <>
        찾는 한 병,
        <br />
        구매 조건부터.
      </>
    ),
    text: "원하는 생산자와 빈티지를 홍콩에서 구매하는 방식을 구상하고 있습니다.",
    detail: "생산자·빈티지 확인 · 구매 조건 검토",
    image: "collection-cinematic",
  },
  {
    id: "storage",
    label: "보관",
    title: (
      <>
        구매와 수령 사이,
        <br />
        홍콩에서 보관.
      </>
    ),
    text: "구매 지원과 첫 12개월 보관을 묶은 유료 서비스를 구상하고 있습니다.",
    detail: "이후 보관료 별도 · 상세 요금 미정",
    image: "macro-cinematic",
  },
  {
    id: "pickup",
    label: "수령",
    title: (
      <>
        홍콩 현지에서,
        <br />
        예약한 날 수령.
      </>
    ),
    text: "홍콩 단일 창구의 예약 수령과 수령이 어려울 때의 환매 조건 상담에 대해 의견을 듣고 있습니다.",
    detail: "수령은 사전 예약 · 환매 상담은 검토 중",
    image: "hero-cinematic",
  },
];
const faqs = [
  [
    "어디서, 언제 수령하나요?",
    "홍콩 단일 창구에서 예약 수령하는 방식을 구상하고 있습니다. 홍콩 시각 기준 월·금 11~16시 수령, 전일 18시까지 접수하는 안에 대해 의견을 듣고 있습니다. 현재 수령 예약은 받지 않습니다.",
  ],
  [
    "구매와 보관 비용은 어떻게 되나요?",
    "구매 지원과 첫 12개월 보관을 수수료에 포함하는 방식을 검토하고 있습니다. 이후 보관료는 별도이며, 상세 요금은 아직 정해지지 않았습니다.",
  ],
  [
    "수령이 어려워지면 어떻게 하나요?",
    "수령이 어려운 경우, 당시 시세를 참고한 환매 조건 상담도 검토합니다. 환매는 구매 취소에 따른 환불과 다르며, 가능 여부·가격·수수료·정산 조건은 미정입니다. 향후 환매가 성사된다면 정산액은 구매한 와인값보다 높거나 낮을 수 있고, 서비스료·보관료 등 비용도 함께 고려해야 합니다.",
  ],
  [
    "한국으로 배송하나요?",
    "한국 배송은 구상에 포함하지 않습니다. 홍콩 현지에서 예약 수령하는 방식을 검토하고 있습니다.",
  ],
];
function useMedia(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
function Photo({
  name,
  className = "",
  priority = false,
  alt = "",
  sizes = "100vw",
}) {
  return (
    <img
      className={className}
      src={asset(`${name}-1536.webp`)}
      srcSet={`${asset(`${name}-900.webp`)} 900w, ${asset(`${name}-1536.webp`)} 1536w`}
      sizes={sizes}
      width="1536"
      height="1024"
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
function Logo({ className = "", dark = false }) {
  const tone = dark ? "-dark" : "";
  return (
    <span className={`brand ${className}`}>
      <img className="brand-symbol" loading={dark ? "lazy" : "eager"} src={asset(`logo-symbol${tone}.svg`)} width="32" height="32" alt="" />
      <img className="brand-wordmark" loading={dark ? "lazy" : "eager"} src={asset(`logo-wordmark${tone}.svg`)} width="144" height="32" alt="vinicola.io" />
    </span>
  );
}
function FormLink({
  type = "research",
  children,
  pendingLabel,
  previewHref,
  onPreviewNavigate,
  className = "",
  onPending,
}) {
  const settings = useContext(SettingsContext);
  const href = { research: settings.researchUrl, newsletter: settings.newsletterUrl }[type];
  const common = {
    "data-form-link": type,
    "data-link-state": href ? "ready" : "pending",
    className: `button ${className}`,
  };
  return href ? (
    <a {...common} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">↗</span>
    </a>
  ) : previewHref ? (
    <a {...common} href={previewHref} onClick={onPreviewNavigate}>{pendingLabel}</a>
  ) : (
    <button
      {...common}
      type="button"
      aria-haspopup="dialog"
      aria-controls="link-dialog"
      onClick={(e) => onPending(type, e.currentTarget)}
    >
      {pendingLabel || "설문 준비 중"}
    </button>
  );
}
function Story({ cinematic, headerHeight }) {
  const section = useRef(null);
  const phase = useRef(0);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!cinematic) return;
    let frame = 0;
    const photos = section.current?.querySelectorAll(".story-photo");
    const update = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - (window.innerHeight - headerHeight);
      const p = Math.max(0, Math.min(1, (headerHeight - rect.top) / Math.max(1, travel)));
      const next = Math.min(2, Math.floor(p * 3));
      if (photos?.[next]) photos[next].style.transform = `scale(${1.025 + p * 0.035})`;
      if (next !== phase.current) {
        phase.current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [cinematic, headerHeight]);
  function go(index) {
    const el = section.current;
    const travel = el.offsetHeight - (window.innerHeight - headerHeight);
    window.scrollTo({
      top:
        window.scrollY +
        el.getBoundingClientRect().top -
        headerHeight +
        travel * ((index + 0.35) / 3),
      behavior: "smooth",
    });
  }
  if (!cinematic)
    return (
      <section
        id="concierge"
        className="story-static"
        aria-label="구매·보관·예약 수령 또는 환매 상담 안내"
      >
        {chapters.map((c, i) => (
          <article className="static-chapter" key={c.id} id={`chapter-${c.id}`}>
            <div className="static-chapter-copy">
              <p className="chapter-label">
                <span>{`0${i + 1}`}</span>
                {c.label}
              </p>
              <h2>{c.title}</h2>
              <p className="chapter-description">{c.text}</p>
              <p className="chapter-detail">{c.detail}</p>
            </div>
            <figure>
              <Photo
                name={c.image}
                alt="와인병과 빛의 질감을 표현한 AI 연출 이미지"
              />
              <figcaption>AI 연출 이미지</figcaption>
            </figure>
          </article>
        ))}
      </section>
    );
  return (
    <section
      id="concierge"
      className="story-scene"
      ref={section}
      aria-label="구매·보관·예약 수령 또는 환매 상담 안내"
    >
      <ol className="sr-only">
        {chapters.map((c) => (
          <li key={c.id}>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
            <p>{c.detail}</p>
          </li>
        ))}
      </ol>
      <div className="story-sticky">
        <div className="story-media" aria-hidden="true">
          {chapters.map((c, i) => (
            <Photo
              key={c.id}
              name={c.image}
              className={`story-photo ${active === i ? "is-active" : ""}`}
            />
          ))}
        </div>
        <div className="story-shade" aria-hidden="true" />
        <div className="story-copy shell" aria-hidden="true">
          {chapters.map((c, i) => (
            <div
              key={c.id}
              className={`chapter-copy ${active === i ? "is-active" : ""}`}
            >
              <p className="chapter-label">
                <span>{`0${i + 1}`}</span>
                {c.label}
              </p>
              <h2>{c.title}</h2>
              <p className="chapter-description">{c.text}</p>
              <p className="chapter-detail">{c.detail}</p>
            </div>
          ))}
        </div>
        <div className="story-controls shell">
          <p>구매 → 보관 → 예약 수령</p>
          <div aria-label="서비스 단계 선택">
            {chapters.map((c, i) => (
              <button
                type="button"
                key={c.id}
                onClick={() => go(i)}
                aria-current={active === i ? "step" : undefined}
                aria-label={`${c.label} 안내 보기`}
              >
                <span className="chapter-dot" />
                {c.label}
              </button>
            ))}
          </div>
          <span className="image-credit">AI 연출 이미지</span>
        </div>
      </div>
    </section>
  );
}
function Newsletter({ onPending }) {
  const [opened, setOpened] = useState(false);
  const href = useContext(SettingsContext).newsletterUrl;
  let embedded = null;
  if (href && new URL(href).hostname === "docs.google.com") {
    const u = new URL(href);
    u.searchParams.set("embedded", "true");
    embedded = u.href;
  }
  return (
    <section
      id="newsletter"
      className="newsletter-section"
      aria-labelledby="newsletter-title"
    >
      <div className="newsletter-inner shell">
        <div>
          <p className="eyebrow">뉴스레터 · 선택 구독</p>
          <h2 id="newsletter-title">
            서비스 준비 소식을
            <br />
            이메일로 받아보세요.
          </h2>
          <p className="section-description">
            와인 카드와 서비스 준비 소식을 전합니다.
            <br />첫 소식은 이번 수요 조사를 마친 뒤 전해드립니다.
          </p>
        </div>
        <div className="newsletter-form-wrap">
          {!href ? (
            <div className="newsletter-form newsletter-pending" aria-describedby="newsletter-state">
              <p className="newsletter-state-label">구독 신청 준비 중</p>
              <p className="newsletter-pending-description">신청이 열리면 별도 폼에서 이메일과 수신 동의를 받습니다.</p>
              <p id="newsletter-state" className="form-note">현재는 이메일을 수집하지 않습니다.</p>
            </div>
          ) : (
            <div className="newsletter-ready">
              {embedded ? (
                <>
                  <button
                    type="button"
                    className="button button-dark"
                    aria-expanded={opened}
                    aria-controls="newsletter-embedded"
                    onClick={() => setOpened((v) => !v)}
                  >
                    {opened ? "구독 신청서 닫기" : "구독 신청서 열기"}
                    <span aria-hidden="true">{opened ? "−" : "+"}</span>
                  </button>
                  {opened && (
                    <iframe
                      id="newsletter-embedded"
                      title="vinicola.io 뉴스레터 구독 신청서"
                      src={embedded}
                      className="newsletter-embed"
                    />
                  )}
                  <a
                    className="text-link"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    새 창에서 구독 신청 ↗
                  </a>
                </>
              ) : (
                <a
                  className="button button-dark"
                  data-form-link="newsletter"
                  data-link-state="ready"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  뉴스레터 구독 신청 ↗
                </a>
              )}
            </div>
          )}
          <p className="form-note">
            뉴스레터 수신 동의는 설문 참여나 후속 대화 신청과 별도로 받습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
export function App({ settings = {} }) {
  const config = normalizeSettings(settings);
  const [menu, setMenu] = useState(false);
  const [dialogType, setDialogType] = useState("research");
  const dialog = useRef(null);
  const opener = useRef(null);
  const hero = useRef(null);
  const progressBar = useRef(null);
  const light = useHeroLight(hero);
  useHeroEntrance(hero);
  const header = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const menuButton = useRef(null);
  const cinematic = useMedia(
    "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)",
  );
  useEffect(() => {
    const node = header.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const height = Math.ceil(node.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-height", `${height}px`);
      setHeaderHeight(previous => previous === height ? previous : height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Read all geometry before local transform writes.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pageProgress = max > 0 ? window.scrollY / max : 0;
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${pageProgress})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  function pending(type, button) {
    setDialogType(type);
    opener.current = button;
    requestAnimationFrame(() => {
      if (dialog.current && !dialog.current.open) dialog.current.showModal();
    });
  }
  useLayoutEffect(() => {
    if (!menu) return;
    document.querySelector(".header-nav a")?.focus({ preventScroll: true });
    const escape = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menu]);
  function closeMenu(e) {
    const wasOpen = menu;
    setMenu(false);
    const id = e?.currentTarget.getAttribute("href")?.slice(1);
    if (wasOpen && id)
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
        }
      });
  }
  const email =
    typeof config.contactEmail === "string" &&
    config.contactEmail.length <= 254 &&
    /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63}$/.test(
      config.contactEmail.trim(),
    )
      ? config.contactEmail.trim()
      : null;
  return (
    <SettingsContext.Provider value={config}>
    <>
      <a href="#main" className="skip-link">
        본문으로 바로가기
      </a>
      <header ref={header} className="site-header">
        <div className="header-inner">
          <a
            className="brand-link"
            href="#main"
            aria-label="vinicola.io 첫 화면"
            onClick={closeMenu}
          >
            <Logo />
          </a>
          <nav
            id="main-navigation"
            className={menu ? "header-nav is-open" : "header-nav"}
            aria-label="주요 메뉴"
          >
            <a href="#concierge" onClick={closeMenu}>
              컨시어지
            </a>
            <a href="#vintages" onClick={closeMenu}>
              빈티지
            </a>
            <a href="#faq" onClick={closeMenu}>
              FAQ
            </a>
            <a
              href="#research"
              className="mobile-research-link"
              onClick={closeMenu}
            >
              리서치
            </a>
          </nav>
          <div className="header-actions">
            <FormLink
              className="button-header"
              pendingLabel="리서치 안내"
              previewHref="#research"
              onPreviewNavigate={closeMenu}
              onPending={pending}
            >
              리서치 참여
            </FormLink>
            <button
              ref={menuButton}
              className="menu-toggle"
              type="button"
              aria-controls="main-navigation"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <div ref={progressBar} className="reading-progress" aria-hidden="true" />
      </header>
      <main id="main">
        <section className="hero hero--editorial" ref={hero} aria-labelledby="hero-title">
          <div className="hero-content shell">
            <p className="hero-location">
              프랑스 프리미엄 와인<span>사업 준비 · 수요 조사</span>
            </p>
            <h1 id="hero-title" className="hero-title-motion">
              <span className="hero-title-line">홍콩에서 구매하고,</span>{" "}
              <span className="hero-title-line">찾아갈 때까지 보관.</span>
            </h1>
            <p className="hero-description">
              프랑스 프리미엄 와인 구매·보관 컨시어지.
              <br />
              홍콩 현지에서 사전 예약 후 수령하는 구상입니다.
            </p>
            <div className="hero-actions">
              <FormLink className="button-light" previewHref="#research" pendingLabel="리서치 알아보기" onPending={pending}>
                내 와인 구매 경험 남기기
              </FormLink>
              <a className="hero-explore" href="#concierge">
                서비스 구상 보기<span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-preparing">
              현재는 수요 조사 중이며, 실제 와인 거래는 진행하지 않습니다.
            </p>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-motion">
              <picture className="hero-picture">
                <source
                  type="image/webp"
                  srcSet={`${asset("hero-cutout-320.webp")} 320w, ${asset("hero-cutout-480.webp")} 480w, ${asset("hero-cutout-900.webp")} 900w`}
                  sizes="(min-width: 1024px) 448px, (min-width: 761px) 34vw, 240px"
                />
                <img
                  className="hero-photo"
                  src={asset("hero-cutout-480.png")}
                  srcSet={`${asset("hero-cutout-480.png")} 480w, ${asset("hero-cutout-900.png")} 900w`}
                  sizes="(min-width: 1024px) 448px, (min-width: 761px) 34vw, 240px"
                  width="900" height="1350"
                  alt="상표 없는 와인병과 잔의 AI 연출 이미지"
                  loading="eager" fetchPriority="high" decoding="async"
                />
              </picture>
              <HeroLight />
              <div className="hero-shade" />
            </div>
          </div>
          <div className="hero-bottom shell">
            <button
              className="hero-light-control"
              type="button"
              hidden={!light.available}
              onClick={light.onToggle}
              aria-label={light.running ? "빛 멈추기 (첫 화면 연출)" : "빛 다시 보기 (첫 화면 연출)"}
            >
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                {light.running ? <path d="M7 5v10M13 5v10" /> : <path d="M7 4.5 15 10l-8 5.5Z" />}
              </svg>
              {light.running ? "빛 멈추기" : "빛 다시 보기"}
            </button>
            <span className="hero-image-note">AI 연출 이미지</span>
          </div>
        </section>
        <Story cinematic={cinematic} headerHeight={headerHeight} />
        <section
          id="vintages"
          className="vintage-section"
          aria-labelledby="vintage-title"
        >
          <div className="shell">
            <div className="vintage-heading">
              <div>
                <p className="eyebrow">빈티지 예시 · 보르도</p>
                <h2 id="vintage-title">
                  다시 찾고 싶은
                  <br />
                  빈티지가 있나요?
                </h2>
              </div>
              <p>
                좋아하는 생산자, 기억에 남은 한 해.
                <br />
                최근에 찾던 한 병을 떠올려 주세요.
              </p>
            </div>
            <div className="vintage-content">
            <div className="wine-grid">
              <article>
                <p className="wine-region">Pauillac, Bordeaux</p>
                <h3>
                  Château Mouton
                  <br />{" "}
                  Rothschild
                </h3>
                <p className="wine-year">2020</p>
                <p>
                  2020년 라벨을 그린 작가, 피터 도이그.
                </p>
                <a
                  href="https://www.chateau-mouton-rothschild.com/chateau-mouton-rothschild/chateau-mouton-rothschild-2020"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2020년 라벨 이야기 ↗
                </a>
              </article>
              <article>
                <p className="wine-region">Margaux, Bordeaux</p>
                <h3>
                  Château
                  <br />{" "}
                  Margaux
                </h3>
                <p className="wine-year">2020</p>
                <p>
                  Decanter의 2025년 자료에 실린 99/100점.
                </p>
                <a
                  href="https://keyassets.timeincuk.net/inspirewp/live/wp-content/uploads/sites/34/2025/08/Decanter-Value-Index-Chateau-Margaux.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Decanter 평가 자료 ↗
                </a>
              </article>
              <article>
                <p className="wine-region">Margaux, Bordeaux</p>
                <h3>
                  Château
                  <br />{" "}
                  Palmer
                </h3>
                <p className="wine-year">1999</p>
                <a
                  href="https://www.chateau-palmer.com/en/wine-library"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  생산자의 와인 라이브러리 ↗
                </a>
              </article>
            </div>
            <figure className="collection-photo">
              <Photo
                name="collection-cinematic"
                alt="상표 없는 와인 세 병의 AI 연출 이미지"
              />
              <figcaption>
                AI 연출 이미지 · 소개한 와인의 제품 사진이 아닙니다.
              </figcaption>
            </figure>
            </div>
            <p className="section-fineprint">
              취향과 구매 경험을 떠올리기 위한 예시입니다. 판매 상품이나 보유 재고를 뜻하지 않습니다.
            </p>
          </div>
        </section>
        <section
          id="research"
          className="research-section"
          aria-labelledby="research-title"
        >
          <div className="research-visual" aria-hidden="true">
            <Photo name="macro-cinematic" />
          </div>
          <div className="research-shade" />
          <div className="research-content shell">
            <p className="eyebrow">와인을 꾸준히 구매하는 분께</p>
            <h2 id="research-title">
              최근에 찾던 와인,
              <br />
              어떻게 구하셨나요?
            </h2>
            <p className="section-description">
              최근 구매에서 좋았던 점과 아쉬웠던 점을 들려주세요.
              <br className="desktop-break" /> 어떤 와인과 구매·보관·수령 방식이 필요한지 살펴보는 데 참고하겠습니다.
            </p>
            <div className="research-topics">
              <span>구매 경험</span>
              <span>보관의 필요</span>
              <span>홍콩 예약 수령</span>
            </div>
            <FormLink className="button-light" onPending={pending}>
              내 와인 구매 경험 남기기
            </FormLink>
            <p className="form-note">
              참여 확인 1개 + 질문 7개 · Google Forms
              <br />
              추가 이야기와 연락처는 선택입니다. 기존 구매 방법으로 충분했던
              경험도 듣고 싶습니다.
            </p>
            <p className="research-image-note">AI 연출 이미지</p>
          </div>
        </section>
        <section
          id="faq"
          className="faq-section shell"
          aria-labelledby="faq-title"
        >
          <div>
            <p className="eyebrow">자주 묻는 질문</p>
            <h2 id="faq-title">
              검토 중인
              <br />
              서비스 구상.
            </h2>
            <p className="faq-intro">
              현재는 사업 준비를 위한 수요 조사 단계입니다.
              <br />
              구매·보관·수령·환매 서비스는 운영하지 않습니다.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
            <a className="text-link research-return" href="#research">리서치 안내로 돌아가기</a>
          </div>
        </section>
        <Newsletter onPending={pending} />
      </main>
      <footer className="site-footer">
        <div className="shell">
          <div className="footer-main">
            <a
              className="brand-link"
              href="#main"
              aria-label="vinicola.io 첫 화면"
            >
              <Logo />
            </a>
            <p>
              프랑스의 빈티지.
              <br />
              홍콩이라는 선택지.
            </p>
            {email && (
              <a href={`mailto:${email}`} className="contact-link">
                {email}
              </a>
            )}
          </div>
          <div className="footer-bottom">
            <p>
              Project vinicola.io · 수요 조사 중<br />
              한국에 거주하는 만 19세 이상을 위한 와인 서비스 수요 조사입니다.
            </p>
            <details className="privacy-note">
              <summary>개인정보 안내</summary>
              <p>
                이 페이지는 설문 응답이나 이메일을 직접 저장하지 않습니다.
                설문과 뉴스레터는 각각 Google Forms에서 접수합니다. 각 폼에서
                수집 목적·보관 기간·문의처와 동의 내용을 안내합니다. 후속 대화
                신청과 뉴스레터 수신 동의는 따로 받습니다.
              </p>
            </details>
            <p>© 2026 vinicola.io</p>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialog}
        id="link-dialog"
        className="link-dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClose={() => {
          opener.current?.focus({ preventScroll: true });
          opener.current = null;
        }}
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="안내 닫기"
          onClick={() => dialog.current.close()}
        >
          ×
        </button>
        <Logo dark />
        <h2 id="dialog-title">
          {dialogType === "newsletter"
            ? "구독 신청 준비 중"
            : "설문 준비 중"}
        </h2>
        <p id="dialog-description">
          {dialogType === "newsletter"
            ? "구독 신청은 아직 준비 중입니다. 현재 이메일을 수집하지 않습니다."
            : "설문을 준비하고 있습니다. 지금은 서비스 구상과 빈티지 예시를 보실 수 있습니다."}
        </p>
        <button
          className="button button-dark"
          type="button"
          onClick={() => dialog.current.close()}
        >
          닫기
        </button>
      </dialog>
    </>
    </SettingsContext.Provider>
  );
}
