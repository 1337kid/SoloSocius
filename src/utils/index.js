import { INSTANCE, VERSION, JWT_SECRET } from "@/constants"
import * as jose from 'jose';

export const genUserAgent = () => {
    return `SoloSocius/${VERSION} (https://${INSTANCE})`
}

export const genJWT = async (object) => {
    const jwt = await new jose.SignJWT(object)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode(JWT_SECRET));
    return jwt
}

export const verifyJWT = async (token) => {
    try {
        console.log('lmao')
        const {paylod: obj} = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
        return true;
    } catch (error) {
        return false
    }
}