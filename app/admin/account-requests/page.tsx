import { db } from "@/database/drizzle";
import { borrowRecords, users } from "@/database/schema";
import { eq } from "drizzle-orm";

export default async function AccountRequestsPage() {
  const pendingUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "PENDING"));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Account Requests
      </h1>

      {pendingUsers.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">{user.fullName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 flex gap-2">
                    <ApproveButton userId={user.id} />
                    <RejectButton userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- APPROVE ---------------- */

function ApproveButton({ userId }: { userId: string }) {
  async function approve() {
    "use server";

    const { db } = await import("@/database/drizzle");
    const { users } = await import("@/database/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, userId));
  }

  return (
    <form action={approve}>
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
      >
        Approve
      </button>
    </form>
  );
}

/* ---------------- REJECT ---------------- */

function RejectButton({ userId }: { userId: string }) {
  async function reject() {
    "use server";

    const { db } = await import("@/database/drizzle");
    const { users } = await import("@/database/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(borrowRecords).where(eq(borrowRecords.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

  }

  return (
    <form action={reject}>
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
      >
        Reject
      </button>
    </form>
  );
}
