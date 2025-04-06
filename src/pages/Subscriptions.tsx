import React, { useState, useEffect, useRef } from "react";
import Database from "@tauri-apps/plugin-sql";
import { PageProps } from "../types";

// Define the Subscription type
type Subscription = {
  id: number;
  name: string;
  description: string;
  duration_days: number;
  price: number;
};

const DB_PATH = "sqlite:GymProDesk.db";

const Subscriptions: React.FC<PageProps> = ({ darkMode }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Database instance ref
  const dbInstance = useRef<Database | null>(null);

  // Initialize database and ensure the Subscriptions table exists
  const initializeDatabase = async (): Promise<boolean> => {
    try {
      const db = await Database.load(DB_PATH);
      dbInstance.current = db;
      await db.execute("BEGIN TRANSACTION;");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS Subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          duration_days INTEGER NOT NULL,
          price REAL NOT NULL
        );
      `);
      await db.execute("COMMIT;");
      return true;
    } catch (err: any) {
      if (dbInstance.current) {
        try {
          await dbInstance.current.execute("ROLLBACK;");
        } catch (rollErr) {
          console.error("Rollback failed:", rollErr);
        }
      }
      console.error("Database initialization error:", err);
      setPageError(`Failed to initialize database: ${err?.message ?? String(err)}`);
      setIsLoading(false);
      return false;
    }
  };

  // Fetch subscriptions (no search functionality now)
  const fetchSubscriptions = async () => {
    if (!dbInstance.current) {
      setPageError("Cannot fetch subscriptions: Database not loaded.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setPageError(null);
    try {
      const results = await dbInstance.current.select<Subscription[]>(
        "SELECT id, name, description, duration_days, price FROM Subscriptions ORDER BY name ASC"
      );
      setSubscriptions(results);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setPageError(`Failed to load subscriptions: ${err?.message ?? String(err)}`);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update a subscription
  const handleSaveSubscription = async () => {
    if (!dbInstance.current) {
      setModalError("Cannot save: Database not available.");
      return;
    }
    setModalError("");
    setPageError(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      setModalError("Name is required.");
      return;
    }
    if (!durationDays || isNaN(Number(durationDays)) || Number(durationDays) <= 0) {
      setModalError("Duration (days) must be a positive number.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setModalError("Price must be a non-negative number.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId !== null) {
        await dbInstance.current.execute(
          `
            UPDATE Subscriptions
            SET name = $1, description = $2, duration_days = $3, price = $4
            WHERE id = $5
          `,
          [trimmedName, trimmedDesc, Number(durationDays), Number(price), editingId]
        );
      } else {
        await dbInstance.current.execute(
          `
            INSERT INTO Subscriptions (name, description, duration_days, price)
            VALUES ($1, $2, $3, $4)
          `,
          [trimmedName, trimmedDesc, Number(durationDays), Number(price)]
        );
      }
      await fetchSubscriptions();
      closeModal();
    } catch (err: any) {
      console.error("Error saving subscription:", err);
      setModalError(`Save failed: ${err?.message ?? String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a subscription
  const deleteSubscription = async (id: number) => {
    if (!dbInstance.current) {
      setPageError("Cannot delete: Database not available.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this subscription plan?")) {
      setPageError(null);
      try {
        await dbInstance.current.execute("DELETE FROM Subscriptions WHERE id = $1", [id]);
        await fetchSubscriptions();
      } catch (err: any) {
        console.error("Error deleting subscription:", err);
        setPageError(`Delete failed: ${err?.message ?? String(err)}`);
      }
    }
  };

  // Modal control functions
  const openModalForAdd = () => {
    setName("");
    setDescription("");
    setDurationDays("");
    setPrice("");
    setEditingId(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (sub: Subscription) => {
    setName(sub.name);
    setDescription(sub.description);
    setDurationDays(sub.duration_days);
    setPrice(sub.price);
    setEditingId(sub.id);
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isSaving) {
      setName("");
      setDescription("");
      setDurationDays("");
      setPrice("");
      setEditingId(null);
      setModalError("");
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const dbInitialized = await initializeDatabase();
      if (dbInitialized) {
        await fetchSubscriptions();
      }
    };
    loadData();
  }, []);

  return (
    <div className={`p-4 md:p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">Subscription Plans</h1>

      {pageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      )}

      {/* Add Plan Button */}
      <div className="mb-4 text-center sm:text-left">
        <button
          className={`px-4 py-2 rounded font-semibold transition-colors duration-200 ${darkMode ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-400"} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={openModalForAdd}
          disabled={isLoading || isSaving || !dbInstance.current}
        >
          ➕ Add New Plan
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 px-4" onClick={closeModal}>
          <div
            className={`p-6 rounded-lg shadow-xl w-full max-w-md relative ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-5 text-center">
              {editingId ? "Edit Plan" : "Add New Plan"}
            </h3>

            <button
              className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${darkMode ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}
              onClick={closeModal}
              disabled={isSaving}
              title="Close"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-4 mb-5">
              <div>
                <label htmlFor="planName" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Name
                </label>
                <input
                  id="planName"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="text"
                  placeholder="Enter plan name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="planDuration" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Duration (Days)
                </label>
                <input
                  id="planDuration"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="number"
                  min={1}
                  placeholder="Enter duration in days"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.valueAsNumber || "")}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label htmlFor="planPrice" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Price (DA)
                </label>
                <input
                  id="planPrice"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="number"
                  step="0.01"
                  placeholder="Enter plan price"
                  value={price}
                  onChange={(e) => setPrice(e.target.valueAsNumber || "")}
                  disabled={isSaving}
                />
              </div>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm mb-4 text-center" role="alert">
                {modalError}
              </p>
            )}

            <div className={`flex justify-end gap-3 pt-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button
                type="button"
                className={`px-4 py-2 rounded font-medium transition-colors ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} disabled:opacity-50`}
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded font-semibold transition-colors ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"} text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]`}
                onClick={handleSaveSubscription}
                disabled={isSaving}
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : editingId ? "Update Plan" : "Add Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="overflow-x-auto shadow-md rounded-lg mt-6">
        <table className={`w-full text-sm text-left ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          <thead className={`text-xs uppercase ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
            <tr>
              {/* Only display three data columns */}
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Duration (Days)</th>
              <th scope="col" className="px-6 py-3">Price (DA)</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && subscriptions.length === 0 && (
              <tr className={darkMode ? "bg-gray-800" : "bg-white"}>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                  Loading subscriptions...
                </td>
              </tr>
            )}
            {!isLoading && subscriptions.length === 0 && !pageError && (
              <tr className={`border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No subscription plans found. Add one using the button above!
                </td>
              </tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub.id} className={`border-b transition-colors duration-150 ${darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700/70" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                <td className="px-6 py-4 font-medium whitespace-nowrap">{sub.name}</td>
                <td className="px-6 py-4">{sub.duration_days}</td>
                <td className="px-6 py-4">{sub.price}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${darkMode ? "bg-yellow-600 hover:bg-yellow-500" : "bg-yellow-500 hover:bg-yellow-400"} disabled:opacity-50`}
                      onClick={() => openModalForEdit(sub)}
                      disabled={isLoading || isSaving || !dbInstance.current}
                      title="Edit Plan"
                      aria-label={`Edit ${sub.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${darkMode ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"} disabled:opacity-50`}
                      onClick={() => deleteSubscription(sub.id)}
                      disabled={isLoading || isSaving || !dbInstance.current}
                      title="Delete Plan"
                      aria-label={`Delete ${sub.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
