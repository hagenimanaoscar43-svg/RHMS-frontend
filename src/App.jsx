import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

// Import all dashboards
import Dashboard from "./pages/rdb/Dashboard";
import PendingHotels from "./pages/rdb/PendingHotels";
import AllHotels from "./pages/rdb/AllHotels";
import Announcements from "./pages/rdb/Announcements";
import ManageAdmins from "./pages/rdb/ManageAdmins";
import RdbReports from "./pages/rdb/Reports";
import RdbProfile from "./pages/rdb/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/Rooms";
import AdminBookings from "./pages/admin/Bookings";
import AdminGuests from "./pages/admin/Guests";
import AdminStaff from "./pages/admin/Staff";
import AdminSalary from "./pages/admin/Salary";
import AdminReports from "./pages/admin/Reports";
import AdminNotifications from "./pages/admin/Notifications";
import AdminChat from "./pages/admin/Chat";
import DashboardOverview from "./pages/admin/DashboardOverview";
import Attendance from "./pages/admin/Attendance";


import ClientDashboard, { ClientDashboardHome, BrowseHotels } from "./pages/client/Dashboard";
import ClientProfile from "./pages/client/Profile";
import ClientBookings from "./pages/client/MyBookings";
import ClientHotels from "./pages/client/Hotels";
import ClientNewBooking from "./pages/client/NewBooking";
import ClientChat from "./pages/client/Chat";

import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeSalary from "./pages/employee/Salary";
import EmployeeReports from "./pages/employee/Reports";
import EmployeeTasks from "./pages/employee/Tasks";
import EmployeeOverview from "./pages/employee/Overview";
import EmployeeAttendance from "./pages/employee/Attendance";

// AUTH PAGES - CLIENT
import ClientAuth from "./pages/auth/client/ClientAuth";
import ClientLogin from "./pages/auth/client/ClientLogin";
import ClientRegister from "./pages/auth/client/ClientRegister";
import ClientOTP from "./pages/auth/client/ClientOTP";
import ClientForgot from "./pages/auth/client/ClientForgot";
import ClientResetPassword from "./pages/auth/client/ClientResetPassword";
import ClientVerifyLoginOTP from "./pages/auth/client/ClientVerifyLoginOTP";

// AUTH PAGES - EMPLOYEE
import EmployeeAuth from "./pages/auth/employee/EmployeeAuth";
import EmployeeLogin from "./pages/auth/employee/EmployeeLogin";
import EmployeeRegister from "./pages/auth/employee/EmployeeRegister";
import EmployeeOTP from "./pages/auth/employee/EmployeeOTP";
import EmployeeForgot from "./pages/auth/employee/EmployeeForgot";
import EmployeeResetPassword from "./pages/auth/employee/EmployeeResetPassword";
import EmployeeVerifyLoginOTP from "./pages/auth/employee/EmployeeVerifyLoginOTP";

// AUTH PAGES - HOTEL
import HotelAuth from "./pages/auth/hotel/HotelAuth";
import HotelLogin from "./pages/auth/hotel/HotelLogin";
import HotelRegister from "./pages/auth/hotel/HotelRegister";
import HotelOTP from "./pages/auth/hotel/HotelOTP";
import HotelForgot from "./pages/auth/hotel/HotelForgot";
import HotelResetPassword from "./pages/auth/hotel/HotelResetPassword";
import HotelVerifyLoginOTP from "./pages/auth/hotel/HotelVerifyLoginOTP";
// Add this import at the top of your App.jsx
import AboutDeveloper from "./components/AboutDeveloper";

// AUTH PAGES - RDB
import RdbLogin from "./pages/auth/rdb/RdbLogin";

