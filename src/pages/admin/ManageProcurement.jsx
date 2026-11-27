import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const categories = [
  "Procurement Plan",
  "Bids",
];

const emptyForm = {
  category: categories[0],
  title: "",
  description: "",
};

export default function ManageProcurement() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setSelectedDocument(null);
    setEditingId(null);

    const fileInput = window.document.getElementById(
      "procurement-file"
    );

    if (fileInput) fileInput.value = "";
  }

  function handleDocumentChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedDocument(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please select a PDF file only.");
      e.target.value = "";
      setSelectedDocument(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The PDF file must not exceed 10 MB.");
      e.target.value = "";
      setSelectedDocument(null);
      return;
    }

    setError("");
    setSelectedDocument(file);
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      category: item.category || categories[0],
      title: item.title || "",
      description: item.description || "",
    });

    setSelectedDocument(null);
    setError("");
    setMessage("");

    const fileInput = window.document.getElementById(
      "procurement-file"
    );

    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let documentUrl = null;

      if (editingId) {
        const existing = records.find(
          (item) => item.id === editingId
        );

        documentUrl = existing?.document_url || null;
      }

      // Upload PDF if a new document was selected
      if (selectedDocument) {
        const filePath = `${crypto.randomUUID()}-${selectedDocument.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}`;

        const { error: uploadError } = await supabase.storage
          .from("procurement-documents")
          .upload(filePath, selectedDocument, {
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

      const wasEditing = editingId !== null;

      resetForm();
      await fetchRecords();

      setMessage(
        wasEditing
          ? "Procurement record updated successfully!"
          : "Procurement record added successfully!"
      );
    } catch (err) {
      setError(
        err.message || "Unable to save procurement record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("procurement")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    if (editingId === item.id) {
      resetForm();
    }

    setMessage("Procurement record deleted successfully!");

    await fetchRecords();
  }

  return (
    <main className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>Manage Procurement & Bids</h1>
          <p>
            Add, edit, and manage public procurement documents.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="admin-back-button"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* ADD / EDIT FORM */}
      <section className="admin-form-card">
        <h2>
          {editingId
            ? "Edit Procurement Record"
            : "Add Procurement Record"}
        </h2>

        {error && (
          <p className="admin-error">{error}</p>
        )}

        {message && (
          <p className="manage-message">{message}</p>
        )}

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
            onChange={handleDocumentChange}
          />

          <p className="admin-file-note">
            PDF only. Maximum file size: 10 MB.
          </p>

          {selectedDocument && (
            <p>
              Selected file: {selectedDocument.name}
            </p>
          )}

          {editingId && (
            <p className="admin-file-note">
              Leave the file field empty to keep the existing PDF.
            </p>
          )}

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

      {/* EXISTING RECORDS */}
      <section className="admin-records">
        <h2>Existing Procurement Records</h2>

        {loading ? (
          <p>Loading procurement records...</p>
        ) : records.length === 0 ? (
          <p>No procurement records available yet.</p>
        ) : (
          records.map((item) => (
            <article
              className="procurement-admin-card"
              key={item.id}
            >
              <div>
                <span className="procurement-category">
                  {item.category}
                </span>

                <h3>{item.title}</h3>

                <p>
                  {item.description ||
                    "No description provided."}
                </p>

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
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() => handleDelete(item)}
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
