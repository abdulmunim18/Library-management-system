import { db } from "@/database/drizzle";
import { users, books, borrowRecords } from "@/database/schema";
import { sql, eq } from "drizzle-orm";
import Link from "next/link";

export default async function AdminHomePage() {
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const totalBooks = await db
    .select({ count: sql<number>`count(*)` })
    .from(books);

  const issuedBooks = await db
    .select({ count: sql<number>`count(*)` })
    .from(borrowRecords)
    .where(eq(borrowRecords.status, "BORROWED"));

  const availableBooks = await db
    .select({ count: sql<number>`sum(${books.availableCopies})` })
    .from(books);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value={totalUsers[0].count} />
        <StatCard title="Total Books" value={totalBooks[0].count} />
        <StatCard title="Issued Books" value={issuedBooks[0].count} />
        <StatCard
          title="Available Copies"
          value={availableBooks[0].count ?? 0}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickCard
          title="Manage Users"
          description="View and manage users"
          link="/admin/users"
        />
        <QuickCard
          title="Manage Books"
          description="Add, update and delete books"
          link="/admin/books"
        />
        <QuickCard
          title="Borrow Records"
          description="Issue & return books"
          link="/admin/book-requests"
        />
        <QuickCard
          title="Account Requests"
          description="Approve new accounts"
          link="/admin/account-requests"
        />
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 text-center">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-3xl font-bold text-blue-600 mt-2">
        {value}
      </p>
    </div>
  );
}

function QuickCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      href={link}
      className="bg-white shadow hover:shadow-lg transition rounded-xl p-6 block"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </Link>
  );
}
