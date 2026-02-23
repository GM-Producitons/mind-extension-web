"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTodoCRUD } from "./todo/useTodoCRUD";
import { useTodoForm } from "./todo/useTodoForm";
import { TodoForm } from "./todo/TodoForm";
import { TodoItem } from "./todo/TodoItem";
import { calculateDuration } from "./todo/utils";

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
  const {
    todos,
    setTodos,
    isLoading,
    fetchTodos,
    addNewTodo,
    toggleTodoCompleted,
    updateTodoItem,
  } = useTodoCRUD();

  const addForm = useTodoForm();
  const editForm = useTodoForm();

  const [filteredTodos, setFilteredTodos] = useState<TodoItem[]>([]);
  const [todoOpen, setTodoOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    const init = async () => {
      await fetchTodos();
      setIsInitializing(false);
    };
    init();
  }, []);

  // Re-filter when selectedDate or todos change
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
    const state = addForm.getState();
    if (!state.title.trim()) return;

    const result = await addNewTodo(
      state.title,
      new Date(state.date),
      state.fromTime,
      state.duration,
    );

    if (result.success) {
      addForm.reset();
      setTodoOpen(false);
      setTodos(result.todos ?? []);
    }
  };

  const handleCheckboxChange = async (
    todoId: string,
    currentCompleted: boolean,
  ) => {
    const result = await toggleTodoCompleted(todoId, currentCompleted);
    if (result.success) {
      setTodos(result.todos ?? []);
    }
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodoId(todo._id);
    const duration =
      todo.fromTime && todo.untilTime
        ? calculateDuration(todo.fromTime, todo.untilTime)
        : 60;
    editForm.setFromState({
      title: todo.title,
      date: todo.date,
      fromTime: todo.fromTime || "12:00",
      duration,
    });
  };

  const handleSaveEdit = async () => {
    const state = editForm.getState();
    if (!state.title.trim() || !editingTodoId) return;

    const result = await updateTodoItem(
      editingTodoId,
      state.title,
      new Date(state.date),
      state.fromTime,
      state.duration,
    );

    if (result.success) {
      setTodos(result.todos ?? []);
      setEditingTodoId(null);
      editForm.reset();
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    editForm.reset();
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
              <TodoForm
                title={addForm.todoTitle}
                setTitle={addForm.setTodoTitle}
                date={addForm.todoDate}
                setDate={addForm.setTodoDate}
                fromTime={addForm.todoFromTime}
                setFromTime={addForm.setTodoFromTime}
                duration={addForm.todoDuration}
                setDuration={addForm.setTodoDuration}
                onSubmit={handleAddTodo}
                isLoading={isLoading}
                submitLabel="Add to do"
              />
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
            <TodoItem
              key={todo._id}
              todo={todo}
              onCheckChange={handleCheckboxChange}
              onEdit={handleEditTodo}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              isEditing={editingTodoId === todo._id}
              editState={
                editingTodoId === todo._id
                  ? {
                      title: editForm.todoTitle,
                      setTitle: editForm.setTodoTitle,
                      date: editForm.todoDate,
                      setDate: editForm.setTodoDate,
                      fromTime: editForm.todoFromTime,
                      setFromTime: editForm.setTodoFromTime,
                      duration: editForm.todoDuration,
                      setDuration: editForm.setTodoDuration,
                    }
                  : undefined
              }
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoSection;
