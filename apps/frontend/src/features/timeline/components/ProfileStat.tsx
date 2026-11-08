import Link from "next/link"

export const ProfileStat = ({
  text,
  value,
  href,
}: {
  text: string
  value: number
  href?: string
}) => {
  const content = (
    <>
      <strong>{value}</strong>
      <span>{text}</span>
    </>
  )

  if (!href) {
    return <span data-slot="stat">{content}</span>
  }

  return (
    <Link href={href} data-slot="stat">
      {content}
    </Link>
  )
}

export default ProfileStat
