
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const categories = ["Procurement Plan", "Bids"];

export default function ManageProcurement() {
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Procurement Plan");
  const [projectDate, setProjectDate] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [existingDocument, setExistingDocument] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("procurement")
      .select("*")
      .order("project_date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setRecords(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setCategory("Procurement Plan");
    setProjectDate("");
    setSelectedDocument(null);
    setExistingDocument("");
    setEditingId(null);
    setMessage("");
    setError("");

    const fileInput = window.document.getElementById("procurement-pdf");
    if (fileInput) fileInput.value = "";
  }

  function editRecord(record) {
    setEditingId(record.id);
    setTitle(record.title || "");
    setCategory(record.category || "Procurement Plan");
    setProjectDate(record.project_date || "");
    setExistingDocument(record.document_url || "");
    setSelectedDocument(null);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadDocument() {
    if (!selectedDocument) return existingDocument;

    if (
      selectedDocument.type !== "application/pdf" &&
      !selectedDocument.name.toLowerCase().endsWith(".pdf")
    ) {
      throw new Error("Please select a PDF file.");
    }

    if (selectedDocument.size > 10 * 1024 * 1024) {
      throw new Error("PDF file must not exceed 10 MB.");
    }

    const safeName = selectedDocument.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const filePath = `${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("procurement-documents")
      .upload(filePath, selectedDocument, {
        contentType: "application/pdf",
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("procurement-documents")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!title.trim()) {
        throw new Error("Please enter the project name.");
      }

      if (!projectDate) {
        throw new Error("Please select the actual project/bidding date.");
      }

      if (!selectedDocument && !existingDocument) {
        throw new Error("Please upload a PDF document.");
      }

      const documentUrl = await uploadDocument();

      const recordData = {
        title: title.trim(),
        category,
        project_date: projectDate,
        document_url: documentUrl,
      };

      const result = editingId
        ? await supabase
            .from("procurement")
            .update(recordData)
            .eq("id", editingId)
        : await supabase
            .from("procurement")
            .insert([recordData]);

      if (result.error) throw result.error;

      setMessage(
        editingId
          ? "Procurement record updated successfully."
          : "Procurement record added successfully."
      );

      resetForm();
      await fetchRecords();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }

    setLoading(false);
  }

  async function deleteRecord(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this procurement record?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("procurement")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Record deleted successfully.");

      if (editingId === id) resetForm();

      await fetchRecords();
    }

    setLoading(false);
  }

  return (
    <main className="manage-page">
      <header className="manage-header">
        <div>
          <h1>Manage Procurement & Bids</h1>
          <p>Manage Procurement Plan and Bids records.</p>
        </div>

        <Link to="/admin/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </header>

      <section className="manage-form-section">
        <h2>{editingId ? "Edit Record" : "Add New Record"}</h2>

        {message && <p className="admin-success">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        <form className="manage-form" onSubmit={handleSubmit}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>Name of Project</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project name"
            required
          />

          <label>Actual Project / Bidding Date</label>
          <input
            type="date"
            value={projectDate}
            onChange={(e) => setProjectDate(e.target.value)}
            required
          />

          <label>PDF Document</label>
          <input
            id="procurement-pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) =>
              setSelectedDocument(e.target.files?.[0] || null)
            }
          />

          {existingDocument && !selectedDocument && (
            <p>
              Existing PDF:{" "}
              <a href={existingDocument} target="_blank" rel="noreferrer">
                View current document
              </a>
            </p>
          )}

          <p className="form-note">
            PDF files only. Maximum file size: 10 MB.
          </p>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : editingId
                  ? "Update Record"
                  : "Add Record"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="news-list-section">
        <h2>Existing Procurement Records</h2>

        {loading ? (
          <p>Loading records...</p>
        ) : records.length === 0 ? (
          <p>No procurement records available.</p>
        ) : (
          <div className="news-admin-list">
            {records.map((record) => (
              <article className="news-admin-card" key={record.id}>
                <div className="news-admin-info">
                  <h3>{record.title}</h3>
                  <p>Category: {record.category}</p>
                  <p>
                    Project/Bidding Date:{" "}
                    {record.project_date || "No date selected"}
                  </p>

                  {record.document_url && (
                    <a
                      href={record.document_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View PDF
                    </a>
                  )}

                  <div className="form-actions">
                    <button onClick={() => editRecord(record)}>
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteRecord(record.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
