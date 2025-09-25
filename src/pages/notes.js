import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [tenant, setTenant] = useState("");
  const [upgraded, setUpgraded] = useState(false);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    setRole(localStorage.getItem("role"));
    setTenant(localStorage.getItem("tenant"));
    fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNotes([...notes, data]);
        setTitle("");
        setContent("");
        setError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const upgradeTenant = async () => {
    try {
      const res = await fetch(`/api/tenants/${tenant}/upgrade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUpgraded(true);
        setError("");
        fetchNotes(); // refresh notes if limit removed
        alert("Tenant upgraded to PRO!");
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <h1>Notes</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button onClick={addNote} style={{ padding: "8px 16px" }}>
          Add Note
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Upgrade button only visible to Admins when Free plan is reached */}
      {role === "ADMIN" && error === "Upgrade to Pro" && !upgraded && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={upgradeTenant} style={{ padding: "8px 16px", backgroundColor: "green", color: "white" }}>
            Upgrade to Pro
          </button>
        </div>
      )}

      <h2>Your Notes</h2>
      {notes.length === 0 && <p>No notes yet</p>}
      <ul>
        {notes.map((note) => (
          <li key={note.id} style={{ marginBottom: 10 }}>
            <strong>{note.title}</strong>
            <p>{note.content}</p>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
