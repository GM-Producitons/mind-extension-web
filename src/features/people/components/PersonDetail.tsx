"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/features/shared/template/page-header";
import { usePersonPage } from "../hooks/use-person-page";

function formatBirthday(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PersonDetail({ id }: { id: string }) {
  const { person, people, isLoading, error, toggleLink } = usePersonPage(id);
  const others = people.filter((item) => item._id !== id);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 px-3 pb-24 pt-3">
      <Button variant="ghost" size="icon" asChild className="w-fit">
        <Link href="/people" aria-label="Back">
          <ChevronLeft />
        </Link>
      </Button>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading</p>
      ) : error || !person ? (
        <p className="text-xs text-destructive">{error ?? "Person not found"}</p>
      ) : (
        <>
          <PageHeader
            title={person.name}
            description={`${person.gender === "male" ? "Male" : "Female"} · ${formatBirthday(person.birthday)}`}
            size="sm"
          />

          <section>
            <p className="mb-1 text-xs font-medium">Likes</p>
            {person.likes.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="text-sm">
                {person.likes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-1 text-xs font-medium">Hates</p>
            {person.hates.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="text-sm">
                {person.hates.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-1 text-xs font-medium">Moments</p>
            {person.moments.length === 0 ? (
              <p className="text-xs text-muted-foreground">None</p>
            ) : (
              <ul className="grid gap-2">
                {person.moments.map((moment) => (
                  <li key={moment.createdAt + moment.text} className="text-sm">
                    <p>{moment.text}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {new Date(moment.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="mb-1 text-xs font-medium">Linked</p>
            {others.length === 0 ? (
              <p className="text-xs text-muted-foreground">No one else yet</p>
            ) : (
              <ul className="grid gap-1">
                {others.map((other) => {
                  const linked = person.linkedIds.includes(other._id);
                  return (
                    <li key={other._id}>
                      <Button
                        type="button"
                        variant={linked ? "default" : "outline"}
                        size="sm"
                        onClick={() => void toggleLink(other._id)}
                      >
                        {other.name}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
