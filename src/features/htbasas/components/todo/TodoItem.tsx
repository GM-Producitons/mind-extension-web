"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EllipsisVertical } from "lucide-react";
import { TodoForm } from "./TodoForm";
import { calculateDuration } from "./utils";

interface TodoItem {
  _id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  fromTime?: string;
  untilTime?: string;
}

interface TodoItemProps {
  todo: TodoItem;
  onCheckChange: (todoId: string, completed: boolean) => void;
  onEdit: (todo: TodoItem) => void;
  onSaveEdit: (
    title: string,
    date: string,
    fromTime: string,
    duration: number,
  ) => void;
  onCancelEdit: () => void;
  isEditing: boolean;
  editState?: {
    title: string;
    setTitle: (v: string) => void;
    date: string;
    setDate: (v: string) => void;
    fromTime: string;
    setFromTime: (v: string) => void;
    duration: number;
    setDuration: (v: number) => void;
  };
  isLoading?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const TodoItem = ({
  todo,
  onCheckChange,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  isEditing,
  editState,
  isLoading = false,
}: TodoItemProps) => {
  if (isEditing && editState) {
    return (
      <div className="p-2 sm:p-4 bg-muted rounded-lg space-y-3 border border-foreground">
        <TodoForm
          title={editState.title}
          setTitle={editState.setTitle}
          date={editState.date}
          setDate={editState.setDate}
          fromTime={editState.fromTime}
          setFromTime={editState.setFromTime}
          duration={editState.duration}
          setDuration={editState.setDuration}
          onSubmit={() =>
            onSaveEdit(
              editState.title,
              editState.date,
              editState.fromTime,
              editState.duration,
            )
          }
          isLoading={isLoading}
          submitLabel="Save"
          onCancel={onCancelEdit}
          showCancel={true}
        />
      </div>
    );
  }

  const duration =
    todo.fromTime && todo.untilTime
      ? calculateDuration(todo.fromTime, todo.untilTime)
      : 0;

  return (
    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 bg-muted rounded-lg hover:bg-accent transition">
      <Checkbox
        className="mt-0.5 sm:mt-1"
        checked={todo.completed}
        onCheckedChange={() => onCheckChange(todo._id, todo.completed)}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm sm:text-base break-words ${
            todo.completed
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }`}
        >
          {todo.title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatDate(todo.date)}
          {todo.fromTime && ` • ${todo.fromTime}`}
          {todo.untilTime && ` - ${todo.untilTime}`}
          {duration > 0 && ` • ${duration} min`}
        </p>
      </div>
      <Button
        onClick={() => onEdit(todo)}
        size="sm"
        variant="outline"
        className="text-xs px-2 py-1"
      >
        <EllipsisVertical size={14} className="sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
};
