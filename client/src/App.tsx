import {
  Navigate,
  Route,
  Routes,
} from "react-router"

import { CreateBusinessPage } from "./pages/CreateBusinessPage"
import { InventoryPage } from "./pages/InventoryPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { SelectBusinessPage } from "./pages/SelectBusinessPage"

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/create-business"
        element={<CreateBusinessPage />}
      />

      <Route
        path="/select-business"
        element={<SelectBusinessPage />}
      />

      <Route
        path="/:slug/inventory"
        element={<InventoryPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App