"use client";
import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
const SignInPage = () => {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", Password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!isLoaded || isLoading) return;

    if (!form.email || !form.Password) {
      setError("All fields are required.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      const result = await signIn.create({
        identifier: form.email,
        password: form.Password,
      });
      if (result.status === "complete") {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      setError(error.errors?.[0]?.message || "sign-in faild.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-raleway">
      {/* Left Side Image */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth.png')" }}
      ></div>

      {/* Right Side Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-center ">Sign In</h2>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <form className="space-y-5" onSubmit={handleSignIn}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                 name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="Password" 
                value={form.Password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-all duration-200"
            >
              {isLoading ? "signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;