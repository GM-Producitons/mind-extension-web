"use server";

import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { convertLocalToUtcTime } from "../components/todo/utils";

export async function deleteTodo(todoId: string) {
  try {
    const db = await getDB();
    const user = db.collection("users").find({ isMe: true });
    const deletedTodo = db
      .collection("todos")
      .deleteOne({ _id: new ObjectId(todoId) });
    return JSON.parse(JSON.stringify({ success: true, deletedTodo }));
  } catch (error) {
    console.error("Error deleting todo: ", error);
  }
}

export async function addTodo(
  title: string,
  date: Date,
  fromTime: string = "12:00",
  untilTime: string = "13:00",
) {
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ isMe: true });
    const utcOffset = user?.utcOffset ?? 2;
    const utcFromTime = convertLocalToUtcTime(fromTime, utcOffset);

    const result = await db.collection("todos").insertOne({
      title,
      date: new Date(date),
      fromTime,
      utcFromTime,
      untilTime,
      completed: false,
      createdAt: new Date(),
    });

    return JSON.parse(
      JSON.stringify({
        success: true,
        todo: {
          _id: result.insertedId,
          title,
          date,
          fromTime,
          utcFromTime,
          untilTime,
          completed: false,
        },
      }),
    );
  } catch (error) {
    console.error("Error adding todo:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to add todo" }),
    );
  }
}

export async function addTTR(title: string, date: Date) {
  try {
    const db = await getDB();
    const normalizedTitle = title.trim();
    const normalizedTags = normalizeTags([]);
    const result = await db.collection("ttrs").insertOne({
      title: normalizedTitle,
      date: new Date(date),
      tags: normalizedTags,
      createdAt: new Date(),
    });

    return JSON.parse(
      JSON.stringify({
        success: true,
        ttr: {
          _id: result.insertedId,
          title: normalizedTitle,
          date,
          tags: normalizedTags,
        },
      }),
    );
  } catch (error) {
    console.error("Error adding TTR:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to add TTR" }),
    );
  }
}

export async function addTTRWithTags(
  title: string,
  date: Date,
  tags: string[],
) {
  try {
    const db = await getDB();
    const normalizedTitle = title.trim();
    const normalizedTags = normalizeTags(tags);

    const result = await db.collection("ttrs").insertOne({
      title: normalizedTitle,
      date: new Date(date),
      tags: normalizedTags,
      createdAt: new Date(),
    });

    return JSON.parse(
      JSON.stringify({
        success: true,
        ttr: {
          _id: result.insertedId,
          title: normalizedTitle,
          date,
          tags: normalizedTags,
        },
      }),
    );
  } catch (error) {
    console.error("Error adding TTR with tags:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to add TTR" }),
    );
  }
}

export async function getUserTTRTags() {
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ isMe: true });
    const tags = normalizeTags(
      Array.isArray(user?.ttrTags) ? user.ttrTags : [],
    );
    return JSON.parse(JSON.stringify({ success: true, tags }));
  } catch (error) {
    console.error("Error fetching user TTR tags:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to fetch user tags" }),
    );
  }
}

export async function createUserTTRTag(tag: string) {
  try {
    const db = await getDB();
    const normalizedTag = tag.trim();

    if (!normalizedTag) {
      return JSON.parse(
        JSON.stringify({ success: false, error: "Tag cannot be empty" }),
      );
    }

    const user = await db.collection("users").findOne({ isMe: true });
    if (!user) {
      return JSON.parse(
        JSON.stringify({ success: false, error: "User not found" }),
      );
    }

    const currentTags = normalizeTags(
      Array.isArray(user.ttrTags) ? user.ttrTags : [],
    );
    const hasTag = currentTags.some(
      (existingTag) =>
        existingTag.toLowerCase() === normalizedTag.toLowerCase(),
    );

    const nextTags = hasTag ? currentTags : [...currentTags, normalizedTag];

    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { ttrTags: nextTags } });

    return JSON.parse(JSON.stringify({ success: true, tags: nextTags }));
  } catch (error) {
    console.error("Error creating user TTR tag:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to create tag" }),
    );
  }
}

const normalizeTags = (tags: string[]): string[] => {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
  );
};

export async function getTodos() {
  try {
    const db = await getDB();
    const todos = await db.collection("todos").find({}).toArray();
    return JSON.parse(JSON.stringify({ success: true, todos }));
  } catch (error) {
    console.error("Error fetching todos:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to fetch todos" }),
    );
  }
}

export async function getTTRs() {
  try {
    const db = await getDB();
    const ttrs = await db
      .collection("ttrs")
      .find({})
      .sort({ date: -1 })
      .toArray();
    return JSON.parse(JSON.stringify({ success: true, ttrs }));
  } catch (error) {
    console.error("Error fetching TTRs:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to fetch TTRs" }),
    );
  }
}

export async function updateTodoCompleted(todoId: string, completed: boolean) {
  try {
    const db = await getDB();
    const result = await db
      .collection("todos")
      .updateOne({ _id: new ObjectId(todoId) }, { $set: { completed } });

    return JSON.parse(
      JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
    );
  } catch (error) {
    console.error("Error updating todo:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to update todo" }),
    );
  }
}

export async function updateTodo(
  todoId: string,
  title: string,
  date: Date,
  fromTime: string,
  untilTime: string,
) {
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ isMe: true });
    const utcOffset = user?.utcOffset ?? 2;
    const utcFromTime = convertLocalToUtcTime(fromTime, utcOffset);

    const result = await db.collection("todos").updateOne(
      { _id: new ObjectId(todoId) },
      {
        $set: {
          title,
          date: new Date(date),
          fromTime,
          utcFromTime,
          untilTime,
        },
      },
    );

    return JSON.parse(
      JSON.stringify({ success: true, modifiedCount: result.modifiedCount }),
    );
  } catch (error) {
    console.error("Error updating todo:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to update todo" }),
    );
  }
}
