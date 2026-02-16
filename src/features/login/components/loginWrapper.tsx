"use client"
import {Card, CardTitle, CardContent} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import { loginUser } from "../apis/userActions"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login(){
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(){
        if (!email.trim()) {
            setError("Please enter an email")
            return
        }
        if (!password.trim()) {
            setError("Please enter a password")
            return
        }
        
        setError("")
        setLoading(true)
        const result = await loginUser(email,password)
        
        if (result.success) {
            // Cookie is set server-side, just refresh so middleware lets us through
            router.refresh()
            router.push("/")
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
                    <Input 
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                    <p>Pass</p>
                    <Input 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                    <Button 
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex-1"
                    >{loading ? 'Logging in...' : 'Login'}</Button>
                </div>
            </CardContent>
        </Card>
        </div>
    )
}