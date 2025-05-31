import { auth, db } from "../../../../firebase";
import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import Upload from "../../../Pages/Upload";
import BlogEditorModal from "../../../Pages/BlogEditor";
import { FiUsers, FiMail, FiUpload, FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiCheck, FiX } from "react-icons/fi";
import './style.css'

const UnauthorizedAccess = ({ error }) => {
  return (
    <div className="unauthorized-access" style={{ padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '8px', margin: '20px' }}>
      <h3>Access Denied</h3>
      <p>{error || "You do not have permission to access this page."}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [users, setUsers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if the current user is an admin
  const checkAdminStatus = async (email) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    if (lowerEmail === "admin@shammarianas.com") return true;
    try {
      const adminDoc = await getDoc(doc(db, "adminUsers", lowerEmail));
      return adminDoc.exists();
    } catch (error) {
      console.error("Error checking admin status for email:", lowerEmail, error, { code: error.code, message: error.message });
      if (error.code === "permission-denied") {
        // Non-existent adminUsers collection or document; treat as non-admin
        return false;
      }
      setError(`Failed to verify admin privileges: ${error.message}`);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error, { code: error.code, message: error.message });
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
      const q = query(
        collection(db, `Profiles/${profileId}/Support`),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        profileId,
        ...doc.data(),
      }));
      setSupportMessages(messages);
    } catch (error) {
      console.error("Error fetching support messages for profileId:", profileId, error, { code: error.code, message: error.message });
      setError(`Failed to load support messages: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
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

        const isDevAdmin =
          process.env.NODE_ENV === "development" &&
          process.env.REACT_APP_DEV_ADMIN_EMAILS?.split(",")
            .map((e) => e.trim().toLowerCase())
            .includes(email);

        if (isDevAdmin || (await checkAdminStatus(email))) {
          setIsAdmin(true);
          fetchUsers();
          setSelectedProfileId(currentUser.uid);
          fetchSupportMessages(currentUser.uid);
        } else {
          setError("You do not have admin privileges");
        }
      } catch (error) {
        console.error("Error in auth state change:", error, { code: error.code, message: error.message });
        setError(`Failed to verify admin privileges: ${error.message}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!isAdmin) {
      setError("Only admins can change user roles");
      return;
    }
    if (window.confirm("Are you sure you want to change this user's role?")) {
      try {
        await updateDoc(doc(db, "Profiles", userId), { role: newRole });
        setUsers(users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } catch (error) {
        console.error("Error updating user role for userId:", userId, error, { code: error.code, message: error.message });
        setError(`Failed to update user role: ${error.message}`);
      }
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!isAdmin) {
      setError("Only admins can perform bulk role changes");
      return;
    }
    if (selectedUsers.length === 0) return;
    if (window.confirm(`Change role of ${selectedUsers.length} user(s) to ${newRole}?`)) {
      try {
        await Promise.all(
          selectedUsers.map((userId) =>
            updateDoc(doc(db, "Profiles", userId), { role: newRole })
          )
        );
        setUsers(users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, role: newRole } : user
        ));
        setSelectedUsers([]);
      } catch (error) {
        console.error("Error updating bulk user roles:", error, { code: error.code, message: error.message });
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
        setSupportMessages(supportMessages.map((msg) =>
          msg.id === messageId && msg.profileId === profileId ? { ...msg, status: newStatus } : msg
        ));
      } catch (error) {
        console.error("Error updating message status for profileId:", profileId, "messageId:", messageId, error, { code: error.code, message: error.message });
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
            return updateDoc(doc(db, `Profiles/${message.profileId}/Support`, messageId), {
              status: newStatus,
            });
          })
        );
        setSupportMessages(supportMessages.map((msg) =>
          selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg
        ));
        setSelectedMessages([]);
      } catch (error) {
        console.error("Error updating bulk message statuses:", error, { code: error.code, message: error.message });
        setError(`Failed to update message statuses: ${error.message}`);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter ? user.role === roleFilter : true)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredMessages = supportMessages.filter((msg) => {
    const matchesSearch =
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase());
    if (messageFilter === "all") return matchesSearch;
    return msg.status === messageFilter && matchesSearch;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter((user) => user.role === 'admin').length,
    pendingMessages: supportMessages.filter((msg) => msg.status === 'unopened').length,
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
          <li
            className={`menu-item ${activeTab === 1 ? "active" : ""}`}
            onClick={() => setActiveTab(1)}
          >
            <FiUsers className="menu-icon" />
            <span>Users</span>
          </li>
          <li
            className={`menu-item ${activeTab === 2 ? "active" : ""}`}
            onClick={() => setActiveTab(2)}
          >
            <FiMail className="menu-icon" />
            <span>Support</span>
          </li>
          <li
            className={`menu-item ${activeTab === 3 ? "active" : ""}`}
            onClick={() => setActiveTab(3)}
          >
            <FiUpload className="menu-icon" />
            <span>Uploads</span>
          </li>
          <li
            className={`menu-item ${activeTab === 4 ? "active" : ""}`}
            onClick={() => {
              setActiveTab(4);
              setIsModalOpen(true);
            }}
          >
            <FiFileText className="menu-icon" />
            <span>Blog</span>
          </li>
          <li
            className={`menu-item ${activeTab === 5 ? "active" : ""}`}
            onClick={() => setActiveTab(5)}
          >
            <FiUsers className="menu-icon" />
            <span>Admin Manager</span>
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
            {activeTab === 5 && "Admin Manager"}
          </h1>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={activeTab === 1 ? "Search users..." : "Search messages..."}
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
        </div>

        <div className="content-card">
          <div className="card-header">
            <div className="filters">
              {activeTab === 1 && (
                <>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                  <button
                    onClick={() => handleSort('email')}
                    className={`sort-button ${sortConfig.key === 'email' ? 'active' : ''}`}
                  >
                    Email {sortConfig.key === 'email' && (
                      sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('role')}
                    className={`sort-button ${sortConfig.key === 'role' ? 'active' : ''}`}
                  >
                    Role {sortConfig.key === 'role' && (
                      sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </button>
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
                      <option value="" disabled>Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={messageFilter}
                    onChange={(e) => setMessageFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Messages</option>
                    <option value="unopened">Unopened</option>
                    <option value="opened">Opened</option>
                    <option value="responded">Responded</option>
                  </select>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className={`sort-button ${sortConfig.key === 'createdAt' ? 'active' : ''}`}
                  >
                    Date {sortConfig.key === 'createdAt' && (
                      sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort('subject')}
                    className={`sort-button ${sortConfig.key === 'subject' ? 'active' : ''}`}
                  >
                    Subject {sortConfig.key === 'subject' && (
                      sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
                    )}
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
            {activeTab === 3 && <Upload />}
            {activeTab === 4 && (
              <BlogEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            )}
            {activeTab === 5 && (
              <AdminManager />
            )}
          </div>

          <div className="card-footer">
            <div className="pagination">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="page-nav"
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(Math.min(Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage)}
                className="page-nav"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {selectedMessage && (
          <MessageModal
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
};

const SupportList = ({ messages, onStatusChange, onMessageClick, selectedMessages, setSelectedMessages, handleBulkStatusChange }) => {
  const handleSelectMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter((id) => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg.id));
    }
  };

  return (
    <div className="table-container">
      {selectedMessages.length > 0 && (
        <div className="table-actions">
          <button
            onClick={() => handleBulkStatusChange('opened')}
            className="action-button"
          >
            Mark as Opened
          </button>
          <button
            onClick={() => handleBulkStatusChange('responded')}
            className="action-button"
          >
            Mark as Responded
          </button>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedMessages.length === messages.length && messages.length > 0}
                onChange={handleSelectAll}
              />
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
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(msg.id)}
                    onChange={() => handleSelectMessage(msg.id)}
                  />
                </td>
                <td onClick={() => onMessageClick(msg)} className="clickable">
                  {msg.subject}
                </td>
                <td>{msg.email}</td>
                <td>{msg.createdAt?.toDate().toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${msg.status}`}>
                    {msg.status}
                  </span>
                </td>
                <td>
                  <select
                    onChange={(e) => onStatusChange(msg.profileId, msg.id, e.target.value)}
                    value={msg.status}
                    className="status-select"
                  >
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
          <h3>{message.subject}</h3>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="message-meta">
            <div><strong>From:</strong> {message.email}</div>
            <div><strong>Date:</strong> {message.createdAt?.toDate().toLocaleString()}</div>
            <div className={`status-badge ${message.status}`}>{message.status}</div>
          </div>
          <div className="message-content">
            {message.description}
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={handleMarkAsOpened}
            disabled={message.status === "opened"}
            className={`action-button ${message.status === "opened" ? "disabled" : ""}`}
          >
            <FiCheck /> {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
          </button>
          <button
            onClick={handleMarkAsResponded}
            disabled={message.status === "responded"}
            className={`action-button ${message.status === "responded" ? "disabled" : ""}`}
          >
            <FiCheck /> {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserList = ({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange }) => {
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  return (
    <div className="table-container">
      {selectedUsers.length > 0 && (
        <div className="table-actions">
          <button
            onClick={() => handleBulkRoleChange('admin')}
            className="action-button"
          >
            Make Admin
          </button>
          <button
            onClick={() => handleBulkRoleChange('moderator')}
            className="action-button"
          >
            Make Moderator
          </button>
          <button
            onClick={() => handleBulkRoleChange('user')}
            className="action-button"
          >
            Make Regular User
          </button>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-data">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
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
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    value={user.role}
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

const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState("info");

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await getDocs(collection(db, "adminUsers"));
        setAdmins(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching admins:", error, { code: error.code, message: error.message });
        if (error.code === "permission-denied") {
          // Non-existent adminUsers collection; treat as empty
          setAdmins([]);
        } else {
          setLogMessage(`Failed to fetch admin list: ${error.message}`);
          setLogType("error");
        }
      }
    };
    if (currentUser) {
      fetchAdmins();
    }
  }, [currentUser]);

  const addAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) {
      setLogMessage("Email cannot be empty.");
      setLogType("error");
      return;
    }

    try {
      await setDoc(doc(db, "adminUsers", email), {
        addedBy: currentUser?.email || "unknown",
        createdAt: new Date(),
      });
      setAdmins([...admins, { id: email, addedBy: currentUser?.email, createdAt: new Date() }]);
      setNewAdminEmail("");
      setLogMessage(`Admin ${email} added successfully.`);
      setLogType("success");
    } catch (error) {
      console.error("Failed to add admin:", email, error, { code: error.code, message: error.message });
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
      console.error("Failed to remove admin:", email, error, { code: error.code, message: error.message });
      setLogMessage(`Failed to remove admin ${email}: ${error.message}`);
      setLogType("error");
    }
  };

  return (
    <div className="admin-manager">
      <h3>Admin Manager</h3>
      <input
        placeholder="Enter admin email"
        value={newAdminEmail}
        onChange={(e) => setNewAdminEmail(e.target.value)}
      />
      <button onClick={addAdmin}>Add Admin</button>
      {logMessage && (
        <div
          style={{
            marginTop: "10px",
            color: logType === "success" ? "green" : logType === "error" ? "red" : "black",
          }}
        >
          {logMessage}
        </div>
      )}
      <ul style={{ marginTop: "20px" }}>
        {admins.map((admin) => (
          <li key={admin.id}>
            {admin.id}
            <button style={{ marginLeft: "10px" }} onClick={() => removeAdmin(admin.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;


// import { auth, db } from "../../../../firebase";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   doc,
//   getDoc,
//   getDocs,
//   collection,
//   updateDoc,
//   setDoc,
//   deleteDoc,
//   orderBy,
//   query,
// } from "firebase/firestore";
// import Upload from "../../../Pages/Upload";
// import BlogEditorModal from "../../../Pages/BlogEditor";
// import { FiUsers, FiMail, FiUpload, FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiCheck, FiX } from "react-icons/fi";
// import './style.css'

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState(1);
//   const [users, setUsers] = useState([]);
//   const [supportMessages, setSupportMessages] = useState([]);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [messageFilter, setMessageFilter] = useState("all");
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [selectedMessages, setSelectedMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
//   const [isAdmin, setIsAdmin] = useState(false); // Track admin status
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Check if the current user is an admin
//   const checkAdminStatus = async (email) => {
//     if (!email) return false;
//     const lowerEmail = email.toLowerCase();
//     if (lowerEmail === "admin@shammarianas.com") return true;
//     const adminDoc = await getDoc(doc(db, "adminUsers", lowerEmail));
//     return adminDoc.exists();
//   };

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const querySnapshot = await getDocs(collection(db, "Profiles"));
//       const userList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setUsers(userList);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       setError("Failed to load users: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Modified to fetch Support as a subcollection under Profiles
//   const fetchSupportMessages = async (userId) => {
//     setLoading(true);
//     try {
//       // Assuming Support is a subcollection under Profiles/{profileId}/Support
//       const q = query(
//         collection(db, `Profiles/${userId}/Support`),
//         orderBy("createdAt", "desc")
//       );
//       const querySnapshot = await getDocs(q);
//       const messages = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setSupportMessages(messages);
//     } catch (error) {
//       console.error("Error fetching support messages:", error);
//       setError("Failed to load support messages: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchCurrentUserRole = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           setError("Please log in to access the admin dashboard");
//           navigate("/login");
//           return;
//         }

//         const email = currentUser.email?.toLowerCase();
//         const isDevAdmin =
//           process.env.NODE_ENV === "development" &&
//           process.env.REACT_APP_DEV_ADMIN_EMAILS?.split(",")
//             .map((e) => e.trim().toLowerCase())
//             .includes(email);

//         if (isDevAdmin || (await checkAdminStatus(email))) {
//           setIsAdmin(true);
//           fetchUsers();
//           fetchSupportMessages(currentUser.uid); // Pass userId for Support subcollection
//         } else {
//           setError("You do not have admin privileges");
//           navigate("/unauthorized");
//         }
//       } catch (error) {
//         console.error("Error checking admin status:", error);
//         setError("Failed to verify admin privileges: " + error.message);
//       }
//     };

//     fetchCurrentUserRole();
//   }, [navigate]);

//   const handleRoleChange = async (userId, newRole) => {
//     if (!isAdmin) {
//       setError("Only admins can change user roles");
//       return;
//     }
//     if (window.confirm("Are you sure you want to change this user's role?")) {
//       try {
//         await updateDoc(doc(db, "Profiles", userId), { role: newRole });
//         setUsers(users.map((user) =>
//           user.id === userId ? { ...user, role: newRole } : user
//         ));
//       } catch (error) {
//         console.error("Error updating role:", error);
//         setError("Failed to update user role: " + error.message);
//       }
//     }
//   };

//   const handleBulkRoleChange = async (newRole) => {
//     if (!isAdmin) {
//       setError("Only admins can perform bulk role changes");
//       return;
//     }
//     if (selectedUsers.length === 0) return;
//     if (window.confirm(`Change role of ${selectedUsers.length} user(s) to ${newRole}?`)) {
//       try {
//         await Promise.all(
//           selectedUsers.map((userId) =>
//             updateDoc(doc(db, "Profiles", userId), { role: newRole })
//           )
//         );
//         setUsers(users.map((user) =>
//           selectedUsers.includes(user.id) ? { ...user, role: newRole } : user
//         ));
//         setSelectedUsers([]);
//       } catch (error) {
//         console.error("Error updating roles:", error);
//         setError("Failed to update user roles: " + error.message);
//       }
//     }
//   };

//   const handleStatusChange = async (messageId, newStatus) => {
//     if (!isAdmin) {
//       setError("Only admins can change message status");
//       return;
//     }
//     if (window.confirm("Are you sure you want to change this message's status?")) {
//       try {
//         await updateDoc(doc(db, `Profiles/${auth.currentUser.uid}/Support`, messageId), {
//           status: newStatus,
//         });
//         setSupportMessages(supportMessages.map((msg) =>
//           msg.id === messageId ? { ...msg, status: newStatus } : msg
//         ));
//       } catch (error) {
//         console.error("Error updating message status:", error);
//         setError("Failed to update message status: " + error.message);
//       }
//     }
//   };

//   const handleBulkStatusChange = async (newStatus) => {
//     if (!isAdmin) {
//       setError("Only admins can perform bulk status changes");
//       return;
//     }
//     if (selectedMessages.length === 0) return;
//     if (window.confirm(`Change status of ${selectedMessages.length} message(s) to ${newStatus}?`)) {
//       try {
//         await Promise.all(
//           selectedMessages.map((messageId) =>
//             updateDoc(doc(db, `Profiles/${auth.currentUser.uid}/Support`, messageId), {
//               status: newStatus,
//             })
//           )
//         );
//         setSupportMessages(supportMessages.map((msg) =>
//           selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg
//         ));
//         setSelectedMessages([]);
//       } catch (error) {
//         console.error("Error updating statuses:", error);
//         setError("Failed to update message statuses: " + error.message);
//       }
//     }
//   };

//   const handleSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const filteredUsers = users.filter((user) =>
//     user.email.toLowerCase().includes(search.toLowerCase()) &&
//     (roleFilter ? user.role === roleFilter : true)
//   );

//   const sortedUsers = [...filteredUsers].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     if (a[sortConfig.key] < b[sortConfig.key]) {
//       return sortConfig.direction === 'ascending' ? -1 : 1;
//     }
//     if (a[sortConfig.key] > b[sortConfig.key]) {
//       return sortConfig.direction === 'ascending' ? 1 : -1;
//     }
//     return 0;
//   });

//   const filteredMessages = supportMessages.filter((msg) => {
//     const matchesSearch =
//       msg.subject.toLowerCase().includes(search.toLowerCase()) ||
//       msg.email.toLowerCase().includes(search.toLowerCase());
//     if (messageFilter === "all") return matchesSearch;
//     return msg.status === messageFilter && matchesSearch;
//   });

//   const sortedMessages = [...filteredMessages].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     if (a[sortConfig.key] < b[sortConfig.key]) {
//       return sortConfig.direction === 'ascending' ? -1 : 1;
//     }
//     if (a[sortConfig.key] > b[sortConfig.key]) {
//       return sortConfig.direction === 'ascending' ? 1 : -1;
//     }
//     return 0;
//   });

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
//   const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const stats = {
//     totalUsers: users.length,
//     totalAdmins: users.filter((user) => user.role === 'admin').length,
//     pendingMessages: supportMessages.filter((msg) => msg.status === 'unopened').length,
//   };

//   return (
//     <div className="admin-dashboard">
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <h2>Admin Panel</h2>
//         </div>
//         <ul className="sidebar-menu">
//           <li
//             className={`menu-item ${activeTab === 1 ? "active" : ""}`}
//             onClick={() => setActiveTab(1)}
//           >
//             <FiUsers className="menu-icon" />
//             <span>Users</span>
//           </li>
//           <li
//             className={`menu-item ${activeTab === 2 ? "active" : ""}`}
//             onClick={() => setActiveTab(2)}
//           >
//             <FiMail className="menu-icon" />
//             <span>Support</span>
//           </li>
//           <li
//             className={`menu-item ${activeTab === 3 ? "active" : ""}`}
//             onClick={() => setActiveTab(3)}
//           >
//             <FiUpload className="menu-icon" />
//             <span>Uploads</span>
//           </li>
//           <li
//             className={`menu-item ${activeTab === 4 ? "active" : ""}`}
//             onClick={() => {
//               setActiveTab(4);
//               setIsModalOpen(true);
//             }}
//           >
//             <FiFileText className="menu-icon" />
//             <span>Blog</span>
//           </li>
//           <li
//             className={`menu-item ${activeTab === 5 ? "active" : ""}`}
//             onClick={() => setActiveTab(5)}
//           >
//             <FiUsers className="menu-icon" />
//             <span>Admin Manager</span>
//           </li>
//         </ul>
//       </div>

//       <div className="main-content">
//         <div className="header">
//           <h1 className="page-title">
//             {activeTab === 1 && "User Management"}
//             {activeTab === 2 && "Support Messages"}
//             {activeTab === 3 && "File Uploads"}
//             {activeTab === 4 && "Blog Editor"}
//             {activeTab === 5 && "Admin Manager"}
//           </h1>
//           <div className="search-bar">
//             <FiSearch className="search-icon" />
//             <input
//               type="text"
//               placeholder={activeTab === 1 ? "Search users..." : "Search messages..."}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {error && (
//           <div className="error-alert">
//             {error}
//             <button onClick={() => setError(null)} className="close-error">
//               <FiX />
//             </button>
//           </div>
//         )}

//         {loading && <div className="loading-overlay">Loading...</div>}

//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-value">{stats.totalUsers}</div>
//             <div className="stat-label">Total Users</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value">{stats.totalAdmins}</div>
//             <div className="stat-label">Admins</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-value">{stats.pendingMessages}</div>
//             <div className="stat-label">Pending Messages</div>
//           </div>
//         </div>

//         <div className="content-card">
//           <div className="card-header">
//             <div className="filters">
//               {activeTab === 1 && (
//                 <>
//                   <select
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                     className="filter-select"
//                   >
//                     <option value="">All Roles</option>
//                     <option value="admin">Admin</option>
//                     <option value="moderator">Moderator</option>
//                     <option value="user">User</option>
//                   </select>
//                   <button
//                     onClick={() => handleSort('email')}
//                     className={`sort-button ${sortConfig.key === 'email' ? 'active' : ''}`}
//                   >
//                     Email {sortConfig.key === 'email' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
//                     )}
//                   </button>
//                   <button
//                     onClick={() => handleSort('role')}
//                     className={`sort-button ${sortConfig.key === 'role' ? 'active' : ''}`}
//                   >
//                     Role {sortConfig.key === 'role' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
//                     )}
//                   </button>
//                 </>
//               )}

//               {activeTab === 2 && (
//                 <>
//                   <select
//                     value={messageFilter}
//                     onChange={(e) => setMessageFilter(e.target.value)}
//                     className="filter-select"
//                   >
//                     <option value="all">All Messages</option>
//                     <option value="unopened">Unopened</option>
//                     <option value="opened">Opened</option>
//                     <option value="responded">Responded</option>
//                   </select>
//                   <button
//                     onClick={() => handleSort('createdAt')}
//                     className={`sort-button ${sortConfig.key === 'createdAt' ? 'active' : ''}`}
//                   >
//                     Date {sortConfig.key === 'createdAt' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
//                     )}
//                   </button>
//                   <button
//                     onClick={() => handleSort('subject')}
//                     className={`sort-button ${sortConfig.key === 'subject' ? 'active' : ''}`}
//                   >
//                     Subject {sortConfig.key === 'subject' && (
//                       sortConfig.direction === 'ascending' ? <FiChevronUp /> : <FiChevronDown />
//                     )}
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>

//           <div className="card-body">
//             {activeTab === 1 && (
//               <UserList
//                 users={currentUsers}
//                 onRoleChange={handleRoleChange}
//                 selectedUsers={selectedUsers}
//                 setSelectedUsers={setSelectedUsers}
//                 handleBulkRoleChange={handleBulkRoleChange}
//               />
//             )}
//             {activeTab === 2 && (
//               <SupportList
//                 messages={currentMessages}
//                 onStatusChange={handleStatusChange}
//                 onMessageClick={setSelectedMessage}
//                 selectedMessages={selectedMessages}
//                 setSelectedMessages={setSelectedMessages}
//                 handleBulkStatusChange={handleBulkStatusChange}
//               />
//             )}
//             {activeTab === 3 && <Upload />}
//             {activeTab === 4 && (
//               <BlogEditorModal
//                 isOpen={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//               />
//             )}
//             {activeTab === 5 && (
//               <AdminManager />
//             )}
//           </div>

//           <div className="card-footer">
//             <div className="pagination">
//               <button
//                 onClick={() => paginate(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//                 className="page-nav"
//               >
//                 Previous
//               </button>
//               {Array.from({ length: Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage) }, (_, i) => (
//                 <button
//                   key={i + 1}
//                   onClick={() => paginate(i + 1)}
//                   className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={() => paginate(Math.min(Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage), currentPage + 1))}
//                 disabled={currentPage === Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage)}
//                 className="page-nav"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>

//         {selectedMessage && (
//           <MessageModal
//             message={selectedMessage}
//             onClose={() => setSelectedMessage(null)}
//             onStatusChange={handleStatusChange}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// const SupportList = ({ messages, onStatusChange, onMessageClick, selectedMessages, setSelectedMessages, handleBulkStatusChange }) => {
//   const handleSelectMessage = (messageId) => {
//     if (selectedMessages.includes(messageId)) {
//       setSelectedMessages(selectedMessages.filter((id) => id !== messageId));
//     } else {
//       setSelectedMessages([...selectedMessages, messageId]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedMessages.length === messages.length) {
//       setSelectedMessages([]);
//     } else {
//       setSelectedMessages(messages.map((msg) => msg.id));
//     }
//   };

//   return (
//     <div className="table-container">
//       {selectedMessages.length > 0 && (
//         <div className="table-actions">
//           <button
//             onClick={() => handleBulkStatusChange('opened')}
//             className="action-button"
//           >
//             Mark as Opened
//           </button>
//           <button
//             onClick={() => handleBulkStatusChange('responded')}
//             className="action-button"
//           >
//             Mark as Responded
//           </button>
//         </div>
//       )}

//       <table className="data-table">
//         <thead>
//           <tr>
//             <th>
//               <input
//                 type="checkbox"
//                 checked={selectedMessages.length === messages.length && messages.length > 0}
//                 onChange={handleSelectAll}
//               />
//             </th>
//             <th>Subject</th>
//             <th>From</th>
//             <th>Date</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {messages.length === 0 ? (
//             <tr>
//               <td colSpan="6" className="no-data">No messages found</td>
//             </tr>
//           ) : (
//             messages.map((msg) => (
//               <tr key={msg.id} className={`status-${msg.status}`}>
//                 <td>
//                   <input
//                     type="checkbox"
//                     checked={selectedMessages.includes(msg.id)}
//                     onChange={() => handleSelectMessage(msg.id)}
//                   />
//                 </td>
//                 <td onClick={() => onMessageClick(msg)} className="clickable">
//                   {msg.subject}
//                 </td>
//                 <td>{msg.email}</td>
//                 <td>{msg.createdAt?.toDate().toLocaleDateString()}</td>
//                 <td>
//                   <span className={`status-badge ${msg.status}`}>
//                     {msg.status}
//                   </span>
//                 </td>
//                 <td>
//                   <select
//                     onChange={(e) => onStatusChange(msg.id, e.target.value)}
//                     value={msg.status}
//                     className="status-select"
//                   >
//                     <option value="unopened">Unopened</option>
//                     <option value="opened">Opened</option>
//                     <option value="responded">Responded</option>
//                   </select>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const MessageModal = ({ message, onClose, onStatusChange }) => {
//   const handleMarkAsOpened = () => {
//     if (message.status !== "opened") {
//       onStatusChange(message.id, "opened");
//     }
//   };

//   const handleMarkAsResponded = () => {
//     onStatusChange(message.id, "responded");
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h3>{message.subject}</h3>
//           <button onClick={onClose} className="close-button">
//             <FiX />
//           </button>
//         </div>
//         <div className="modal-body">
//           <div className="message-meta">
//             <div><strong>From:</strong> {message.email}</div>
//             <div><strong>Date:</strong> {message.createdAt?.toDate().toLocaleString()}</div>
//             <div className={`status-badge ${message.status}`}>{message.status}</div>
//           </div>
//           <div className="message-content">
//             {message.description}
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button
//             onClick={handleMarkAsOpened}
//             disabled={message.status === "opened"}
//             className={`action-button ${message.status === "opened" ? "disabled" : ""}`}
//           >
//             <FiCheck /> {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
//           </button>
//           <button
//             onClick={handleMarkAsResponded}
//             disabled={message.status === "responded"}
//             className={`action-button ${message.status === "responded" ? "disabled" : ""}`}
//           >
//             <FiCheck /> {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const UserList = ({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange }) => {
//   const handleSelectUser = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter((id) => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedUsers.length === users.length) {
//       setSelectedUsers([]);
//     } else {
//       setSelectedUsers(users.map((user) => user.id));
//     }
//   };

//   return (
//     <div className="table-container">
//       {selectedUsers.length > 0 && (
//         <div className="table-actions">
//           <button
//             onClick={() => handleBulkRoleChange('admin')}
//             className="action-button"
//           >
//             Make Admin
//           </button>
//           <button
//             onClick={() => handleBulkRoleChange('moderator')}
//             className="action-button"
//           >
//             Make Moderator
//           </button>
//           <button
//             onClick={() => handleBulkRoleChange('user')}
//             className="action-button"
//           >
//             Make Regular User
//           </button>
//         </div>
//       )}

//       <table className="data-table">
//         <thead>
//           <tr>
//             <th>
//               <input
//                 type="checkbox"
//                 checked={selectedUsers.length === users.length && users.length > 0}
//                 onChange={handleSelectAll}
//               />
//             </th>
//             <th>Email</th>
//             <th>Current Role</th>
//             <th>Change Role</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.length === 0 ? (
//             <tr>
//               <td colSpan="4" className="no-data">No users found</td>
//             </tr>
//           ) : (
//             users.map((user) => (
//               <tr key={user.id}>
//                 <td>
//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.includes(user.id)}
//                     onChange={() => handleSelectUser(user.id)}
//                   />
//                 </td>
//                 <td>{user.email}</td>
//                 <td>
//                   <span className={`role-badge ${user.role}`}>
//                     {user.role}
//                   </span>
//                 </td>
//                 <td>
//                   <select
//                     onChange={(e) => onRoleChange(user.id, e.target.value)}
//                     value={user.role}
//                     className="role-select"
//                   >
//                     <option value="admin">Admin</option>
//                     <option value="moderator">Moderator</option>
//                     <option value="user">User</option>
//                   </select>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const AdminManager = () => {
//   const [admins, setAdmins] = useState([]);
//   const [newAdminEmail, setNewAdminEmail] = useState("");
//   const [logMessage, setLogMessage] = useState("");
//   const [logType, setLogType] = useState("info");

//   const currentUser = auth.currentUser;

//   useEffect(() => {
//     const fetchAdmins = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "adminUsers"));
//         setAdmins(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//       } catch (error) {
//         console.error("Error fetching admins:", error);
//         setLogMessage("Failed to fetch admin list: " + error.message);
//         setLogType("error");
//       }
//     };
//     if (currentUser) {
//       fetchAdmins();
//     }
//   }, [currentUser]);

//   const addAdmin = async () => {
//     const email = newAdminEmail.trim().toLowerCase();
//     if (!email) {
//       setLogMessage("Email cannot be empty.");
//       setLogType("error");
//       return;
//     }

//     try {
//       await setDoc(doc(db, "adminUsers", email), {
//         addedBy: currentUser?.email || "unknown",
//         createdAt: new Date(),
//       });
//       setAdmins([...admins, { id: email, addedBy: currentUser?.email, createdAt: new Date() }]);
//       setNewAdminEmail("");
//       setLogMessage(`Admin ${email} added successfully.`);
//       setLogType("success");
//     } catch (error) {
//       console.error("Failed to add admin:", error);
//       setLogMessage(`Failed to add admin ${email}: ${error.message}`);
//       setLogType("error");
//     }
//   };

//   const removeAdmin = async (email) => {
//     if (!window.confirm(`Remove admin: ${email}?`)) return;

//     try {
//       await deleteDoc(doc(db, "adminUsers", email));
//       setAdmins(admins.filter((a) => a.id !== email));
//       setLogMessage(`Admin ${email} removed successfully.`);
//       setLogType("success");
//     } catch (error) {
//       console.error("Failed to remove admin:", error);
//       setLogMessage(`Failed to remove admin ${email}: ${error.message}`);
//       setLogType("error");
//     }
//   };

//   return (
//     <div className="admin-manager">
//       <h3>Admin Manager</h3>
//       <input
//         placeholder="Enter admin email"
//         value={newAdminEmail}
//         onChange={(e) => setNewAdminEmail(e.target.value)}
//       />
//       <button onClick={addAdmin}>Add Admin</button>
//       {logMessage && (
//         <div
//           style={{
//             marginTop: "10px",
//             color: logType === "success" ? "green" : logType === "error" ? "red" : "black",
//           }}
//         >
//           {logMessage}
//         </div>
//       )}
//       <ul style={{ marginTop: "20px" }}>
//         {admins.map((admin) => (
//           <li key={admin.id}>
//             {admin.id}
//             <button style={{ marginLeft: "10px" }} onClick={() => removeAdmin(admin.id)}>
//               Remove
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AdminDashboard;