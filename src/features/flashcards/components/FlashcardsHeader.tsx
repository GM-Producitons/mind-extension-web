"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/features/shared/template/page-header";
import type { ClusterSort } from "../types";

const SORT_OPTIONS: { value: ClusterSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "size", label: "Size" },
  { value: "name", label: "Name" },
  { value: "lastTrained", label: "Last trained" },
];

interface FlashcardsHeaderProps {
  searchQuery: string;
  sort: ClusterSort;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ClusterSort) => void;
  onCreateCluster: () => void;
  onCreateCard: () => void;
}

export function FlashcardsHeader({
  searchQuery,
  sort,
  onSearchChange,
  onSortChange,
  onCreateCluster,
  onCreateCard,
}: FlashcardsHeaderProps) {
  return (
    <div className="sticky top-0 z-10 mb-4 bg-background">
      <PageHeader title="Flashcards" size="sm" className="mb-3" />
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-56">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search clusters"
            aria-label="Search clusters"
          />
        </InputGroup>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as ClusterSort)}
        >
          <SelectTrigger aria-label="Sort clusters" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" asChild>
          <Link href="/flashcards/practice">Practice all</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateCluster}>
          New cluster
        </Button>
        <Button size="sm" onClick={onCreateCard}>
          Add card
        </Button>
      </div>
    </div>
  );
}
