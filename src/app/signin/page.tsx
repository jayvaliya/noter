"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
// Import React Icons
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SignIn() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        signIn("google", { callbackUrl: "/" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setIsSuccess(false);

        try {
            if (authMode === "register") {
                // Register the user
                console.log("Submitting registration...");
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                console.log("Registration response status:", response.status);
                const data = await response.json();
                console.log("Registration response data:", data);

                if (!response.ok) {
                    throw new Error(data.error || "Registration failed");
                }

                // Registration successful, now sign in
                console.log("Registration successful, signing in...");
                const result = await signIn("credentials", {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                console.log("Sign in result:", result);

                if (result?.error) {
                    throw new Error(result.error || "Sign in failed after registration");
                }

                setIsSuccess(true);
                // Add a slight delay before redirect to avoid UI flicker
                setTimeout(() => {
                    router.push("/");
                }, 300);
            } else {
                // Sign in existing user
                const result = await signIn("credentials", {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                console.log("Sign in result:", result);

                if (result?.error) {
                    throw new Error("Invalid email or password");
                }

                setIsSuccess(true);
                // Add a slight delay before redirect to avoid UI flicker
                setTimeout(() => {
                    router.push("/");
                }, 300);
            }
        } catch (error: any) {
            console.error("Authentication error:", error);
            setError(error.message);
        } finally {
            if (!isSuccess) {
                setIsLoading(false);
            }
        }
    };

    // If successfully authenticated, show a success message briefly
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.push("/dashboard");
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-neutral-800/30 backdrop-blur-sm p-8 rounded-2xl border border-neutral-700 shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {authMode === "signin" ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-neutral-400">
                            {authMode === "signin"
                                ? "Sign in to continue to Noter"
                                : "Join Noter for better note-taking"}
                        </p>
                    </div>

                    {error && !isSuccess && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
                            Successfully authenticated! Redirecting...
                        </div>
                    )}


                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-300 mb-4"
                    >
                        {isLoading ? (
                            <AiOutlineLoading3Quarters className="w-5 h-5 text-gray-800 animate-spin" />
                        ) : (
                            <>
                                <FcGoogle size={24} />
                                Continue with Google
                            </>
                        )}
                    </button>


                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-neutral-800/30 text-neutral-500">or</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {authMode === "register" && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-neutral-300 mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-neutral-300 mb-1"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-neutral-300 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 mb-4"
                        >
                            {isLoading ? (
                                <div className="flex justify-center">
                                    <AiOutlineLoading3Quarters className="w-5 h-5 text-white animate-spin" />
                                </div>
                            ) : authMode === "signin" ? (
                                "Sign In"
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={() =>
                                setAuthMode(authMode === "signin" ? "register" : "signin")
                            }
                            className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                            {authMode === "signin"
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-neutral-500 text-sm">
                        © 2025 Noter. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}