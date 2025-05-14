import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Subscriptions from "./routes/Subscriptions";
import AuthGuard from "./lib/AuthGuard";
import Header from "./lib/Header";
import "./App.css";
import Signup from "./routes/Signup";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/subscriptions" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/subscriptions"
          element={
            <AuthGuard>
              <Subscriptions />
            </AuthGuard>
          }
        />
        <Route
          path="*"
          element={<div className="p-6">404 - Page Not Found</div>}
        />
      </Routes>
    </>
  );
}
