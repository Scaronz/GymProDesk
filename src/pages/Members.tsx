import { useState, useEffect } from "react";
import { PageProps } from "../types";

type Member = {
  id: number;
  name: string;
  email: string;
};

const Members: React.FC<PageProps> = ({ darkMode }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const savedMembers = localStorage.getItem("members");
    return savedMembers ? JSON.parse(savedMembers) : [];
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    localStorage.setItem("members", JSON.stringify(members));
  }, [members]);

  const openModalForAdd = () => {
    setName("");
    setEmail("");
    setEditingId(null);
    setError("");
    setIsModalOpen(true);
  };

  const openModalForEdit = (member: Member) => {
    setName(member.name);
    setEmail(member.email);
    setEditingId(member.id);
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveMember = () => {
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setError("Name and email cannot be empty.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError("Invalid email format! Example: user@example.com");
      return;
    }
    if (
      members.some(
        (m) => m.email.toLowerCase() === trimmedEmail && m.id !== editingId
      )
    ) {
      setError("Email already exists!");
      return;
    }

    if (editingId) {
      setMembers(
        members.map((m) =>
          m.id === editingId ? { ...m, name: trimmedName, email: trimmedEmail } : m
        )
      );
    } else {
      const newMember = { id: Date.now(), name: trimmedName, email: trimmedEmail };
      setMembers([...members, newMember]);
    }

    closeModal();
  };

  const deleteMember = (id: number) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <h1 className="text-2xl font-bold mb-6">Members Management</h1>

      <button
        className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded mb-4`}
        onClick={openModalForAdd}
      >
        ➕ Add Member
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          onClick={closeModal}
        >
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'text-white' : 'text-gray-900'} p-6 rounded-lg shadow-lg w-96 relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Member" : "Add Member"}
            </h3>

            <button
              className={`absolute top-2 right-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={closeModal}
            >
              ✖
            </button>

            <input
              className={`border ${darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} p-2 w-full mb-3 rounded`}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={`border ${darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-900'} p-2 w-full mb-3 rounded`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-white px-4 py-2 rounded`}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded`}
                onClick={handleSaveMember}
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
          <thead>
            <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-200'}>
              <th className={`p-3 text-left ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>Name</th>
              <th className={`p-3 text-left ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>Email</th>
              <th className={`p-3 text-left ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className={darkMode ? 'border-gray-700' : 'border-gray-300'}>
                <td className={`p-3 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>{member.name}</td>
                <td className={`p-3 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>{member.email}</td>
                <td className={`p-3 ${darkMode ? 'border-gray-600' : 'border-gray-300'} flex gap-2`}>
                  <button
                    className={`${darkMode ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-yellow-500 hover:bg-yellow-400'} text-white px-3 py-1 rounded`}
                    onClick={() => openModalForEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-500'} text-white px-3 py-1 rounded`}
                    onClick={() => deleteMember(member.id)}
                  >
                    Delete
                  </button>
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