// import { auth, db } from "../../../firebase";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   doc,
//   getDoc,
//   getDocs,
//   collection,
//   updateDoc,
//   orderBy,
//   query,
// } from "firebase/firestore";

// function Tab() {
//   // ... existing state and functions ...
//   const [activeTab, setActiveTab] = useState(1);
//   const [users, setUsers] = useState([]);
//   const [supportMessages, setSupportMessages] = useState([]);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [messageFilter, setMessageFilter] = useState("all");
//   const [selectedMessage, setSelectedMessage] = useState(null); // Track selected message for modal
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCurrentUserRole = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           navigate("/unauthorized");
//           return;
//         }
//         const userDoc = await getDoc(doc(db, "Profiles", currentUser.uid));
//         if (!userDoc.exists() || userDoc.data().role !== "admin") {
//           navigate("/unauthorized");
//           return;
//         }
//         fetchUsers();
//         fetchSupportMessages();
//       } catch (error) {
//         console.error("Error checking user role:", error);
//       }
//     };

//     const fetchUsers = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "Profiles"));
//         const userList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setUsers(userList);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     const fetchSupportMessages = async () => {
//       try {
//         const q = query(collection(db, "Support"), orderBy("createdAt", "desc"));
//         const querySnapshot = await getDocs(q);
//         const messages = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setSupportMessages(messages);
//       } catch (error) {
//         console.error("Error fetching support messages:", error);
//       }
//     };

//     fetchCurrentUserRole();
//   }, [navigate]);

//   const handleRoleChange = async (userId, newRole) => {
//     try {
//       await updateDoc(doc(db, "Profiles", userId), { role: newRole });
//       setUsers((users) =>
//         users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
//       );
//     } catch (error) {
//       console.error("Error updating role:", error);
//     }
//   };

//   const handleStatusChange = async (messageId, newStatus) => {
//     try {
//       await updateDoc(doc(db, "Support", messageId), { status: newStatus });
//       setSupportMessages((messages) =>
//         messages.map((msg) =>
//           msg.id === messageId ? { ...msg, status: newStatus } : msg
//         )
//       );
//     } catch (error) {
//       console.error("Error updating message status:", error);
//     }
//   };

//   const filteredUsers = users.filter(
//     (user) =>
//       user.email.toLowerCase().includes(search.toLowerCase()) &&
//       (roleFilter ? user.role === roleFilter : true)
//   );

//   const filteredMessages = supportMessages.filter((msg) => {
//     const matchesSearch = msg.subject.toLowerCase().includes(search.toLowerCase());
//     if (messageFilter === "all") return matchesSearch;
//     return msg.status === messageFilter && matchesSearch;
//   });


//   return (
//     <div className="tab-container">
//       <ul className="tab-list">
//         <li 
//           className={`tab-item ${activeTab === 1 ? "active" : ""}`} 
//           onClick={() => setActiveTab(1)}
//         >
//           Admins
//         </li>
//         <li 
//           className={`tab-item ${activeTab === 2 ? "active" : ""}`} 
//           onClick={() => setActiveTab(2)}
//         >
//           Support Messages
//         </li>
//       </ul>

//       <input
//         type="text"
//         placeholder={activeTab === 1 ? "Search by email" : "Search by subject"}
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="search-input"
//       />

//       {activeTab === 1 && (
//         <select 
//           value={roleFilter} 
//           onChange={(e) => setRoleFilter(e.target.value)}
//           className="filter-select"
//         >
//           <option value="">All Roles</option>
//           <option value="admin">Admin</option>
//           <option value="moderator">Moderator</option>
//           <option value="user">User</option>
//         </select>
//       )}

//       {activeTab === 2 && (
//         <select 
//           value={messageFilter} 
//           onChange={(e) => setMessageFilter(e.target.value)}
//           className="filter-select"
//         >
//           <option value="all">All Messages</option>
//           <option value="unopened">Unopened</option>
//           <option value="opened">Opened</option>
//           <option value="responded">Responded</option>
//         </select>
//       )}

//       <div className="tab-content">
//         {activeTab === 1 && <UserList users={filteredUsers} onRoleChange={handleRoleChange} />}
//         {activeTab === 2 && (
//           <SupportList 
//             messages={filteredMessages} 
//             onStatusChange={handleStatusChange} 
//             onMessageClick={setSelectedMessage}
//           />
//         )}
//       </div>

//       {selectedMessage && (
//         <MessageModal 
//           message={selectedMessage} 
//           onClose={() => setSelectedMessage(null)} 
//           onStatusChange={handleStatusChange}
//         />
//       )}
//     </div>
//   );
// }

