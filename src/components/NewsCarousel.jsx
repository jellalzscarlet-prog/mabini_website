
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function NewsCarousel() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch news from Supabase
  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading news:", error.message);
        setError("Unable to load news and events.");
      } else {
        setSlides(data || []);
        setIndex(0);
        setError("");
      }

      setLoading(false);
    }

    fetchNews();

    // Listen for news changes in Supabase
    const channel = supabase
      .channel("news-carousel-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        () => {
          fetchNews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Automatic slide rotation every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  function previousSlide() {
    setIndex((i) =>
      i === 0 ? slides.length - 1 : i - 1
    );
  }

  function nextSlide() {
    setIndex((i) =>
      (i + 1) % slides.length
    );
  }

  if (loading) {
    return (
      <div className="news-carousel">
        <p>Loading news and events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-carousel">
        <p>{error}</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="news-carousel">
        <p>No news and events available at the moment.</p>
      </div>
    );
  }

  const currentSlide = slides[index];

  return (
    <div className="news-carousel">
      <div className="news-slide" key={currentSlide.id}>
        <div className="news-img">
          {currentSlide.image_url ? (
            <img
              src={currentSlide.image_url}
              alt={currentSlide.title}
            />
          ) : (
            <img
              src="/images/mabini-seal.jpg"
              alt="Mabini Municipal Seal"
            />
          )}
        </div>

        <div className="news-text">
          <p className="eyebrow green">COMMUNITY NEWS</p>

          <h3>{currentSlide.title}</h3>

          <p>
            {currentSlide.description ||
              "No description available."}
          </p>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            className="carousel-btn prev"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            ❮
          </button>

          <button
            className="carousel-btn next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ❯
          </button>

          <div className="dots">
            {slides.map((slide, n) => (
              <button
                key={slide.id}
                className={index === n ? "active" : ""}
                aria-label={`Go to slide ${n + 1}`}
                onClick={() => setIndex(n)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
