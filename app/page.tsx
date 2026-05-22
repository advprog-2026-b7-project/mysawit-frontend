"use client";

import { useEffect, useState } from "react";
import { getUsers, type AdminUser, type PageResponse } from "@/features/admin/api";

const emptyPage: PageResponse<AdminUser> = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
};

export default function Home() {
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUser>>(emptyPage);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getUsers({ page, size: 10 })
      .then(setUsersPage)
      .catch(() => setUsersPage(emptyPage));
  }, [page]);

  return (
      <div style={{ padding: "20px" }}>
        <h1>Auth Users</h1>

        {usersPage.content.map((user) => (
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

        {usersPage.totalPages > 1 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              disabled={usersPage.page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Prev
            </button>
            <span>
              Page {usersPage.page + 1} of {usersPage.totalPages}
            </span>
            <button
              type="button"
              disabled={usersPage.page + 1 >= usersPage.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
  );
}
