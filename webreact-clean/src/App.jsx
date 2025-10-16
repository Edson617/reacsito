import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import { registerPush } from "./pushManager";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <h2 className="logo">Mi Web React</h2>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="inicio" style={{ textAlign: "center", marginTop: "40px" }}>
                <h1>Bienvenido</h1>
                <p>Selecciona una opción del menú superior para continuar.</p>
                <h2>PWA con Push Notifications 🔔</h2>
                <button onClick={registerPush}>Activar notificaciones</button>
              </div>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2025 Mi Web React - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default App;
