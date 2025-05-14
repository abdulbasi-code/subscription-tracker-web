import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b-2  border-black/20  ">
      <h1 className="font-bold text-xl">Subscription Tracker</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>{user.name || user.email}</span>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="default">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
