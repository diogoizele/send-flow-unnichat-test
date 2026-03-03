import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { ConnectionsPage } from "./pages/ConnectionsPage";
import { ContactsPage } from "./pages/ContactsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { LoggedLayout } from "./components/LoggedLayout";

import { PrivateRoute } from "./routes/PrivateRoutes";
import { PublicRoute } from "./routes/PublicRoutes";
import { theme } from "./theme/theme";
import { Signup } from "./pages/Signup";
import { ToastProvider } from "./components/ToastProvider";
import { useAuthStore } from "./stores/authStore";

const App = () => {
  const initAuthListener = useAuthStore((state) => state.initAuthListener);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, [initAuthListener]);

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider />
      <CssBaseline />

      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <LoggedLayout>
                  <Navigate to="/connections" replace />
                </LoggedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <PrivateRoute>
                <LoggedLayout>
                  <ConnectionsPage />
                </LoggedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <PrivateRoute>
                <LoggedLayout>
                  <ContactsPage />
                </LoggedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <LoggedLayout>
                  <MessagesPage />
                </LoggedLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <LoggedLayout>
                  <Profile />
                </LoggedLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
