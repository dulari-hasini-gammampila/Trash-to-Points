/**
 * Here's what this is for:
 * Layout shell for resident routes: Sidebar + `<Outlet />` for nested pages.
 *
 * How it fits in:
 * Consistent navigation for all /resident/* URLs after login.
 *
 * Why it matters:
 * One place to adjust resident IA (links, labels) without touching each page.
 */
import { Outlet } from "react-router-dom";
import { ResidentSidebar } from "../components/Sidebar";

export default function ResidentLayout() {
  return (
    <div className="dashboard-layout">
      <ResidentSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
