/**
 * Here's what this is for:
 * Layout shell for admin routes: Sidebar + `<Outlet />` for staff tools.
 *
 * How it fits in:
 * Shared chrome for moderation and configuration pages.
 *
 * Why it matters:
 * Keeps staff navigation consistent and separates admin UI from public marketing.
 */
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
