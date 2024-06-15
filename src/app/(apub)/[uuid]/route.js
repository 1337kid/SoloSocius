import { headers } from "next/headers"
import { NextResponse } from "next/server";

export const GET = async(req) => {
    const headerList = headers();
    if (headerList.get('accept').includes("json")) {
        return NextResponse.json({error:"Not Found"},{status:404})
    }
    return new NextResponse("Error 404 Page not found",{status:404})
}