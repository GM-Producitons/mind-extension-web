"use client";

import { useCallback, useEffect, useState } from "react";
import { listPeopleAction } from "../actions/people.actions";
import type { Person, PersonGraph } from "../types";

const emptyGraph: PersonGraph = { nodes: [], links: [] };

export function usePeopleGraph() {
  const [people, setPeople] = useState<Person[]>([]);
  const [graph, setGraph] = useState<PersonGraph>(emptyGraph);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await listPeopleAction();
    if (!result.success) {
      setError("error" in result ? result.error : "Could not load people");
      return;
    }
    setError(null);
    setPeople(result.data.people);
    setGraph(result.data.graph);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void listPeopleAction().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError("error" in result ? result.error : "Could not load people");
        setIsLoading(false);
        return;
      }
      setPeople(result.data.people);
      setGraph(result.data.graph);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener("people-changed", onChange);
    return () => window.removeEventListener("people-changed", onChange);
  }, [reload]);

  return { people, graph, isLoading, error, reload };
}
