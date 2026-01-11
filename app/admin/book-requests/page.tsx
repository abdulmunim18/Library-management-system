import { db } from "@/database/drizzle";
import { users, books, borrowRecords } from "@/database/schema";
import { eq, sql } from "drizzle-orm";

/* ---------------- ADMIN BORROW PAGE ---------------- */
export default async function AdminBorrowPage() {
  // Fetch only APPROVED users
  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "APPROVED"));

  // Fetch all available books
  const allBooks = await db
    .select()
    .from(books)
    .where(sql`${books.availableCopies} > 0`);

  // Fetch all currently borrowed books
  const issuedRaw = await db
    .select({
      id: borrowRecords.id,
      userName: users.fullName,
      bookTitle: books.title,
      dueDate: borrowRecords.dueDate,
      status: borrowRecords.status,
    })
    .from(borrowRecords)
    .leftJoin(users, eq(borrowRecords.userId, users.id))
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .where(eq(borrowRecords.status, "BORROWED"));

  // Convert dueDate strings to Date objects
  const issued = issuedRaw.map((b) => ({
    ...b,
    dueDate: b.dueDate ? new Date(b.dueDate) : null,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Borrow Books</h1>

      {/* Issue Book Form */}
      <IssueBookForm userOptions={allUsers} bookOptions={allBooks} />

      {/* Issued Books Table */}
      <div className="mt-8 bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Book</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {issued.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-4">{b.userName}</td>
                <td className="p-4">{b.bookTitle}</td>
                <td className="p-4">
                  {b.dueDate ? b.dueDate.toDateString() : "N/A"}
                </td>
                <td className="p-4">
                  <ReturnBookButton borrowId={b.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- ISSUE BOOK FORM ---------------- */
function IssueBookForm({
  userOptions,
  bookOptions,
}: {
  userOptions: typeof users.$inferSelect[];
  bookOptions: typeof books.$inferSelect[];
}) {
  async function issueBook(formData: FormData) {
    "use server";

    const userId = formData.get("userId") as string;
    const bookId = formData.get("bookId") as string;
    const dueDate = formData.get("dueDate") as string;

    const { db } = await import("@/database/drizzle");
    const { borrowRecords, books, users } = await import("@/database/schema");
    const { eq, sql } = await import("drizzle-orm");

    // ✅ Step 1: Server-side check - user must be APPROVED
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length || user[0].status !== "APPROVED") {
      throw new Error("User is not approved and cannot borrow books.");
    }

    // ✅ Step 2: Insert borrow record
    await db.insert(borrowRecords).values({
      userId,
      bookId,
      dueDate, // safer as Date
      status: "BORROWED",
    });

    // ✅ Step 3: Decrease available copies
    await db
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} - 1` })
      .where(eq(books.id, bookId));
  }

  return (
    <form
      action={issueBook}
      className="bg-white shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <select name="userId" required className="border p-2 rounded">
        <option value="">Select User</option>
        {/* Only show APPROVED users in the dropdown */}
        {userOptions.map((u) => (
          <option key={u.id} value={u.id}>
            {u.fullName}
          </option>
        ))}
      </select>

      <select name="bookId" required className="border p-2 rounded">
        <option value="">Select Book</option>
        {bookOptions.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="dueDate"
        required
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Issue Book
      </button>
    </form>
  );
}

/* ---------------- RETURN BOOK BUTTON ---------------- */
function ReturnBookButton({ borrowId }: { borrowId: string }) {
  async function returnBook() {
    "use server";

    const { db } = await import("@/database/drizzle");
    const { borrowRecords, books } = await import("@/database/schema");
    const { eq, sql } = await import("drizzle-orm");

    const record = await db
      .select()
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowId));

    if (!record.length || record[0].status === "RETURNED") return;

    // Update borrow record to RETURNED
    await db
      .update(borrowRecords)
      .set({ status: "RETURNED", returnDate: new Date().toISOString() })
      .where(eq(borrowRecords.id, borrowId));

    // Increase available copies
    await db
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} + 1` })
      .where(eq(books.id, record[0].bookId));
  }

  return (
    <form action={returnBook}>
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
      >
        Return
      </button>
    </form>
  );
}

