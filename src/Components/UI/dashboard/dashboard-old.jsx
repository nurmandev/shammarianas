import { auth, db } from "../../../../firebase";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc, deleteDoc, orderBy, query } from "firebase/firestore";
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
  FiUserCheck
} from "react-icons/fi";
import "./style.css";
import { serverTimestamp } from "firebase/firestore";

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
  const navigate = useNavigate();

  // Check admin status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser && import.meta.env.DEV) {
        setIsAdmin(true);
        setUsers([
          { id: "1", email: "test@example.com", role: "user" },
          { id: "2", email: "admin@shammarinanas.com", role: "admin" },
          { id: "3", email: "wasivoy749@aperiol.com", role: "admin" }
        ]);
        setSupportMessages([
          {
            id: "1",
            profileId: "1",
            subject: "Test Support Message",
            email: "test@example.com",
            status: "unopened",
            createdAt: { toDate: () => new Date() },
            description: "This is a test support message for development"
          }
        ]);
        setSelectedProfileId("1");
        return;
      }

      if (!currentUser) {
        setError("Please log in to access the admin dashboard");
        return;
      }

      try {
        const email = currentUser.email?.toLowerCase();
        if (!email) {
          setError("User email not available");
          return;
        }

        const devAdminEmails = import.meta.env.VITE_DEV_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
        const isDevAdmin = import.meta.env.DEV && devAdminEmails.includes(email);
        const isDevelopmentBypass = import.meta.env.DEV;

        if (isDevAdmin || isDevelopmentBypass || (await checkAdminStatus(email))) {
          setIsAdmin(true);
          await Promise.all([fetchUsers(), fetchSupportMessages(currentUser.uid)]);
          setSelectedProfileId(currentUser.uid);
        } else {
          setError("You do not have admin privileges");
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
      if (import.meta.env.DEV) return true;
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
      if (import.meta.env.DEV) {
        setUsers([
          { id: "1", email: "test@example.com", role: "user" },
          { id: "2", email: "admin@shammarinanas.com", role: "admin" }
        ]);
      } else {
        setError(`Failed to load users: ${error.message}`);
      }
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
      if (import.meta.env.DEV) {
        setSupportMessages([
          {
            id: "1",
            profileId,
            subject: "Test Support Message",
            email: "test@example.com",
            status: "unopened",
            createdAt: { toDate: () => new Date() },
            description: "This is a test support message"
          }
        ]);
      } else {
        setError(`Failed to load support messages: ${error.message}`);
      }
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
    const matchesText = (user.email || "").toLowerCase().includes(search.toLowerCase()) || (user.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? (user.status || "active") === statusFilter : true;
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
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          <li className={`menu-item ${activeTab === 0 ? "active" : ""}`} onClick={() => setActiveTab(0)}>
            <FiHome className="menu-icon" /> Overview
          </li>
          <li className={`menu-item ${activeTab === 1 ? "active" : ""}`} onClick={() => setActiveTab(1)}>
            <FiUsers className="menu-icon" /> Users
          </li>
          <li className={`menu-item ${activeTab === 2 ? "active" : ""}`} onClick={() => setActiveTab(2)}>
            <FiMail className="menu-icon" /> Support
          </li>
          <li className={`menu-item ${activeTab === 3 ? "active" : ""}`} onClick={() => setActiveTab(3)}>
            <FiUpload className="menu-icon" /> Uploads
          </li>
          <li className={`menu-item ${activeTab === 4 ? "active" : ""}`} onClick={() => setActiveTab(4)}>
            <FiFileText className="menu-icon" /> Blog
          </li>
          <li className={`menu-item ${activeTab === 5 ? "active" : ""}`} onClick={() => setActiveTab(5)}>
            <FiFileText className="menu-icon" /> Portfolio
          </li>
          <li className={`menu-item ${activeTab === 6 ? "active" : ""}`} onClick={() => setActiveTab(6)}>
            <FiBox className="menu-icon" /> Stock Management
          </li>
          <li className={`menu-item ${activeTab === 7 ? "active" : ""}`} onClick={() => setActiveTab(7)}>
            <FiUsers className="menu-icon" /> Admin Manager
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
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
                  <h3 className="panel-title">Usage Distribution</h3>
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
  const handleSelectMessage = (messageId) => {
    setSelectedMessages(selectedMessages.includes(messageId) ? selectedMessages.filter((id) => id !== messageId) : [...selectedMessages, messageId]);
  };

  const handleSelectAll = () => {
    setSelectedMessages(selectedMessages.length === messages.length ? [] : messages.map((msg) => msg.id));
  };

  return (
    <div className="table-container">
      {selectedMessages.length > 0 && (
        <div className="table-actions">
          <button onClick={() => handleBulkStatusChange("opened")} className="action-button">Mark as Opened</button>
          <button onClick={() => handleBulkStatusChange("responded")} className="action-button">Mark as Responded</button>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" checked={selectedMessages.length === messages.length && messages.length > 0} onChange={handleSelectAll} />
            </th>
            <th>Subject</th>
            <th>From</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">No messages found</td>
            </tr>
          ) : (
            messages.map((msg) => (
              <tr key={msg.id} className={`status-${msg.status}`}>
                <td>
                  <input type="checkbox" checked={selectedMessages.includes(msg.id)} onChange={() => handleSelectMessage(msg.id)} />
                </td>
                <td onClick={() => onMessageClick(msg)} className="clickable">{msg.subject || "No Subject"}</td>
                <td>{msg.email || "Unknown"}</td>
                <td>{msg.createdAt?.toDate().toLocaleDateString() || "N/A"}</td>
                <td>
                  <span className={`status-badge ${msg.status}`}>{msg.status || "Unknown"}</span>
                </td>
                <td>
                  <select onChange={(e) => onStatusChange(msg.profileId, msg.id, e.target.value)} value={msg.status || "unopened"} className="status-select">
                    <option value="unopened">Unopened</option>
                    <option value="opened">Opened</option>
                    <option value="responded">Responded</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
                    <td>{user.email || "Unknown"}</td>
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
                        <button className="icon-action warn" title={status === 'suspended' ? 'Activate' : 'Suspend'} onClick={() => setConfirm({ type: status === 'suspended' ? 'activate' : 'suspend', user })}>{status === 'suspended' ? 'Activate' : 'Suspend'}</button>
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
              <div className="progress-bar" style={{ width: `${pct}%` }} />
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

export default AdminDashboard;
