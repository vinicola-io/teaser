(() => {
  "use strict";

  // 같은 스크립트가 두 번 포함되어도 초기화와 이벤트 등록은 한 번만 합니다.
  const initialized = Symbol.for("vinicola.form-links.initialized");
  if (window[initialized]) return;
  window[initialized] = true;

  function formUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" || url.username || url.password || url.port) {
        return null;
      }
      const isShortForm =
        url.hostname === "forms.gle" &&
        /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
      const isResponseForm =
        url.hostname === "docs.google.com" &&
        /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(
          url.pathname,
        );
      return isShortForm || isResponseForm ? url.href : null;
    } catch {
      return null;
    }
  }

  function contactEmail(value) {
    if (typeof value !== "string") return null;
    const email = value.trim();
    if (email.length > 254) return null;
    const parts = email.split("@");
    if (parts.length !== 2 || parts[0].length > 64) return null;
    if (
      !/^[A-Za-z0-9._%+-]+$/.test(parts[0]) ||
      parts[0].startsWith(".") ||
      parts[0].endsWith(".") ||
      parts[0].includes("..") ||
      !/^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(
        parts[1],
      )
    ) {
      return null;
    }
    return email;
  }

  function initialize() {
    const config = window.VINICOLA_CONFIG || {};
    const destinations = {
      research: formUrl(config.researchUrl),
      newsletter: formUrl(config.newsletterUrl),
    };
    const dialog = document.getElementById("link-dialog");
    const dialogTitle = document.getElementById("link-dialog-title");
    const dialogDescription = document.getElementById("link-dialog-description");
    const dialogClose = document.getElementById("link-dialog-close");
    let opener = null;

    document.querySelectorAll("a[data-form-link]").forEach((link) => {
      const destination = destinations[link.dataset.formLink];
      const ready = typeof destination === "string";
      link.dataset.linkState = ready ? "ready" : "pending";
      const label = link.querySelector("[data-form-label]");
      if (label) label.textContent = ready ? label.dataset.readyLabel : (link.dataset.formLink === "newsletter" ? "뉴스레터 오픈 준비 중" : "리서치 접수 준비 중");

      // 이 표시는 HTML에도 있어야 JS가 꺼진 경우 준비 중이라는 사실이 남습니다.
      link.querySelectorAll("[data-link-status]").forEach((status) => {
        status.hidden = ready;
      });

      if (ready) {
        link.href = destination;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-disabled");
        link.removeAttribute("aria-haspopup");
        link.removeAttribute("aria-controls");
        link.removeAttribute("role");
        link.removeAttribute("tabindex");
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.removeAttribute("aria-disabled");
        link.setAttribute("aria-haspopup", "dialog");
        link.setAttribute("aria-controls", "link-dialog");
        link.setAttribute("role", "button");
        link.tabIndex = 0;
      }
    });

    function showPendingDialog(link) {
      if (!dialog || typeof dialog.showModal !== "function") return;
      if (dialogTitle) dialogTitle.textContent = link.dataset.formLink === "newsletter" ? "뉴스레터 신청 준비 중" : "리서치 접수 준비 중";
      if (dialogDescription) {
        dialogDescription.textContent =
          link.dataset.formLink === "newsletter"
            ? "아직 뉴스레터 신청이 열리지 않았습니다. 지금은 서비스 소개와 와인 이야기를 살펴보실 수 있어요."
            : "아직 리서치 접수가 열리지 않았습니다. 정식 접수 전까지 서비스 소개를 먼저 살펴보세요.";
      }
      if (!dialog.open) {
        opener = link;
        dialog.showModal();
        if (dialogClose) dialogClose.focus();
      }
    }

    function pendingLink(event) {
      if (!(event.target instanceof Element)) return null;
      const link = event.target.closest("a[data-form-link]");
      return link && link.dataset.linkState !== "ready" ? link : null;
    }

    document.addEventListener("click", (event) => {
      const link = pendingLink(event);
      if (!link) return;
      event.preventDefault();
      showPendingDialog(link);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const link = pendingLink(event);
      if (!link) return;
      event.preventDefault();
      if (!event.repeat) showPendingDialog(link);
    });

    if (dialogClose && dialog) {
      dialogClose.addEventListener("click", (event) => {
        event.preventDefault();
        dialog.close();
      });
    }
    if (dialog) {
      // Esc 취소는 native dialog가 처리합니다. 닫기 방식과 무관하게 트리거로 복귀합니다.
      dialog.addEventListener("close", () => {
        const previousOpener = opener;
        opener = null;
        if (previousOpener && previousOpener.isConnected) {
          previousOpener.focus({ preventScroll: true });
        }
      });
    }

    const email = contactEmail(config.contactEmail);
    document.querySelectorAll("[data-contact]").forEach((container) => {
      container.hidden = !email;
      if (!email) {
        if (container.matches("a")) container.removeAttribute("href");
        return;
      }
      let link = container.matches("a") ? container : container.querySelector("a");
      if (!link) {
        link = document.createElement("a");
        container.append(link);
      }
      link.href = `mailto:${encodeURIComponent(email).replace("%40", "@")}`;
      link.textContent = email;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
