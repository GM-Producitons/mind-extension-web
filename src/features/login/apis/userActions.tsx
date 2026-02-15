"use server";
import { getDB } from "@/lib/db";
import {createHash, compareHash} from "@/features/login/lib/auth-helpers"
import { generateToken } from "@/lib/auth-utils"

export async function createOneUser(pass: string) {
    try{
        const db = await getDB()
        const hashedPass = await createHash(pass)
        const userInserted = await db.collection("users").insertOne({
            email: "gogo05tv@gmail.com",
            name: "GM",
            password: hashedPass,
            isMe: true
        })
        return JSON.parse(JSON.stringify({success: true, user: userInserted}))
    }
    catch(error){
        console.error('Error adding user:', error);
        return JSON.parse(JSON.stringify({ success: false, error: 'Failed to add user' }));
    }
}

export async function getUserByEmail(email: string) {
    try {
        const db = await getDB()
        const user = await db.collection("users").findOne({
            email: "gogo05tv@gmail.com"
        })
        return JSON.parse(JSON.stringify({success: true, user}))
    } catch(error) {
        console.error('Error fetching user:', error);
        return JSON.parse(JSON.stringify({ success: false, error: 'Failed to fetch user' }));
    }
}

export async function loginUser(password: string) {
    try {
        const user = await getUserByEmail("gogo05tv@gmail.com")
        
        if (!user.success || !user.user) {
            return JSON.parse(JSON.stringify({ success: false, error: 'User not found' }))
        }

        const isPasswordValid = await compareHash(password, user.user.password)
        
        if (!isPasswordValid) {
            return JSON.parse(JSON.stringify({ success: false, error: 'Invalid password' }))
        }

        const token = await generateToken({
            userId: user.user._id.toString(),
            email: user.user.email
        })

        return JSON.parse(JSON.stringify({ success: true, user: user.user, token }))
    } catch(error) {
        console.error('Error logging in:', error);
        return JSON.parse(JSON.stringify({ success: false, error: 'Login failed' }));
    }
}