import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { normalizeSettings } from "./settings.js";
import { HeroLight, useHeroLight } from "./hero-light.jsx";
import { useHeroEntrance } from "./hero-entrance.js";

const SettingsContext = createContext(normalizeSettings());
const asset = (name) => `./assets/${name}`;
const chapters = [
  {
    id: "selection", label: "구매",
    title: <>찾으시는 와인을,<br />홍콩에서.</>,
    text: "원하시는 생산자와 빈티지의 와인을 홍콩에서 구매할 수 있도록 돕는 서비스입니다.",
    image: "collection-cinematic",
  },
  {
    id: "storage", label: "보관",
    title: <>구매와 수령 사이,<br />홍콩에서 보관.</>,
    text: "구매한 와인은 홍콩에 보관하고, 방문하실 때 찾아가는 방식입니다.",
    image: "macro-cinematic",
  },
  {
    id: "pickup", label: "수령",
    title: <>홍콩에 오시는 날,<br />예약 후 수령.</>,
    text: "방문 전에 예약하고, 홍콩의 지정 장소에서 와인을 받습니다.",
    image: "hero-cinematic",
  },
];
const faqs = [
  ["지금 이용할 수 있나요?", "서비스는 아직 시작하지 않았습니다. 와인 구매 경험과 필요한 점을 듣고 있습니다."],
  ["와인은 어디서 받나요?", "홍콩 현지의 지정 장소에서 사전 예약 후 수령하는 방식으로 준비하고 있습니다. 한국 배송은 포함하지 않습니다. 수령 장소와 일정은 아직 정해지지 않았습니다."],
  ["구매와 보관 비용은 어떻게 되나요?", "구매 지원 수수료에 첫 12개월 보관을 포함하는 방식을 검토하고 있습니다. 이후 보관료는 별도이며, 요금은 아직 정해지지 않았습니다."],
  ["수령이 어려워지면 어떻게 하나요?", "당시 시세를 참고해 다시 매각하는 방안도 검토 중입니다. 구매 취소에 따른 환불과는 다릅니다. 매각이 성사된다면 수수료·보관료 등을 뺀 정산액은 구매 가격보다 높거나 낮을 수 있으며, 매각 가능 여부와 조건은 미정입니다."],
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
function FormLink({ children, className = "" }) {
  const href = useContext(SettingsContext).researchUrl;
  if (!href) return null;
  return (
    <a className={`button ${className}`} data-form-link="research" data-link-state="ready"
      href={href} target="_blank" rel="noopener noreferrer" aria-label={`${children} (새 창)`}>
      {children}
    </a>
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
  if (!cinematic)
    return (
      <section
        id="concierge"
        className="story-static"
        aria-label="구매·보관·수령"
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
            </div>
            <figure>
              <Photo
                name={c.image}
                alt=""
              />
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
      aria-label="구매·보관·수령"
    >
      <ol className="sr-only">
        {chapters.map((c) => (
          <li key={c.id}>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
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
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
function Newsletter() {
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
          <h2 id="newsletter-title">
            서비스 소식을
            <br />
            이메일로 받아보세요.
          </h2>

        </div>
        <div className="newsletter-form-wrap">
          {!href ? (
            <div className="newsletter-form newsletter-pending" aria-describedby="newsletter-state">
              <p id="newsletter-state" className="newsletter-pending-description">뉴스레터 구독을 준비하고 있습니다.</p>
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
                    {opened ? "신청서 닫기" : "뉴스레터 구독하기"}
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
                  {opened && <a
                    className="text-link"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    새 창에서 열기
                  </a>}
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
                  뉴스레터 구독하기
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
export function App({ settings = {} }) {
  const config = normalizeSettings(settings);
  const [menu, setMenu] = useState(false);
  const hero = useRef(null);
  const progressBar = useRef(null);
  useHeroLight(hero);
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
              서비스 소개
            </a>
            <a href="#vintages" onClick={closeMenu}>
              와인
            </a>
            <a href="#research" onClick={closeMenu}>구매 경험</a>
            <a href="#faq" onClick={closeMenu}>자주 묻는 질문</a>
          </nav>
          <div className="header-actions">
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
              홍콩 와인 컨시어지
            </p>
            <h1 id="hero-title" className="hero-title-motion">
              <span className="hero-title-line">홍콩에서 구매하고,</span>{" "}
              <span className="hero-title-line">찾아갈 때까지 보관.</span>
            </h1>
            <p className="hero-description">
              프랑스 와인 구매·보관 서비스를 준비하고 있습니다.
            </p>
            {config.researchUrl && <div className="hero-actions">
              <FormLink className="button-light">와인 구매 경험 나누기</FormLink>
            </div>}
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
                  alt=""
                  loading="eager" fetchPriority="high" decoding="async"
                />
              </picture>
              <HeroLight />
              <div className="hero-shade" />
            </div>
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
                <h2 id="vintage-title">
                  어떤 와인을<br />찾고 계신가요?
                </h2>
              </div>
              <p>
                좋아하시는 생산자와 빈티지를 들려주세요.
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
              </article>
              <article>
                <p className="wine-region">Margaux, Bordeaux</p>
                <h3>
                  Château
                  <br />{" "}
                  Margaux
                </h3>
                <p className="wine-year">2020</p>
              </article>
              <article>
                <p className="wine-region">Margaux, Bordeaux</p>
                <h3>
                  Château
                  <br />{" "}
                  Palmer
                </h3>
                <p className="wine-year">1999</p>
              </article>
            </div>
            <figure className="collection-photo">
              <Photo
                name="collection-cinematic"
                alt=""
              />
            </figure>
            </div>
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
            <h2 id="research-title">
              최근에 찾던 와인,
              <br />
              어떻게 구하셨나요?
            </h2>
            <p className="section-description">
              최근 와인을 구매하면서 좋았던 점과 아쉬웠던 점을 들려주세요.
            </p>
            {config.researchUrl ? (
              <>
                <FormLink className="button-light">설문에 답하기</FormLink>
                <p className="form-note">참여 확인 후 질문 7개 · 추가 의견과 연락처는 선택입니다.</p>
              </>
            ) : (
              <p className="survey-pending" role="status">설문을 준비하고 있습니다.</p>
            )}
          </div>
        </section>
        <section
          id="faq"
          className="faq-section shell"
          aria-labelledby="faq-title"
        >
          <div>
            <h2 id="faq-title">자주 묻는 질문</h2>
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
        <Newsletter />
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
            {email && (
              <a href={`mailto:${email}`} className="contact-link">
                {email}
              </a>
            )}
          </div>
          <div className="footer-bottom">
            <p>
              한국에 거주하는 만 19세 이상을 위한 설문입니다.
            </p>
            <details className="privacy-note">
              <summary>개인정보 안내</summary>
              <p>
                설문·구독 신청서에서 수집 목적, 보관 기간, 문의처를 안내합니다.
                후속 연락과 뉴스레터 수신 동의는 각각 받습니다.
              </p>
            </details>
            <p>© 2026 vinicola.io</p>
          </div>
        </div>
      </footer>

    </>
    </SettingsContext.Provider>
  );
}
