import { useState } from "react";
import { getLocalDateString } from "./utils";

export interface TodoFormState {
  title: string;
  date: string;
  fromTime: string;
  duration: number;
}

export const useTodoForm = (initialDate?: Date) => {
  const today = initialDate || new Date();
  const initialDate_formatted = getLocalDateString(today);
  const initialTime = today.toTimeString().slice(0, 5);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoDate, setTodoDate] = useState(initialDate_formatted);
  const [todoFromTime, setTodoFromTime] = useState(initialTime);
  const [todoDuration, setTodoDuration] = useState(60);

  const reset = () => {
    setTodoTitle("");
    setTodoDate(initialDate_formatted);
    setTodoFromTime(initialTime);
    setTodoDuration(60);
  };

  const setFromState = (state: TodoFormState) => {
    setTodoTitle(state.title);
    setTodoDate(state.date);
    setTodoFromTime(state.fromTime);
    setTodoDuration(state.duration);
  };

  return {
    todoTitle,
    setTodoTitle,
    todoDate,
    setTodoDate,
    todoFromTime,
    setTodoFromTime,
    todoDuration,
    setTodoDuration,
    reset,
    setFromState,
    getState: (): TodoFormState => ({
      title: todoTitle,
      date: todoDate,
      fromTime: todoFromTime,
      duration: todoDuration,
    }),
  };
};
