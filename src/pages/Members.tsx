import { useState, useEffect, useRef } from "react";
// Import the plugin's Database class
import Database from "@tauri-apps/plugin-sql";
// Assuming PageProps includes darkMode from your App.tsx structure
import { PageProps } from "../types";

// Define the Member type for the frontend state
type Member = {
  id: number; // SQL plugin generally returns numbers for INTEGER keys
  name: string;
  email: string;
};

// Define the database path (relative to AppConfig dir, e.g., /Users/<user>/Library/Application Support/com.your.app/ or similar)
const DB_PATH = "sqlite:GymProDesk.db"; // The filename for your SQLite database

const Members: React.FC<PageProps> = ({ darkMode }) => {
  // Component State
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState(""); // Error specifically for the modal form
  const [pageError, setPageError] = useState<string | null>(null); // Error for page-level issues (loading, deleting)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state (DB init + fetches)
  const [isSaving, setIsSaving] = useState(false); // Tracks saving state (add/update operations)

  // Ref to hold the database instance once loaded
  const dbInstance = useRef<Database | null>(null);

  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Database Initialization and Schema ---
  const initializeDatabase = async (): Promise<boolean> => {
    try {
      console.log(`Attempting to load database: ${DB_PATH}`);
      // Load the database instance using the plugin
      const db = await Database.load(DB_PATH);
      dbInstance.current = db; // Store the instance in the ref

      // Ensure the members table exists with the correct schema
      // UNIQUE constraint on email is important for preventing duplicates
      await db.execute(`
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE
        );
      `);
      console.log("Database loaded and schema verified/created.");
      return true; // Indicate success
    } catch (err) {
      console.error("Database initialization failed:", err);
      setPageError(
        `Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`
      );
      setIsLoading(false); // Stop loading if DB fails
      return false; // Indicate failure
    }
  };

  // --- Data Fetching ---
  const fetchMembers = async () => {
    if (!dbInstance.current) {
      setPageError("Cannot fetch members: Database not loaded.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setPageError(null); // Clear previous page errors
    try {
      // Use db.select<Type[]> for SELECT queries
      const fetchedMembers = await dbInstance.current.select<Member[]>(
        "SELECT id, name, email FROM members ORDER BY name ASC" // Fetch all members, ordered by name
      );
      setMembers(fetchedMembers);
    } catch (err) {
      console.error("Error fetching members:", err);
      setPageError(
        `Failed to load members: ${err instanceof Error ? err.message : String(err)}`
      );
      setMembers([]); // Clear members on error
    } finally {
      setIsLoading(false); // Finish loading state
    }
  };

  // --- Data Manipulation (Save/Add/Update) ---
  const handleSaveMember = async () => {
    if (!dbInstance.current) {
      setModalError("Cannot save: Database not available."); // Show error in modal
      return;
    }
    setModalError(""); // Clear previous modal errors
    setPageError(null); // Clear previous page errors

    // Trim and validate input
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setModalError("Name and email cannot be empty.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setModalError("Invalid email format! Example: user@example.com");
      return;
    }

    setIsSaving(true); // Start saving state (disables buttons, shows spinner)

    try {
      if (editingId !== null) {
        // --- Update Existing Member ---
        // Use db.execute for UPDATE queries. Use $1, $2, etc. for placeholders.
        await dbInstance.current.execute(
          "UPDATE members SET name = $1, email = $2 WHERE id = $3",
          [trimmedName, trimmedEmail, editingId]
        );
      } else {
        // --- Add New Member ---
        // Use db.execute for INSERT queries.
        await dbInstance.current.execute(
          "INSERT into members (name, email) VALUES ($1, $2)",
          [trimmedName, trimmedEmail]
        );
      }
      // After successful add/update, refetch the list to show the latest data
      await fetchMembers();
      closeModal(); // Close the modal on success
    } catch (err) {
      console.error("Error saving member:", err);
      // Provide user-friendly error messages, checking for common DB errors
      const errorMsg = String(err);
      if (errorMsg.includes("UNIQUE constraint failed: members.email")) {
        setModalError("This email address is already registered.");
      } else {
         setModalError(`Save failed: ${err instanceof Error ? err.message : errorMsg}`);
      }
    } finally {
      setIsSaving(false); // End saving state
    }
  };

  // --- Data Deletion ---
  const deleteMember = async (id: number) => {
     if (!dbInstance.current) {
      setPageError("Cannot delete: Database not available."); // Show error on page
      return;
    }
    // Confirmation dialog
    if (window.confirm("Are you sure you want to delete this member?")) {
      setPageError(null); // Clear previous page errors
      try {
        // Use db.execute for DELETE queries.
        await dbInstance.current.execute("DELETE FROM members WHERE id = $1", [id]);
        // Refetch the list to reflect the deletion
        await fetchMembers();
        // Alternative: Update state locally for faster UI feedback
        // setMembers(currentMembers => currentMembers.filter((m) => m.id !== id));
      } catch (err) {
        console.error("Error deleting member:", err);
        setPageError(
          `Delete failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  };

  // --- Modal Control ---
  const openModalForAdd = () => {
    setName("");
    setEmail("");
    setEditingId(null);
    setModalError(""); // Clear errors when opening
    setIsModalOpen(true);
  };

  const openModalForEdit = (member: Member) => {
    setName(member.name);
    setEmail(member.email);
    setEditingId(member.id);
    setModalError(""); // Clear errors when opening
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form state on close, only if not currently saving
    if (!isSaving) {
        setName("");
        setEmail("");
        setEditingId(null);
        setModalError("");
    }
  };

  // --- Effect for Initialization ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Start loading indicator
      const dbInitialized = await initializeDatabase();
      if (dbInitialized) {
        await fetchMembers(); // Fetch data only if DB loaded successfully
      }
      // Loading state is handled within fetchMembers and initializeDatabase
    };
    loadData();

    // Note: The SQL plugin generally handles connection closing automatically
    // when the app exits. No explicit cleanup ref needed usually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Render Logic ---

  // Initial loading state (before DB is ready or first fetch attempt)
   if (isLoading && members.length === 0 && !pageError) {
     return (
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h1 className="text-2xl font-bold mb-6">Members Management</h1>
        <p>Loading database and members...</p>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h1 className="text-2xl font-bold mb-6">Members Management</h1>

      {/* Display Page-Level Errors */}
      {pageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      )}

      {/* Add Member Button */}
      <button
        className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={openModalForAdd}
        disabled={isLoading || isSaving || !dbInstance.current} // Disable if loading, saving, or DB not ready
      >
        ➕ Add Member
      </button>

      {/* --- Add/Edit Member Modal --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          onClick={closeModal} // Allow closing by clicking backdrop
        >
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-900'} p-6 rounded-lg shadow-xl w-full max-w-md relative`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            {/* Modal Title */}
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Member" : "Add New Member"}
            </h3>

            {/* Close Button (Top Right) */}
            <button
              className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
              onClick={closeModal}
              disabled={isSaving} // Disable if saving
              title="Close"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form Inputs */}
            <div className="space-y-4 mb-4">
              <input
                className={`border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                aria-label="Member Name"
              />
              <input
                className={`border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50`}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSaving}
                 aria-label="Member Email"
              />
            </div>

            {/* Modal Error Display */}
            {modalError && (
                <p className="text-red-400 text-sm mb-4" role="alert">{modalError}</p>
            )}

            {/* Action Buttons (Cancel/Save) */}
            <div className="flex justify-end gap-3">
              <button
                className={`${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-gray-200' : 'text-gray-800'} px-4 py-2 rounded transition-colors disabled:opacity-50`}
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className={`${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'} text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]`} // min-width to prevent size jump with spinner
                onClick={handleSaveMember}
                disabled={isSaving} // Disable button while saving
              >
                {isSaving ? (
                  // Simple loading spinner
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  editingId ? "Update Member" : "Add Member" // Dynamic button text
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Members Table --- */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className={`w-full text-sm text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* Table Head */}
          <thead className={`text-xs uppercase ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {/* Loading indicator within table area */}
            {isLoading && members.length === 0 && (
                 <tr className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td colSpan={3} className="px-6 py-4 text-center">Loading members...</td>
                 </tr>
             )}
            {/* No members found message */}
            {!isLoading && members.length === 0 && !pageError && (
              <tr className={darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b'}>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No members found. Add one using the button above!
                </td>
              </tr>
            )}
            {/* Member Rows */}
            {members.map((member) => (
              <tr key={member.id} className={`border-b ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/70' : 'bg-white hover:bg-gray-50'}`}>
                <td className="px-6 py-4 font-medium whitespace-nowrap">{member.name}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  {/* Edit Button */}
                  <button
                    className={`${darkMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-500 hover:bg-yellow-400'} text-white px-3 py-1 rounded text-xs disabled:opacity-50`}
                    onClick={() => openModalForEdit(member)}
                     disabled={isLoading || isSaving || !dbInstance.current}
                     title="Edit Member"
                  >
                    Edit
                  </button>
                  {/* Delete Button */}
                  <button
                    className={`${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-500'} text-white px-3 py-1 rounded text-xs disabled:opacity-50`}
                    onClick={() => deleteMember(member.id)}
                     disabled={isLoading || isSaving || !dbInstance.current}
                     title="Delete Member"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> {/* End of overflow-x-auto */}
    </div> // End of main container
  );
};

export default Members;