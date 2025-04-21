import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Logar from "./pages/Logar";
import Calendar from "./pages/Calendar";
import Points from "./pages/Point";
import Verification from "./pages/Verification";
import ProtectedRoute from "./components/ProtectRoute";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Report from "./pages/Report";
import RecoverPassword from "./pages/RecoverPassword";
import UpdatePassword from "./pages/UpdatePassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Logar />} />
        <Route path="/recover" element={<RecoverPassword />} />
        <Route path="/resetar-senha/:token" element={<UpdatePassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/index" element={<Index />}>
            {/* Definindo as rotas dentro de /index */}
            <Route path="calendar" element={<Calendar />} />
            <Route path="points" element={<Points />} />
            <Route path="verification" element={<Verification />} />
            <Route path="register" element={<Register />} />
            <Route path="report" element={<Report />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
