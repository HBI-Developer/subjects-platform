import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store/index.ts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/index.tsx";
import { ADMIN_PAGE, DASHBOARD_PAGE } from "./constants.ts";
import { Dashboard, Login, Page404 } from "./pages/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path={ADMIN_PAGE} element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path={DASHBOARD_PAGE} element={<Dashboard />}></Route>
            </Route>
            <Route path="*" element={<Page404 />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ReduxProvider>
  </StrictMode>
);
