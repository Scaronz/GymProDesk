import { useState, useEffect } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const savedMembers = localStorage.getItem("members");
    return savedMembers ? JSON.parse(savedMembers) : [];
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    localStorage.setItem("members", JSON.stringify(members));
  }, [members]);

  // Open modal for adding a new member
  const openModalForAdd = () => {
    setName("");
    setEmail("");
    setEditingId(null);
    setError("");
    setIsModalOpen(true);
  };

  // Open modal for editing an existing member
  const openModalForEdit = (member: Member) => {
    setName(member.name);
    setEmail(member.email);
    setEditingId(member.id);
    setError("");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add or Update Member
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
      // Update member
      setMembers(
        members.map((m) =>
          m.id === editingId ? { ...m, name: trimmedName, email: trimmedEmail } : m
        )
      );
    } else {
      // Add new member
      const newMember = { id: Date.now(), name: trimmedName, email: trimmedEmail };
      setMembers([...members, newMember]);
    }

    closeModal();
  };

  // Delete Member
  const deleteMember = (id: number) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Members Management</h2>

      {/* Add Member Button */}
      <button
        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        onClick={openModalForAdd}
      >
        ➕ Add Member
      </button>

      {/* Dark-Themed Popup Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
          onClick={closeModal} // Close when clicking outside
        >
          <div
            className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Member" : "Add Member"}
            </h3>

            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={closeModal}
            >
              ✖
            </button>

            {/* Input Fields */}
            <input
              className="border border-gray-700 bg-gray-900 text-white p-2 w-full mb-3 rounded"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-gray-700 bg-gray-900 text-white p-2 w-full mb-3 rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Show validation error */}
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleSaveMember}
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <table className="w-full border-collapse border border-gray-700 mt-4">
        <thead>
          <tr className="bg-gray-700">
            <th className="border border-gray-600 p-2">Name</th>
            <th className="border border-gray-600 p-2">Email</th>
            <th className="border border-gray-600 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border border-gray-700">
              <td className="border border-gray-600 p-2">{member.name}</td>
              <td className="border border-gray-600 p-2">{member.email}</td>
              <td className="border border-gray-600 p-2 flex gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded"
                  onClick={() => openModalForEdit(member)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
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
  );
};

export default Members;
