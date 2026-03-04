import { LogOut } from "lucide-react";
import Button from "./Button";

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    document.cookie =
      "token=; path=/; max-age=0; samesite=Lax";

    window.location.href = "/";
  };

  return (
    <Button
      onClick={handleLogout}
      className="cursor-pointer w-fit text-left justify-start mt-1"
    >
      Logout <LogOut />
    </Button>
  );
}