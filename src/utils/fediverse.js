import { createSign, createHash, createVerify } from "crypto";
import { INSTANCE } from "@/constants";
import https from "https";
import axios from "axios";

const genSignature = (privateKey, url, activityJSON, senderPubKey) => {
    const currentDate = new Date().toGMTString();
    const parsedUrl = new URL(url);
    const digestHash = createHash("sha256").update(JSON.stringify(activityJSON)).digest('base64');
    const signatureText = `(request-target): post ${parsedUrl.pathname}\nhost: ${parsedUrl.hostname}\ndate: ${currentDate}\ndigest: SHA-256=${digestHash}`;
    const sign = createSign("sha256");
    console.log(signatureText   )
    sign.update(signatureText);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    const signatureHeader = `keyID="${senderPubKey}",headers="(request-target) host date digest",signature="${signature}"`
    const digestHeader = `SHA-256=${digestHash}`
    return { currentDate, signatureHeader, digestHeader };
}

const verifySignature = async (headers, url) => {
    try {
        const parsedUrl = new URL(url);
        const signatureHeader = headers.get('signature');
        const digestHash = headers.get('digest');
        const currentDate = headers.get('date') || headers.get('x-date');
        const data = signatureHeader.split(',')
        const keyID = data[0].split('=')[1].replaceAll('"','');
        const signature = data[2].split('=')[1].replaceAll('"','');

        const agent = new https.Agent({  
            rejectUnauthorized: false // temp, will be removed
        });

        const result = await axios.get(keyID, { httpsAgent: agent })
        const reqdata = result.data;
        if (!data) return false
        const publicKey = reqdata.publicKey.publicKeyPem;
        const verify = createVerify('SHA256');
        const signatureText = `(request-target): post ${parsedUrl.pathname}\nhost: ${INSTANCE}\ndate: ${currentDate}\ndigest: ${digestHash}`;
        verify.update(signatureText);
        verify.end();
        const isVerfied = verify.verify(publicKey, signature, 'base64');
        return isVerfied
    } catch (error) {
        console.log(error)
        return false
    }
}

export { genSignature, verifySignature }