"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/users")
        .then((res) => res.json())
        .then((data) => setUsers(data));
  }, []);

  return (
      <div style={{ padding: "20px" }}>
        <h1>Auth Users</h1>

        {users.map((user) => (
            <div key={user.id}>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <hr />
            </div>
        ))}
      </div>
  );
}