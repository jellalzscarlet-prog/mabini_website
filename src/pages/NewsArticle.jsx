
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NewsArticle() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError("");

      const { data: newsData, error: newsError } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (newsError) {
        setError(newsError.message);
        setLoading(false);
        return;
      }

      if (!newsData) {
        setError("This news article could not be found.");
        setLoading(false);
        return;
      }

      const { data: imageData, error: imageError } = await supabase
        .from("news_images")
        .select("*")
        .eq("news_id", id)
        .order("created_at", { ascending: true });

      if (imageError) {
        setError(imageError.message);
      } else {
        setArticle(newsData);
        setPhotos(imageData || []);
      }

      setLoading(false);
    }

    fetchArticle();
  }, [id]);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="news-article-page">
        <p>Loading article...</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="news-article-page">
        <h2>Article unavailable</h2>
        <p>{error || "This article could not be found."}</p>
        <Link to="/#news" className="back-button">
          Back to News & Events
        </Link>
      </main>
    );
  }

  return (
    <main className="news-article-page">
      <Link to="/#news" className="back-button">
        ← Back to News & Events
      </Link>

      <article className="news-article">
        <p className="eyebrow green">MUNICIPALITY OF MABINI</p>

        <h1>{article.title}</h1>

        <p className="news-article-date">
          Published {formatDate(article.created_at)}
        </p>

        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="news-article-cover"
          />
        )}

        <div className="news-article-description">
          {article.description
            ?.split(/\n+/)
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>

        {photos.length > 0 && (
          <section className="news-article-gallery">
            <h2>Event Photo Gallery</h2>

            <div className="news-gallery-grid">
              {photos.map((photo) => (
                <a
                  href={photo.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={photo.id}
                >
                  <img
                    src={photo.image_url}
                    alt={`${article.title} event photo`}
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </article>

      <Link to="/#news" className="back-button">
        ← Back to News & Events
      </Link>
    </main>
  );
}