// function SupportList({ messages, onStatusChange, onMessageClick }) {
//   return (
//     <div className="support-list">
//       <h2 className="section-title">Support Messages</h2>
//       <ul className="message-list">
//         {messages.map((msg) => (
//           <li 
//             key={msg.id} 
//             onClick={() => onMessageClick(msg)} 
//             className="message-item"
//           >
//             <strong className="message-subject">{msg.subject}</strong> - 
//             <span className="message-status">{msg.status}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// function MessageModal({ message, onClose, onStatusChange }) {
//   // ... existing modal logic ...
//   console.log({message})
//   const handleMarkAsOpened = () => {
//     if (message.status !== "opened") {
//       onStatusChange(message.id, "opened");
//     }
//   };

//   const handleMarkAsResponded = () => {
//     onStatusChange(message.id, "responded");
//   };


//   return (
//   <div className="modal-overlay">
//     <div className="modal-content">
//       <h2 className="modal-title">{message.subject}</h2>
//       <p className="modal-meta"><strong>From:</strong> {message.email}</p>
//       <p className="modal-meta"><strong>Date:</strong> {new Date(message.createdAt?.toDate()).toLocaleString()}</p>
//       <p className="modal-description">{message.description}</p>
//       <div className="modal-actions">
//         <button 
//           onClick={handleMarkAsOpened} 
//           disabled={message.status === "opened"}
//           className={`action-button ${message.status === "opened" ? "disabled" : ""}`}
//         >
//           {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
//         </button>
//         <button 
//           onClick={handleMarkAsResponded} 
//           disabled={message.status === "responded"}
//           className={`action-button ${message.status === "responded" ? "disabled" : ""}`}
//         >
//           {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
//         </button>
//         <button 
//           onClick={onClose} 
//           className="action-button"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// );

// }

// function UserList({ users, onRoleChange }) {
//   return (
//     <div className="user-list">
//       <h2 className="section-title">User Management</h2>
//       <ul className="user-list-items">
//         {users.map(user => (
//           <li 
//             key={user.id} 
//             className="user-item"
//           >
//             <span className="user-email">{user.email}</span> - 
//             <span className="user-role">{user.role}</span>
//             <select 
//               onChange={(e) => onRoleChange(user.id, e.target.value)} 
//               value={user.role}
//               className="role-select"
//             >
//               <option value="admin">Admin</option>
//               <option value="moderator">Moderator</option>
//               <option value="user">User</option>
//             </select>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Tab;

import { auth, db } from "../../../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";

