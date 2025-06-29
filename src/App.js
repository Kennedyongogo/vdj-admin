import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Mixes from "./components/Mixes";
import Events from "./components/Events";
import Trending from "./components/Trending";
import AdminVibeChat from "./components/AdminVibeChat";
import Home from "./components/Home";
import Archive from "./components/Archive";
import Services from "./components/Services";
import { styled } from "@mui/material/styles";
import "./App.css";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";

const drawerWidth = 300;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

// Wrap the AppContent in a separate component so useTheme is used after ThemeProvider
const AppContent = () => {
  const { darkMode } = useTheme();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#19bdb7",
          },
          secondary: {
            main: "#dc004e",
          },
          background: {
            default: darkMode ? "#121212" : "#ffffff",
            paper: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
      }),
    [darkMode]
  );

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Navbar />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="mixes" element={<Mixes />} />
            <Route path="events" element={<Events />} />
            <Route path="services" element={<Services />} />
            <Route path="archive" element={<Archive />} />
            <Route path="trending" element={<Trending />} />
            <Route path="vibe" element={<AdminVibeChat />} />
          </Route>
        </Routes>
      </Router>
      <ThemeSwitcher />
    </MUIThemeProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
