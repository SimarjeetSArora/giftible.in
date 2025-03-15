import React, { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    const loadGoogleTranslateScript = () => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    loadGoogleTranslateScript();
  }, []);

  return <div id="google_translate_element" style={{ display: "flex", justifyContent: "center", marginTop: 10 }}></div>;
};

export default GoogleTranslate;
