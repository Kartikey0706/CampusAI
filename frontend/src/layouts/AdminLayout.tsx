import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Building2, ClipboardList, LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
import { logout } from "../api";
import AccountProfile from "../components/layout/AccountProfile";
import NotificationBell from "../components/layout/NotificationBell";

const nav=[{to:"/admin",label:"Dashboard",icon:LayoutDashboard,end:true},{to:"/admin/complaints",label:"Complaints",icon:ClipboardList},{to:"/admin/departments",label:"Departments",icon:Building2},{to:"/admin/analytics",label:"Analytics",icon:BarChart3},{to:"/admin/settings",label:"Settings",icon:Settings}];

function AdminLayout(){
  const navigate=useNavigate();

  function handleLogout(){
    logout();
    navigate("/login");
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white text-slate-900 lg:flex lg:flex-col">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <ShieldCheck size={18}/>
          </div>
          <span className="text-xl font-bold">
            Campus<span className="text-indigo-600">AI</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Administration Console</p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {nav.map(({to,label,icon:Icon,end})=>
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({isActive})=>`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive?"bg-indigo-50 text-indigo-700":"text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <Icon size={18}/>{label}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4 text-xs text-slate-400">
        AI recommendations are reviewed by administrators before action.
      </div>
    </aside>

    <div className="min-h-screen lg:pl-64">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <p className="text-sm font-medium text-slate-500">Admin Console</p>

        <div className="flex items-center gap-3">
          <NotificationBell role="admin" />

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={16}/> Sign out
          </button>

          <AccountProfile/>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet/>
      </main>
    </div>
  </div>
}

export default AdminLayout;

