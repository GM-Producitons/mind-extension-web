"use client";

import { useLayoutEffect } from "react";
import {
  applyActivityColors,
  useActivityColors,
} from "../lib/activity-color-store";

export function ActivityColorSync() {
  const overrides = useActivityColors((state) => state.overrides);

  useLayoutEffect(() => {
    applyActivityColors(overrides);
  }, [overrides]);

  return null;
}
