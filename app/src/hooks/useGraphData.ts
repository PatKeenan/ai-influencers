import { useState, useEffect } from "react";
import { fetchGraphData } from "../lib/api";
import type { Person, Edge } from "../lib/types";

export function useGraphData() {
  const [people, setPeople] = useState<Person[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData()
      .then(data => {
        setPeople(data.people as Person[]);
        setEdges(data.edges as Edge[]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { people, edges, loading, error };
}
