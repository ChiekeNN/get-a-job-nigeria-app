"use client";

import { useCallback, useEffect, useState } from "react";

import { BRAND } from "@/data/site";

const STORAGE_KEY = BRAND.storageKey;
const LEGACY_KEY = "naijahire:saved-jobs";

export function useSavedJobs() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      // Read the pre-rename key too, so existing visitors keep their saved jobs.
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSaved(parsed.filter((item): item is string => typeof item === "string"));
        }
      }
    } catch {
      setSaved([]);
    }
  }, []);

  const toggle = useCallback((slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage can be unavailable in private mode; keep in-memory state
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  return { saved, toggle, isSaved };
}
