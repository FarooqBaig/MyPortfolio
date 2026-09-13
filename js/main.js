(() => {
  const cfg = window.PORTFOLIO || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progress = document.querySelector(".scroll-progress span");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const year = document.querySelector("[data-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    header?.classList.toggle("is-stuck", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(open)));
    document.body.classList.toggle("nav-open", Boolean(open));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });

  document.querySelectorAll("[data-social-row]").forEach((el) => {
    const labels = { linkedin: "LinkedIn", github: "GitHub", trailhead: "Trailhead" };
    let any = false;
    Object.entries(cfg.social || {}).forEach(([key, href]) => {
      if (!href) return;
      any = true;
      const a = document.createElement("a");
      a.className = "text-link";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = labels[key] || key;
      el.append(a);
    });
    if (!any) el.setAttribute("hidden", "");
  });

  const grid = document.querySelector("[data-cert-grid]");
  if (grid) {
    cfg.certifications?.forEach((cert) => {
      const card = document.createElement("article");
      card.className = `cert-card${cert.placeholder ? " is-placeholder" : ""}`;
      card.tabIndex = 0;
      card.setAttribute("data-reveal", "");

      const img = document.createElement("img");
      img.src = cert.image;
      img.alt = cert.placeholder ? "Placeholder for upcoming Salesforce credential" : `${cert.name} certificate`;
      img.loading = "lazy";
      img.width = 720;
      img.height = 480;
      img.addEventListener("error", () => {
        img.replaceWith(fallbackMark(cert));
      });

      const body = document.createElement("div");
      body.className = "cert-card__body";
      const kicker = document.createElement("p");
      kicker.className = "cert-card__kicker";
      kicker.textContent = cert.issuer || "Salesforce";
      const title = document.createElement("h3");
      title.textContent = cert.name;
      const meta = document.createElement("dl");
      meta.className = "cert-card__meta";
      meta.innerHTML = `
        <div><dt>Issued</dt><dd>${cert.issued || "TODO — issue date"}</dd></div>
        <div><dt>Credential ID</dt><dd>${cert.credentialId || "TODO — credential ID"}</dd></div>
      `;
      body.append(kicker, title, meta);
      if (cert.note) {
        const note = document.createElement("p");
        note.className = "cert-card__note";
        note.textContent = cert.note;
        body.append(note);
      }
      if (cert.url) {
        const a = document.createElement("a");
        a.className = "text-link";
        a.href = cert.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "View credential";
        body.append(a);
      }
      card.append(img, body);
      grid.append(card);
    });
  }

  function fallbackMark(cert) {
    const wrap = document.createElement("div");
    wrap.className = "cert-fallback";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = `
      <svg viewBox="0 0 64 64" fill="none">
        <rect x="8" y="10" width="48" height="44" rx="6" stroke="currentColor" stroke-width="1.5"/>
        <path d="M20 28h24M20 36h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="44" cy="40" r="6" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span>${cert.placeholder ? "Add certificate file" : "Certificate image pending"}</span>
    `;
    return wrap;
  }

  document.querySelectorAll(".capability-group, .practice-card, .chip-row, .own-card, .timeline-item").forEach((group, i) => {
    group.style.setProperty("--delay", `${(i % 6) * 70}ms`);
  });

  if (!reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("is-in");
          } else {
            el.classList.remove("is-in");
            el.classList.toggle("from-above", entry.boundingClientRect.top < 0);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            let n = 0;
            const steps = 24;
            const tick = () => {
              n += 1;
              el.textContent = `${Math.round((target * n) / steps)}${suffix}`;
              if (n < steps) requestAnimationFrame(tick);
            };
            tick();
          });
        },
        { threshold: 0.6 }
      );
      observer.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }
})();
