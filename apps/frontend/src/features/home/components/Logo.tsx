import logo from "@/assets/logo.png";
import Image from "next/image";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={logo}
        alt="Logo"
        width={40}
        height={40}
        className="rounded-lg"
      />
      <span className="text-xl font-bold text-foreground">SoloSocius</span>
    </div>
  );
};

export default Logo;
