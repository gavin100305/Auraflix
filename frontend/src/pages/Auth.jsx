import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="relative flex-1 flex overflow-hidden bg-black/[0.96] antialiased items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #171717 1px, transparent 1px), linear-gradient(to bottom, #171717 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 w-full max-w-md mx-auto px-6 py-10">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
                {isSignIn ? "Welcome Back" : "Join InfluenceIQ"}
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                {isSignIn
                  ? "Sign in to access your dashboard"
                  : "Register your business to get started"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isSignIn ? <SignIn key="signin" /> : <SignUp key="signup" />}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-400">
                {isSignIn
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="ml-2 text-white hover:text-blue-400 transition-colors"
                >
                  {isSignIn ? "Register" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
