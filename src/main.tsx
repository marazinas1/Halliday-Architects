import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { prefetchBootData } from "@/lib/queryClient";

// Fire the content queries before React mounts, so photograph URLs are known
// as early as possible and the grey placeholders are short-lived.
void prefetchBootData();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
