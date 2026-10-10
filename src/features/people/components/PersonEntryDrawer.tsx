"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPersonEntryAction, listPeopleAction } from "../actions/people.actions";
import type { Person, PersonEntryKind } from "../types";

const kinds: { id: PersonEntryKind; label: string }[] = [
  { id: "like", label: "Like" },
  { id: "hate", label: "Hate" },
  { id: "moment", label: "Moment" },
];

interface PersonEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonEntryDrawer({ open, onOpenChange }: PersonEntryDrawerProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState("");
  const [kind, setKind] = useState<PersonEntryKind>("like");
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listPeopleAction().then((result) => {
      if (cancelled || !result.success) return;
      setPeople(result.data.people);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const save = async () => {
    if (!personId) {
      toast.error("Pick a person");
      return;
    }
    setIsSaving(true);
    const result = await addPersonEntryAction(personId, kind, text);
    setIsSaving(false);
    if (!result.success) {
      toast.error("error" in result ? result.error : "Could not save");
      return;
    }
    toast.success("Saved");
    window.dispatchEvent(new Event("people-changed"));
    setText("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>About someone</DrawerTitle>
        </DrawerHeader>
        <div className="grid gap-3 px-4">
          <Select value={personId} onValueChange={setPersonId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Person" />
            </SelectTrigger>
            <SelectContent>
              {people.map((person) => (
                <SelectItem key={person._id} value={person._id}>
                  {person.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-3 gap-2">
            {kinds.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={kind === item.id ? "default" : "outline"}
                onClick={() => setKind(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={kind === "moment" ? "What happened" : kind === "like" ? "What they like" : "What they hate"}
            rows={4}
          />
        </div>
        <DrawerFooter>
          <Button type="button" disabled={isSaving} onClick={() => void save()}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