// Landing Page Component
function LandingPage() {
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const navigate = useNavigate();
// Add scroll effect to header
useEffect(() => {
  const handleScroll = () => {
    const header = document.querySelector('.site-header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
  // Section navigation
  useEffect(() => {
    const sections = {
      home: document.getElementById('home-section'),
      destinations: document.getElementById('destinations-section'),
      contact: document.getElementById('contact-section')
    };
    
    const activateSection = (sectionId) => {
      Object.keys(sections).forEach(key => {
        if (sections[key]) sections[key].classList.remove('active-section');
      });
      if (sections[sectionId]) sections[sectionId].classList.add('active-section');
      
      document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) link.classList.add('active');
      });
    };
    
    activateSection(activeSection);
    
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const handleNavClick = (e) => {
      const section = e.currentTarget.getAttribute('data-section');
      setActiveSection(section);
      activateSection(section);
    };
    
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavClick);
    });
    
    const homeLogoBtn = document.getElementById('homeLogoBtn');
    const handleLogoClick = () => {
      setActiveSection('home');
      activateSection('home');
    };
    if (homeLogoBtn) homeLogoBtn.addEventListener('click', handleLogoClick);
    
    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleNavClick);
      });
      if (homeLogoBtn) homeLogoBtn.removeEventListener('click', handleLogoClick);
    };
  }, [activeSection]);

  // Modal logic
  useEffect(() => {
    const modal = document.getElementById('roleModal');
    const usersNavBtn = document.getElementById('usersNavBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleWindowClick = (e) => {
      if (e.target === modal) closeModal();
    };
    
    if (usersNavBtn) usersNavBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', handleWindowClick);
    
    return () => {
      if (usersNavBtn) usersNavBtn.removeEventListener('click', openModal);
      if (closeModalBtn) closeModalBtn.removeEventListener('click', closeModal);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  // Update modal visibility

  // Add this useEffect INSIDE your LandingPage component, after the existing useEffects

// Mobile menu functionality
useEffect(() => {
  const setupMobileMenu = () => {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelector('.nav-links');
    
    if (!header || !navLinks) return;
    
    // Check if mobile menu button already exists
    let mobileMenuBtn = header.querySelector('.mobile-menu-btn');
    
    // Create button if it doesn't exist and screen is mobile
    if (!mobileMenuBtn && window.innerWidth <= 600) {
      mobileMenuBtn = document.createElement('button');
      mobileMenuBtn.className = 'mobile-menu-btn';
      mobileMenuBtn.innerHTML = '☰';
      mobileMenuBtn.setAttribute('aria-label', 'Menu');
      mobileMenuBtn.style.cssText = `
        display: block;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        z-index: 1001;
      `;
      header.insertBefore(mobileMenuBtn, navLinks);
      
      // Toggle menu
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
        
        // Adjust nav-links style when open
        if (navLinks.classList.contains('open')) {
          navLinks.style.cssText = `
            position: fixed;
            top: ${header.offsetHeight}px;
            left: 0;
            width: 100%;
            height: calc(100vh - ${header.offsetHeight}px);
            background: rgba(10, 37, 64, 0.98);
            backdrop-filter: blur(14px);
            flex-direction: column;
            padding: 20px;
            gap: 16px;
            z-index: 1000;
            overflow-y: auto;
          `;
        } else {
          navLinks.style.cssText = '';
        }
      });
    }
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const mobileBtn = header.querySelector('.mobile-menu-btn');
        navLinks.classList.remove('open');
        if (mobileBtn) mobileBtn.innerHTML = '☰';
        if (navLinks) navLinks.style.cssText = '';
      });
    });
  };
  
  setupMobileMenu();
  
  // Handle window resize
  const handleResize = () => {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelector('.nav-links');
    const existingBtn = header?.querySelector('.mobile-menu-btn');
    
    if (window.innerWidth > 600) {
      if (navLinks) {
        navLinks.classList.remove('open');
        navLinks.style.cssText = '';
      }
      if (existingBtn) existingBtn.remove();
    } else if (window.innerWidth <= 600 && !existingBtn && header) {
      // Re-create button if needed
      const newBtn = document.createElement('button');
      newBtn.className = 'mobile-menu-btn';
      newBtn.innerHTML = '☰';
      newBtn.setAttribute('aria-label', 'Menu');
      newBtn.style.cssText = `
        display: block;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        z-index: 1001;
      `;
      header.insertBefore(newBtn, navLinks);
      
      newBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        newBtn.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
        if (navLinks.classList.contains('open')) {
          navLinks.style.cssText = `
            position: fixed;
            top: ${header.offsetHeight}px;
            left: 0;
            width: 100%;
            height: calc(100vh - ${header.offsetHeight}px);
            background: rgba(10, 37, 64, 0.98);
            backdrop-filter: blur(14px);
            flex-direction: column;
            padding: 20px;
            gap: 16px;
            z-index: 1000;
            overflow-y: auto;
          `;
        } else {
          navLinks.style.cssText = '';
        }
      });
    }
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  useEffect(() => {
    const modal = document.getElementById('roleModal');
    if (modal) {
      if (isModalOpen) {
        modal.classList.add('active');
      } else {
        modal.classList.remove('active');
      }
    }
  }, [isModalOpen]);

  // Role selection - Navigate to respective dashboards
  useEffect(() => {
    const roleOptions = document.querySelectorAll('.role-option');
    const handleRoleClick = (e) => {
      const role = e.currentTarget.getAttribute("data-role");
      setIsModalOpen(false);

      switch (role) {
        case "rdb":
          navigate("/rdb/login");
          break;
        case "client":
          navigate("/client/auth");
          break;
        case "hotel":
          navigate("/hotel/auth");
          break;
        case "employee":
          navigate("/employee/auth");
          break;
        default:
          break;
      }
    };
    
    roleOptions.forEach(opt => {
      opt.addEventListener('click', handleRoleClick);
    });
    
    return () => {
      roleOptions.forEach(opt => {
        opt.removeEventListener('click', handleRoleClick);
      });
    };
  }, [navigate]);

  // Contact form handler
  const handleSendContact = () => {
    if (!contactName || !contactEmail || !contactMsg) {
      alert('Please fill all required fields (Name, Email, Message).');
      return;
    }
    alert(`Thank you ${contactName}! Your message has been sent to RHMS support. We'll reply within 24 hours.`);
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMsg('');
  };

  // Newsletter subscription
  const handleSubscribe = () => {
    if (subscribeEmail && subscribeEmail.includes('@')) {
      alert(`Subscribed! ${subscribeEmail} will receive RHMS updates.`);
      setSubscribeEmail('');
    } else {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <div>
      <header className="site-header">
        <div className="logo" id="homeLogoBtn">
          <div className="logo-icon">
            <img src="/assets/images/hotel-icon.png" alt="RHMS" style={{width: '32px', height: '32px'}} />
          </div>
          <div>
            <div className="logo-text">RH<span>M</span>S</div>
            <div className="logo-sub">Rwanda Hotel Management System</div>
          </div>
        </div>
       // In your LandingPage component, add this to the nav-links section:
<div className="nav-links">
  <a className="nav-link active" data-section="home">Home</a>
  <a className="nav-link" data-section="destinations">Destinations</a>
  <a className="nav-link" id="usersNavBtn">Users</a>
  <a className="nav-link" data-section="contact">Contact</a>
  <a className="nav-link" href="/about-developer">About Dev</a>
</div>
      </header>

      <main className="main-container">
        {/* HOME SECTION */}
        <div id="home-section" className="section active-section">
          <div className="hero-banner">
            <div className="hero-left">
              <div className="hero-badge">Rwanda Development Board</div>
              <h1>Experience <span>Rwanda</span><br />World‑class Hospitality</h1>
              <p>Unified platform for hotel approvals, reservations, payroll and guest experience. Discover luxury lodges, boutique hideaways across the land of a thousand hills.</p>
            </div>
            <div className="hero-right">
              <video autoPlay muted loop playsInline>
                <source src="/assets/videos/rwanda-hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="section-title">Featured Hotels in Rwanda</div>
          <div className="hotel-grid">
            <div className="hotel-card">
              <div className="hotel-img" style={{backgroundImage: "url('/assets/images/hotel-serena.jpg')"}}>
                <div className="hotel-stars">★★★★★</div>
              </div>
              <div className="hotel-info">
                <h3>Kigali Serena Hotel</h3>
                <div className="hotel-location">
                  <i className="fas fa-map-marker-alt"></i> Kigali City
                </div>
                <div className="hotel-price">$180 <span>/ night</span></div>
              </div>
            </div>
            <div className="hotel-card">
              <div className="hotel-img" style={{backgroundImage: "url('/assets/images/hotel-nyungwe.jpg')"}}>
                <div className="hotel-stars">★★★★★</div>
              </div>
              <div className="hotel-info">
                <h3>One&Only Nyungwe House</h3>
                <div className="hotel-location">
                  <i className="fas fa-tree"></i> Nyungwe Forest
                </div>
                <div className="hotel-price">$420 <span>/ night</span></div>
              </div>
            </div>
            <div className="hotel-card">
              <div className="hotel-img" style={{backgroundImage: "url('/assets/images/hotel-marriott.jpg')"}}>
                <div className="hotel-stars">★★★★☆</div>
              </div>
              <div className="hotel-info">
                <h3>Lake Kivu Serena</h3>
                <div className="hotel-location">
                  <i className="fas fa-water"></i> Rubavu
                </div>
                <div className="hotel-price">$140 <span>/ night</span></div>
              </div>
            </div>
            <div className="hotel-card">
              <div className="hotel-img" style={{backgroundImage: "url('/assets/images/hotel-volcano.jpg')"}}>
                <div className="hotel-stars">★★★★</div>
              </div>
              <div className="hotel-info">
                <h3>Volcano View Lodge</h3>
                <div className="hotel-location">
                  <i className="fas fa-mountain"></i> Musanze
                </div>
                <div className="hotel-price">$210 <span>/ night</span></div>
              </div>
            </div>
          </div>
          <div className="section-title">Beautiful Rwanda · Land of a Thousand Hills</div>
          <div className="video-showcase">
            <div className="video-card">
              <video autoPlay loop muted playsInline>
                <source src="/assets/videos/gorilla-trek.mp4" type="video/mp4" />
              </video>
              <div className="video-caption">Volcanoes National Park</div>
            </div>
            <div className="video-card">
              <video autoPlay loop muted playsInline>
                <source src="/assets/videos/lake-kivu-aerial.mp4" type="video/mp4" />
              </video>
              <div className="video-caption">Lake Kivu Serenity</div>
            </div>
            <div className="video-card">
              <video autoPlay loop muted playsInline>
                <source src="/assets/videos/akagera-wildlife.mp4" type="video/mp4" />
              </video>
              <div className="video-caption">Akagera Savannah</div>
            </div>
          </div>
        </div>

        {/* DESTINATIONS SECTION */}
        <div id="destinations-section" className="section">
          <div className="section-title">Explore top destinations</div>
          <div className="destinations-flex">
            <div className="dest-item">
              <div className="dest-img" style={{backgroundImage: "url('/assets/images/kigali-skyline.jpg')"}}></div>
              <h4>Kigali</h4>
              <p>Cultural hubs, convention centres & luxury hotels</p>
            </div>
            <div className="dest-item">
              <div className="dest-img" style={{backgroundImage: "url('/assets/images/volcanoes-park.jpg')"}}></div>
              <h4>Musanze</h4>
              <p>Gorilla trekking & Virunga vistas</p>
            </div>
            <div className="dest-item">
              <div className="dest-img" style={{backgroundImage: "url('/assets/images/lake-kivu.jpg')"}}></div>
              <h4>Rubavu (Gisenyi)</h4>
              <p>Lake beaches & resorts</p>
            </div>
            <div className="dest-item">
              <div className="dest-img" style={{backgroundImage: "url('/assets/images/nyungwe-forest.jpg')"}}></div>
              <h4>Nyungwe</h4>
              <p>Canopy walk & chimpanzees</p>
            </div>
          </div>
        </div>

        {/* CONTACT SECTION */}
        <div id="contact-section" className="section">
          <div className="section-title">Get in touch with RHMS</div>
          <div className="contact-wrapper">
            <div className="contact-info">
              <h3>Rwanda Development Board</h3>
              <div className="contact-detail"><i className="fas fa-map-marker-alt"></i><span>Kigali Heights, KG 7 Ave, Rwanda</span></div>
              <div className="contact-detail"><i className="fas fa-phone-alt"></i><span>+250 791970956</span></div>
              <div className="contact-detail"><i className="fas fa-envelope"></i><span>support@rhms.gov.rw</span></div>
              <div className="contact-detail"><i className="fas fa-globe"></i><span>www.rhms.rw</span></div>
               <div className="contact-detail"><i className="fas fa-envelope"></i><span>hagenimanaoscar43@gmail.com</span></div>
              <div style={{marginTop: "32px"}}>
                <i className="fab fa-twitter"></i> &nbsp;&nbsp;
                <i className="fab fa-linkedin"></i> &nbsp;&nbsp;
                <i className="fab fa-instagram"></i>
              </div>
            </div>
            <div className="contact-form">
              <input type="text" id="contactName" placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              <input type="email" id="contactEmail" placeholder="Email address" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              <input type="text" id="contactSubject" placeholder="Subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
              <textarea rows="5" id="contactMsg" placeholder="Your message..." value={contactMsg} onChange={(e) => setContactMsg(e.target.value)}></textarea>
              <button className="btn-primary" id="sendContactBtn" onClick={handleSendContact}><i className="fas fa-paper-plane"></i> Send Message</button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px"}}>
              <div className="logo-icon" style={{width: "42px", height: "42px"}}>
                <img src="/assets/images/rwanda-flag.png" alt="Rwanda" style={{width: '100%', height: '100%', borderRadius: '14px'}} />
              </div>
              <span style={{fontSize: "22px", fontWeight: "800"}}>RHMS</span>
            </div>
            <p><strong>Rwanda Hotel Management System</strong> – A unified digital ecosystem connecting government regulators, hotel administrators, guests, and employees. Streamlined approvals, bookings, payroll, and analytics.</p>
          </div>
          <div>
            <div className="footer-title">Our Services</div>
            <ul className="services-list">
              <li><i className="fas fa-check-circle"></i> Hotel Approval & Licensing</li>
              <li><i className="fas fa-calendar-alt"></i> Booking Management</li>
              <li><i className="fas fa-coins"></i> Payroll & Salary Management</li>
              <li><i className="fas fa-chart-line"></i> Reports & Compliance Analytics</li>
            </ul>
          </div>
          <div className="stay-updated">
            <div className="footer-title">Stay Updated</div>
            <p style={{marginBottom: "16px", fontSize: "14px"}}>Get latest hotel offers, regulatory news & RHMS updates.</p>
            <input type="email" id="subscribeEmail" placeholder="Your email address" value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} />
            <button id="subscribeBtn" onClick={handleSubscribe}>Subscribe →</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 RHMS — Rwanda Hotel Management System. All rights reserved.</span>
          <span>Made in Rwanda</span>
        </div>
      </footer>

      {/* USER MODAL */}
      <div id="roleModal" className="role-modal">
        <div className="modal-card">
          <h2 style={{fontFamily: "Playfair Display", fontSize: "32px"}}>Access your dashboard</h2>
          <p style={{margin: "10px 0"}}>Select your role to continue</p>
          <div className="role-options">
            <div className="role-option" data-role="rdb">
              <div className="role-icon">
                <img src="/assets/images/government-icon.jpg" alt="Government" style={{width: '48px', height: '48px'}} />
              </div>
              <h4>RDB Agent</h4>
              <p>Government control</p>
              <small style={{color: "#00b894"}}>Login </small>
            </div>
            <div className="role-option" data-role="hotel">
              <div className="role-icon">
                <img src="/assets/images/hotel-icon.png" alt="Hotel" style={{width: '48px', height: '48px'}} />
              </div>
              <h4>Hotel Admin</h4>
              <p>Hotel manager</p>
              <small>Login / Register / Forgot</small>
            </div>
            <div className="role-option" data-role="client">
              <div className="role-icon">
                <img src="/assets/images/client-icon.jpg" alt="Client" style={{width: '48px', height: '48px'}} />
              </div>
              <h4>Client</h4>
              <p>Traveller / Guest</p>
              <small>Login / Register / Forgot</small>
            </div>
            <div className="role-option" data-role="employee">
              <div className="role-icon">
                <img src="/assets/images/employee-icon.jpg" alt="Employee" style={{width: '48px', height: '48px'}} />
              </div>
              <h4>Employee</h4>
              <p>Staff member</p>
              <small>Login / Register / Forgot</small>
            </div>
          </div>
          <button className="close-modal" id="closeModalBtn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* RDB Routes */}
        <Route path="/rdb/dashboard" element={<Dashboard />} />
        <Route path="/rdb/pending-hotels" element={<PendingHotels />} />
        <Route path="/rdb/hotels" element={<AllHotels />} />
        <Route path="/rdb/announcements" element={<Announcements />} />
        <Route path="/rdb/admins" element={<ManageAdmins />} />
        <Route path="/rdb/reports" element={<RdbReports />} />
        <Route path="/rdb/profile" element={<RdbProfile />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<DashboardOverview />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="salary" element={<AdminSalary />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
        
        {/* Client Routes */}
        <Route path="/client" element={<ClientDashboard />}>
          <Route index element={<ClientDashboardHome />} />
          <Route path="dashboard" element={<ClientDashboardHome />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="new-booking" element={<ClientNewBooking />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="hotels" element={<ClientHotels />} />
          <Route path="chat" element={<ClientChat />} />
        </Route>
        
        {/* Employee Dashboard Routes */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeOverview />} />
          <Route path="overview" element={<EmployeeOverview />} />
          <Route path="salary" element={<EmployeeSalary />} />
          <Route path="reports" element={<EmployeeReports />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
        </Route>
        
        {/* Client Auth Routes */}
        <Route path="/client/auth" element={<ClientAuth />} />
        <Route path="/client/otp" element={<ClientOTP />} />
        <Route path="/client/verify-otp" element={<ClientOTP />} />
        <Route path="/client/forgot" element={<ClientForgot />} />
        <Route path="/client/reset-password" element={<ClientResetPassword />} />
        <Route path="/client/verify-login-otp" element={<ClientVerifyLoginOTP />} />
        
        {/* Hotel Auth Routes */}
      <Route path="/hotel/auth" element={<HotelAuth />} />
<Route path="/hotel/login" element={<HotelLogin />} />
<Route path="/hotel/register" element={<HotelRegister />} />
<Route path="/hotel/verify-login-otp" element={<HotelVerifyLoginOTP />} />
<Route path="/hotel/verify-otp" element={<HotelOTP />} />

<Route path="/hotel/forgot-password" element={<HotelForgot />} />
<Route path="/hotel/reset-password" element={<HotelResetPassword />} />
        
     {/* Employee Auth Routes */}
<Route path="/employee/auth" element={<EmployeeAuth />} />
<Route path="/employee/login" element={<EmployeeLogin />} />
<Route path="/employee/register" element={<EmployeeRegister />} />
<Route path="/employee/otp" element={<EmployeeOTP />} />
<Route path="/employee/forgot-password" element={<EmployeeForgot />} />  {/* ← ADD THIS LINE */}
<Route path="/employee/reset-password" element={<EmployeeResetPassword />} />
<Route path="/employee/verify-login-otp" element={<EmployeeVerifyLoginOTP />} />
<Route path="/about-developer" element={<AboutDeveloper />} />
      
        
        
        {/* RDB Auth Route */}
        <Route path="/rdb/login" element={<RdbLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;