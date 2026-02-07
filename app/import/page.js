"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Get logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  const handleImport = async () => {
    if (!file) {
      setError("Please select a JSON file");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadedBy: user.name,
          data : data.Group_expenses,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Import failed");
      }

      alert(
        `Import successful!\n\nExpenses added: ${result.inserted}`
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid file or import failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-2">
          Import Google Pay Data
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Logged in as <b>{user.name}</b>
        </p>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded mb-4">
          ⚠️ Uploading will <b>replace all expenses created by you</b> in
          the system.
        </div>

        {/* File input */}
        <input
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import Data"}
        </button>
      </div>
    </div>
  );
}
