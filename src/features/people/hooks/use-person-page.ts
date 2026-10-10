"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPersonAction,
  setPersonLinksAction,
} from "../actions/people.actions";
import type { Person } from "../types";

export function usePersonPage(id: string) {
  const [person, setPerson] = useState<Person | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await getPersonAction(id);
    if (!result.success) {
      setError("error" in result ? result.error : "Could not load person");
      return;
    }
    setError(null);
    setPerson(result.data.person);
    setPeople(result.data.people);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void getPersonAction(id).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError("error" in result ? result.error : "Could not load person");
        setIsLoading(false);
        return;
      }
      setPerson(result.data.person);
      setPeople(result.data.people);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const onChange = () => void reload();
    window.addEventListener("people-changed", onChange);
    return () => window.removeEventListener("people-changed", onChange);
  }, [reload]);

  const toggleLink = async (otherId: string) => {
    if (!person) return;
    const linked = person.linkedIds.includes(otherId)
      ? person.linkedIds.filter((linkId) => linkId !== otherId)
      : [...person.linkedIds, otherId];
    const result = await setPersonLinksAction(id, linked);
    if (!result.success) {
      toast.error("error" in result ? result.error : "Could not update links");
      return;
    }
    setPerson(result.data);
  };

  return { person, people, isLoading, error, toggleLink };
}
