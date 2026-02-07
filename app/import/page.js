"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
const isDisabled = loading || !month || !file;
  const handleImport = async () => {
    if (!file || !month) return alert("Select file & month");

    const text = await file.text();
    const data = JSON.parse(text);

    setLoading(true);
    
    await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, data : data.Group_expenses }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-xl font-bold mb-4">Import GPay Data</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-md">
        <input
          type="month"
          className="border p-2 w-full mb-3"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <input
          type="file"
          accept=".json"
          className="mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleImport}
          disabled={isDisabled}
          className={`bg-black text-white px-4 py-2 rounded w-full ${isDisabled && 'bg-gray-500 cursor-not-allowed'}`}
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>
    </div>
  );
}
