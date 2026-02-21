"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical, Plus } from "lucide-react";
import {
  addTodo,
  getTodos,
  updateTodoCompleted,
  updateTodo,
} from "../apis/actions";

interface TodoItem {
  _id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  fromTime?: string;
  untilTime?: string;
}

interface TodoSectionProps {
  selectedDate: Date;
  onTodosLoaded: (todos: TodoItem[]) => void;
}

const TodoSection = ({ selectedDate, onTodosLoaded }: TodoSectionProps) => {
  const today = new Date();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDate, setTodoDate] = useState(today.toISOString().split("T")[0]);
  const [todoFromTime, setTodoFromTime] = useState("12:00");
  const [todoUntilTime, setTodoUntilTime] = useState("13:00");
  const [todoOpen, setTodoOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFromTime, setEditFromTime] = useState("");
  const [editUntilTime, setEditUntilTime] = useState("");
  const [todoLoading, setTodoLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      const result = await getTodos();
      if (result.success) {
        setTodos(result.todos);
        filterTodosByDate(result.todos, selectedDate);
      }
      setIsInitializing(false);
    };
    fetchTodos();
  }, []);

  // Re-filter when selectedDate changes
  useEffect(() => {
    filterTodosByDate(todos, selectedDate);
  }, [selectedDate, todos]);

  const filterTodosByDate = (todosList: TodoItem[], dateToFilter: Date) => {
    const dateStart = new Date(
      dateToFilter.getFullYear(),
      dateToFilter.getMonth(),
      dateToFilter.getDate(),
    );
    const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

    const filtered = todosList.filter((todo) => {
      const todoDate = new Date(todo.date);
      return todoDate >= dateStart && todoDate < dateEnd;
    });

    // Sort by time
    const sorted = filtered.sort((a, b) => {
      const timeA = a.fromTime || "12:00";
      const timeB = b.fromTime || "12:00";
      return timeA.localeCompare(timeB);
    });

    setFilteredTodos(sorted);
    onTodosLoaded(sorted);
  };

  const handleAddTodo = async () => {
    if (!todoTitle.trim()) return;

    setTodoLoading(true);
    const result = await addTodo(
      todoTitle,
      new Date(todoDate),
      todoFromTime,
      todoUntilTime,
    );

    if (result.success) {
      const newTodo: TodoItem = {
        _id: result.todo._id,
        title: todoTitle,
        date: todoDate,
        completed: false,
        createdAt: new Date().toISOString(),
        fromTime: todoFromTime,
        untilTime: todoUntilTime,
      };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      filterTodosByDate(updatedTodos, selectedDate);
      setTodoTitle("");
      setTodoDate(today.toISOString().split("T")[0]);
      setTodoFromTime("12:00");
      setTodoUntilTime("13:00");
      setTodoOpen(false);
    }
    setTodoLoading(false);
  };

  const handleCheckboxChange = async (
    todoId: string,
    currentCompleted: boolean,
  ) => {
    const newCompleted = !currentCompleted;
    const result = await updateTodoCompleted(todoId, newCompleted);

    if (result.success) {
      const updatedTodos = todos.map((todo) =>
        todo._id === todoId ? { ...todo, completed: newCompleted } : todo,
      );
      setTodos(updatedTodos);
      filterTodosByDate(updatedTodos, selectedDate);
    }
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodoId(todo._id);
    setEditTitle(todo.title);
    setEditDate(todo.date);
    setEditFromTime(todo.fromTime || "12:00");
    setEditUntilTime(todo.untilTime || "13:00");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editingTodoId) return;

    setTodoLoading(true);
    const result = await updateTodo(
      editingTodoId,
      editTitle,
      new Date(editDate),
      editFromTime,
      editUntilTime,
    );

    if (result.success) {
      const updatedTodos = todos.map((todo) =>
        todo._id === editingTodoId
          ? {
              ...todo,
              title: editTitle,
              date: editDate,
              fromTime: editFromTime,
              untilTime: editUntilTime,
            }
          : todo,
      );
      setTodos(updatedTodos);
      filterTodosByDate(updatedTodos, selectedDate);
      setEditingTodoId(null);
      setEditTitle("");
      setEditDate("");
      setEditFromTime("");
      setEditUntilTime("");
    }
    setTodoLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditTitle("");
    setEditDate("");
    setEditFromTime("");
    setEditUntilTime("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          To do's
        </h2>
        <Popover open={todoOpen} onOpenChange={setTodoOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add to do</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Add a new to do</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Title
                </label>
                <Input
                  placeholder="Enter todo title"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTodo();
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  type="date"
                  value={todoDate}
                  onChange={(e) => setTodoDate(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      From
                    </label>
                    <Input
                      type="time"
                      value={todoFromTime}
                      onChange={(e) => setTodoFromTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Until
                    </label>
                    <Input
                      type="time"
                      value={todoUntilTime}
                      onChange={(e) => setTodoUntilTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddTodo}
                disabled={!todoTitle.trim() || todoLoading}
                className="w-full"
              >
                {todoLoading ? "Adding..." : "Add to do"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* Todo list */}
      <div className="space-y-2 sm:space-y-3">
        {isInitializing ? (
          <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
            Loading...
          </p>
        ) : filteredTodos.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
            No todos for this day
          </p>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo._id}>
              {editingTodoId === todo._id ? (
                <div className="p-2 sm:p-4 bg-muted rounded-lg space-y-3 border border-foreground">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Title
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Todo title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        From
                      </label>
                      <Input
                        type="time"
                        value={editFromTime}
                        onChange={(e) => setEditFromTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Until
                      </label>
                      <Input
                        type="time"
                        value={editUntilTime}
                        onChange={(e) => setEditUntilTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={!editTitle.trim() || todoLoading}
                      size="sm"
                      className="flex-1"
                    >
                      {todoLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={todoLoading}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 bg-muted rounded-lg hover:bg-accent transition">
                  <Checkbox
                    className="mt-0.5 sm:mt-1"
                    checked={todo.completed}
                    onCheckedChange={() =>
                      handleCheckboxChange(todo._id, todo.completed)
                    }
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
                    </p>
                  </div>
                  <Button
                    onClick={() => handleEditTodo(todo)}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    <EllipsisVertical size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoSection;
