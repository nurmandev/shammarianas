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
  const [selectedMessage, setSelectedMessage] = useState(null); // Track selected message for modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate("/unauthorized");
          return;
        }
        const userDoc = await getDoc(doc(db, "Profiles", currentUser.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
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
    try {
      await updateDoc(doc(db, "Profiles", userId), { role: newRole });
      setUsers((users) =>
        users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
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
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter ? user.role === roleFilter : true)
  );

  const filteredMessages = supportMessages.filter((msg) => {
    const matchesSearch = msg.subject.toLowerCase().includes(search.toLowerCase());
    if (messageFilter === "all") return matchesSearch;
    return msg.status === messageFilter && matchesSearch;
  });

  return (
    <div className="tab-container">
      <ul className="tab-list">
        <li className={activeTab === 1 ? "active" : ""} onClick={() => setActiveTab(1)}>
          Admins
        </li>
        <li className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
          Support Messages
        </li>
      </ul>

      <input
        type="text"
        placeholder={activeTab === 1 ? "Search by email" : "Search by subject"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {activeTab === 1 && (
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      )}

      {activeTab === 2 && (
        <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
          <option value="all">All Messages</option>
          <option value="unopened">Unopened</option>
          <option value="opened">Opened</option>
          <option value="responded">Responded</option>
        </select>
      )}

      <div className="tab-content">
        {activeTab === 1 && <UserList users={filteredUsers} onRoleChange={handleRoleChange} />}
        {activeTab === 2 && (
          <SupportList messages={filteredMessages} onStatusChange={handleStatusChange} onMessageClick={setSelectedMessage} />
        )}
      </div>

      {selectedMessage && (
        <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}

function SupportList({ messages, onStatusChange, onMessageClick }) {
  return (
    <div>
      <h2>Support Messages</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id} onClick={() => onMessageClick(msg)} style={{ cursor: "pointer" }}>
            <strong>{msg.subject}</strong> - {msg.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageModal({ message, onClose, onStatusChange }) {
    console.log({message})
  const handleMarkAsOpened = () => {
    if (message.status !== "opened") {
      onStatusChange(message.id, "opened");
    }
  };

  const handleMarkAsResponded = () => {
    onStatusChange(message.id, "responded");
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{message.subject}</h2>
        <p><strong>From:</strong> {message.email}</p>
        <p><strong>Date:</strong> {new Date(message.createdAt?.toDate()).toLocaleString()}</p>
        <p>{message.description}</p>
        <div className="modal-actions">
          <button onClick={handleMarkAsOpened} disabled={message.status === "opened"}>
            Mark as Opened
          </button>
          <button onClick={handleMarkAsResponded} disabled={message.status === "responded"}>
            Mark as Responded
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function UserList({ users, onRoleChange }) {
  return (
    <div>
      <h2>User Management</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} - {user.role}
            <select onChange={(e) => onRoleChange(user.id, e.target.value)} value={user.role}>
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


