"use client";
import { auth, db } from "../../../../firebase";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
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
} from "react-icons/fi";
import "./style.css";

// Helper Components
const UnauthorizedAccess = ({ error }) => (
  <div className="unauthorized-access">
    <h3>Access Denied</h3>
    <p>{error || "You don't have permission to access this page."}</p>
  </div>
);

const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
);

const ErrorAlert = ({ error, onClose }) => (
  <div className="error-alert">
    {error}
    <button onClick={onClose} className="close-error">
      <FiX />
    </button>
  </div>
);

// Main Admin Component
const AdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState(1);
  const [data, setData] = useState({
    users: [],
    supportMessages: [],
    blogs: [],
    portfolios: [],
    assets: []
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    messageStatus: "all"
  });
  const [selection, setSelection] = useState({
    users: [],
    messages: [],
    message: null
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc"
  });
  const [uiState, setUiState] = useState({
    loading: false,
    error: null,
    isAdmin: false,
    modals: {
      blog: false,
      portfolio: false
    }
  });

  const navigate = useNavigate();

  // Auth and permissions check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setUiState(prev => ({ ...prev, error: "Please log in to access admin dashboard" }));
        return;
      }

      try {
        const isAdmin = await checkAdminStatus(user.email);
        setUiState(prev => ({ ...prev, isAdmin }));
        
        if (isAdmin) {
          await Promise.all([fetchData('users'), fetchData('supportMessages', user.uid)]);
        } else {
          setUiState(prev => ({ ...prev, error: "You don't have admin privileges" }));
        }
      } catch (error) {
        setUiState(prev => ({ ...prev, error: `Auth error: ${error.message}` }));
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    if (!email) return false;
    const adminDoc = await getDoc(doc(db, "adminUsers", email.toLowerCase()));
    return adminDoc.exists();
  };

  // Data fetching
  const fetchData = async (type, profileId = null) => {
    setUiState(prev => ({ ...prev, loading: true }));
    
    try {
      let querySnapshot;
      switch (type) {
        case 'users':
          querySnapshot = await getDocs(collection(db, "Profiles"));
          setData(prev => ({ ...prev, users: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
          break;
        case 'supportMessages':
          if (!profileId) return;
          const q = query(
            collection(db, `Profiles/${profileId}/Support`),
            orderBy("createdAt", "desc")
          );
          querySnapshot = await getDocs(q);
          setData(prev => ({ ...prev, supportMessages: querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            profileId,
            ...doc.data() 
          })) }));
          break;
        case 'blogs':
          querySnapshot = await getDocs(collection(db, "blogs"));
          setData(prev => ({ ...prev, blogs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
          break;
        case 'portfolios':
          querySnapshot = await getDocs(collection(db, "projects"));
          setData(prev => ({ ...prev, portfolios: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
          break;
        case 'assets':
          querySnapshot = await getDocs(collection(db, "Assets"));
          setData(prev => ({ ...prev, assets: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
          break;
        default:
          break;
      }
    } catch (error) {
      setUiState(prev => ({ ...prev, error: `Failed to load ${type}: ${error.message}` }));
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Tab-specific data loading
  useEffect(() => {
    if (!uiState.isAdmin) return;

    const fetchMap = {
      4: () => fetchData('blogs'),
      5: () => fetchData('portfolios'),
      6: () => fetchData('assets')
    };

    fetchMap[activeTab]?.();
  }, [activeTab, uiState.isAdmin]);

  // Data operations
  const handleRoleChange = async (userId, newRole) => {
    if (!uiState.isAdmin) return;

    try {
      await updateDoc(doc(db, "Profiles", userId), { role: newRole });
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      }));
    } catch (error) {
      setUiState(prev => ({ ...prev, error: `Role update failed: ${error.message}` }));
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!uiState.isAdmin || selection.users.length === 0) return;

    try {
      const batch = selection.users.map(userId => 
        updateDoc(doc(db, "Profiles", userId), { role: newRole })
      );
      await Promise.all(batch);
      
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          selection.users.includes(user.id) ? { ...user, role: newRole } : user
        )
      }));
      
      setSelection(prev => ({ ...prev, users: [] }));
    } catch (error) {
      setUiState(prev => ({ ...prev, error: `Bulk update failed: ${error.message}` }));
    }
  };

  const handleStatusChange = async (messageId, newStatus, profileId) => {
    try {
      await updateDoc(doc(db, `Profiles/${profileId}/Support`, messageId), {
        status: newStatus,
      });
      
      setData(prev => ({
        ...prev,
        supportMessages: prev.supportMessages.map(msg =>
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        )
      }));
    } catch (error) {
      setUiState(prev => ({ ...prev, error: `Status update failed: ${error.message}` }));
    }
  };

  const handleDelete = async (collectionName, id) => {
    if (!uiState.isAdmin) return;

    try {
      await deleteDoc(doc(db, collectionName, id));
      setData(prev => ({
        ...prev,
        [collectionName]: prev[collectionName].filter(item => item.id !== id)
      }));
      return true;
    } catch (error) {
      setUiState(prev => ({ ...prev, error: `Deletion failed: ${error.message}` }));
      return false;
    }
  };

  // Data processing
  const processedData = useMemo(() => {
    const { key, direction } = sortConfig;
    let result = [...data[getCollectionName(activeTab)]];

    // Filtering
    result = result.filter(item => {
      const matchesSearch = Object.values(item).some(
        value => String(value).toLowerCase().includes(filters.search.toLowerCase())
      );

      switch (activeTab) {
        case 1: return matchesSearch && (filters.role ? item.role === filters.role : true);
        case 2: return matchesSearch && (filters.messageStatus === "all" || item.status === filters.messageStatus);
        default: return matchesSearch;
      }
    });

    // Sorting
    if (key) {
      result.sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";
        return direction === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [data, activeTab, filters, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return processedData.slice(start, start + pagination.itemsPerPage);
  }, [processedData, pagination]);

  const totalPages = Math.ceil(processedData.length / pagination.itemsPerPage);

  // Helper functions
  const getCollectionName = (tab) => {
    const map = {
      1: 'users',
      2: 'supportMessages',
      4: 'blogs',
      5: 'portfolios',
      6: 'assets'
    };
    return map[tab] || 'users';
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Render functions
  const renderTable = () => {
    switch (activeTab) {
      case 1: return <UserTable 
                      data={paginatedData} 
                      selected={selection.users}
                      onSelect={ids => setSelection(prev => ({ ...prev, users: ids }))}
                      onRoleChange={handleRoleChange}
                    />;
      case 2: return <MessageTable 
                      data={paginatedData}
                      selected={selection.messages}
                      onSelect={ids => setSelection(prev => ({ ...prev, messages: ids }))}
                      onSelectMessage={msg => setSelection(prev => ({ ...prev, message: msg }))}
                      onStatusChange={handleStatusChange}
                    />;
      case 4: return <BlogTable 
                      data={paginatedData}
                      onDelete={id => handleDelete('blogs', id)}
                      onCreate={() => setUiState(prev => ({ ...prev, modals: { ...prev.modals, blog: true } }))}
                    />;
      case 5: return <PortfolioTable 
                      data={paginatedData}
                      onDelete={id => handleDelete('projects', id)}
                      onCreate={() => setUiState(prev => ({ ...prev, modals: { ...prev.modals, portfolio: true } }))}
                    />;
      case 6: return <AssetTable 
                      data={paginatedData}
                      onDelete={id => handleDelete('Assets', id)}
                    />;
      default: return null;
    }
  };

  if (uiState.error && !uiState.isAdmin) {
    return <UnauthorizedAccess error={uiState.error} />;
  }

  return (
    <div className="admin-dashboard">
      {uiState.loading && <LoadingOverlay />}
      {uiState.error && (
        <ErrorAlert 
          error={uiState.error} 
          onClose={() => setUiState(prev => ({ ...prev, error: null }))} 
        />
      )}

      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          {[
            { id: 1, icon: <FiUsers />, label: "Users" },
            { id: 2, icon: <FiMail />, label: "Support" },
            { id: 3, icon: <FiUpload />, label: "Uploads" },
            { id: 4, icon: <FiFileText />, label: "Blog" },
            { id: 5, icon: <FiFileText />, label: "Portfolio" },
            { id: 6, icon: <FiBox />, label: "Assets" },
          ].map(item => (
            <li
              key={item.id}
              className={`menu-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1 className="page-title">
            {[
              "User Management",
              "Support Messages",
              "File Uploads",
              "Blog Editor",
              "Portfolio Uploads",
              "Stock Management"
            ][activeTab - 1]}
          </h1>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${getCollectionName(activeTab)}...`}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        <div className="stats-grid">
          {Object.entries({
            "Total Users": data.users.length,
            "Admins": data.users.filter(u => u.role === "admin").length,
            "Pending Messages": data.supportMessages.filter(m => m.status === "unopened").length,
            "Total Blogs": data.blogs.length,
            "Portfolios": data.portfolios.length,
            "Assets": data.assets.length
          }).map(([label, value]) => (
            <div key={label} className="stat-card">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="content-card">
          <div className="card-header">
            <div className="filters">
              {activeTab === 1 && (
                <>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                  <SortButton 
                    field="email" 
                    sortConfig={sortConfig}
                    onClick={handleSort}
                  />
                </>
              )}
              {activeTab === 2 && (
                <>
                  <select
                    value={filters.messageStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, messageStatus: e.target.value }))}
                    className="filter-select"
                  >
                    <option value="all">All Messages</option>
                    <option value="unopened">Unopened</option>
                    <option value="opened">Opened</option>
                    <option value="responded">Responded</option>
                  </select>
                  <SortButton 
                    field="createdAt" 
                    sortConfig={sortConfig}
                    onClick={handleSort}
                  />
                </>
              )}
            </div>
          </div>

          <div className="card-body">
            {renderTable()}
          </div>

          <div className="card-footer">
            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {selection.message && (
        <MessageModal
          message={selection.message}
          onClose={() => setSelection(prev => ({ ...prev, message: null }))}
          onStatusChange={handleStatusChange}
        />
      )}

      {uiState.modals.blog && (
        <BlogEditorModal
          onClose={() => setUiState(prev => ({ ...prev, modals: { ...prev.modals, blog: false }))}
          onSave={() => {
            fetchData('blogs');
            setUiState(prev => ({ ...prev, modals: { ...prev.modals, blog: false }));
          }}
        />
      )}

      {uiState.modals.portfolio && (
        <ProjectModal
          onClose={() => setUiState(prev => ({ ...prev, modals: { ...prev.modals, portfolio: false }))}
          onSave={() => {
            fetchData('portfolios');
            setUiState(prev => ({ ...prev, modals: { ...prev.modals, portfolio: false }));
          }}
        />
      )}
    </div>
  );
};

// Table Components
const UserTable = ({ data, selected, onSelect, onRoleChange }) => {
  const handleSelectAll = (e) => {
    onSelect(e.target.checked ? data.map(item => item.id) : []);
  };

  return (
    <div className="table-container">
      {selected.length > 0 && (
        <div className="table-actions">
          <button onClick={() => onRoleChange("admin")} className="action-button">
            Make Admin
          </button>
          <button onClick={() => onRoleChange("user")} className="action-button">
            Make User
          </button>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selected.length === data.length && data.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">
                No users found
              </td>
            </tr>
          ) : (
            data.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => onSelect(
                      selected.includes(user.id)
                        ? selected.filter(id => id !== user.id)
                        : [...selected, user.id]
                    )}
                  />
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
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
      setAdmins([
        ...admins,
        { id: email, addedBy: auth.currentUser?.email, createdAt: new Date() },
      ]);
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
        <button onClick={addAdmin} className="bg-blue-600 text-black px-4 py-2 rounded-md hover:bg-blue-700 transition-all w-full sm:w-auto">
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
