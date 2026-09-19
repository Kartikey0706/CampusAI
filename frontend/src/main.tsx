import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { startBackendHealthCheck } from "./services/backendHealth";

startBackendHealthCheck();

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