function Tab() {
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const currentUser = auth.currentUser;
      
        const userDoc = await getDoc(doc(db, "Profiles", currentUser.uid));
        if (!currentUser || !userDoc.exists() || userDoc.data().role !== "admin") {
          navigate("/unauthorized");
          return;
        }
        fetchUsers();
        fetchSupportMessages();
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Profiles"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchSupportMessages = async () => {
      try {
        const q = query(collection(db, "Support"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSupportMessages(messages);
      } catch (error) {
        console.error("Error fetching support messages:", error);
      }
    };

    fetchCurrentUserRole();
  }, [navigate]);

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm("Are you sure you want to change this user's role?")) {
      try {
        await updateDoc(doc(db, "Profiles", userId), { role: newRole });
        setUsers((users) =>
          users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
      } catch (error) {
        console.error("Error updating role:", error);
      }
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    if (window.confirm("Are you sure you want to change this message's status?")) {
      try {
        await updateDoc(doc(db, "Support", messageId), { status: newStatus });
        setSupportMessages((messages) =>
          messages.map((msg) =>
            msg.id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} users to ${newRole}?`)) {
      try {
        await Promise.all(selectedUsers.map(userId => 
          updateDoc(doc(db, "Profiles", userId), { role: newRole })
        )); // Added closing parenthesis here
        setUsers((users) =>
          users.map((user) => (selectedUsers.includes(user.id) ? { ...user, role: newRole } : user))
        );
        setSelectedUsers([]);
      } catch (error) {
        console.error("Error updating roles:", error);
      }
    }
  };
  
  const handleBulkStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to change the status of ${selectedMessages.length} messages to ${newStatus}?`)) {
      try {
        await Promise.all(selectedMessages.map(messageId => 
          updateDoc(doc(db, "Support", messageId), { status: newStatus })
        )); // Added closing parenthesis here
        setSupportMessages((messages) =>
          messages.map((msg) => (selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg))
        );
        setSelectedMessages([]);
      } catch (error) {
        console.error("Error updating statuses:", error);
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

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter ? user.role === roleFilter : true)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredMessages = supportMessages.filter((msg) => {
    const matchesSearch = msg.subject.toLowerCase().includes(search.toLowerCase());
    if (messageFilter === "all") return matchesSearch;
    return msg.status === messageFilter && matchesSearch;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
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
    totalAdmins: users.filter(user => user.role === 'admin').length,
    pendingMessages: supportMessages.filter(msg => msg.status === 'unopened').length,
  };

  return (
    <div className="tab-container">
      <ul className="tab-list">
        <li 
          className={`tab-item ${activeTab === 1 ? "active" : ""}`} 
          onClick={() => setActiveTab(1)}
        >
          Admins
        </li>
        <li 
          className={`tab-item ${activeTab === 2 ? "active" : ""}`} 
          onClick={() => setActiveTab(2)}
        >
          Support Messages
        </li>
      </ul>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Total Users:</span>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Admins:</span>
          <span className="stat-value">{stats.totalAdmins}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending Messages:</span>
          <span className="stat-value">{stats.pendingMessages}</span>
        </div>
      </div>

      <input
        type="text"
        placeholder={activeTab === 1 ? "Search by email or name" : "Search by subject"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {activeTab === 1 && (
        <div className="filters">
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
          <button onClick={() => handleSort('email')} className="sort-button">Sort by Email</button>
          <button onClick={() => handleSort('role')} className="sort-button">Sort by Role</button>
          <button onClick={() => handleSort('createdAt')} className="sort-button">Sort by Registration Date</button>
        </div>
      )}

      {activeTab === 2 && (
        <div className="filters">
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
          <button onClick={() => handleSort('createdAt')} className="sort-button">Sort by Date</button>
          <button onClick={() => handleSort('status')} className="sort-button">Sort by Status</button>
          <button onClick={() => handleSort('subject')} className="sort-button">Sort by Subject</button>
        </div>
      )}

      <div className="tab-content">
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
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil((activeTab === 1 ? filteredUsers.length : filteredMessages.length) / itemsPerPage) }, (_, i) => (
          <button key={i + 1} onClick={() => paginate(i + 1)} className="page-item">
            {i + 1}
          </button>
        ))}
      </div>

      {selectedMessage && (
        <MessageModal 
          message={selectedMessage} 
          onClose={() => setSelectedMessage(null)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

function SupportList({ messages, onStatusChange, onMessageClick, selectedMessages, setSelectedMessages, handleBulkStatusChange }) {
  const handleSelectMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  return (
    <div className="support-list">
      <h2 className="section-title">Support Messages</h2>
      <div className="bulk-actions">
        <button onClick={() => handleBulkStatusChange('opened')} className="bulk-action-button">Mark as Opened</button>
        <button onClick={() => handleBulkStatusChange('responded')} className="bulk-action-button">Mark as Responded</button>
      </div>
      <ul className="message-list">
        {messages.map((msg) => (
          <li 
            key={msg.id} 
            onClick={() => onMessageClick(msg)} 
            className={`message-item ${msg.status}`}
          >
            <input 
              type="checkbox" 
              checked={selectedMessages.includes(msg.id)} 
              onChange={() => handleSelectMessage(msg.id)} 
              onClick={(e) => e.stopPropagation()}
              className="message-checkbox"
            />
            <strong className="message-subject">{msg.subject}</strong> - 
            <span className={`message-status ${msg.status}`}>{msg.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageModal({ message, onClose, onStatusChange }) {
  const handleMarkAsOpened = () => {
    if (message.status !== "opened") {
      onStatusChange(message.id, "opened");
    }
  };

  const handleMarkAsResponded = () => {
    onStatusChange(message.id, "responded");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{message.subject}</h2>
        <p className="modal-meta"><strong>From:</strong> {message.email}</p>
        <p className="modal-meta"><strong>Date:</strong> {new Date(message.createdAt?.toDate()).toLocaleString()}</p>
        <p className="modal-description">{message.description}</p>
        <div className="modal-actions">
          <button 
            onClick={handleMarkAsOpened} 
            disabled={message.status === "opened"}
            className={`action-button ${message.status === "opened" ? "disabled" : ""}`}
          >
            {message.status === "opened" ? "Already Opened" : "Mark as Opened"}
          </button>
          <button 
            onClick={handleMarkAsResponded} 
            disabled={message.status === "responded"}
            className={`action-button ${message.status === "responded" ? "disabled" : ""}`}
          >
            {message.status === "responded" ? "Already Responded" : "Mark as Responded"}
          </button>
          <button 
            onClick={onClose} 
            className="action-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function UserList({ users, onRoleChange, selectedUsers, setSelectedUsers, handleBulkRoleChange }) {
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="user-list">
      <h2 className="section-title">User Management</h2>
      <div className="bulk-actions">
        <button onClick={() => handleBulkRoleChange('admin')} className="bulk-action-button">Make Admin</button>
        <button onClick={() => handleBulkRoleChange('moderator')} className="bulk-action-button">Make Moderator</button>
        <button onClick={() => handleBulkRoleChange('user')} className="bulk-action-button">Make User</button>
      </div>
      <ul className="user-list-items">
        {users.map(user => (
          <li 
            key={user.id} 
            className={`user-item ${user.role}`}
          >
            <input 
              type="checkbox" 
              checked={selectedUsers.includes(user.id)} 
              onChange={() => handleSelectUser(user.id)} 
              className="user-checkbox"
            />
            <span className="user-email">{user.email}</span> - 
            <span className={`user-role ${user.role}`}>{user.role}</span>
            <select 
              onChange={(e) => onRoleChange(user.id, e.target.value)} 
              value={user.role}
              className="role-select"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tab;