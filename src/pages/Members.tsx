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

  // Email validation regex: Must contain "@" and a domain like ".com", ".net", etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("members", JSON.stringify(members));
  }, [members]);

  // Add Member
  const addMember = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      alert("Name and email cannot be empty.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      alert("Invalid email format! Example: user@example.com");
      return;
    }
    if (members.some(m => m.email === trimmedEmail)) {
      alert("Email already exists!");
      return;
    }

    const newMember = { id: Date.now(), name: trimmedName, email: trimmedEmail };
    setMembers([...members, newMember]);
    setName("");
    setEmail("");
  };

  // Edit Member
  const editMember = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setEditingId(id);
    }
  };

  // Update Member
  const updateMember = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      alert("Name and email cannot be empty.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      alert("Invalid email format! Example: user@example.com");
      return;
    }

    setMembers(members.map(m =>
      m.id === editingId ? { ...m, name: trimmedName, email: trimmedEmail } : m
    ));
    
    setEditingId(null);
    setName("");
    setEmail("");
  };

  // Delete Member
  const deleteMember = (id: number) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Members Management</h2>

      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 flex-1"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {editingId ? (
          <button className="bg-blue-500 text-white p-2" onClick={updateMember} aria-label="Update Member">
            Update
          </button>
        ) : (
          <button className="bg-green-500 text-white p-2" onClick={addMember} aria-label="Add Member">
            Add
          </button>
        )}
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border">
              <td className="border p-2">{member.name}</td>
              <td className="border p-2">{member.email}</td>
              <td className="border p-2">
                <button className="bg-yellow-500 text-white p-1 mr-2" onClick={() => editMember(member.id)} aria-label="Edit Member">
                  Edit
                </button>
                <button className="bg-red-500 text-white p-1" onClick={() => deleteMember(member.id)} aria-label="Delete Member">
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
