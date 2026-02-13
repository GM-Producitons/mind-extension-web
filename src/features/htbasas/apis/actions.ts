'use server';

import { getDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function addTodo(title: string, date: Date) {
  try {
    const db = await getDB();
    const result = await db.collection('todos').insertOne({
      title,
      date: new Date(date),
      completed: false,
      createdAt: new Date(),
    });

    return JSON.parse(JSON.stringify({ success: true, todo: { _id: result.insertedId, title, date, completed: false } }));
  } catch (error) {
    console.error('Error adding todo:', error);
    return JSON.parse(JSON.stringify({ success: false, error: 'Failed to add todo' }));
  }
}

export async function addTTR(title: string, date: Date) {
  try {
    const db = await getDB();
    const result = await db.collection('ttrs').insertOne({
      title,
      date: new Date(date),
      createdAt: new Date(),
    });

    return JSON.parse(JSON.stringify({ success: true, ttr: { _id: result.insertedId, title, date } }));
  } catch (error) {
    console.error('Error adding TTR:', error);
    return JSON.parse(JSON.stringify({ success: false, error: 'Failed to add TTR' }));
  }
}

export async function getTodos() {
  try {
    const db = await getDB();
    const todos = await db.collection('todos').find({}).toArray();
    return JSON.parse(JSON.stringify({ success: true, todos }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return JSON.parse(JSON.stringify({ success: false, error: 'Failed to fetch todos' }));
  }
}

export async function getTTRs() {
  try {
    const db = await getDB();
    const ttrs = await db.collection('ttrs').find({}).sort({ date: -1 }).toArray();
    return JSON.parse(JSON.stringify({ success: true, ttrs }));
  } catch (error) {
    console.error('Error fetching TTRs:', error);
    return JSON.parse(JSON.stringify({ success: false, error: 'Failed to fetch TTRs' }));
  }
}

export async function updateTodoCompleted(todoId: string, completed: boolean) {
  try {
    const db = await getDB();
    const result = await db.collection('todos').updateOne(
      { _id: new ObjectId(todoId) },
      { $set: { completed } }
    );

    return JSON.parse(JSON.stringify({ success: true, modifiedCount: result.modifiedCount }));
  } catch (error) {
    console.error('Error updating todo:', error);
    return JSON.parse(JSON.stringify({ success: false, error: 'Failed to update todo' }));
  }
}
