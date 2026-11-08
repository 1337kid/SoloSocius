import logo from "@/assets/logo.png"
import Image from "next/image"
import Link from "next/link"

const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} data-slot="brand">
      <Image src={logo} alt="SoloSocius" width={32} height={32} />
      <span>SoloSocius</span>
    </Link>
  )
}

export default Logo
