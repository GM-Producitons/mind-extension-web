"use client"
import {Card, CardTitle, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import { createOneUser, loginUser } from "../apis/userActions"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login(){
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSignUp(){
        setLoading(true)
        await createOneUser("Manga_123")
        setSuccess("User created successfully!")
        setLoading(false)
    }

    async function handleLogin(){
        if (!password.trim()) {
            setError("Please enter a password")
            return
        }
        
        setError("")
        setLoading(true)
        const result = await loginUser(password)
        
        if (result.success) {
            // Set the token as a cookie
            document.cookie = `auth-token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}`
            setSuccess("Login successful!")
            setError("")
            setPassword("")
            // Redirect to app
            setTimeout(() => router.push("/"), 500)
        } else {
            setError(result.error || "Login failed")
        }
        setLoading(false)
    }

    return (
        <div className="w-full h-full flex justify-center items-center">
        
        <Card className="w-fit flex justify-center items-center">
            <CardTitle>Who the fuck are you?</CardTitle>
            <CardContent>
                <div className="flex flex-col items-center space-y-2">
                    <p>Email/Name</p>
                    <Input disabled value="gogo05tv@gmail.com" />
                    <p>Pass</p>
                    <Input 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        disabled={loading}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button 
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex-1"
                    >{loading ? 'Logging in...' : 'Login'}</Button>
                    <Button 
                        onClick={handleSignUp}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                    >{loading ? 'Creating...' : 'Sign Up'}</Button>
                </div>
            </CardContent>
        </Card>
        </div>
    )
}