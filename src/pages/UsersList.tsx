import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

const adminEmail = "aare.kanna@gmail.com"; // change this!

const UsersList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => doc.data());
      setUsers(data);
    };

    fetchUsers();
  }, []);
console.log("Logged-in user:", user);

  if (!user) return <div className="p-6 text-center">Loading...</div>;

  if (user.email !== adminEmail) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
      <ul className="space-y-2">
        {users.map((u, idx) => (
          <li key={idx} className="border p-4 rounded">
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Name:</strong> {u.name || "No name"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
