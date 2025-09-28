// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

/* ---------- Auth utils ---------- */
import { authStorage } from "./utils/authStorage";

/* ---------- Public wrappers ---------- */
import PublicLayout from "./components/Public/PublicLayout";
import Layout from "./components/website/Layout";
import Layout2 from "./components/website/Layout2";

/* ---------- Public pages ---------- */
import Home from "./pages/Home";
import About from "./pages/aboutus";
import Blog from "./pages/blog";
import Contact from "./pages/contact";
import Elements from "./pages/element";
import Gallery from "./pages/gallery";
import Menu from "./pages/menu";
import Services from "./pages/service";
import RegisterUser from "./pages/registerhome";
import Order from "./pages/OrderPage";
import PaymentMethod from "./pages/PaymentMethod";
import OrderView from "./pages/OrderView";

/* ---------- Auth ---------- */
import Signup from "./components/user/signup";
import Login from "./components/user/login";

/* ---------- Admin (blue header) ---------- */
import AdminSidebar from "./components/admin/Sidebar";
import AdminHeader from "./components/admin/Header";
import AdminDashboard from "./components/admin/AdminDashboard";
import AttendanceList from "./components/admin/AttendanceList";
import UserManagement from "./components/admin/UserManagement";

/* ---------- User Admin (no blue header) ---------- */
import AddAdmin from "./components/user/AdminForm";
import AdminManager from "./components/user/AdminTable";
import UserAdminDashboard from "./components/user/Admindashboard";
import UserSidebar from "./components/user/Sidebar";

/* ---------- Product pages ---------- */
import ProductDashboard from "./components/product/addproduct";
import ProductForm from "./components/product/productform";

/* ---------- Payments & Salaries ---------- */
import PaymentNew from "./components/admin/PaymentNew";
import SalaryEditor from "./components/admin/SalaryEditor";
import EmployeePayRecord from "./components/admin/EmployeePayRecord";

/* ---------- Admin CSS Module (scoped) ---------- */
import adminStyles from "./components/admin/styles/admin.module.css";

/* ------------------- Small helpers ------------------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Protect routes that require authentication */
function RequireAuth() {
  const location = useLocation();
  const authed = authStorage.isAuthenticated();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/* ------------------- Shells ------------------- */
function AdminShell() {
  const [sidebarActive, setSidebarActive] = React.useState(false);
  return (
    <div className={`admin-scope ${adminStyles["admin-container"]}`}>
      <AdminSidebar
        isActive={sidebarActive}
        toggleSidebar={() => setSidebarActive((s) => !s)}
      />
      <section
        className={`${adminStyles["admin-main"]} ${
          sidebarActive ? adminStyles["admin-main-expanded"] : ""
        }`}
      >
        <AdminHeader />
        <Outlet />
      </section>
    </div>
  );
}

function UserAdminShell() {
  const [sidebarActive, setSidebarActive] = React.useState(false);
  return (
    <div className={`admin-scope ${adminStyles["admin-container"]}`}>
      <UserSidebar
        isActive={sidebarActive}
        toggleSidebar={() => setSidebarActive((s) => !s)}
      />
      <section
        className={`${adminStyles["admin-main"]} ${
          sidebarActive ? adminStyles["admin-main-expanded"] : ""
        }`}
      >
        <Outlet />
      </section>
    </div>
  );
}

function ProductShell() {
  return (
    <div className="product-skin">
      <Outlet />
    </div>
  );
}

/* ------------------- App ------------------- */
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* PRODUCT (protected) */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/product/*" element={<ProductShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProductDashboard />} />
            <Route path="form" element={<ProductForm />} />
            <Route path="from" element={<Navigate to="form" replace />} />
          </Route>
        </Route>

        {/* USER ADMIN (protected) */}
        <Route element={<RequireAuth />}>
          <Route path="/useradmin/*" element={<UserAdminShell />}>
            <Route index element={<UserAdminDashboard />} />
            <Route path="addadmin" element={<AddAdmin />} />
            <Route path="adminmanager" element={<AdminManager />} />
            <Route path="editadmin/:id" element={<AddAdmin />} />
            <Route path="*" element={<Navigate to="/useradmin" replace />} />
          </Route>
        </Route>

        {/* ORIGINAL ADMIN (protected) */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/*" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="payments">
              <Route index element={<Navigate to="new" replace />} />
              <Route path="new" element={<PaymentNew />} />
            </Route>
            <Route path="salaries">
              <Route index element={<Navigate to="new" replace />} />
              <Route path="new" element={<SalaryEditor />} />
              <Route path="records" element={<EmployeePayRecord />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>

        {/* PUBLIC SITE */}
        <Route element={<PublicLayout />}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="elements" element={<Elements />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="menu" element={<Menu />} />
            <Route path="services" element={<Services />} />
            {/* Product details / checkout */}
            <Route path="order" element={<Order />} />
            <Route path="order/:id" element={<Order />} />
            {/* Google Pay checkout page */}
            <Route path="payment" element={<PaymentMethod />} />
            <Route path="myorders" element={<OrderView />} />
          </Route>

          <Route element={<Layout2 />}>
            <Route path="register" element={<RegisterUser />} />
          </Route>
        </Route>

        {/* AUTH */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
