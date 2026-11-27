
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setNews(data || []);
    }

    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setEditingId(null);
  }

  function editNews(item) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setImageUrl(item.image_url || "");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const newsData = {
      title,
      description,
      image_url: imageUrl || null,
    };

    let result;

    if (editingId !== null) {
      result = await supabase
        .from("news")
        .update(newsData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("news")
        .insert([newsData]);
    }

    if (result.error) {
      setMessage("Error: " + result.error.message);
    } else {
      setMessage(
        editingId !== null
          ? "News updated successfully!"
          : "News added successfully!"
      );

      resetForm();
      await fetchNews();
    }

    setSaving(false);
  }

  async function deleteNews(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news item?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("News deleted successfully!");
      await fetchNews();
    }
  }

  return (
    <main className="manage-page">
      <header className="manage-header">
        <div>
          <h1>News & Events</h1>
          <p>Manage your municipal website news and events.</p>
        </div>

        <Link to="/admin/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </header>

      <section className="manage-form-section">
        <h2>{editingId !== null ? "Edit News" : "Add New News"}</h2>

        <form onSubmit={handleSubmit} className="manage-form">
          <label>News Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter news title"
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter news description"
            rows="5"
          />

          <label>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL here"
          />

          {imageUrl && (
            <img
              src={imageUrl}
              alt="News preview"
              className="news-preview"
            />
          )}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update News"
                : "Add News"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="manage-message">{message}</p>}
      </section>

      <section className="news-list-section">
        <h2>Existing News & Events</h2>

        {loading ? (
          <p>Loading news...</p>
        ) : news.length === 0 ? (
          <p>No news items found. Add your first news item above.</p>
        ) : (
          <div className="news-admin-list">
            {news.map((item) => (
              <article className="news-admin-card" key={item.id}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                  />
                )}

                <div className="news-admin-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <div className="form-actions">
                    <button onClick={() => editNews(item)}>
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => deleteNews(item.id)}
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
