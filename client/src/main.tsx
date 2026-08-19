import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"

import App from "./App"
import "./index.css"
import { BusinessProvider } from "./context/BusinessContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <BusinessProvider>
        <App />
      </BusinessProvider>
    </BrowserRouter>
  </StrictMode>
)