
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
  const [movingId, setMovingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("");

  async function fetchOfficials() {
    setLoading(true);

    const { data, error } = await supabase
      .from("officials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      const sortedData = [...(data || [])].sort((a, b) => {
        const groupA = groups.indexOf(a.group_name);
        const groupB = groups.indexOf(b.group_name);

        if (groupA !== groupB) {
          return (
            (groupA === -1 ? groups.length : groupA) -
            (groupB === -1 ? groups.length : groupB)
          );
        }

        return (
          (a.sort_order ?? a.id) - (b.sort_order ?? b.id)
        );
      });

      setOfficials(sortedData);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOfficials();
  }, []);

  const filteredOfficials = officials.filter((official) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (official.name || "").toLowerCase().includes(search) ||
      (official.position || "").toLowerCase().includes(search) ||
      (official.organizational_unit || "").toLowerCase().includes(search);

    const matchesGroup =
      filterGroup === "" || official.group_name === filterGroup;

    return matchesSearch && matchesGroup;
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    setError("");
  }

  async function uploadImage() {
    if (!selectedImage) return form.image_url;

    const fileExt = selectedImage.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("officials-images")
      .upload(fileName, selectedImage, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("officials-images")
      .getPublicUrl(fileName);

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

      let result;

      if (editingId) {
        result = await supabase
          .from("officials")
          .update(record)
          .eq("id", editingId);
      } else {
        const groupOfficials = officials.filter(
          (official) => official.group_name === form.group_name
        );

        const nextOrder =
          groupOfficials.length > 0
            ? Math.max(
                ...groupOfficials.map(
                  (official) => official.sort_order ?? official.id
                )
              ) + 1
            : 1;

        result = await supabase
          .from("officials")
          .insert([
            {
              ...record,
              sort_order: nextOrder,
            },
          ]);
      }

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    if (editingId === official.id) {
      resetForm();
    }
  }

  async function moveOfficial(official, direction) {
    if (movingId !== null) return;

    setError("");
    setMessage("");

    const groupOfficials = officials
      .filter(
        (item) => item.group_name === official.group_name
      )
      .sort((a, b) => {
        return (
          (a.sort_order ?? a.id) -
          (b.sort_order ?? b.id)
        );
      });

    const currentIndex = groupOfficials.findIndex(
      (item) => item.id === official.id
    );

    const targetIndex = currentIndex + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= groupOfficials.length
    ) {
      return;
    }

    const currentOfficial = groupOfficials[currentIndex];
    const targetOfficial = groupOfficials[targetIndex];

    const currentOrder =
      currentOfficial.sort_order ?? currentOfficial.id;

    const targetOrder =
      targetOfficial.sort_order ?? targetOfficial.id;

    setMovingId(official.id);

    try {
      const { error: firstError } = await supabase
        .from("officials")
        .update({
          sort_order: targetOrder,
        })
        .eq("id", currentOfficial.id);

      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("officials")
        .update({
          sort_order: currentOrder,
        })
        .eq("id", targetOfficial.id);

      if (secondError) {
        await supabase
          .from("officials")
          .update({
            sort_order: currentOrder,
          })
          .eq("id", currentOfficial.id);

        throw secondError;
      }

      setMessage(`${official.name} moved successfully.`);

      await fetchOfficials();
    } catch (err) {
      setError(
        err.message || "Unable to rearrange officials."
      );

      await fetchOfficials();
    } finally {
      setMovingId(null);
    }
  }

  function getGroupPosition(official) {
    const groupOfficials = officials
      .filter(
        (item) => item.group_name === official.group_name
      )
      .sort((a, b) => {
        return (
          (a.sort_order ?? a.id) -
          (b.sort_order ?? b.id)
        );
      });

    const index = groupOfficials.findIndex(
      (item) => item.id === official.id
    );

    return {
      isFirst: index === 0,
      isLast: index === groupOfficials.length - 1,
    };
  }

  return (
    <main className="manage-page">
      <header className="manage-header">
        <div>
          <h1>Manage Municipal Officials</h1>
          <p>
            Add, edit, and manage municipal official records.
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className="back-button"
        >
          Back to Dashboard
        </Link>
      </header>

      <section className="manage-form-section">
        <h2>
          {editingId ? "Edit Official" : "Add New Official"}
        </h2>

        <form
          className="manage-form"
          onSubmit={handleSubmit}
        >
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
              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="save-status">{message}</p>
        )}

        {error && (
          <p className="admin-error">{error}</p>
        )}
      </section>

      <section className="officials-admin-list">
        <div className="officials-table-header">
          <div>
            <h2>Existing Officials</h2>

            <p>
              Showing {filteredOfficials.length} of{" "}
              {officials.length} officials
            </p>

            <p className="officials-reorder-note">
              Use the ↑ and ↓ buttons to arrange officials
              within their category.
            </p>
          </div>
        </div>

        <div className="officials-table-filters">
          <input
            type="text"
            placeholder="Search name, position, or organizational unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All Categories</option>

            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading officials...</p>
        ) : filteredOfficials.length === 0 ? (
          <p className="officials-empty">
            No official records found.
          </p>
        ) : (
          <div className="officials-table-wrapper">
            <table className="officials-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Photo</th>
                  <th>Official Name</th>
                  <th>Position</th>
                  <th>Category</th>
                  <th>Organizational Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOfficials.map((official, index) => {
                  const { isFirst, isLast } =
                    getGroupPosition(official);

                  return (
                    <tr key={official.id}>
                      {/* Sequential row number */}
                      <td>{index + 1}</td>

                      <td>
                        {official.image_url ? (
                          <img
                            src={official.image_url}
                            alt={official.name}
                            className="official-table-image"
                          />
                        ) : (
                          <span className="no-official-image">
                            No Image
                          </span>
                        )}
                      </td>

                      <td className="official-table-name">
                        {official.name}
                      </td>

                      <td>
                        {official.position || "—"}
                      </td>

                      <td>
                        {official.group_name || "—"}
                      </td>

                      <td>
                        {official.organizational_unit || "—"}
                      </td>

                      <td>
                        <div className="official-table-actions">
                          <button
                            type="button"
                            className="move-up-button"
                            title="Move up"
                            aria-label={`Move ${official.name} up`}
                            disabled={
                              isFirst || movingId !== null
                            }
                            onClick={() =>
                              moveOfficial(official, -1)
                            }
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            className="move-down-button"
                            title="Move down"
                            aria-label={`Move ${official.name} down`}
                            disabled={
                              isLast || movingId !== null
                            }
                            onClick={() =>
                              moveOfficial(official, 1)
                            }
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(official)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(official)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
