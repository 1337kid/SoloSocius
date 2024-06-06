import { createSign, createVerify } from "crypto";
import https from "https";
import axios from "axios";

const genSignature = (privateKey, url) => {
    const currentDate = new Date().toGMTString();
    const parsedUrl = new URL(url);
    const signatureText = `(request-target): post ${parsedUrl.pathname}\nhost: ${parsedUrl.hostname}\ndate: ${currentDate}`;
    const sign = createSign("SHA256");
    sign.update(signatureText);
    const signature = sign.sign(privateKey, 'base64');
    return signature;
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