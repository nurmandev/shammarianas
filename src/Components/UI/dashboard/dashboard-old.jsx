"use client";
import { auth, db } from "../../../../firebase";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import Upload from "../../../Pages/Upload";
import BlogEditorModal from "../../../Pages/BlogEditor";
import ProjectModal from "../../../Pages/PortfolioUpload";
import { FiUsers, FiMail, FiUpload, FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiCheck, FiX, FiTrash2, FiBox } from "react-icons/fi";
import "./style.css";
import { serverTimestamp } from "firebase/firestore";

const UnauthorizedAccess = ({ error }) => {
  console.log("UnauthorizedAccess rendered with error:", error);
  return (
    <div
      className="unauthorized-access"
      style={{
        padding: "20px",
        textAlign: "center",
        color: "red",
        backgroundColor: "#ffe6e6",
        borderRadius: "8px",
        margin: "20px",
      }}>
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [users, setUsers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [messageFilter, setMessageFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const navigate = useNavigate();
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  // Check admin status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      // Development mode bypass - allow access without login
      if (!currentUser && import.meta.env.DEV) {
        console.warn("Development mode: bypassing authentication for admin dashboard");
        setIsAdmin(true);
        // Set mock data for development
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

        // Development mode bypass - allow anyone in dev mode
        const isDevelopmentBypass = import.meta.env.DEV;

        if (isDevAdmin || isDevelopmentBypass || (await checkAdminStatus(email))) {
          setIsAdmin(true);
          await Promise.all([fetchUsers(), fetchSupportMessages(currentUser.uid)]);
          setSelectedProfileId(currentUser.uid);
        } else {
          setError("You do not have admin privileges");
        }
      } catch (error) {
        console.error("Error in auth state change:", error, {
          code: error.code,
          message: error.message,
        });
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
      // Test Firebase connection first
      if (!db) {
        console.warn("Firebase not initialized properly");
        return false;
      }

      const adminDoc = await getDoc(doc(db, "adminUsers", email));
      console.log("Admin check for", email, "exists:", adminDoc.exists());
      return adminDoc.exists();
    } catch (error) {
      console.error("Error checking admin status for email:", email, error, {
        code: error.code,
        message: error.message,
      });

      // Don't show error for Firebase permission issues in dev mode
      if (import.meta.env.DEV) {
        console.warn("Firebase admin check failed in dev mode, allowing access");
        return true;
      }

      setError(`Failed to check admin status: ${error.message}`);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched users:", userList.length);
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error, {
        code: error.code,
        message: error.message,
      });

      // In dev mode, set mock data instead of showing error
      if (import.meta.env.DEV) {
        console.warn("Using mock user data in dev mode");
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
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      const q = query(collection(db, `Profiles/${profileId}/Support`), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        profileId,
        ...doc.data(),
      }));
      console.log("Fetched support messages for profileId:", profileId, "count:", messages.length);
      setSupportMessages(messages);
    } catch (error) {
      console.error("Error fetching support messages for profileId:", profileId, error, { code: error.code, message: error.message });

      // In dev mode, set mock data instead of showing error
      if (import.meta.env.DEV) {
        console.warn("Using mock support messages in dev mode");
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
        console.log("Fetched blogs:", blogsData.length, blogsData);
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to load blogs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 4) {
      console.log("Blog tab selected, fetching blogs...");
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
        console.log("Fetched portfolios:", projectsData.length, projectsData);
        setPortfolios(projectsData);
      } catch (error) {
        console.error("Error fetching portfolios:", error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to load portfolios: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 5) {
      console.log("Portfolio tab selected, fetching portfolios...");
      fetchProjects();
    }
  }, [activeTab]);

  // Fetch All Assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "Assets"));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssets(assetsData);
      console.log("Fetched assets:", assetsData.length, assetsData);
    } catch (error) {
      console.error("Error fetching assets:", error, {
        code: error.code,
        message: error.message,
      });
      setError(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assets when Stock Management tab is selected
  useEffect(() => {
    if (activeTab === 6) {
      console.log("Stock Management tab selected, fetching assets...");
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
          await setDoc(doc(db, "adminUsers", lowerCaseEmail), {
            createdAt: serverTimestamp(),
            promotedBy: auth.currentUser.email,
          });
        } else {
          await deleteDoc(doc(db, "adminUsers", lowerCaseEmail));
        }
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
        console.log(`User ${userEmail} role changed to ${newRole}`);
      } catch (error) {
        console.error("Error updating role for userId:", userId, error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to update role: ${error.message}`);
      }
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
            if (!user || !user.email) {
              console.warn(`Could not find user data for ID: ${userId}`);
              return;
            }
            const lowerCaseEmail = user.email.toLowerCase();
            await updateDoc(doc(db, "Profiles", userId), { role: newRole });
            if (newRole === "admin") {
              await setDoc(doc(db, "adminUsers", lowerCaseEmail), {
                createdAt: serverTimestamp(),
                promotedBy: auth.currentUser.email,
              });
            } else {
              await deleteDoc(doc(db, "adminUsers", lowerCaseEmail));
            }
          })
        );
        setUsers(users.map((user) => (selectedUsers.includes(user.id) ? { ...user, role: newRole } : user)));
        setSelectedUsers([]);
        console.log(`Bulk role change to ${newRole} for ${selectedUsers.length} users`);
      } catch (error) {
        console.error("Error updating bulk user roles:", error, {
          code: error.code,
          message: error.message,
        });
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
        await updateDoc(doc(db, `Profiles/${profileId}/Support`, messageId), {
          status: newStatus,
        });
        setSupportMessages(supportMessages.map((msg) => (msg.id === messageId && msg.profileId === profileId ? { ...msg, status: newStatus } : msg)));
        console.log(`Message ${messageId} status changed to ${newStatus}`);
      } catch (error) {
        console.error("Error updating message status for messageId:", messageId, error, { code: error.code, message: error.message });
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
        console.log(`Bulk status change to ${newStatus} for ${selectedMessages.length} messages`);
      } catch (error) {
        console.error("Error updating bulk message statuses:", error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to update message statuses: ${error.message}`);
      }
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!isAdmin) {
      setError("Only admins can delete blog posts");
      console.warn("Non-admin attempted to delete blog:", blogId);
      return;
    }
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", blogId));
        setBlogs(blogs.filter((blog) => blog.id !== blogId));
        console.log(`Blog ${blogId} deleted successfully`);
      } catch (error) {
        console.error("Error deleting blog:", blogId, error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to delete blog post: ${error.message}`);
      }
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!isAdmin) {
      setError("Only admins can delete portfolio items");
      console.warn("Non-admin attempted to delete portfolio:", portfolioId);
      return;
    }
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await deleteDoc(doc(db, "projects", portfolioId));
        setPortfolios(portfolios.filter((portfolio) => portfolio.id !== portfolioId));
        console.log(`Portfolio ${portfolioId} deleted successfully`);
      } catch (error) {
        console.error("Error deleting portfolio:", portfolioId, error, {
          code: error.code,
          message: error.message,
        });
        setError(`Failed to delete portfolio item: ${error.message}`);
      }
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!isAdmin) {
      setError("Only admins can delete assets");
      console.warn("Non-admin attempted to delete asset:", assetId);
      return;
    }
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteDoc(doc(db, "Assets", assetId));
        setAssets(assets.filter((asset) => asset.id !== assetId));
        console.log(`Asset ${assetId} deleted successfully`);
      } catch (error) {
        console.error("Error deleting asset:", assetId, error, {
          code: error.code,
          message: error.message,
        });
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
    console.log("Sorting by", key, direction);
  };

  const filteredUsers = users.filter((user) => user.email?.toLowerCase().includes(search.toLowerCase()) && (roleFilter ? user.role === roleFilter : true));

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || "";
    const bValue = b[sortConfig.key] || "";
    return sortConfig.direction === "ascending" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
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
        <div className="header">
          <h1 className="page-title">
            {activeTab === 1 && "User Management"}
            {activeTab === 2 && "Support Messages"}
            {activeTab === 3 && "File Uploads"}
            {activeTab === 4 && "Blog Editor"}
            {activeTab === 5 && "Portfolio Uploads"}
            {activeTab === 6 && "Stock Management"}
            {activeTab === 7 && "Admin Manager"}
          </h1>
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

        {error && (
          <div className="error-alert">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              <FiX />
            </button>
          </div>
        )}

        {loading && <div className="loading-overlay">Loading...</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalAdmins}</div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingMessages}</div>
            <div className="stat-label">Pending Messages</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalBlogs}</div>
            <div className="stat-label">Total Blogs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalPortfolios}</div>
            <div className="stat-label">Total Portfolios</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalAssets}</div>
            <div className="stat-label">Total Assets</div>
          </div>
        </div>

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
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button onClick={() => handleSort("email")} className={`sort-button ${sortConfig.key === "email" ? "active" : ""} w-full sm:w-auto`}>
                      Email {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
                    </button>
                    <button onClick={() => handleSort("role")} className={`sort-button ${sortConfig.key === "role" ? "active" : ""} w-full sm:w-auto`}>
                      Role {sortConfig.key === "role" && (sortConfig.direction === "ascending" ? <FiChevronUp /> : <FiChevronDown />)}
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
                      className="filter-select">
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
              <UserList users={currentUsers} onRoleChange={handleRoleChange} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} handleBulkRoleChange={handleBulkRoleChange} />
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
            {activeTab === 3 && <Upload />}
            {activeTab === 4 && (
              <BlogList
                blogs={currentBlogs}
                onDelete={handleDeleteBlog}
                onCreate={() => {
                  console.log("Opening BlogEditorModal");
                  setIsBlogModalOpen(true);
                }}
              />
            )}
            {activeTab === 5 && (
              <PortfolioList
                portfolios={currentPortfolios}
                onDelete={handleDeletePortfolio}
                onCreate={() => {
                  console.log("Opening ProjectModal");
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
                className="page-nav">
                Next
              </button>
            </div>
          </div>
        </div>

        {selectedMessage && <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} onStatusChange={handleStatusChange} />}
        {isBlogModalOpen && (
          <BlogEditorModal
            isOpen={isBlogModalOpen}
            onClose={() => setIsBlogModalOpen(false)}
            onSave={() => {
              console.log("Blog saved, refreshing blogs...");
              setIsBlogModalOpen(false);
              fetchBlogs();
            }}
          />
        )}
        {isPortfolioModalOpen && (
          <ProjectModal
            isOpen={isPortfolioModalOpen}
            onClose={() => setIsPortfolioModalOpen(false)}
            onSave={() => {
              console.log("Portfolio saved, refreshing portfolios...");
              setIsPortfolioModalOpen(false);
              fetchProjects();
            }}
          />
        )}
      </div>
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
          <button onClick={() => handleBulkStatusChange("opened")} className="action-button">
            Mark as Opened
          </button>
          <button onClick={() => handleBulkStatusChange("responded")} className="action-button">
            Mark as Responded
          </button>
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
              <td colSpan="6" className="no-data">
                No messages found
              </td>
            </tr>
          ) : (
            messages.map((msg) => (
              <tr key={msg.id} className={`status-${msg.status}`}>
                <td>
                  <input type="checkbox" checked={selectedMessages.includes(msg.id)} onChange={() => handleSelectMessage(msg.id)} />
                </td>
                <td onClick={() => onMessageClick(msg)} className="clickable">
                  {msg.subject || "No Subject"}
                </td>
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
        <button onClick={onCreate} className="action-button">
          Create New Blog
        </button>
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
              <td colSpan="4" className="no-data">
                No blogs found
              </td>
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
        <button onClick={onCreate} className="action-button">
          Create New Portfolio
        </button>
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
              <td colSpan="4" className="no-data">
                No portfolios found
              </td>
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
      {/* <div className="table-actions">
        <button onClick={() => console.log("Create New Asset")} className="action-button">
          Create New Asset
        </button>
      </div> */}
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
              <td colSpan="4" className="no-data">
                No assets found
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name || "Unnamed"}</td>
                <td>{asset.type || "Unknown"}</td>
                <td>{asset.createdAt?.toDate().toLocaleDateString() || "N/A"}</td>
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

const UserList = ({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange }) => {
  const handleSelectUser = (userId) => {
    setSelectedUsers(selectedUsers.includes(userId) ? selectedUsers.filter((id) => id !== userId) : [...selectedUsers, userId]);
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((user) => user.id));
  };

  return (
    <div className="table-container">
      {selectedUsers.length > 0 && (
        <div className="table-actions">
          <button onClick={() => handleBulkRoleChange("admin")} className="action-button">
            Make Admin
          </button>
          <button onClick={() => handleBulkRoleChange("moderator")} className="action-button">
            Make Moderator
          </button>
          <button onClick={() => handleBulkRoleChange("user")} className="action-button">
            Make Regular User
          </button>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} />
            </th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                </td>
                <td>{user.email || "Unknown"}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role || "Unknown"}</span>
                </td>
                <td>
                  <select onChange={(e) => onRoleChange(user.id, e.target.value, user.email)} value={user.role || "user"} className="role-select">
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
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

const AdminManager = ({ setError }) => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState("info");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        const adminList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched admins:", adminList.length);
        setAdmins(adminList);
      } catch (error) {
        console.error("Error fetching admins:", error, {
          code: error.code,
          message: error.message,
        });
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
      console.log(`Admin ${email} added`);
    } catch (error) {
      console.error("Error adding admin:", email, error, {
        code: error.code,
        message: error.message,
      });
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
      console.log(`Admin ${email} removed`);
    } catch (error) {
      console.error("Error removing admin:", email, error, {
        code: error.code,
        message: error.message,
      });
      setLogMessage(`Failed to remove admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  return (
    <div className="admin-manager p-4 sm:p-6 bg-white rounded-xl shadow-md w-full max-w-xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Admin Manager</h3>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="email"
          placeholder="Enter admin email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={addAdmin} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all w-full sm:w-auto">
          Add Admin
        </button>
      </div>

      {logMessage && <div className={`text-sm mt-2 ${logType === "success" ? "text-green-600" : "text-red-600"}`}>{logMessage}</div>}

      <ul className="mt-6 space-y-3">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between border-b pb-2">
            <span className="text-gray-700 text-sm break-words">{admin.id}</span>
            <button onClick={() => removeAdmin(admin.id)} className="text-red-600 hover:text-red-800 text-sm">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
