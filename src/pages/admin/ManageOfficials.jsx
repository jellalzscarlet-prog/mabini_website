
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const groups = [
  "Municipal Mayor",
  "Municipal Vice Mayor",
  "Municipal Employees",
  "Barangay Officials",
  "SK Officials",
  "DepEd Officials",
  "PNP Officials",
  "Mabini Fire Station",
  "Job Order",
];

const emptyForm = {
  name: "",
  position: "",
  organizational_unit: "",
  group_name: "",
  biography: "",
  image_url: "",
};

export default function ManageOfficials() {
  const [officials, setOfficials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchOfficials() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("officials")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setOfficials(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOfficials();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const record = {
      name: form.name.trim(),
      position: form.position.trim(),
      organizational_unit: form.organizational_unit.trim(),
      group_name: form.group_name,
      biography: form.biography.trim(),
      image_url: form.image_url.trim(),
    };

    const result = editingId
      ? await supabase
          .from("officials")
          .update(record)
          .eq("id", editingId)
      : await supabase.from("officials").insert([record]);

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(
        editingId
          ? "Official updated successfully."
          : "Official added successfully."
      );
      resetForm();
      await fetchOfficials();
    }

    setSaving(false);
  }

  function handleEdit(official) {
    setForm({
      name: official.name || "",
      position: official.position || "",
      organizational_unit: official.organizational_unit || "",
      group_name: official.group_name || "",
      biography: official.biography || "",
      image_url: official.image_url || "",
    });

    setEditingId(official.id);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this official?")) {
      return;
    }

    const { error } = await supabase
      .from("officials")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Official deleted successfully.");
      await fetchOfficials();

      if (editingId === id) {
        resetForm();
      }
    }
  }

  return (
    <main className="manage-page">
      <header className="manage-header">
        <div>
          <Link to="/admin/dashboard">← Back to Dashboard</Link>
          <h1>Manage Municipal Officials</h1>
          <p>Add, edit, and manage municipal official records.</p>
        </div>
      </header>

      <section className="manage-form-section">
        <h2>{editingId ? "Edit Official" : "Add New Official"}</h2>

        <form className="manage-form" onSubmit={handleSubmit}>
          <label>
            Official Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </label>

          <label>
            Category
            <select
              name="group_name"
              value={form.group_name}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label>
            Organizational Unit
            <input
              name="organizational_unit"
              value={form.organizational_unit}
              onChange={handleChange}
              placeholder="Enter organizational unit"
            />
          </label>

          <label>
            Position Title
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Enter position"
              required
            />
          </label>

          <label>
            Biography
            <textarea
              name="biography"
              value={form.biography}
              onChange={handleChange}
              placeholder="Enter biography (optional)"
              rows="4"
            />
          </label>

          <label>
            Profile Image URL
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="Paste image URL"
            />
          </label>

          {form.image_url && (
            <img
              src={form.image_url}
              alt="Profile preview"
              className="official-preview"
            />
          )}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Official"
                  : "Add Official"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="save-status">{message}</p>}
        {error && <p className="admin-error">{error}</p>}
      </section>

      <section className="officials-admin-list">
        <h2>Existing Officials ({officials.length})</h2>

        {loading ? (
          <p>Loading officials...</p>
        ) : officials.length === 0 ? (
          <p>No official records found.</p>
        ) : (
          officials.map((official) => (
            <article className="official-admin-card" key={official.id}>
              <div>
                <h3>{official.name}</h3>
                <p>{official.position}</p>
                <small>
                  {official.group_name || "No category assigned"}
                </small>
              </div>

              <div className="form-actions">
                <button onClick={() => handleEdit(official)}>
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(official.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
