import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard";
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
              <div className="inicio">
                <h1>Bienvenido</h1>
                <p>Selecciona una opción del menú superior para continuar.</p>
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
