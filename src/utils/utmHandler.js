export function handleFacebookUTM() {
  const params = new URLSearchParams(window.location.search);
  const utmParams = ["utm_source", "utm_medium", "utm_campaign"];

  // If coming from Facebook
  if (params.get("utm_source") === "facebook") {
    utmParams.forEach((param) => {
      if (params.get(param)) {
        localStorage.setItem(param, params.get(param));
      }
    });
  }

  // Restore if needed
  if (localStorage.getItem("utm_source") === "facebook") {
    utmParams.forEach((param) => {
      if (!params.get(param)) {
        const value = localStorage.getItem(param);
        if (value) {
          params.set(param, value);
        }
      }
    });

    const newUrl =
      window.location.pathname + "?" + params.toString();
    window.history.replaceState({}, "", newUrl);
  }
}