
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupabaseTest() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select("*");

      if (error) {
        console.error(error.message);
        return;
      }

      setNews(data);
    }

    fetchNews();
  }, []);

  return (
    <div>
      <h1>Supabase Connection Test</h1>

      {news.map((item) => (
        <p key={item.id}>{item.title}</p>
      ))}
    </div>
  );
}
