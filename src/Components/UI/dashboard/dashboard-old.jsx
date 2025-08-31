import { auth, db, storage } from "../../../../firebase";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc, deleteDoc, orderBy, query, addDoc } from "firebase/firestore";
import Upload from "../../../Pages/Upload";
import BlogEditorModal from "../../../Pages/BlogEditor";
import ProjectModal from "../../../Pages/PortfolioUpload";
import {
  FiUsers,
  FiMail,
  FiUpload,
  FiFileText,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiTrash2,
  FiBox,
  FiHome,
  FiBell,
  FiSettings,
  FiUser,
  FiShield,
  FiUserCheck,
  FiChevronLeft,
  FiMenu,
  FiLogOut,
  FiActivity,
  FiFilter,
  FiEye,
  FiMapPin,
  FiCalendar,
  FiShoppingCart,
  FiDollarSign,
  FiDownload,
  FiCheckCircle,
  FiMoreHorizontal
} from "react-icons/fi";
import "./style.css";
import { serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access">
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Overview
  const [users, setUsers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("all");
  const [selectedUserStatus, setSelectedUserStatus] = useState("all");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Check admin status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {

      if (!currentUser) {
        setError("Please log in to access the admin dashboard");
        navigate('/Login');
        return;
      }

      try {
        const email = currentUser.email?.toLowerCase();
        if (!email) {
          setError("User email not available");
          return;
        }


        if (await checkAdminStatus(email)) {
          setIsAdmin(true);
          await Promise.all([fetchUsers(), fetchSupportMessages(currentUser.uid)]);
          setSelectedProfileId(currentUser.uid);
        } else {
          setError("You do not have admin privileges");
          navigate('/');
        }
      } catch (error) {
        setError(`Failed to verify admin privileges: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    if (!email) return false;
    const superAdminEmails = import.meta.env.VITE_SUPER_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
    if (superAdminEmails.includes(email)) return true;

    try {
      if (!db) return false;
      const adminDoc = await getDoc(doc(db, "adminUsers", email));
      return adminDoc.exists();
    } catch (error) {
      setError(`Failed to check admin status: ${error.message}`);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!db) throw new Error("Firebase not initialized");
      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) {
      setError(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMessages = async (profileId) => {
    if (!profileId) return;
    if (!isAdmin && profileId !== auth.currentUser?.uid) {
      setError("Only admins can view other users' support messages");
      return;
    }
    setLoading(true);
    try {
      if (!db) throw new Error("Firebase not initialized");
      const q = query(collection(db, `Profiles/${profileId}/Support`), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({ id: doc.id, profileId, ...doc.data() }));
      setSupportMessages(messages);
    } catch (error) {
      setError(`Failed to load support messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blogs when Blog tab is selected
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = [];
        querySnapshot.forEach((doc) => {
          blogsData.push({ id: doc.id, ...doc.data() });
        });
        setBlogs(blogsData);
      } catch (error) {
        setError(`Failed to load blogs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 4) {
      fetchBlogs();
    }
  }, [activeTab]);

  // Fetch portfolios (projects) when Portfolio tab is selected
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData = [];
        querySnapshot.forEach((doc) => {
          projectsData.push({ id: doc.id, ...doc.data() });
        });
        setPortfolios(projectsData);
      } catch (error) {
        setError(`Failed to load portfolios: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 5) {
      fetchProjects();
    }
  }, [activeTab]);

  // Fetch All Assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Assets"));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
    } catch (error) {
      setError(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assets when Uploads or Stock Management tab is selected
  useEffect(() => {
    if (activeTab === 3 || activeTab === 6) {
      fetchAssets();
    }
  }, [activeTab, fetchAssets]);

  const handleRoleChange = async (userId, newRole, userEmail) => {
    if (!isAdmin) {
      setError("Only admins can change user roles");
      return;
    }
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        const lowerCaseEmail = userEmail.toLowerCase();
        await updateDoc(doc(db, "Profiles", userId), { role: newRole });
        if (newRole === "admin") {
          await setDoc(doc(db, "adminUsers", lowerCaseEmail), { createdAt: serverTimestamp(), promotedBy: auth.currentUser.email });
        } else {
          await deleteDoc(doc(db, "adminUsers", lowerCaseEmail));
        }
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      } catch (error) {
        setError(`Failed to update role: ${error.message}`);
      }
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    if (!isAdmin) {
      setError("Only admins can change user status");
      return;
    }
    try {
      await updateDoc(doc(db, "Profiles", userId), { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (error) {
      setError(`Failed to update status: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!isAdmin) {
      setError("Only admins can delete users");
      return;
    }
    try {
      await deleteDoc(doc(db, "Profiles", userId));
      if (email) {
        const lower = email.toLowerCase();
        await deleteDoc(doc(db, "adminUsers", lower));
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      setError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!isAdmin) {
      setError("Only admins can perform bulk role changes");
      return;
    }
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} user(s) to "${newRole}"?`)) {
      try {
        await Promise.all(
          selectedUsers.map(async (userId) => {
            const user = users.find((u) => u.id === userId);
            if (!user || !user.email) return;
            const lowerCaseEmail = user.email.toLowerCase();
            await updateDoc(doc(db, "Profiles", userId), { role: newRole });
            if (newRole === "admin") {
              await setDoc(doc(db, "adminUsers", lowerCaseEmail), { createdAt: serverTimestamp(), promotedBy: auth.currentUser.email });
            } else {
              await deleteDoc(doc(db, "adminUsers", lowerCaseEmail));
            }
          })
        );
        setUsers(users.map((user) => (selectedUsers.includes(user.id) ? { ...user, role: newRole } : user)));
        setSelectedUsers([]);
      } catch (error) {
        setError(`Failed to update user roles: ${error.message}`);
      }
    }
  };

  const handleStatusChange = async (profileId, messageId, newStatus) => {
    if (!isAdmin && profileId !== auth.currentUser?.uid) {
      setError("Only admins can change other users' message status");
      return;
    }
    if (window.confirm("Are you sure you want to change this message's status?")) {
      try {
        await updateDoc(doc(db, `Profiles/${profileId}/Support`, messageId), { status: newStatus });
        setSupportMessages(supportMessages.map((msg) => (msg.id === messageId && msg.profileId === profileId ? { ...msg, status: newStatus } : msg)));
      } catch (error) {
        setError(`Failed to update message status: ${error.message}`);
      }
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!isAdmin && selectedMessages.some((id) => supportMessages.find((msg) => msg.id === id).profileId !== auth.currentUser?.uid)) {
      setError("Only admins can perform bulk status changes for other users' messages");
      return;
    }
    if (selectedMessages.length === 0) return;
    if (window.confirm(`Change status of ${selectedMessages.length} message(s) to ${newStatus}?`)) {
      try {
        await Promise.all(
          selectedMessages.map((messageId) => {
            const message = supportMessages.find((msg) => msg.id === messageId);
            return updateDoc(doc(db, `Profiles/${message.profileId}/Support`, messageId), { status: newStatus });
          })
        );
        setSupportMessages(supportMessages.map((msg) => (selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg)));
        setSelectedMessages([]);
      } catch (error) {
        setError(`Failed to update message statuses: ${error.message}`);
      }
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!isAdmin) {
      setError("Only admins can delete blog posts");
      return;
    }
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", blogId));
        setBlogs(blogs.filter((blog) => blog.id !== blogId));
      } catch (error) {
        setError(`Failed to delete blog post: ${error.message}`);
      }
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!isAdmin) {
      setError("Only admins can delete portfolio items");
      return;
    }
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await deleteDoc(doc(db, "projects", portfolioId));
        setPortfolios(portfolios.filter((portfolio) => portfolio.id !== portfolioId));
      } catch (error) {
        setError(`Failed to delete portfolio item: ${error.message}`);
      }
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!isAdmin) {
      setError("Only admins can delete assets");
      return;
    }
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, "Assets", assetId));
        setAssets(assets.filter((asset) => asset.id !== assetId));
      } catch (error) {
        setError(`Failed to delete asset: ${error.message}`);
      }
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const withinDate = (createdAt) => {
    if (!dateFilter) return true;
    const days = parseInt(dateFilter, 10);
    const d = normalizeDate(createdAt);
    if (!d) return false;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return d.getTime() >= cutoff;
  };

  const filteredUsers = users.filter((user) => {
    const searchTerm = activeTab === 1 ? userSearchTerm : search;
    const roleFilterValue = activeTab === 1 ? selectedUserRole : roleFilter;
    const statusFilterValue = activeTab === 1 ? selectedUserStatus : statusFilter;

    const matchesText = (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (user.name || user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilterValue === "all" || !roleFilterValue ? true : user.role === roleFilterValue;
    const matchesStatus = statusFilterValue === "all" || !statusFilterValue ? true : (user.status || "active") === statusFilterValue;
    const matchesDate = withinDate(user.createdAt);
    return matchesText && matchesRole && matchesStatus && matchesDate;
  });

  const valueByKey = (obj, key) => {
    if (key === "lastActive") return normalizeDate(obj.lastActive)?.getTime() || 0;
    return (obj[key] || "").toString().toLowerCase();
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const av = valueByKey(a, sortConfig.key);
    const bv = valueByKey(b, sortConfig.key);
    return sortConfig.direction === "ascending" ? (av < bv ? -1 : av > bv ? 1 : 0) : av > bv ? -1 : av < bv ? 1 : 0;
  });

  const filteredMessages = supportMessages.filter((msg) => {
    const matchesSearch = msg.subject?.toLowerCase().includes(search.toLowerCase()) || msg.email?.toLowerCase().includes(search.toLowerCase());
    return messageFilter === "all" ? matchesSearch : msg.status === messageFilter && matchesSearch;
  });
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredBlogs = blogs.filter((blog) => blog.title?.toLowerCase().includes(search.toLowerCase()) || !blog.title);
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredPortfolios = portfolios.filter((portfolio) => portfolio.title?.toLowerCase().includes(search.toLowerCase()) || !portfolio.title);
  const sortedPortfolios = [...filteredPortfolios].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const filteredAssets = assets.filter((asset) => asset.name?.toLowerCase().includes(search.toLowerCase()) || !asset.name);
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);
  const currentBlogs = sortedBlogs.slice(indexOfFirstItem, indexOfLastItem);
  const currentPortfolios = sortedPortfolios.slice(indexOfFirstItem, indexOfLastItem);
  const currentAssets = sortedAssets.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter((user) => user.role === "admin").length,
    pendingMessages: supportMessages.filter((msg) => msg.status === "unopened").length,
    totalBlogs: blogs.length,
    totalPortfolios: portfolios.length,
    totalAssets: assets.length,
  };

  if (error && !isAdmin) {
    return <UnauthorizedAccess error={error} />;
  }

  return (
    <div className="admin-dashboard">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-full">Admin Panel</div>
            <div className="logo-compact">AP</div>
          </div>
          <button className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? 'Expand' : 'Collapse'}>
            <FiChevronLeft className={`toggle-icon ${isSidebarCollapsed ? 'rotated' : ''}`} />
          </button>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => { setActiveTab(0); setIsSidebarOpen(false); }} title="Dashboard">
            <FiHome className="menu-icon" />
            <span className="nav-label">Dashboard</span>
          </li>
          <li className={`menu-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => { setActiveTab(1); setIsSidebarOpen(false); }} title="Users">
            <FiUsers className="menu-icon" />
            <span className="nav-label">Users</span>
          </li>
          <li className={`menu-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => { setActiveTab(2); setIsSidebarOpen(false); }} title="Support">
            <FiMail className="menu-icon" />
            <span className="nav-label">Support</span>
          </li>
          <li className={`menu-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => { setActiveTab(3); setIsSidebarOpen(false); }} title="Uploads">
            <FiUpload className="menu-icon" />
            <span className="nav-label">Uploads</span>
          </li>
          <li className={`menu-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => { setActiveTab(4); setIsSidebarOpen(false); }} title="Blog">
            <FiFileText className="menu-icon" />
            <span className="nav-label">Blog</span>
          </li>
          <li className={`menu-item ${activeTab === 5 ? 'active' : ''}`} onClick={() => { setActiveTab(5); setIsSidebarOpen(false); }} title="Portfolio">
            <FiFileText className="menu-icon" />
            <span className="nav-label">Portfolio</span>
          </li>
          <li className={`menu-item ${activeTab === 6 ? 'active' : ''}`} onClick={() => { setActiveTab(6); setIsSidebarOpen(false); }} title="Stock Management">
            <FiBox className="menu-icon" />
            <span className="nav-label">Stock Management</span>
          </li>
          <li className={`menu-item ${activeTab === 7 ? 'active' : ''}`} onClick={() => { setActiveTab(7); setIsSidebarOpen(false); }} title="Admin Manager">
            <FiShield className="menu-icon" />
            <span className="nav-label">Admin Manager</span>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="menu-item compact" title="Settings">
            <FiSettings className="menu-icon" />
            <span className="nav-label">Settings</span>
          </button>
          <button className="menu-item compact" title="Logout" onClick={async () => { try { await signOut(auth); navigate('/'); } catch {} }}>
            <FiLogOut className="menu-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-only" onClick={() => setIsSidebarOpen(true)} title="Open Menu">
              <FiMenu />
            </button>
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={
                  activeTab === 1
                    ? "Search users..."
                    : activeTab === 2
                    ? "Search messages..."
                    : activeTab === 4
                    ? "Search blogs..."
                    : activeTab === 5
                    ? "Search portfolios..."
                    : activeTab === 6
                    ? "Search assets..."
                    : activeTab === 7
                    ? "Search admins..."
                    : "Search..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-right">
            <div className="notification-button" title="Notifications">
              <FiBell />
              {stats.pendingMessages > 0 && <span className="notification-badge">{stats.pendingMessages}</span>}
            </div>
            <button className="icon-button" title="Settings">
              <FiSettings />
            </button>
            <div className="profile-chip" title={auth.currentUser?.email || "Admin"}>
              <FiUser className="profile-icon" />
              <span className="profile-email">{auth.currentUser?.email || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">
            {activeTab === 0 && "Dashboard Overview"}
            {activeTab === 1 && "User Management"}
            {activeTab === 2 && "Support Messages"}
            {activeTab === 3 && "File Uploads"}
            {activeTab === 4 && "Blog Editor"}
            {activeTab === 5 && "Portfolio Uploads"}
            {activeTab === 6 && "Stock Management"}
            {activeTab === 7 && "Admin Manager"}
          </h1>
        </div>

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              <FiX />
            </button>
          </div>
        )}

        {activeTab === 0 && (
          <div className="overview-grid">
            <WelcomeBanner
              name={auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Admin"}
              totalUsers={users.length}
              totalAssets={assets.length}
            />

            <KPICards
              users={users}
              admins={users.filter((u) => u.role === "admin").length}
              messages={supportMessages}
              blogs={blogs}
              portfolios={portfolios}
              assets={assets}
            />

            <div className="insights-grid">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Popular Categories</h3>
                </div>
                <div className="card-body">
                  <UsageDistribution assets={assets} />
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Activity</h3>
                </div>
                <div className="card-body">
                  <RecentActivity messages={supportMessages} blogs={blogs} portfolios={portfolios} assets={assets} />
                </div>
              </div>
            </div>

            <QuickActions onNavigate={(tab) => setActiveTab(tab)} />

            <div className="overview-panels">
              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Users</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 5).map((u) => (
                          <tr key={u.id}>
                            <td>{u.email || "Unknown"}</td>
                            <td>
                              <span className={`role-badge ${u.role}`}>{u.role || "Unknown"}</span>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan="2" className="no-data">No users yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <h3 className="panel-title">Recent Support</h3>
                </div>
                <div className="card-body">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supportMessages.slice(0, 5).map((m) => (
                          <tr key={m.id}>
                            <td>{m.subject || "No Subject"}</td>
                            <td>
                              <span className={`status-badge ${m.status}`}>{m.status || "Unknown"}</span>
                            </td>
                          </tr>
                        ))}
                        {supportMessages.length === 0 && (
                          <tr>
                            <td colSpan="2" className="no-data">No messages</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading-overlay">Loading...</div>}

        {activeTab !== 0 && (
          <div className="content-card">
            <div className="card-header">
              <div className="filters">
                {activeTab === 1 && (
                  <>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="user">User</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="banned">Banned</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
                      <option value="">Any Time</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                    <div className="filter-group-responsive">
                      <button onClick={() => handleSort("name")} className={`sort-button ${sortConfig.key === "name" ? "active" : ""}`}>
                        Name {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("email")} className={`sort-button ${sortConfig.key === "email" ? "active" : ""}`}>
                        Email {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("role")} className={`sort-button ${sortConfig.key === "role" ? "active" : ""}`}>
                        Role {sortConfig.key === "role" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                      <button onClick={() => handleSort("lastActive")} className={`sort-button ${sortConfig.key === "lastActive" ? "active" : ""}`}>
                        Last Active {sortConfig.key === "lastActive" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                      </button>
                    </div>
                  </>
                )}
                {activeTab === 2 && (
                  <>
                    {isAdmin && (
                      <select
                        value={selectedProfileId || ""}
                        onChange={(e) => {
                          setSelectedProfileId(e.target.value);
                          fetchSupportMessages(e.target.value);
                        }}
                        className="filter-select"
                      >
                        <option value="" disabled>
                          Select User
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.email}
                          </option>
                        ))}
                      </select>
                    )}
                    <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)} className="filter-select">
                      <option value="all">All Messages</option>
                      <option value="unopened">Unopened</option>
                      <option value="opened">Opened</option>
                      <option value="responded">Responded</option>
                    </select>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("subject")} className={`sort-button ${sortConfig.key === "subject" ? "active" : ""}`}>
                      Subject {sortConfig.key === "subject" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 4 && (
                  <>
                    <button onClick={() => handleSort("title")} className={`sort-button ${sortConfig.key === "title" ? "active" : ""}`}>
                      Title {sortConfig.key === "title" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 5 && (
                  <>
                    <button onClick={() => handleSort("title")} className={`sort-button ${sortConfig.key === "title" ? "active" : ""}`}>
                      Title {sortConfig.key === "title" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
                {activeTab === 6 && (
                  <>
                    <button onClick={() => handleSort("name")} className={`sort-button ${sortConfig.key === "name" ? "active" : ""}`}>
                      Name {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("createdAt")} className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}>
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="card-body">
              {activeTab === 1 && (
                <UserList
                  users={currentUsers}
                  onRoleChange={handleRoleChange}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  handleBulkRoleChange={handleBulkRoleChange}
                  onUpdateStatus={handleUpdateUserStatus}
                  onDelete={handleDeleteUser}
                />
              )}
              {activeTab === 2 && (
                <SupportList
                  messages={currentMessages}
                  onStatusChange={handleStatusChange}
                  onMessageClick={setSelectedMessage}
                  selectedMessages={selectedMessages}
                  setSelectedMessages={setSelectedMessages}
                  handleBulkStatusChange={handleBulkStatusChange}
                />
              )}
              {activeTab === 3 && (
                <div className="uploads-layout">
                  <Upload />
                  <div className="uploads-preview">
                    <h3 className="panel-title">Recent Uploads</h3>
                    <PreviewGrid assets={assets.slice(0, 12)} />
                  </div>
                </div>
              )}
              {activeTab === 4 && (
                <BlogList
                  blogs={currentBlogs}
                  onDelete={handleDeleteBlog}
                  onCreate={() => {
                    setIsBlogModalOpen(true);
                  }}
                />
              )}
              {activeTab === 5 && (
                <PortfolioList
                  portfolios={currentPortfolios}
                  onDelete={handleDeletePortfolio}
                  onCreate={() => {
                    setIsPortfolioModalOpen(true);
                  }}
                />
              )}
              {activeTab === 6 && <AssetList assets={currentAssets} onDelete={handleDeleteAsset} />}
              {activeTab === 7 && <AdminManager setError={setError} />}
            </div>

            <div className="card-footer">
              <div className="pagination">
                <button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="page-nav">
                  Previous
                </button>
                {Array.from(
                  {
                    length: Math.ceil(
                      (activeTab === 1
                        ? filteredUsers.length
                        : activeTab === 2
                        ? filteredMessages.length
                        : activeTab === 4
                        ? filteredBlogs.length
                        : activeTab === 5
                        ? filteredPortfolios.length
                        : activeTab === 6
                        ? filteredAssets.length
                        : 1) / itemsPerPage
                    ),
                  },
                  (_, i) => (
                    <button key={i + 1} onClick={() => paginate(i + 1)} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                      {i + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    paginate(
                      Math.min(
                        Math.ceil(
                          (activeTab === 1
                            ? filteredUsers.length
                            : activeTab === 2
                            ? filteredMessages.length
                            : activeTab === 4
                            ? filteredBlogs.length
                            : activeTab === 5
                            ? filteredPortfolios.length
                            : activeTab === 6
                            ? filteredAssets.length
                            : 1) / itemsPerPage
                        ),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(
                      (activeTab === 1
                        ? filteredUsers.length
                        : activeTab === 2
                        ? filteredMessages.length
                        : activeTab === 4
                        ? filteredBlogs.length
                        : activeTab === 5
                        ? filteredPortfolios.length
                        : activeTab === 6
                        ? filteredAssets.length
                        : 1) / itemsPerPage
                    )
                  }
                  className="page-nav"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedMessage && <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} onStatusChange={handleStatusChange} />}
        {isBlogModalOpen && (
          <BlogEditorModal
            isOpen={isBlogModalOpen}
            onClose={() => setIsBlogModalOpen(false)}
            onSave={() => {
              setIsBlogModalOpen(false);
            }}
          />
        )}
        {isPortfolioModalOpen && (
          <ProjectModal
            isOpen={isPortfolioModalOpen}
            onClose={() => setIsPortfolioModalOpen(false)}
            onSave={() => {
              setIsPortfolioModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

const PreviewGrid = ({ assets }) => {
  return (
    <div className="preview-grid">
      {assets.length === 0 && <div className="no-data">No uploads yet</div>}
      {assets.map((a) => {
        const thumb = a.thumbnail || (Array.isArray(a.images) && a.images[0]) || (Array.isArray(a.icons) && a.icons[0]) || "";
        return (
          <div className="preview-card" key={a.id}>
            {thumb ? <img src={thumb} alt={a.title || a.name || "asset"} className="preview-image" /> : <div className="preview-placeholder" />}
            <div className="preview-info">
              <div className="preview-title">{a.title || a.name || "Untitled"}</div>
              <div className="preview-meta">{a.type || a.category || "Asset"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SupportList = ({ messages, onStatusChange, onMessageClick, selectedMessages, setSelectedMessages, handleBulkStatusChange }) => {
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [viewFilter, setViewFilter] = useState("inbox");
  const [statusFilterLocal, setStatusFilterLocal] = useState("");
  const [cannedOpen, setCannedOpen] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        setAdmins(snapshot.docs.map((d) => d.id));
      } catch {}
    };
    loadAdmins();
  }, []);

  useEffect(() => {
    setSelected(null);
    setThread([]);
  }, [viewFilter]);

  const filtered = messages.filter((m) => {
    const s = (m.status || "").toLowerCase();
    const inView = viewFilter === "inbox" ? ["unopened", "opened"].includes(s) : viewFilter === "resolved" ? ["responded", "closed", "resolved"].includes(s) : ["archived"].includes(s);
    const byStatus = statusFilterLocal ? s === statusFilterLocal : true;
    return inView && byStatus;
  });

  const handleSelectAll = () => {
    setSelectedMessages(selectedMessages.length === filtered.length ? [] : filtered.map((msg) => msg.id));
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    try {
      const repliesSnap = await getDocs(collection(db, `Profiles/${msg.profileId}/Support/${msg.id}/Replies`));
      const replies = repliesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const base = [{ id: "root", sender: "user", message: msg.description, createdAt: msg.createdAt }];
      const toTime = (v) => { const d = normalizeDate(v); return d ? d.getTime() : 0; };
      setThread([...base, ...replies].sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt)));
    } catch {
      setThread([{ id: "root", sender: "user", message: msg.description, createdAt: msg.createdAt }]);
    }
    if (msg.status === "unopened") onStatusChange(msg.profileId, msg.id, "opened");
    onMessageClick?.(msg);
  };

  return (
    <div className="support-module">
      <aside className="support-sidebar">
        <div className="support-sections">
          <button className={`support-tab ${viewFilter==='inbox'?'active':''}`} onClick={() => setViewFilter('inbox')}>Inbox</button>
          <button className={`support-tab ${viewFilter==='resolved'?'active':''}`} onClick={() => setViewFilter('resolved')}>Resolved</button>
          <button className={`support-tab ${viewFilter==='archived'?'active':''}`} onClick={() => setViewFilter('archived')}>Archived</button>
        </div>
        <div className="support-filters">
          <select className="filter-select" value={statusFilterLocal} onChange={(e)=>setStatusFilterLocal(e.target.value)}>
            <option value="">All Status</option>
            <option value="unopened">Unopened</option>
            <option value="opened">Opened</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="inbox-toolbar">
          {selectedMessages.length > 0 && (
            <div className="table-actions">
              <button onClick={() => handleBulkStatusChange('opened')} className="action-button">Mark Opened</button>
              <button onClick={() => handleBulkStatusChange('responded')} className="action-button">Mark Responded</button>
            </div>
          )}
        </div>
        <div className="support-inbox-list">
          <div className="inbox-head">
            <label className="user-select-all">
              <input type="checkbox" checked={selectedMessages.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} />
              <span>Select all</span>
            </label>
          </div>
          <div className="inbox-items">
            {filtered.length === 0 && <div className="no-data">No messages</div>}
            {filtered.map((msg) => {
              const isActive = selected?.id === msg.id;
              return (
                <button key={msg.id} className={`inbox-item ${isActive?'active':''}`} onClick={() => openMessage(msg)}>
                  <div className="inbox-title">{msg.subject || 'No Subject'}</div>
                  <div className="inbox-meta">
                    <span className="inbox-email">{msg.email || 'Unknown'}</span>
                    <span className={`status-badge ${msg.status}`}>{msg.status || 'Unknown'}</span>
                    <span className="inbox-time">{msg.createdAt?.toDate?.().toLocaleDateString?.() || 'N/A'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="support-conversation">
        {!selected ? (
          <div className="no-data">Select a message to view conversation</div>
        ) : (
          <div className="conversation-wrapper">
            <div className="conversation-header">
              <div className="conv-title">{selected.subject || 'No Subject'}</div>
              <div className="conv-actions">
                <select className="role-select" value={assignee || selected.assignedTo || ''} onChange={async (e)=>{ const v=e.target.value; try { await updateDoc(doc(db, `Profiles/${selected.profileId}/Support`, selected.id), { assignedTo: v }); setAssignee(v); } catch {} }}>
                  <option value="">Assign to...</option>
                  {admins.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <select className="status-select" value={selected.status || 'opened'} onChange={(e)=>onStatusChange(selected.profileId, selected.id, e.target.value)}>
                  <option value="unopened">Unopened</option>
                  <option value="opened">Open</option>
                  <option value="responded">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="conversation-body">
              {thread.map((m) => {
                const sender = (m.sender || 'user').toLowerCase();
                const tsDate = normalizeDate(m.createdAt);
                const ts = tsDate ? tsDate.toLocaleString() : '';
                return (
                  <div key={m.id} className={`msg-row ${sender==='admin'?'right':'left'}`}>
                    <div className={`msg-bubble ${sender==='admin'?'admin':'user'}`}>
                      {m.message && <div className="msg-text">{m.message}</div>}
                      {m.attachment && (
                        <a className="msg-attachment" href={m.attachment} target="_blank" rel="noreferrer">Attachment</a>
                      )}
                      <div className="msg-time">{ts}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reply-box">
              <div className="reply-tools">
                <button className="qa-button" onClick={()=>setCannedOpen(!cannedOpen)}>Canned</button>
                {cannedOpen && (
                  <div className="canned-menu">
                    {["Thanks for reaching out! We're looking into this now.","Can you share more details or a screenshot?","This has been resolved. Please confirm on your side."].map((c) => (
                      <button key={c} className="canned-item" onClick={()=>{ setReplyText(c); setCannedOpen(false); }}>{c}</button>
                    ))}
                  </div>
                )}
                <label className="attach-label">
                  <input type="file" className="attach-input" onChange={(e)=> setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
                  Attach
                </label>
              </div>
              <textarea className="reply-input" rows={3} placeholder="Write a reply..." value={replyText} onChange={(e)=>setReplyText(e.target.value)} />
              <div className="reply-actions">
                <button className="action-button" onClick={async ()=>{
                  if (!selected || (!replyText && !attachment)) return;
                  let attachmentUrl = null;
                  try {
                    if (attachment) {
                      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                      const path = `support_attachments/${selected.id}/${attachment.name}`;
                      const storageRef = ref(storage, path);
                      const up = await uploadBytes(storageRef, attachment);
                      attachmentUrl = await getDownloadURL(up.ref);
                    }
                    await addDoc(collection(db, `Profiles/${selected.profileId}/Support/${selected.id}/Replies`), { sender: 'admin', message: replyText, attachment: attachmentUrl, createdAt: serverTimestamp(), agent: auth.currentUser?.email || 'admin' });
                    setReplyText('');
                    setAttachment(null);
                    const repliesSnap = await getDocs(collection(db, `Profiles/${selected.profileId}/Support/${selected.id}/Replies`));
                    const replies = repliesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    const base = [{ id: 'root', sender: 'user', message: selected.description, createdAt: selected.createdAt }];
                    setThread([...base, ...replies]);
                    onStatusChange(selected.profileId, selected.id, 'responded');
                  } catch {}
                }}>Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const BlogList = ({ blogs, onDelete, onCreate }) => {
  return (
    <div className="table-container">
      <div className="table-actions">
        <button onClick={onCreate} className="action-button">Create New Blog</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">No blogs found</td>
            </tr>
          ) : (
            blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.title || "Untitled"}</td>
                <td>{blog.author || "Unknown"}</td>
                <td>{blog.createdAt?.toDate().toLocaleDateString() || "N/A"}</td>
                <td>
                  <button onClick={() => onDelete(blog.id)} className="action-button delete-button">
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const PortfolioList = ({ portfolios, onDelete, onCreate }) => {
  return (
    <div className="table-container">
      <div className="table-actions">
        <button onClick={onCreate} className="action-button">Create New Portfolio</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Owner</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {portfolios.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">No portfolios found</td>
            </tr>
          ) : (
            portfolios.map((portfolio) => (
              <tr key={portfolio.id}>
                <td>{portfolio.title || "Untitled"}</td>
                <td>{portfolio.owner || "Unknown"}</td>
                <td>{portfolio.createdAt?.toDate().toLocaleDateString() || "N/A"}</td>
                <td>
                  <button onClick={() => onDelete(portfolio.id)} className="action-button delete-button">
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const AssetList = ({ assets, onDelete }) => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">No assets found</td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name || asset.title || "Unnamed"}</td>
                <td>{asset.type || "Unknown"}</td>
                <td>{asset.createdAt?.toDate?.().toLocaleDateString?.() || "N/A"}</td>
                <td>
                  <button onClick={() => onDelete(asset.id)} className="action-button delete-button">
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const MessageModal = ({ message, onClose, onStatusChange }) => {
  const handleMarkAsOpened = () => {
    if (message.status !== "opened") {
      onStatusChange(message.profileId, message.id, "opened");
    }
  };

  const handleMarkAsResponded = () => {
    onStatusChange(message.profileId, message.id, "responded");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{message.subject || "No Subject"}</h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="message-meta">
            <div>
              <strong>From:</strong> {message.email || "Unknown"}
            </div>
            <div>
              <strong>Date:</strong> {message.createdAt?.toDate().toLocaleString() || "N/A"}
            </div>
            <div className={`status-badge ${message.status}`}>{message.status || "Unknown"}</div>
          </div>
          <div className="message-content">{message.description || "No content"}</div>
        </div>
        <div className="modal-footer">
          <button onClick={handleMarkAsOpened} disabled={message.status === "opened"} className={`action-button ${message.status === "opened" ? "disabled" : ""}`}>
            <FiCheck /> {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
          </button>
          <button onClick={handleMarkAsResponded} disabled={message.status === "responded"} className={`action-button ${message.status === "responded" ? "disabled" : ""}`}>
            <FiCheck /> {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserList = ({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange, onUpdateStatus, onDelete }) => {
  const handleSelectUser = (userId) => {
    setSelectedUsers(selectedUsers.includes(userId) ? selectedUsers.filter((id) => id !== userId) : [...selectedUsers, userId]);
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((user) => user.id));
  };

  const [drawerUser, setDrawerUser] = useState(null);
  const [confirm, setConfirm] = useState(null);

  return (
    <div className="user-management">
      {selectedUsers.length > 0 && (
        <div className="table-actions">
          <button onClick={() => handleBulkRoleChange("admin")} className="action-button">Make Admin</button>
          <button onClick={() => handleBulkRoleChange("moderator")} className="action-button">Make Moderator</button>
          <button onClick={() => handleBulkRoleChange("user")} className="action-button">Make Regular User</button>
        </div>
      )}

      {users.length > 0 && (
        <div className="user-select-toolbar">
          <label className="user-select-all">
            <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} />
            <span>Select all</span>
          </label>
          {selectedUsers.length > 0 && <span className="selected-count">{selectedUsers.length} selected</span>}
        </div>
      )}

      {users.length === 0 ? (
        <div className="no-data">No users found</div>
      ) : (
        <div className="table-container">
          <table className="data-table user-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={() => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id))} /></th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const name = user.name || user.displayName || user.email?.split("@")[0] || "Unknown";
                const status = (user.status || "active").toLowerCase();
                const lastActive = normalizeDate(user.lastActive)?.toLocaleDateString?.() || "N/A";
                return (
                  <tr key={user.id}>
                    <td><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} /></td>
                    <td>
                      <div className="avatar">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={name} className="avatar-img" />
                        ) : (
                          <div className="avatar-initials">{(name[0] || "").toUpperCase()}</div>
                        )}
                      </div>
                    </td>
                    <td className="name-cell clickable" onClick={() => setDrawerUser(user)}>{name}</td>
                    <td className="email-cell">{user.email || "Unknown"}</td>
                    <td>
                      <select onChange={(e) => onRoleChange(user.id, e.target.value, user.email)} value={user.role || "user"} className="role-select">
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td><span className={`status-badge ${status}`}>{status}</span></td>
                    <td>{lastActive}</td>
                    <td>
                      <div className="actions">
                        <button className="icon-action info" title="View" onClick={() => setDrawerUser(user)}><FiUser /></button>
                        <button className="icon-action warn" title={status === 'suspended' ? 'Activate' : 'Suspend'} onClick={() => setConfirm({ type: status === 'suspended' ? 'activate' : 'suspend', user })}>
                          {status === 'suspended' ? <FiUserCheck /> : <FiShield />}
                          <span className="action-label">{status === 'suspended' ? 'Activate' : 'Suspend'}</span>
                        </button>
                        <button className="icon-action danger" title="Delete" onClick={() => setConfirm({ type: 'delete', user })}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawerUser && <UserProfileDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onUpdateStatus={onUpdateStatus} onRoleChange={(role) => onRoleChange(drawerUser.id, role, drawerUser.email)} />}
      {confirm && (
        <ConfirmModal
          title={confirm.type === 'delete' ? 'Delete User' : confirm.type === 'suspend' ? 'Suspend User' : 'Activate User'}
          message={confirm.type === 'delete' ? 'This action cannot be undone.' : confirm.type === 'suspend' ? 'User will be suspended.' : 'User will be re-activated.'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === 'delete') onDelete(confirm.user.id, confirm.user.email);
            if (confirm.type === 'suspend') onUpdateStatus(confirm.user.id, 'suspended');
            if (confirm.type === 'activate') onUpdateStatus(confirm.user.id, 'active');
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
};

const AdminManager = ({ setError }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState("info");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        const adminList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAdmins(adminList);
      } catch (error) {
        setError(`Failed to fetch admin list: ${error.message}`);
      }
    };
    fetchAdmins();
  }, [setError]);

  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) {
      setLogMessage("Email cannot be empty.");
      setLogType("error");
      return;
    }
    try {
      await setDoc(doc(db, "adminUsers", email), {
        addedBy: auth.currentUser?.email || "unknown",
        createdAt: serverTimestamp(),
      });
      setAdmins([...admins, { id: email, addedBy: auth.currentUser?.email, createdAt: new Date() }]);
      setNewAdminEmail("");
      setLogMessage(`Admin ${email} added successfully.`);
      setLogType("success");
    } catch (error) {
      setLogMessage(`Failed to add admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  const removeAdmin = async (email) => {
    if (!window.confirm(`Remove admin: ${email}?`)) return;
    try {
      await deleteDoc(doc(db, "adminUsers", email));
      setAdmins(admins.filter((a) => a.id !== email));
      setLogMessage(`Admin ${email} removed successfully.`);
      setLogType("success");
    } catch (error) {
      setLogMessage(`Failed to remove admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  return (
    <div className="admin-manager">
      <h3 className="panel-title">Admin Manager</h3>

      <div className="admin-manager-actions">
        <input
          type="email"
          placeholder="Enter admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="admin-input"
        />
        <button onClick={addAdmin} className="action-button">Add Admin</button>
      </div>

      {logMessage && <div className={`admin-log ${logType === "success" ? "log-success" : "log-error"}`}>{logMessage}</div>}

      <ul className="admin-list">
        {admins.map((admin) => (
          <li key={admin.id} className="admin-list-item">
            <span className="admin-email">{admin.id}</span>
            <button onClick={() => removeAdmin(admin.id)} className="remove-admin">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const normalizeDate = (value) => {
  if (!value) return null;
  if (value.toDate) {
    try { return value.toDate(); } catch { return null; }
  }
  if (value.seconds) return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value);
  if (value instanceof Date) return value;
  return null;
};

const countNewInDays = (items, key, days = 7) => {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return items.reduce((acc, it) => {
    const d = normalizeDate(it[key]);
    return acc + (d && d.getTime() >= cutoff ? 1 : 0);
  }, 0);
};

const KPICards = ({ users, admins, messages, blogs, portfolios, assets }) => {
  const newUsers = countNewInDays(users, "createdAt");
  const newMsgs = countNewInDays(messages, "createdAt");
  const newBlogs = countNewInDays(blogs, "createdAt");
  const newAssets = countNewInDays(assets, "createdAt");
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon kpi-users"><FiUsers /></div>
        <div className="kpi-content">
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-label">Total Users</div>
        </div>
        <div className="delta-badge">+{newUsers} this week</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-admins"><FiUser /></div>
        <div className="kpi-content">
          <div className="kpi-value">{admins}</div>
          <div className="kpi-label">Admins</div>
        </div>
        <div className="delta-badge">{admins > 0 ? "Active" : "None"}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-messages"><FiMail /></div>
        <div className="kpi-content">
          <div className="kpi-value">{messages.length}</div>
          <div className="kpi-label">Support Tickets</div>
        </div>
        <div className="delta-badge">+{newMsgs} this week</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-icon kpi-assets"><FiBox /></div>
        <div className="kpi-content">
          <div className="kpi-value">{assets.length}</div>
          <div className="kpi-label">Total Assets</div>
        </div>
        <div className="delta-badge">+{newAssets} this week</div>
      </div>
    </div>
  );
};

const UsageDistribution = ({ assets }) => {
  const counts = assets.reduce((acc, a) => {
    const key = (a.type || "other").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = assets.length || 1;
  return (
    <div className="usage-list">
      {entries.length === 0 && <div className="no-data">No assets yet</div>}
      {entries.map(([type, cnt]) => {
        const pct = Math.round((cnt / total) * 100);
        return (
          <div className="usage-row" key={type}>
            <div className="usage-label">{type}</div>
            <div className="progress">
              <div className="progress-bar" style={{ "--progress-width": `${pct}%` }} />
            </div>
            <div className="usage-value">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
};

const RecentActivity = ({ messages, blogs, portfolios, assets }) => {
  const items = [];
  messages.forEach((m) => items.push({ t: normalizeDate(m.createdAt), type: "Support", label: m.subject || "No Subject" }));
  blogs.forEach((b) => items.push({ t: normalizeDate(b.createdAt), type: "Blog", label: b.title || "Untitled" }));
  portfolios.forEach((p) => items.push({ t: normalizeDate(p.createdAt), type: "Portfolio", label: p.title || "Untitled" }));
  assets.forEach((a) => items.push({ t: normalizeDate(a.createdAt), type: "Asset", label: a.title || a.name || "Untitled" }));
  const recent = items
    .filter((i) => i.t)
    .sort((a, b) => b.t - a.t)
    .slice(0, 6);
  return (
    <ul className="activity-list">
      {recent.length === 0 && <li className="no-data">No recent activity</li>}
      {recent.map((i, idx) => (
        <li key={idx} className="activity-item">
          <span className="activity-type">{i.type}</span>
          <span className="activity-label">{i.label}</span>
          <span className="activity-time">{i.t?.toLocaleDateString?.() || ""}</span>
        </li>
      ))}
    </ul>
  );
};

const QuickActions = ({ onNavigate }) => {
  return (
    <div className="quick-actions">
      <button className="qa-button" onClick={() => onNavigate(1)}><FiUsers /> Manage Users</button>
      <button className="qa-button" onClick={() => onNavigate(3)}><FiUpload /> Add Upload</button>
      <button className="qa-button" onClick={() => onNavigate(4)}><FiFileText /> Create Blog</button>
      <button className="qa-button" onClick={() => onNavigate(5)}><FiFileText /> Add Portfolio</button>
    </div>
  );
};

const UserProfileDrawer = ({ user, onClose, onUpdateStatus, onRoleChange }) => {
  const [tab, setTab] = useState('overview');
  const name = user.name || user.displayName || user.email?.split('@')[0] || 'Unknown';
  const status = (user.status || 'active').toLowerCase();
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="avatar large">
            {user.photoURL ? <img src={user.photoURL} alt={name} className="avatar-img" /> : <div className="avatar-initials">{(name[0] || '').toUpperCase()}</div>}
          </div>
          <div className="drawer-title">
            <div className="name">{name}</div>
            <div className="meta">{user.email}</div>
          </div>
          <button className="close-button" onClick={onClose}><FiX /></button>
        </div>
        <div className="tabs">
          <button className={`tab ${tab==='overview'?'active':''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab ${tab==='activity'?'active':''}`} onClick={() => setTab('activity')}>Activity Logs</button>
          <button className={`tab ${tab==='permissions'?'active':''}`} onClick={() => setTab('permissions')}>Permissions</button>
          <button className={`tab ${tab==='settings'?'active':''}`} onClick={() => setTab('settings')}>Settings</button>
        </div>
        <div className="drawer-body">
          {tab === 'overview' && (
            <div className="drawer-section">
              <div className="info-grid">
                <div><div className="label">Role</div><div className="value"><span className={`role-badge ${user.role}`}>{user.role || 'user'}</span></div></div>
                <div><div className="label">Status</div><div className="value"><span className={`status-badge ${status}`}>{status}</span></div></div>
                <div><div className="label">Last Active</div><div className="value">{normalizeDate(user.lastActive)?.toLocaleString?.() || 'N/A'}</div></div>
                <div><div className="label">Joined</div><div className="value">{normalizeDate(user.createdAt)?.toLocaleDateString?.() || 'N/A'}</div></div>
              </div>
            </div>
          )}
          {tab === 'activity' && (
            <div className="drawer-section">
              <ul className="activity-list">
                <li className="activity-item"><span className="activity-type">Login</span><span className="activity-label">Signed in</span><span className="activity-time">—</span></li>
              </ul>
            </div>
          )}
          {tab === 'permissions' && (
            <div className="drawer-section">
              <div className="perm-row">
                <label>Role</label>
                <select className="role-select" value={user.role || 'user'} onChange={(e) => onRoleChange(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="perm-row">
                <label>Status</label>
                <select className="role-select" value={status} onChange={(e) => onUpdateStatus(user.id, e.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="banned">Banned</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          )}
          {tab === 'settings' && (
            <div className="drawer-section">
              <div className="perm-row">
                <label>Name</label>
                <input className="admin-input" defaultValue={name} />
              </div>
              <div className="perm-row">
                <label>Email</label>
                <input className="admin-input" defaultValue={user.email} />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const ConfirmModal = ({ title, message, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onCancel}><FiX /></button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="action-button" onClick={onCancel}>Cancel</button>
          <button className="action-button" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const WelcomeBanner = ({ name, totalUsers, totalAssets }) => {
  return (
    <div className="content-card welcome-banner">
      <div className="card-body">
        <div className="welcome-header">
          <div className="welcome-title">
            <h2 className="welcome-text">Welcome back, {name}! 👋</h2>
            <p className="welcome-sub">Here's what's happening with your marketplace today.</p>
            <div className="welcome-meta">
              <div className="welcome-meta-item">
                <FiActivity className="meta-icon online" />
                <span>System Online</span>
              </div>
              <div className="welcome-meta-item">
                <FiUsers className="meta-icon users" />
                <span>{totalUsers} Users</span>
              </div>
              <div className="welcome-meta-item">
                <FiBox className="meta-icon assets" />
                <span>{totalAssets} Assets</span>
              </div>
            </div>
          </div>
          <div className="welcome-graphic">
            <div className="graphic-circle"><FiActivity /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
