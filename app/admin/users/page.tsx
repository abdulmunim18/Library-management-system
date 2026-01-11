import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.fullName}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4 font-semibold">{user.role}</td>
                <td className="p-4">
                  {user.role !== "ADMIN" && (
                    <DeleteButton userId={user.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteButton({ userId }: { userId: string }) {
  async function deleteUser() {
    "use server";

    const { db } = await import("@/database/drizzle");
    const { users, borrowRecords } = await import("@/database/schema");
    const { eq } = await import("drizzle-orm");

    // 1️⃣ Pehle user ke borrow records delete karo
    await db.delete(borrowRecords).where(eq(borrowRecords.userId, userId));

    // 2️⃣ Phir user ko delete karo
    await db.delete(users).where(eq(users.id, userId));
  }

  return (
    <form action={deleteUser}>
      <button
        type="submit"
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
      >
        Delete
      </button>
    </form>
  );
}

