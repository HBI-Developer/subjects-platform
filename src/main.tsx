import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <Provider>
        <App />
      </Provider>
    </ReduxProvider>
  </StrictMode>
);
