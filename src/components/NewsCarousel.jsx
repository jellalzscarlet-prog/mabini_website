
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NewsCarousel() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transition, setTransition] = useState("enter");

  const touchStartX = useRef(0);
  const lastSwipeTime = useRef(0);
  const transitionTimer = useRef(null);

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

    const channel = supabase
      .channel("news-carousel-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
        },
        fetchNews
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);

      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function changeSlide(newIndex) {
    if (slides.length <= 1 || newIndex === index) return;

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }

    setTransition("exit");

    transitionTimer.current = setTimeout(() => {
      setIndex(newIndex);
      setTransition("enter");
    }, 250);
  }

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
      setTransition("enter");
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  function previousSlide() {
    if (slides.length <= 1) return;

    const newIndex =
      index === 0 ? slides.length - 1 : index - 1;

    changeSlide(newIndex);
  }

  function nextSlide() {
    if (slides.length <= 1) return;

    const newIndex = (index + 1) % slides.length;

    changeSlide(newIndex);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (slides.length <= 1) return;

    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;

    if (Math.abs(difference) < 50) return;

    lastSwipeTime.current = Date.now();

    if (difference > 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }

  function preventSwipeClick(e) {
    if (Date.now() - lastSwipeTime.current < 500) {
      e.preventDefault();
    }
  }

  if (loading) {
    return (
      <div className="news-carousel news-carousel-message">
        <p>Loading news and events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-carousel news-carousel-message">
        <p>{error}</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="news-carousel news-carousel-message">
        <p>No news and events available at the moment.</p>
      </div>
    );
  }

  const currentSlide = slides[index];

  return (
    <div
      className="news-carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Link
        to={`/news/${currentSlide.id}`}
        className={`news-slide news-slide-link ${
          transition === "exit"
            ? "carousel-exit"
            : "carousel-enter"
        }`}
        key={currentSlide.id}
        onClickCapture={preventSwipeClick}
      >
        <div className="news-img">
          <img
            src={currentSlide.image_url || "/images/mabini-seal.jpg"}
            alt={currentSlide.title}
          />
        </div>

        <div className="news-text">
          <span className="news-category">
            COMMUNITY NEWS & EVENTS
          </span>

          <h3>{currentSlide.title}</h3>

          <p className="news-description">
            {currentSlide.description
              ? `${currentSlide.description.slice(0, 220)}${
                  currentSlide.description.length > 220 ? "..." : ""
                }`
              : "No description available."}
          </p>

          <span className="news-read-more">
            Read Full Article <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

      {slides.length > 1 && (
        <div className="news-carousel-controls">
          <div className="dots">
            {slides.map((slide, n) => (
              <button
                type="button"
                key={slide.id}
                className={index === n ? "active" : ""}
                aria-label={`Go to news article ${n + 1}`}
                aria-current={index === n ? "true" : undefined}
                onClick={() => changeSlide(n)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
