"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBucketList } from "../hooks/use-bucket-list";

const WIDTH = 340;
const HEIGHT = 360;
const WALL = 20;

interface Chip {
  id: string;
  label: string;
  w: number;
  h: number;
  body: Matter.Body;
}

function chipSize(label: string) {
  return {
    w: Math.min(150, Math.max(72, label.length * 7 + 20)),
    h: 34,
  };
}

function placeChip(count: number, w: number, h: number, fromTop: boolean) {
  const minX = WALL + w / 2 + 6;
  const maxX = WIDTH - WALL - w / 2 - 6;
  const span = Math.max(maxX - minX, 1);
  const x = minX + ((count * 47) % span);
  const y = fromTop ? -h : 28 + (count % 4) * (h + 14);
  return { x, y };
}

export function BucketListPhysics() {
  const { items, isLoading, isAdding, addItem } = useBucketList();
  const [label, setLabel] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const chipMapRef = useRef<Map<string, Chip>>(new Map());
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const settledRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;

    const ground = Matter.Bodies.rectangle(
      WIDTH / 2,
      HEIGHT - WALL / 2,
      WIDTH,
      WALL,
      { isStatic: true },
    );
    const left = Matter.Bodies.rectangle(WALL / 2, HEIGHT / 2, WALL, HEIGHT, {
      isStatic: true,
    });
    const right = Matter.Bodies.rectangle(
      WIDTH - WALL / 2,
      HEIGHT / 2,
      WALL,
      HEIGHT,
      { isStatic: true },
    );
    Matter.Composite.add(engine.world, [ground, left, right]);

    const mouse = Matter.Mouse.create(stage);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2 },
    });
    Matter.Composite.add(engine.world, mouseConstraint);

    const sync = () => {
      for (const chip of chipMapRef.current.values()) {
        const node = nodeRefs.current.get(chip.id);
        if (!node) continue;
        const { x, y } = chip.body.position;
        node.style.transform = `translate(${x - chip.w / 2}px, ${y - chip.h / 2}px) rotate(${chip.body.angle}rad)`;
      }
    };
    Matter.Events.on(engine, "afterUpdate", sync);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    for (const item of itemsRef.current) {
      const { w, h } = chipSize(item.label);
      const { x, y } = placeChip(chipMapRef.current.size, w, h, false);
      const body = Matter.Bodies.rectangle(x, y, w, h, {
        restitution: 0.45,
        friction: 0.1,
        frictionAir: 0.01,
      });
      Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
      Matter.Composite.add(engine.world, body);
      chipMapRef.current.set(item._id, {
        id: item._id,
        label: item.label,
        w,
        h,
        body,
      });
    }
    if (chipMapRef.current.size > 0) {
      setChips(Array.from(chipMapRef.current.values()));
      settledRef.current = true;
    }

    return () => {
      Matter.Runner.stop(runner);
      Matter.Events.off(engine, "afterUpdate", sync);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      chipMapRef.current.clear();
      nodeRefs.current.clear();
      settledRef.current = false;
    };
  }, []);

  const spawn = (id: string, text: string, fromTop: boolean) => {
    const engine = engineRef.current;
    if (!engine || chipMapRef.current.has(id)) return;
    const { w, h } = chipSize(text);
    const count = chipMapRef.current.size;
    const { x, y } = placeChip(count, w, h, fromTop);
    const body = Matter.Bodies.rectangle(x, y, w, h, {
      restitution: 0.45,
      friction: 0.1,
      frictionAir: 0.01,
    });
    Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 3,
      y: fromTop ? 2 : 0,
    });
    Matter.Composite.add(engine.world, body);
    chipMapRef.current.set(id, { id, label: text, w, h, body });
    setChips(Array.from(chipMapRef.current.values()));
  };

  useEffect(() => {
    if (isLoading || !engineRef.current) return;
    for (const item of items) {
      if (!chipMapRef.current.has(item._id)) {
        spawn(item._id, item.label, settledRef.current);
      }
    }
    settledRef.current = true;
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
        ref={stageRef}
        className="relative mx-auto overflow-hidden bg-muted/20"
        style={{ width: WIDTH, height: HEIGHT, touchAction: "none" }}
      >
        <div
          className="pointer-events-none absolute bottom-0 left-0 bg-border"
          style={{ width: WALL, height: HEIGHT }}
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 bg-border"
          style={{ width: WALL, height: HEIGHT }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 bg-border"
          style={{ width: WIDTH, height: WALL }}
        />
        {chips.map((chip) => (
          <div
            key={chip.id}
            ref={(node) => {
              if (node) nodeRefs.current.set(chip.id, node);
              else nodeRefs.current.delete(chip.id);
            }}
            className="pointer-events-none absolute top-0 left-0 flex items-center justify-center overflow-hidden rounded-md border border-border bg-card px-2 text-xs text-card-foreground"
            style={{ width: chip.w, height: chip.h }}
          >
            <span className="truncate">{chip.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
