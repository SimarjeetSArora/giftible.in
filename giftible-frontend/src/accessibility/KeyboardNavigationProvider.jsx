import { useEffect } from "react";

const KeyboardNavigationProvider = () => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab" || event.key === "ArrowDown" || event.key === "ArrowUp") {
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return null;
};

export default KeyboardNavigationProvider;
