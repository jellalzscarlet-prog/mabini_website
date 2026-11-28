
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "news-images";

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [coverMethod, setCoverMethod] = useState("upload");
  const [coverFile, setCoverFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [galleryMethod, setGalleryMethod] = useState("upload");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const [existingGallery, setExistingGallery] = useState([]);
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

    setCoverMethod("upload");
    setCoverFile(null);
    setImageUrl("");

    setGalleryMethod("upload");
    setGalleryFiles([]);
    setGalleryUrls([]);
    setGalleryUrlInput("");

    setExistingGallery([]);
    setEditingId(null);

    const coverInput = document.getElementById("news-cover");
    const galleryInput = document.getElementById("news-gallery");

    if (coverInput) coverInput.value = "";
    if (galleryInput) galleryInput.value = "";
  }

  async function editNews(item) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");

    setCoverMethod("url");
    setCoverFile(null);
    setImageUrl(item.image_url || "");

    setGalleryMethod("upload");
    setGalleryFiles([]);
    setGalleryUrls([]);
    setGalleryUrlInput("");

    setExistingGallery([]);
    setMessage("");

    const { data, error } = await supabase
      .from("news_images")
      .select("*")
      .eq("news_id", item.id)
      .order("created_at", { ascending: true });

    if (error) {
      setMessage("Unable to load gallery: " + error.message);
    } else {
      setExistingGallery(data || []);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return {
      image_url: data.publicUrl,
      storage_path: path,
    };
  }

  function addGalleryUrls() {
    const urls = galleryUrlInput
      .split(/\n/)
      .map((url) => url.trim())
      .filter(Boolean);

    const validUrls = [];

    for (const url of urls) {
      try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          throw new Error();
        }

        validUrls.push(url);
      } catch {
        setMessage(`Invalid image URL: ${url}`);
        return;
      }
    }

    setGalleryUrls((current) => [...current, ...validUrls]);
    setGalleryUrlInput("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a news title.");
      return;
    }

    if (coverMethod === "upload" && !coverFile && !imageUrl) {
      setMessage("Please select a cover photo or enter an image URL.");
      return;
    }

    if (coverMethod === "url" && !imageUrl.trim()) {
      setMessage("Please enter the cover photo URL.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let finalImageUrl = imageUrl || null;

      if (coverMethod === "upload" && coverFile) {
        const uploadedCover = await uploadImage(coverFile);
        finalImageUrl = uploadedCover.image_url;
      }

      if (coverMethod === "url") {
        const parsed = new URL(imageUrl);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Please enter a valid HTTP or HTTPS cover URL.");
        }

        finalImageUrl = imageUrl.trim();
      }

      const newsData = {
        title: title.trim(),
        description,
        image_url: finalImageUrl,
      };

      let newsId = editingId;

      if (editingId !== null) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("news")
          .insert([newsData])
          .select()
          .single();

        if (error) throw error;

        newsId = data.id;
      }

      // Save additional local photos
      const galleryRecords = [];

      for (const file of galleryFiles) {
        const uploaded = await uploadImage(file);

        galleryRecords.push({
          news_id: newsId,
          image_url: uploaded.image_url,
          storage_path: uploaded.storage_path,
        });
      }

      // Save additional URL photos
      for (const url of galleryUrls) {
        galleryRecords.push({
          news_id: newsId,
          image_url: url,
          storage_path: null,
        });
      }

      if (galleryRecords.length > 0) {
        const { error } = await supabase
          .from("news_images")
          .insert(galleryRecords);

        if (error) throw error;
      }

      setMessage(
        editingId !== null
          ? "News and photos updated successfully!"
          : "News and photos added successfully!"
      );

      resetForm();
      await fetchNews();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeGalleryImage(photo) {
    const confirmed = window.confirm(
      "Remove this photo from the article gallery?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news_images")
      .delete()
      .eq("id", photo.id);

    if (error) {
      setMessage("Error removing photo: " + error.message);
      return;
    }

    if (photo.storage_path) {
      await supabase.storage
        .from(BUCKET)
        .remove([photo.storage_path]);
    }

    setExistingGallery((current) =>
      current.filter((image) => image.id !== photo.id)
    );

    setMessage("Gallery photo removed.");
  }

  async function deleteNews(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news item?"
    );

    if (!confirmed) return;

    const { data: photos } = await supabase
      .from("news_images")
      .select("storage_path")
      .eq("news_id", id);

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Error: " + error.message);
      return;
    }

    const paths = (photos || [])
      .map((photo) => photo.storage_path)
      .filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }

    setMessage("News deleted successfully!");
    await fetchNews();
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

          <label>Description / Full Article</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the full news or event article here"
            rows="8"
          />

          <hr />

          <h3>Cover Photo</h3>
          <p className="form-hint">
            This photo will appear on the homepage carousel.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className={coverMethod === "upload" ? "" : "cancel-button"}
              onClick={() => setCoverMethod("upload")}
            >
              Upload Local Photo
            </button>

            <button
              type="button"
              className={coverMethod === "url" ? "" : "cancel-button"}
              onClick={() => setCoverMethod("url")}
            >
              Use Image URL
            </button>
          </div>

          {coverMethod === "upload" ? (
            <>
              <label>Select Cover Photo</label>
              <input
                id="news-cover"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverFile(e.target.files?.[0] || null)
                }
              />
            </>
          ) : (
            <>
              <label>Cover Photo URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </>
          )}

          {coverFile && coverMethod === "upload" && (
            <img
              src={URL.createObjectURL(coverFile)}
              alt="Cover preview"
              className="news-preview"
            />
          )}

          {imageUrl && coverMethod === "url" && (
            <img
              src={imageUrl}
              alt="Cover preview"
              className="news-preview"
            />
          )}

          <hr />

          <h3>Additional Article Photos</h3>
          <p className="form-hint">
            These photos will appear in the article gallery.
          </p>

          <div className="form-actions">
            <button
              type="button"
              className={galleryMethod === "upload" ? "" : "cancel-button"}
              onClick={() => setGalleryMethod("upload")}
            >
              Upload Local Photos
            </button>

            <button
              type="button"
              className={galleryMethod === "url" ? "" : "cancel-button"}
              onClick={() => setGalleryMethod("url")}
            >
              Use Image URLs
            </button>
          </div>

          {galleryMethod === "upload" ? (
            <>
              <label>Select Multiple Photos</label>
              <input
                id="news-gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setGalleryFiles(Array.from(e.target.files || []))
                }
              />

              {galleryFiles.length > 0 && (
                <p>{galleryFiles.length} photo(s) selected.</p>
              )}
            </>
          ) : (
            <>
              <label>Paste Image URLs</label>
              <textarea
                value={galleryUrlInput}
                onChange={(e) => setGalleryUrlInput(e.target.value)}
                placeholder={"Paste one image URL per line:\nhttps://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                rows="4"
              />

              <button
                type="button"
                onClick={addGalleryUrls}
                disabled={!galleryUrlInput.trim()}
              >
                Add Image URLs
              </button>

              {galleryUrls.length > 0 && (
                <div>
                  <p>{galleryUrls.length} URL photo(s) ready to save.</p>

                  <ul>
                    {galleryUrls.map((url, index) => (
                      <li key={`${url}-${index}`}>
                        <span>{url}</span>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            setGalleryUrls((current) =>
                              current.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {editingId !== null && existingGallery.length > 0 && (
            <div className="news-gallery-preview">
              <h3>Existing Article Photos</h3>

              <div className="news-gallery-grid">
                {existingGallery.map((photo) => (
                  <div className="news-gallery-item" key={photo.id}>
                    <img src={photo.image_url} alt="Article" />

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => removeGalleryImage(photo)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
                  <img src={item.image_url} alt={item.title} />
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
