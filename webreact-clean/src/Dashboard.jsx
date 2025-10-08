import "./Dashboard.css";

const stats = [
  { title: "Usuarios", value: 120 },
  { title: "Películas", value: 45 },
  { title: "Ventas", value: 30 },
  { title: "Visitas", value: 1024 },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Mi PWA</h2>
        <nav>
          <a href="/">Inicio</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/peliculas">Películas</a>
          <a href="/config">Configuración</a>
        </nav>
      </aside>

      <main className="main-content">
        <h1>Dashboard</h1>
        <div className="cards">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
