import { createContext, useState, useMemo, useContext, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  // ✅ Persist theme mode across refreshes
  const storedTheme = localStorage.getItem("theme") || "light";
  const [mode, setMode] = useState(storedTheme);

  useEffect(() => {
    localStorage.setItem("theme", mode);
    document.body.classList.toggle("dark-mode", mode === "dark");
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#6A4C93", // Royal Purple
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#F5B800", // Golden Yellow
            contrastText: "#1B1B1B",
          },
          background: {
            default: mode === "light" ? "#FFFFFF" : "#1B1B1B", // White or Jet Black
            paper: mode === "light" ? "#FFFFFF" : "#292929", // Paper background
          },
          text: {
            primary: mode === "light" ? "#1B1B1B" : "#FFFFFF",
            secondary: mode === "light" ? "#6A4C93" : "#A8A8A8",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontWeight: "bold",
                borderRadius: "8px",
                textTransform: "none",
              },
              containedPrimary: {
                backgroundColor: "#F5B800",
                color: "#6A4C93",
                "&:hover": {
                  backgroundColor: "#6A4C93",
                  color: "#F5B800",
                },
              },
              outlinedPrimary: {
                borderColor: "#F5B800",
                color: "#F5B800",
                "&:hover": {
                  backgroundColor: "#6A4C93",
                  color: "#F5B800",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#FFFFFF" : "#292929",
                border: `2px solid ${mode === "light" ? "#6A4C93" : "#F5B800"}`,
                borderRadius: "12px",
                boxShadow: mode === "light" ? "0px 2px 6px rgba(0, 0, 0, 0.1)" : "0px 2px 10px rgba(255, 255, 255, 0.1)",
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: "#F5B800",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
