"use client";
import { redirect } from "next/navigation";
import { getResponse } from "@/features/ai/getResponse";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMission, getMissions } from "@/features/test/createMission";

export default function Page() {
  const [response, setResponse] = useState("");
  const [text, setText] = useState("What is the meaning of life?");
  const [loading, setLoading] = useState(false);

  const [missions, setMissions] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", priority: 1, deadline: "" });

  useEffect(() => {
    getMissions().then(setMissions);
  }, []);

  function handleSubmit() {
    setLoading(true);
    getResponse({ text }).then((res) => {
      setResponse(res);
      setLoading(false);
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createMission({ ...form, deadline: new Date(form.deadline) });
    setForm({ title: "", priority: 1, deadline: "" });
    getMissions().then(setMissions);
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold tracking-tight">Test Page</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This page is for testing purposes
      </p>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button className="w-fit" onClick={handleSubmit}>
        get response
      </Button>
      <Card className="p-4">
        {!response && (
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            click the button to get response from AI
          </h2>
        )}
        {loading && <p>Loading...</p>}
        <p>{response}</p>
      </Card>

      {"get and display missions"}
      <div className="grid grid-cols-2 gap-4 w-full">
        <Card className="p-4 overflow-auto max-h-96">
          <h3 className="font-bold mb-2">Missions JSON</h3>
          <pre className="text-xs bg-slate-100 p-2 rounded">
            {JSON.stringify(missions, null, 2)}
          </pre>
        </Card>

        <Card className="p-4">
          <h3 className="font-bold mb-2">Create Mission</h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Priority"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: parseInt(e.target.value) })
              }
              required
            />
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              required
            />
            <Button type="submit">Create</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
