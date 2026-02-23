import { useState } from "react";
import {
  addTodo,
  getTodos,
  updateTodoCompleted,
  updateTodo,
} from "@/features/htbasas/apis/actions";
import { calculateEndTime } from "./utils";

interface TodoItem {
  _id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  fromTime?: string;
  untilTime?: string;
}

export const useTodoCRUD = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTodos = async () => {
    const result = await getTodos();
    if (result.success) {
      setTodos(result.todos);
      return result.todos;
    }
    return [];
  };

  const addNewTodo = async (
    title: string,
    date: Date,
    fromTime: string,
    duration: number,
  ) => {
    setIsLoading(true);
    const untilTime = calculateEndTime(fromTime, duration);
    const result = await addTodo(title, date, fromTime, untilTime);

    if (result.success) {
      const newTodo: TodoItem = {
        _id: result.todo._id,
        title,
        date: date.toISOString().split("T")[0],
        completed: false,
        createdAt: new Date().toISOString(),
        fromTime,
        untilTime,
      };
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      setIsLoading(false);
      return { success: true, todos: updatedTodos };
    }
    setIsLoading(false);
    return { success: false };
  };

  const toggleTodoCompleted = async (
    todoId: string,
    currentCompleted: boolean,
  ) => {
    setIsLoading(true);
    const newCompleted = !currentCompleted;
    const result = await updateTodoCompleted(todoId, newCompleted);

    if (result.success) {
      const updatedTodos = todos.map((todo) =>
        todo._id === todoId ? { ...todo, completed: newCompleted } : todo,
      );
      setTodos(updatedTodos);
      setIsLoading(false);
      return { success: true, todos: updatedTodos };
    }
    setIsLoading(false);
    return { success: false };
  };

  const updateTodoItem = async (
    todoId: string,
    title: string,
    date: Date,
    fromTime: string,
    duration: number,
  ) => {
    setIsLoading(true);
    const untilTime = calculateEndTime(fromTime, duration);
    const result = await updateTodo(todoId, title, date, fromTime, untilTime);

    if (result.success) {
      const updatedTodos = todos.map((todo) =>
        todo._id === todoId
          ? {
              ...todo,
              title,
              date: date.toISOString().split("T")[0],
              fromTime,
              untilTime,
            }
          : todo,
      );
      setTodos(updatedTodos);
      setIsLoading(false);
      return { success: true, todos: updatedTodos };
    }
    setIsLoading(false);
    return { success: false };
  };

  return {
    todos,
    setTodos,
    isLoading,
    fetchTodos,
    addNewTodo,
    toggleTodoCompleted,
    updateTodoItem,
  };
};
