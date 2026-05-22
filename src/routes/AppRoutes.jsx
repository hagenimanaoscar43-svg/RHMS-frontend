import { BrowserRouter, Routes, Route } from "react-router-dom";

// AUTH
import Login from "../pages/auth/Login";
import VerifyOTP from "../pages/auth/VerifyOTP";

// RDB
import RdbDashboard from "../pages/rdb/Dashboard";
import PendingHotels from "../pages/rdb/PendingHotels";
import AllHotels from "../pages/rdb/AllHotels";
import Announcements from "../pages/rdb/Announcements";
import ManageAdmins from "../pages/rdb/ManageAdmins";
import RdbReports from "../pages/rdb/Reports";
import RdbProfile from "../pages/rdb/Profile";

// ADMIN
import DashboardOverview from "../pages/admin/DashboardOverview";
import AdminDashboard from "../pages/admin/Dashboard";
import Bookings from "../pages/admin/Bookings";
import Rooms from "../pages/admin/Rooms";
import Guests from "../pages/admin/Guests";
import Staff from "../pages/admin/Staff";
import Salary from "../pages/admin/Salary";
import AdminReports from "../pages/admin/Reports";
import Notifications from "../pages/admin/Notifications";
import ChatAdmin from "../pages/admin/Chat";


// CLIENT
import ClientDashboard from "../pages/client/Dashboard";
import Profile from "../pages/client/Profile";
import ClientNewBooking from "./pages/client/NewBooking";
import MyBookings from "../pages/client/MyBookings";
import Hotels from "../pages/client/Hotels";
import ChatClient from "../pages/client/Chat";

// EMPLOYEE
import EmployeeDashboard from "../pages/employee/Dashboard";
import EmployeeSalary from "../pages/employee/Salary";
import EmployeeReports from "../pages/employee/Reports";
import Tasks from "../pages/employee/Tasks";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* RDB */}
        <Route path="/rdb" element={<RdbDashboard />} />
        <Route path="/rdb/pending" element={<PendingHotels />} />
        <Route path="/rdb/hotels" element={<AllHotels />} />
        <Route path="/rdb/announcements" element={<Announcements />} />
        <Route path="/rdb/admins" element={<ManageAdmins />} />
        <Route path="/rdb/reports" element={<RdbReports />} />
        <Route path="/rdb/profile" element={<RdbProfile />} />

        {/* ADMIN */}
      <Route path="/admin" element={<AdminDashboard />}>
  <Route index element={<DashboardOverview />} />
  <Route path="dashboard" element={<DashboardOverview />} />
  <Route path="bookings" element={<Bookings />} />
  <Route path="rooms" element={<Rooms />} />
  <Route path="guests" element={<Guests />} />
  <Route path="staff" element={<Staff />} />
  <Route path="salary" element={<Salary />} />
  <Route path="reports" element={<AdminReports />} />
  <Route path="notifications" element={<Notifications />} />
  <Route path="chat" element={<ChatAdmin />} />

</Route>

        {/* CLIENT */}
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/profile" element={<Profile />} />
        <Route path="/client/new-booking" element={<ClientNewBooking />} />
        <Route path="/client/bookings" element={<MyBookings />} />
        <Route path="/client/hotels" element={<Hotels />} />
        <Route path="/client/chat" element={<ChatClient />} />

        {/* EMPLOYEE */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/salary" element={<EmployeeSalary />} />
        <Route path="/employee/reports" element={<EmployeeReports />} />
        <Route path="/employee/tasks" element={<Tasks />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;