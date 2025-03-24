import { useState } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Add Member
  const addMember = () => {
    if (!name || !email) return;
    const newMember = { id: Date.now(), name, email };
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
    setMembers(members.map(m => m.id === editingId ? { ...m, name, email } : m));
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

      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {editingId ? (
          <button className="bg-blue-500 text-white p-2" onClick={updateMember}>
            Update
          </button>
        ) : (
          <button className="bg-green-500 text-white p-2" onClick={addMember}>
            Add
          </button>
        )}
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr >
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
                <button className="bg-yellow-500 text-white p-1 mr-2" onClick={() => editMember(member.id)}>
                  Edit
                </button>
                <button className="bg-red-500 text-white p-1" onClick={() => deleteMember(member.id)}>
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
