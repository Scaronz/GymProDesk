import { useState } from "react";

interface Member {
  id: number;
  name: string;
  email: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // Add or Update Member
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setMembers(
        members.map((m) => (m.id === editId ? { id: editId, name, email } : m))
      );
      setEditId(null);
    } else {
      setMembers([...members, { id: Date.now(), name, email }]);
    }
    setName("");
    setEmail("");
  };

  // Edit Member
  const handleEdit = (member: Member) => {
    setEditId(member.id);
    setName(member.name);
    setEmail(member.email);
  };

  // Delete Member
  const handleDelete = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">🏋️ Members Management</h2>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-1/3"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-1/3"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Members List */}
      <ul className="border rounded p-4">
        {members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          members.map((m) => (
            <li
              key={m.id}
              className="flex justify-between p-2 border-b last:border-none"
            >
              <span>{m.name} ({m.email})</span>
              <div>
                <button
                  onClick={() => handleEdit(m)}
                  className="bg-yellow-400 px-2 py-1 text-sm rounded mx-1"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
