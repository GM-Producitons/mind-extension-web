"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/date-picker";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPersonAction } from "../actions/people.actions";
import type { Gender } from "../types";

interface CreatePersonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreatePersonDrawer({
  open,
  onOpenChange,
  onCreated,
}: CreatePersonDrawerProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [birthday, setBirthday] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    if (!gender) {
      toast.error("Gender is required");
      return;
    }
    setIsSaving(true);
    const parsed = birthday.trim() ? new Date(birthday) : null;
    const result = await createPersonAction({
      name,
      gender,
      birthday: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
    });
    setIsSaving(false);
    if (!result.success) {
      toast.error("error" in result ? result.error : "Could not add person");
      return;
    }
    toast.success("Person added");
    window.dispatchEvent(new Event("people-changed"));
    setName("");
    setGender("");
    setBirthday("");
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New person</DrawerTitle>
        </DrawerHeader>
        <div className="grid gap-3 px-4">
          <div className="grid gap-1">
            <Label htmlFor="person-name">Name</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Gender</Label>
            <Select
              value={gender}
              onValueChange={(value) => setGender(value as Gender)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>Birthday</Label>
            <DatePickerInput
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </div>
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
