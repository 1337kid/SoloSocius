import { connectToDB } from "@/db";
import "./globals.css";
import { getUserActorFromDB } from "@/db/actor";

const genTitle = async () => {
  await connectToDB();
  const user = await getUserActorFromDB("username name");
  return `${user.name} (@${user.username}@${process.env.NEXT_PUBLIC_DOMAIN})`
}

export const metadata = {
  title: await genTitle(),
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}