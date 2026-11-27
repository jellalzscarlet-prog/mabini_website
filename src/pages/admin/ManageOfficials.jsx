
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const groups = [
  "Municipal Mayor",
  "Municipal Vice Mayor",
  "Municipal Employees",
  "Barangay Officials",
  "SK Officials (Sangguniang Kabataan)",
  "Department of Education (DepEd) Officials",
  "Philippine National Police (PNP) Officials",
  "MFS (Mabini Fire Station) Officials",
  "Job Order (JO) Officials",
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchOfficials() {
    setLoading(true);

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

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function resetForm() {
    setForm(emptyForm);
    setSelectedImage(null);
    setPreview("");
    setEditingId(null);
    setMessage("");
  }

  async function uploadImage() {
    if (!selectedImage) return form.image_url;

    const fileExt = selectedImage.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("officials-images")
      .upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("officials-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const imageUrl = await uploadImage();

      const record = {
        name: form.name.trim(),
        position: form.position.trim(),
        organizational_unit: form.organizational_unit.trim(),
        group_name: form.group_name,
        biography: form.biography.trim(),
        image_url: imageUrl,
      };

      const result = editingId
        ? await supabase
            .from("officials")
            .update(record)
            .eq("id", editingId)
        : await supabase.from("officials").insert([record]);

      if (result.error) throw result.error;

      setMessage(
        editingId
          ? "Official updated successfully."
          : "Official added successfully."
      );

      resetForm();
      await fetchOfficials();
    } catch (err) {
      setError(err.message || "Unable to save official.");
    } finally {
      setSaving(false);
    }
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

    setSelectedImage(null);
    setPreview(official.image_url || "");
    setEditingId(official.id);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(official) {
    if (!window.confirm(`Delete ${official.name}?`)) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("officials")
      .delete()
      .eq("id", official.id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Official deleted successfully.");
    await fetchOfficials();

    if (editingId === official.id) resetForm();
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
            Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {preview && (
            <div>
              <p>Image Preview</p>
              <img
                src={preview}
                alt="Official profile preview"
                className="official-preview"
              />
            </div>
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
                {official.image_url && (
                  <img
                    src={official.image_url}
                    alt={official.name}
                    className="official-preview"
                  />
                )}

                <h3>{official.name}</h3>
                <p>{official.position}</p>
                <small>{official.group_name}</small>
              </div>

              <div className="form-actions">
                <button onClick={() => handleEdit(official)}>
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDelete(official)}
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
