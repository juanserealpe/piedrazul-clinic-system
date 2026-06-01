import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar-container">
        <Sidebar />
      </aside>
      <div style={{ flex: 1, background: "var(--pz-cream)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
