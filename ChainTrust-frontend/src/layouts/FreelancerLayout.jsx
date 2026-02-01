import { Outlet } from "react-router-dom";
import FreelancerSidebar from "../components/FreelancerSidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function FreelancerLayout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="flex">
        <aside className="hidden md:block w-64 border-r border-gray-800/50 bg-gray-900/40 backdrop-blur-xl">
          <FreelancerSidebar />
        </aside>
        <div className="flex-1">
          <Topbar />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
