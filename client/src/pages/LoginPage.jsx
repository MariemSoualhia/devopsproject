import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext.jsx";
import { API_BASE_URL } from "../../config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setUser } = useContext(UserContext);
  const location = useLocation(); // Add useLocation hook

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      const { data } = await axios.post(API_BASE_URL + "/login", {
        email,
        password,
      });
      setUser(data);
      alert("Login successful");
      setRedirect(true);
    } catch (e) {
      alert("Login failed");
    }
  }

  if (redirect) {
    // Redirect to the previous location or home if there is none
    const { state } = location;
    const redirectTo = state && state.from ? state.from : "/";
    return <Navigate to={redirectTo} />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            data-test="email"
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            data-test="password"
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <button className="primary" data-test="connect">
            Login
          </button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet?{" "}
            <Link className="underline text-black" to={"/register"}>
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
