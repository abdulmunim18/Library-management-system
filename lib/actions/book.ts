"use server";

import { db } from "@/database/drizzle";
import { users, books, borrowRecords } from "@/database/schema";
import { eq, sql } from "drizzle-orm";

export async function borrowBook({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}) {
  try {
    /* ✅ FETCH USER */
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user.length) {
      return { success: false, error: "User not found" };
    }

    /* ❌ BLOCK PENDING / REJECTED USERS */
    if (user[0].status !== "APPROVED") {
      return {
        success: false,
        error: "Your account is not approved yet",
      };
    }

    /* ✅ CHECK BOOK AVAILABILITY */
    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId));

    if (!book.length || book[0].availableCopies <= 0) {
      return { success: false, error: "Book not available" };
    }

    /* ✅ CREATE BORROW RECORD */
    await db.insert(borrowRecords).values({
      userId,
      bookId,
      status: "BORROWED",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    /* ✅ DECREASE COPIES */
    await db
      .update(books)
      .set({
        availableCopies: sql`${books.availableCopies} - 1`,
      })
      .where(eq(books.id, bookId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to borrow book",
    };
  }
}
