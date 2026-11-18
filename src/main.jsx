import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const config = window.VINICOLA_CONFIG || {};
function formURL(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== "https:" || u.username || u.password || u.port)
      return null;
    const short =
      u.hostname === "forms.gle" && /^\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
    const response =
      u.hostname === "docs.google.com" &&
      /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(
        u.pathname,
      );
    return short || response ? u.href : null;
  } catch {
    return null;
  }
}
const destinations = {
  research: formURL(config.researchUrl),
  newsletter: formURL(config.newsletterUrl),
};
const asset = (name) => `./assets/${name}`;
const chapters = [
  {
    id: "selection",
    label: "구매",
    title: (
      <>
        찾는 한 병은,
        <br />
        생산자와 빈티지부터.
      </>
    ),
    text: "평소 찾는 와인과 기억해둔 그해. 홍콩에서 구매 가능한 조건을 함께 살핍니다.",
    detail: "원하는 와인 확인 · 구매 조건 검토",
    image: "collection-cinematic",
  },
  {
    id: "storage",
    label: "보관",
    title: (
      <>
        지금 골라두고,
        <br />
        홍콩에 보관하다.
      </>
    ),
    text: "구매 지원과 첫 12개월 보관을 묶은 유료 서비스를 준비합니다.",
    detail: "이후 보관료 별도 · 상세 요금 준비 중",
    image: "macro-cinematic",
  },
  {
    id: "pickup",
    label: "수령",
    title: (
      <>
        찾아갈 날은,
        <br />
        미리 정해두고.
      </>
    ),
    text: "홍콩의 단일 창구에서 사전 예약해 수령하는 방식입니다. 가능한 운영일을 확인해 예약을 확정합니다.",
    detail: "홍콩 현지 수령 · 사전 예약",
    image: "hero-cinematic",
  },
];
const faqs = [
  [
    "어디서, 언제 받을 수 있나요?",
    "홍콩 단일 창구에서 사전 예약해 수령하는 방식입니다. 월·금 11~16시, 전일 18시까지 접수 후 가능 여부를 확인해 예약을 확정하는 안을 검토하고 있습니다(홍콩 시각). 운영 가능일은 확정 뒤 안내합니다.",
  ],
  [
    "구매와 보관 비용은 어떻게 되나요?",
    "수수료에 구매 지원과 첫 12개월 보관을 포함하는 방향으로 준비합니다. 이후 보관료는 별도이며, 상세 요금은 아직 정해지지 않았습니다.",
  ],
  [
    "수령이 어려워지면 어떻게 하나요?",
    "당시 시세를 참고해 환매 조건을 상담하는 방향도 검토합니다. 환매 가능 여부·가격·수수료·정산 조건은 개별 협의합니다.",
  ],
  [
    "한국으로도 배송하나요?",
    "한국 배송은 제공하지 않습니다. 홍콩 현지에서 예약 수령하는 서비스로 준비하고 있습니다.",
  ],
];
function useMedia(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
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
  className = "",
  onPending,
}) {
  const href = destinations[type];
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
  ) : (
    <button
      {...common}
      type="button"
      aria-haspopup="dialog"
      aria-controls="link-dialog"
      onClick={(e) => onPending(type, e.currentTarget)}
    >
      {pendingLabel || "리서치 접수 준비 중"}
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
        aria-label="구매부터 예약 수령까지"
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
                alt="보틀과 빛의 질감을 표현한 AI 연출 이미지"
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
      aria-label="구매부터 예약 수령까지"
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
          <p>구매부터, 찾아가는 날까지.</p>
          <div aria-label="스토리 장면 선택">
            {chapters.map((c, i) => (
              <button
                type="button"
                key={c.id}
                onClick={() => go(i)}
                aria-current={active === i ? "step" : undefined}
                aria-label={`${c.label} 장면 보기`}
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
  const href = destinations.newsletter;
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
          <p className="eyebrow">이야기를 이어가고 싶다면</p>
          <h2 id="newsletter-title">
            다음 한 병의 이야기,
            <br />
            계속 받아보세요.
          </h2>
          <p className="section-description">
            와인 카드와 서비스 준비 소식을 전합니다.
            <br />첫 소식은 이번 리서치를 마친 뒤 보내드립니다.
          </p>
        </div>
        <div className="newsletter-form-wrap">
          {!href ? (
            <form
              className="newsletter-form"
              onSubmit={(e) => e.preventDefault()}
              aria-describedby="newsletter-state"
            >
              <p className="newsletter-state-label">
                신청 화면 미리보기 · 접수 준비 중
              </p>
              <fieldset disabled>
                <label htmlFor="newsletter-email">이메일 주소</label>
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <label className="consent-preview">
                  <input type="checkbox" />
                  뉴스레터 수신에 동의합니다.
                </label>
              </fieldset>
              <button
                className="button button-dark"
                type="button"
                data-form-link="newsletter"
                data-link-state="pending"
                aria-haspopup="dialog"
                aria-controls="link-dialog"
                onClick={(e) => onPending("newsletter", e.currentTarget)}
              >
                뉴스레터 접수 준비 중
              </button>
              <p id="newsletter-state" className="form-note">
                접수 전에는 이메일을 입력하거나 전송할 수 없습니다.
              </p>
            </form>
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
                    {opened ? "구독 폼 닫기" : "구독 폼 열기"}
                    <span aria-hidden="true">{opened ? "−" : "+"}</span>
                  </button>
                  {opened && (
                    <iframe
                      id="newsletter-embedded"
                      title="vinicola.io 뉴스레터 신청 Google Forms"
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
                    새 창에서 신청하기 ↗
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
                  뉴스레터 구독 폼 열기 ↗
                </a>
              )}
            </div>
          )}
          <p className="form-note">
            설문과 별도로 신청합니다. 이메일과 수신 동의는
            <br className="desktop-break" /> 뉴스레터 Google Forms에서 따로
            받습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [dialogType, setDialogType] = useState("research");
  const dialog = useRef(null);
  const opener = useRef(null);
  const hero = useRef(null);
  const progressBar = useRef(null);
  const header = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(window.innerWidth <= 760 ? 64 : 72);
  const menuButton = useRef(null);
  const cinematic = useMedia(
    "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)",
  );
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
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
    const heroNode = hero.current;
    const photo = heroNode?.querySelector(".hero-photo");
    const update = () => {
      frame = 0;
      // Read all geometry before local transform writes.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pageProgress = max > 0 ? window.scrollY / max : 0;
      const animateHero = !reduced && window.innerWidth > 760 && window.innerHeight > 600;
      const rect = animateHero ? heroNode?.getBoundingClientRect() : null;
      const heroProgress = rect ? Math.max(0, Math.min(1, -rect.top / rect.height)) : 0;
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${pageProgress})`;
      if (photo) photo.style.transform = animateHero ? `scale(${1 + heroProgress * 0.045})` : "none";
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
  }, [reduced]);
  function pending(type, button) {
    setDialogType(type);
    opener.current = button;
    requestAnimationFrame(() => {
      if (dialog.current && !dialog.current.open) dialog.current.showModal();
    });
  }
  useEffect(() => {
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
              pendingLabel="접수 준비 중"
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
        <section className="hero" ref={hero} aria-labelledby="hero-title">
          <picture className="hero-picture">
            <source
              media="(max-width: 760px) and (orientation: portrait), (min-width: 761px) and (max-width: 1100px) and (max-aspect-ratio: 1/1)"
              srcSet={`${asset("hero-mobile-900.webp")} 900w, ${asset("hero-mobile-1024.webp")} 1024w`}
              sizes="100vw"
            />
            <Photo
              name="hero-cinematic"
              priority
              className="hero-photo"
              alt="빛을 따라 윤곽이 드러나는 무브랜드 와인 보틀과 잔의 AI 연출 이미지"
            />
          </picture>
          <div className="hero-shade" />
          <div className="hero-content shell">
            <p className="hero-location">
              홍콩 와인 컨시어지<span>서비스 준비 중</span>
            </p>
            <h1 id="hero-title">
              찾던 빈티지를,
              <br />
              홍콩에 골라두다.
            </h1>
            <p className="hero-description">
              프랑스 프리미엄 와인 구매·보관.
              <br />
              그리고 예약한 날, 홍콩 현지 수령.
            </p>
            <div className="hero-actions">
              <FormLink className="button-light" onPending={pending}>
                내 와인 구매 경험 남기기
              </FormLink>
              <a className="hero-explore" href="#concierge">
                한 병의 여정 살펴보기<span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="hero-preparing">
              구매·보관 컨시어지를 준비하며, 실제 구매 경험을 듣습니다.
            </p>
          </div>
          <div className="hero-bottom shell">
            <span>France, the vintage. Hong Kong, the possibility.</span>
            <span>AI 연출 이미지</span>
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
                <p className="eyebrow">프랑스 와인, 당신의 다음 선택</p>
                <h2 id="vintage-title">
                  다시 찾는 이름.
                  <br />
                  기억해둔 빈티지.
                </h2>
              </div>
              <p>
                당신이 다음에 다시 구하고 싶은
                <br />
                생산자와 빈티지는 무엇인가요?
              </p>
            </div>
            <figure className="collection-photo">
              <Photo
                name="collection-cinematic"
                alt="같은 조명 아래 놓인 무브랜드 와인 세 병의 AI 연출 이미지"
              />
              <figcaption>
                보틀과 배경은 AI 연출입니다. 아래 와인의 실제 제품 사진이
                아닙니다.
              </figcaption>
            </figure>
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
                  피터 도이그가 그린 라벨.
                  <br />{" "}한 빈티지에 남는 또 하나의 이야기.
                </p>
                <a
                  href="https://www.chateau-mouton-rothschild.com/chateau-mouton-rothschild/chateau-mouton-rothschild-2020"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  생산자의 라벨 이야기 ↗
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
                  Decanter 자료의 99/100 평가.
                  <br />{" "}
                  당신은 어떤 기준으로 한 병을 고르나요?
                </p>
                <a
                  href="https://keyassets.timeincuk.net/inspirewp/live/wp-content/uploads/sites/34/2025/08/Decanter-Value-Index-Chateau-Margaux.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2025년 평가 자료 ↗
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
                <p>
                  생산자만큼이나 중요한 그해.
                  <br />{" "}
                  다시 만나고 싶은 빈티지가 있나요?
                </p>
                <a
                  href="https://www.chateau-palmer.com/en/wine-library"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  생산자의 와인 라이브러리 ↗
                </a>
              </article>
            </div>
            <p className="section-fineprint">
              리서치를 위한 빈티지 예시입니다. 판매 상품이나 보유 재고를 뜻하지
              않습니다.
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
            <p className="eyebrow">당신의 경험에서, 다음 방향을.</p>
            <h2 id="research-title">
              잘 샀던 경험도.
              <br />
              맡기기 망설였던 이유도.
            </h2>
            <p className="section-description">
              최근 와인 구매 경험과 맡기고 싶었던 일을 들려주세요.
              <br className="desktop-break" /> 답변을 바탕으로 먼저 다룰 와인과
              보관·수령 방식을 검토합니다.
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
              참여 확인과 7개 질문 · Google Forms
              <br />
              추가 이야기와 연락처는 선택입니다. 기존 구매 방법으로 충분했던
              경험도 좋습니다.
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
            <p className="eyebrow">미리 알아둘 이야기</p>
            <h2 id="faq-title">
              맡기기 전에,
              <br />
              궁금한 것들.
            </h2>
            <p className="faq-intro">
              현재는 리서치 단계입니다.
              <br />
              실제 이용 조건과 요금은 확정 후 안내합니다.
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
              Project vinicola.io · 서비스 준비 중<br />
              한국 거주 만 19세 이상을 위한 와인 서비스 리서치입니다.
            </p>
            <details className="privacy-note">
              <summary>개인정보 안내</summary>
              <p>
                이 페이지는 설문 응답이나 이메일을 직접 저장하지 않습니다.
                설문과 뉴스레터는 각각 Google Forms에서 접수하며, 수집 목적·보관
                기간·문의처와 동의 내용을 각 폼에서 안내합니다. 후속 대화 신청과
                뉴스레터 수신 동의는 별도로 받습니다.
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
            ? "뉴스레터 접수 준비 중"
            : "리서치 접수 준비 중"}
        </h2>
        <p id="dialog-description">
          {dialogType === "newsletter"
            ? "아직 구독 신청이 열리지 않았습니다. 현재 이메일을 입력하거나 전송할 수 없습니다."
            : "아직 리서치 접수가 열리지 않았습니다. 정식 접수 전까지 서비스 소개와 빈티지 이야기를 살펴보세요."}
        </p>
        <button
          className="button button-dark"
          type="button"
          onClick={() => dialog.current.close()}
        >
          확인
        </button>
      </dialog>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
