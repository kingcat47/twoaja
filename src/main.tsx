import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "@/router";
import Toast from "@/components/ui/Toast";
import "@/styles/globals.scss";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toast />
  </StrictMode>,
);
