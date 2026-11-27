
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const categories = [
  "Annual Procurement Plan",
  "Procurement Awards",
  "Public Documents",
];

export default function ManageProcurement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category: categories[0],
    title: "",
    description: "",
  });

  const [document, setDocument] = useState(null);

  async function fetchRecords() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurement")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setRecords(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function resetForm() {
    setForm({
      category: categories[0],
      title: "",
      description: "",
    });
    setDocument(null);
    setEditingId(null);

    const fileInput = document.getElementById("procurement-file");
    if (fileInput) fileInput.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let documentUrl = null;

      if (editingId) {
        const existing = records.find((item) => item.id === editingId);
        documentUrl = existing?.document_url || null;
      }

      if (document) {
        const isPdf =
          document.type === "application/pdf" ||
          document.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          throw new Error("Please upload a PDF file only.");
        }

        if (document.size > 10 * 1024 * 1024) {
          throw new Error("The PDF file must not exceed 10 MB.");
        }

        const filePath = `${crypto.randomUUID()}-${document.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}`;

        const { error: uploadError } = await supabase.storage
          .from("procurement-documents")
          .upload(filePath, document, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("procurement-documents")
          .getPublicUrl(filePath);

        documentUrl = data.publicUrl;
      }

      const record = {
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
        document_url: documentUrl,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("procurement")
          .update(record)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("procurement")
          .insert([record]);
      }

      if (result.error) throw result.error;

      resetForm();
      await fetchRecords();
      alert(editingId ? "Record updated successfully!" : "Record added successfully!");
    } catch (err) {
      setError(err.message || "Unable to save procurement record.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      category: item.category || categories[0],
      title: item.title || "",
      description: item.description || "",
    });
    setDocument(null);

    const fileInput = document.getElementById("procurement-file");
    if (fileInput) fileInput.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    const { error } = await supabase
      .from("procurement")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchRecords();
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>Manage Procurement & Awards</h1>
          <p>Add and manage public procurement documents.</p>
        </div>
        <a href="/admin/dashboard" className="admin-back-button">
          Back to Dashboard
        </a>
      </header>

      <section className="admin-form-card">
        <h2>{editingId ? "Edit Record" : "Add Procurement Record"}</h2>

        {error && <p className="admin-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <label>Document Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter document title"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter document description"
            rows="4"
          />

          <label>Upload PDF Document</label>
          <input
            id="procurement-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setDocument(e.target.files?.[0] || null)}
          />

          <p className="admin-file-note">
            PDF only. Maximum file size: 10 MB.
            {editingId && " Leave this empty to keep the existing document."}
          </p>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Record"
                : "Add Record"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-records">
        <h2>Existing Procurement Records</h2>

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No procurement records available yet.</p>
        ) : (
          records.map((item) => (
            <article className="procurement-admin-card" key={item.id}>
              <div>
                <span className="procurement-category">
                  {item.category}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description || "No description provided."}</p>

                {item.document_url && (
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View PDF Document
                  </a>
                )}
              </div>

              <div className="procurement-admin-actions">
                <button onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="admin-delete-button"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
