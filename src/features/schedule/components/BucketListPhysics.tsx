"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBucketList } from "../hooks/use-bucket-list";

const BUCKET_WIDTH = 320;
const BUCKET_HEIGHT = 220;
const WALL = 12;

interface ChipBody {
  id: string;
  label: string;
  body: Matter.Body;
}

export function BucketListPhysics() {
  const { items, isLoading, isAdding, addItem } = useBucketList();
  const [label, setLabel] = useState("");
  const [chips, setChips] = useState<ChipBody[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chipMapRef = useRef<Map<string, ChipBody>>(new Map());
  const [, setTick] = useState(0);

  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    const floor = Matter.Bodies.rectangle(
      BUCKET_WIDTH / 2,
      BUCKET_HEIGHT - WALL / 2,
      BUCKET_WIDTH,
      WALL,
      { isStatic: true },
    );
    const left = Matter.Bodies.rectangle(
      WALL / 2,
      BUCKET_HEIGHT / 2,
      WALL,
      BUCKET_HEIGHT,
      { isStatic: true },
    );
    const right = Matter.Bodies.rectangle(
      BUCKET_WIDTH - WALL / 2,
      BUCKET_HEIGHT / 2,
      WALL,
      BUCKET_HEIGHT,
      { isStatic: true },
    );
    Matter.Composite.add(engine.world, [floor, left, right]);

    let frame: number;
    const loop = () => {
      Matter.Engine.update(engine, 1000 / 60);
      setTick((t) => t + 1);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      chipMapRef.current.clear();
    };
  }, []);

  const spawnChip = (id: string, text: string, fromTop = false) => {
    const engine = engineRef.current;
    if (!engine) return;

    const w = Math.min(140, 24 + text.length * 7);
    const h = 28;
    const x = BUCKET_WIDTH / 2 + (Math.random() - 0.5) * 80;
    const y = fromTop ? 24 : BUCKET_HEIGHT - 60 - chipMapRef.current.size * 8;

    const body = Matter.Bodies.rectangle(x, y, w, h, {
      restitution: 0.2,
      friction: 0.4,
      chamfer: { radius: 6 },
    });
    Matter.Composite.add(engine.world, body);
    const chip: ChipBody = { id, label: text, body };
    chipMapRef.current.set(id, chip);
    setChips(Array.from(chipMapRef.current.values()));
  };

  const initialSyncDoneRef = useRef(false);

  useEffect(() => {
    if (isLoading || !engineRef.current) return;
    for (const item of items) {
      if (!chipMapRef.current.has(item._id)) {
        spawnChip(item._id, item.label, initialSyncDoneRef.current);
      }
    }
    initialSyncDoneRef.current = true;
  }, [items, isLoading]);

  const handleAdd = async () => {
    const value = label.trim();
    if (!value) return;
    await addItem(value);
    setLabel("");
  };

  return (
    <section className="border-b border-border px-3 py-3">
      <p className="mb-2 text-xs font-medium">Bucket list</p>
      <div className="flex gap-2 pb-3">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add item"
          className="h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAdd();
          }}
        />
        <Button
          type="button"
          size="sm"
          disabled={isAdding}
          onClick={() => void handleAdd()}
        >
          Add
        </Button>
      </div>
      <div
        ref={containerRef}
        className="relative mx-auto overflow-hidden rounded-md border border-border bg-muted/30"
        style={{ width: BUCKET_WIDTH, height: BUCKET_HEIGHT }}
      >
        {chips.map((chip) => {
          const { x, y } = chip.body.position;
          const angle = chip.body.angle;
          return (
            <div
              key={chip.id}
              className="pointer-events-none absolute flex items-center justify-center rounded-md border border-border bg-card px-2 text-xs"
              style={{
                width: chip.body.bounds.max.x - chip.body.bounds.min.x,
                height: chip.body.bounds.max.y - chip.body.bounds.min.y,
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${angle}rad)`,
              }}
            >
              {chip.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
