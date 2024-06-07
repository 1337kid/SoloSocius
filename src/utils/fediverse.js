import { createSign, createHash, createVerify } from "crypto";
import https from "https";
import axios from "axios";

const genSignature = (privateKey, url, activityJSON, senderPubKey) => {
    const currentDate = new Date().toGMTString();
    const parsedUrl = new URL(url);
    const digestHash = createHash("sha256").update(JSON.stringify(activityJSON)).digest('base64');
    const signatureText = `(request-target): post ${parsedUrl.pathname}\nhost: ${parsedUrl.hostname}\ndate: ${currentDate}\ndigest: SHA-256=${digestHash}`;
    const sign = createSign("sha256");
    sign.update(signatureText);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    signatureHeader = ` keyID="${senderPubKey}",headers="(request-target) host date digest",signature="${signature}"`
    digestHeader = `SHA-256=${digestHash}`
    return { signatureHeader, digestHeader };
}

const verifySignature = async(signatureHeader,url) => {
    try {
        const parsedUrl = new URL(url);
        const data = signatureHeader.split(',')
        const keyID = data[0].split('=')[1].replaceAll('"','');
        const headers = data[1].split('=')[1].replaceAll('"','');
        const signature = data[2].split('=')[1].replaceAll('"','');
        const agent = new https.Agent({  
            rejectUnauthorized: false // temp, will be removed
        });
        await axios.get(keyID, { httpsAgent: agent })
        .then(response => {
            const data = response.data;
            if (!data) return false
            const publicKey = data.publicKey.publicKeyPem;
            const verify = createVerify('SHA256');
            verify.update(`(request-target) post ${parsedUrl.pathname}`);
            return verify.verify(publicKey, signature, 'base64');
        })
    } catch (error) {
        console.log(error)
        return false
    }
}

export { genSignature, verifySignature }