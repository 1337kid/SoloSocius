import { auth } from "@/auth"
import { NextResponse } from "next/server";
import { INSTANCE } from "./constants";
import { headers } from 'next/headers'
import { verifyJWT } from "./utils";

export default auth(async (req) => {
  const url = new URL(req.url);
  const headersList = headers();
  if (url.pathname.startsWith("/api/private")) {
    if (!headersList.get("Authorization")) return NextResponse.json({error: "Unauthorized"}, {status: 403})
    else {
      let token = headersList.get("Authorization");
      token=token.split(" ")[1];
      if (! await verifyJWT(token)) return NextResponse.json({error: "Unauthorized"}, {status: 403})
    }
  } else  if (!req.auth) return NextResponse.redirect(`https://${INSTANCE}/auth`);
})

export const config = {
    matcher: [
      '/api/private/:path*',
      '/home/:path*'
    ],
    unstable_allowDynamic: [
      "/src/db/lib/dbConnect.js",
      "/node_modules/mongoose/dist/**",
    ]
}