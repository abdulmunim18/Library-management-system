"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BookForm from "@/components/admin/forms/BookForm";

const Page = () => {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  return (
    <>

      {/* Add Book Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-blue-600 hover:bg-blue-700"
        >
          ➕ Add New Book
        </Button>
      )}

      {/* Book Form */}
      {showForm && (
        <section className="w-full max-w-2xl bg-white shadow rounded-xl p-6">
          <BookForm />

          <div className="mt-4">
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500"
            >
              Cancel
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default Page;
