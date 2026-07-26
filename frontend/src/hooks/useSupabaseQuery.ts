import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DistrictStat, LitigationCase, Property } from "../lib/types";

function usePaged<T>(table: string, select: string, pageSize = 1000) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      const all: T[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from(table)
          .select(select)
          .range(from, from + pageSize - 1);
        if (error) {
          if (!cancelled) setError(error.message);
          break;
        }
        if (!data || data.length === 0) break;
        all.push(...(data as T[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      if (!cancelled) {
        setData(all);
        setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [table, select, pageSize]);

  return { data, loading, error };
}

export function useProperties() {
  return usePaged<Property>("properties", "*");
}

export function useDistrictStats() {
  return usePaged<DistrictStat>("district_stats", "*", 100);
}

export function useLitigationCases() {
  return usePaged<LitigationCase>("litigation_cases", "*", 100);
}

export function useProperty(id: string | undefined) {
  const [data, setData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setData(data as Property);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading };
}
