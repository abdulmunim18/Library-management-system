import AddBook from "./new/page";
export default async function AdminBooksPage() {
  const { db } = await import("@/database/drizzle");
  const { books } = await import("@/database/schema");

  const allBooks = await db.select().from(books);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

      {/* ADD BOOK BUTTON + FORM */}
      <AddBook />

      {/* BOOKS TABLE */}
      <div className="mt-8 bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Total</th>
              <th className="p-4">Available</th>
              <th className="p-4">Rating</th>
            </tr>
          </thead>
          <tbody>
            {allBooks.map((book) => (
              <tr key={book.id} className="border-t">
                <td className="p-4">{book.title}</td>
                <td className="p-4">{book.author}</td>
                <td className="p-4">{book.genre}</td>
                <td className="p-4">{book.totalCopies}</td>
                <td className="p-4">{book.availableCopies}</td>
                <td className="p-4">{book.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
