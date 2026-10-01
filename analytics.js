const GOOGLE_ANALYTICS_ID = "G-XXXXXXXXXX";

const isConfigured = /^G-[A-Z0-9]+$/i.test(GOOGLE_ANALYTICS_ID)
  && GOOGLE_ANALYTICS_ID !== "G-XXXXXXXXXX";

window.qaziqAnalytics = {
  event() {},
  pageView() {},
};

if (isConfigured) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ANALYTICS_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ANALYTICS_ID, {
    anonymize_ip: true,
  });

  window.qaziqAnalytics = {
    event(name, parameters = {}) {
      window.gtag("event", name, parameters);
    },
    pageView(path, title = document.title) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: title,
      });
    },
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    const mode = target.dataset.mode;
    const view = target.dataset.view;
    const label = target.textContent.trim().replace(/\s+/g, " ").slice(0, 100);

    if (mode) {
      window.qaziqAnalytics.event("select_game_mode", {
        game_mode: mode,
        button_label: label,
      });
    } else if (view) {
      window.qaziqAnalytics.event("navigate_view", {
        destination: view,
        button_label: label,
      });
      window.qaziqAnalytics.pageView(`/${view}`);
    } else if (target.id) {
      window.qaziqAnalytics.event("button_click", {
        button_id: target.id,
        button_label: label,
      });
    }
  });
}
