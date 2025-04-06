import React, { useState, useEffect, useRef } from "react";
// Import the Tauri SQL plugin's Database class
import Database from "@tauri-apps/plugin-sql";
import { PageProps } from "../types";

// Updated Member type to include phone
type Member = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

const DB_PATH = "sqlite:GymProDesk.db";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Members: React.FC<PageProps> = ({ darkMode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New state variable for search term
  const [searchTerm, setSearchTerm] = useState("");

  // Ref to hold the database instance once loaded
  const dbInstance = useRef<Database | null>(null);

  // --- Database Initialization with Full Schema ---
  const initializeDatabase = async (): Promise<boolean> => {
    try {
      console.log(`Attempting to load database: ${DB_PATH}`);
      const db = await Database.load(DB_PATH);
      dbInstance.current = db;
      console.log("Database loaded. Verifying schema...");

      await db.execute("BEGIN TRANSACTION;");

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          role TEXT NOT NULL CHECK(role IN ('Member', 'Trainer', 'Admin')) DEFAULT 'Member',
          membership_type TEXT,
          start_date TEXT,
          end_date TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          trainer_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
          schedule TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          check_in TEXT NOT NULL,
          check_out TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS Payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
          amount REAL NOT NULL,
          method TEXT CHECK(method IN ('Cash', 'Card', 'Online', 'Other')),
          date TEXT NOT NULL
        );
      `);

      await db.execute("COMMIT;");
      console.log("Database schema verification complete.");
      return true;
    } catch (err: any) {
      if (dbInstance.current) {
        try {
          await dbInstance.current.execute("ROLLBACK;");
        } catch (roll_err) {
          console.error("Rollback failed:", roll_err);
        }
      }
      console.error("Database initialization or schema setup failed:", err);
      setPageError(`Failed to initialize database schema: ${err?.message ?? String(err)}`);
      setIsLoading(false);
      return false;
    }
  };

  // --- Data Fetching (Get Members) with optional search ---
  const fetchMembers = async (search: string = "") => {
    if (!dbInstance.current) {
      setPageError("Cannot fetch members: Database not loaded.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setPageError(null);
    try {
      let fetchedMembers: Member[] = [];
      if (search.trim() === "") {
        // No search term; fetch all members
        fetchedMembers = await dbInstance.current.select<Member[]>(
          "SELECT id, name, email, phone FROM Users WHERE role = $1 ORDER BY name ASC",
          ["Member"]
        );
      } else {
        // Search using LIKE operator for both name and email
        const searchParam = `%${search.trim()}%`;
        fetchedMembers = await dbInstance.current.select<Member[]>(
          "SELECT id, name, email, phone FROM Users WHERE role = $1 AND (name LIKE $2 OR email LIKE $2) ORDER BY name ASC",
          ["Member", searchParam]
        );
      }
      setMembers(fetchedMembers);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setPageError(`Failed to load members: ${err?.message ?? String(err)}`);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Data Manipulation (Save/Add/Update Member) ---
  const handleSaveMember = async () => {
    if (!dbInstance.current) {
      setModalError("Cannot save: Database not available.");
      return;
    }
    setModalError("");
    setPageError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail) {
      setModalError("Name and email cannot be empty.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setModalError("Invalid email format! Example: user@example.com");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId !== null) {
        await dbInstance.current.execute(
          "UPDATE Users SET name = $1, email = $2, phone = $3 WHERE id = $4 AND role = 'Member'",
          [trimmedName, trimmedEmail, trimmedPhone, editingId]
        );
      } else {
        await dbInstance.current.execute(
          "INSERT into Users (name, email, phone, role) VALUES ($1, $2, $3, $4)",
          [trimmedName, trimmedEmail, trimmedPhone, "Member"]
        );
      }
      await fetchMembers(searchTerm);
      closeModal();
    } catch (err: any) {
      console.error("Error saving member:", err);
      const errorMsg = String(err?.message ?? err);
      if (errorMsg.includes("UNIQUE constraint failed: Users.email")) {
        setModalError("This email address is already registered.");
      } else {
        setModalError(`Save failed: ${errorMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- Data Deletion (Delete Member) ---
  const deleteMember = async (id: number) => {
    if (!dbInstance.current) {
      setPageError("Cannot delete: Database not available.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this member? Associated attendance and payments may also be removed.")) {
      setPageError(null);
      try {
        await dbInstance.current.execute("DELETE FROM Users WHERE id = $1 AND role = 'Member'", [id]);
        await fetchMembers(searchTerm);
      } catch (err: any) {
        console.error("Error deleting member:", err);
        setPageError(`Delete failed: ${err?.message ?? String(err)}`);
      }
    }
  };

  // --- Modal Control Functions ---
  const openModalForAdd = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEditingId(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (member: Member) => {
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone ?? "");
    setEditingId(member.id);
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isSaving) {
      setName("");
      setEmail("");
      setPhone("");
      setEditingId(null);
      setModalError("");
    }
  };

  // --- Handle Search ---
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchMembers(searchTerm);
  };

  // --- Effect Hook for Initialization ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const dbInitialized = await initializeDatabase();
      if (dbInitialized) {
        await fetchMembers();
      }
    };
    loadData();
  }, []);

  return (
    <div className={`p-4 md:p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">Members Management</h1>

      {pageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      )}

      {/* --- Search Form --- */}
      <form onSubmit={handleSearch} className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          className={`flex-grow p-2 rounded border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded font-semibold transition-colors ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isLoading || isSaving || !dbInstance.current}
        >
          Search
        </button>
      </form>

      <div className="mb-4 text-center sm:text-left">
        <button
          className={`px-4 py-2 rounded font-semibold transition-colors duration-200 ${darkMode ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-400"} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={openModalForAdd}
          disabled={isLoading || isSaving || !dbInstance.current}
        >
          ➕ Add New Member
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 px-4" onClick={closeModal}>
          <div
            className={`p-6 rounded-lg shadow-xl w-full max-w-md relative ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-5 text-center">{editingId ? "Edit Member Information" : "Add New Member"}</h3>

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
                <label htmlFor="memberName" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Full Name</label>
                <input
                  id="memberName"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="memberEmail" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email Address</label>
                <input
                  id="memberEmail"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSaving}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="memberPhone" className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Phone Number</label>
                <input
                  id="memberPhone"
                  className={`border ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            {modalError && (
              <p className="text-red-400 text-sm mb-4 text-center" role="alert">
                {modalError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
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
                onClick={handleSaveMember}
                disabled={isSaving}
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  editingId ? "Update Member" : "Add Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Members Table --- */}
      <div className="overflow-x-auto shadow-md rounded-lg mt-6">
        <table className={`w-full text-sm text-left ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          <thead className={`text-xs uppercase ${darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
            <tr>
              <th scope="col" className="px-4 py-3 w-16">ID</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Phone</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && members.length === 0 && (
              <tr className={darkMode ? "bg-gray-800" : "bg-white"}>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 italic">
                  Loading members...
                </td>
              </tr>
            )}
            {!isLoading && members.length === 0 && !pageError && (
              <tr className={`border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No members found. Add one using the button above!
                </td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={member.id} className={`border-b transition-colors duration-150 ${darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700/70" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                <td className="px-4 py-4 font-mono text-xs text-center">{member.id}</td>
                <td className="px-6 py-4 font-medium whitespace-nowrap">{member.name}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">{member.phone || "-"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${darkMode ? "bg-yellow-600 hover:bg-yellow-500" : "bg-yellow-500 hover:bg-yellow-400"} disabled:opacity-50`}
                      onClick={() => openModalForEdit(member)}
                      disabled={isLoading || isSaving || !dbInstance.current}
                      title="Edit Member"
                      aria-label={`Edit ${member.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-white text-xs font-medium transition-colors ${darkMode ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"} disabled:opacity-50`}
                      onClick={() => deleteMember(member.id)}
                      disabled={isLoading || isSaving || !dbInstance.current}
                      title="Delete Member"
                      aria-label={`Delete ${member.name}`}
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

export default Members;
