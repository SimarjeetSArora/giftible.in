import { createContext, useState, useMemo, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("light");
  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#6A4C93", // Royal Purple
            contrastText: "#FFFFFF", // White text on primary
          },
          secondary: {
            main: "#F5B800", // Golden Yellow
            contrastText: "#1B1B1B", // Jet Black text on secondary
          },
          background: {
            default: mode === "light" ? "#FFFFFF" : "#1B1B1B", // White or Jet Black
            paper: mode === "light" ? "#FFFFFF" : "#292929", // Paper background
          },
          text: {
            primary: mode === "light" ? "#1B1B1B" : "#FFFFFF", // Jet Black or White
            secondary: mode === "light" ? "#6A4C93" : "#A8A8A8", // Royal Purple or Light Grey
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
                backgroundColor: "#F5B800", // Golden Yellow
                color: "#6A4C93", // Royal Purple text
                "&:hover": {
                  backgroundColor: "#6A4C93", // Royal Purple
                  color: "#F5B800", // Golden Yellow text
                },
              },
              outlinedPrimary: {
                borderColor: "#F5B800", // Golden Yellow border
                color: "#F5B800", // Golden Yellow text
                "&:hover": {
                  backgroundColor: "#6A4C93", // Royal Purple background
                  color: "#F5B800", // Golden Yellow text
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#FFFFFF" : "#292929", // White or dark card background
                border: `2px solid #6A4C93`, // Subtle Royal Purple border
                borderRadius: "12px",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: "#F5B800", // Golden Yellow links
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
