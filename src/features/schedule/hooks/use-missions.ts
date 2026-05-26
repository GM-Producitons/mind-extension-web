"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import {
  createMissionAction,
  deleteMissionAction,
  getMissionsAction,
  updateMissionAction,
} from "../apis/actions";
import type { Mission } from "../types";

export interface MissionFormData {
  name: string;
  priority: number;
  deadline: Date;
}

export interface UseMissionsReturn {
  missions: Mission[];
  isLoading: boolean;
  isSubmitting: boolean;
  addMission: (data: MissionFormData) => Promise<void>;
  updateMission: (id: string, data: MissionFormData) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
}

type OptimisticAction =
  | { type: "add"; mission: Mission }
  | { type: "update"; id: string; data: Partial<Mission> }
  | { type: "delete"; id: string };

function applyOptimisticAction(
  current: Mission[],
  action: OptimisticAction,
): Mission[] {
  switch (action.type) {
    case "add":
      return [...current, action.mission];
    case "update":
      return current.map((m) =>
        m._id === action.id ? { ...m, ...action.data } : m,
      );
    case "delete":
      return current.filter((m) => m._id !== action.id);
  }
}

export function useMissions(): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [optimisticMissions, dispatchOptimistic] = useOptimistic(
    missions,
    applyOptimisticAction,
  );

  useEffect(() => {
    getMissionsAction().then((result) => {
      if (result.success) setMissions(result.data);
      setIsLoading(false);
    });
  }, []);

  const addMission = async (data: MissionFormData): Promise<void> => {
    startTransition(async () => {
      const tempMission: Mission = {
        _id: `temp-${Date.now()}`,
        ...data,
        taskIds: [],
        completionRate: 0,
        createdAt: new Date(),
      };
      dispatchOptimistic({ type: "add", mission: tempMission });
      const result = await createMissionAction(data);
      if (result.success) {
        setMissions((prev) => [...prev, result.data]);
      }
    });
  };

  const updateMission = async (
    id: string,
    data: MissionFormData,
  ): Promise<void> => {
    startTransition(async () => {
      dispatchOptimistic({ type: "update", id, data });
      const result = await updateMissionAction(id, data);
      if (result.success) {
        setMissions((prev) =>
          prev.map((m) => (m._id === id ? result.data : m)),
        );
      }
    });
  };

  const deleteMission = async (id: string): Promise<void> => {
    startTransition(async () => {
      dispatchOptimistic({ type: "delete", id });
      await deleteMissionAction(id);
      setMissions((prev) => prev.filter((m) => m._id !== id));
    });
  };

  return {
    missions: optimisticMissions,
    isLoading,
    isSubmitting: isPending,
    addMission,
    updateMission,
    deleteMission,
  };
}
