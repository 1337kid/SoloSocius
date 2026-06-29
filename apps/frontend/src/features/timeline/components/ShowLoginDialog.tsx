import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

export function ShowLoginDialog() {
  const handleLogin = () => {
    router.push(routes.login);
  };

  const router = useRouter();

  return (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Login to your account</DialogTitle>
        <DialogDescription>
          You need to login to your account to perform this action.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleLogin}>
          Login
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
