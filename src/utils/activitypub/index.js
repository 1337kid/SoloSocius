import { createSign, createHash, createVerify } from "crypto";
import { INSTANCE } from "@/constants";
import axios from "axios";

const webfingerLookup = async (user,domain) => {
    const url = `https://${domain}/.well-known/webfinger?resource=acct:${user}@${domain}`
    const result = await axios.get(url)
    return result.data  
}

const getActor = async (user,domain) => {
    const webfingerResult = await webfingerLookup(user,domain);
    let actorUrl = ''
    webfingerResult.links.map((link) => {
        if (link.rel === "self") {
            actorUrl = link.href
        }
    })
    const result = await axios.get(actorUrl)
    return result.data  
}

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
    console.log(signatureHeader)
    return { currentDate, signatureHeader, digestHeader };
}

const verifySignature = async (headers, url) => {
    try {
        const parsedUrl = new URL(url);
        const data = headers.get('signature').split(',');
        const signatureElements = {host: INSTANCE, path: parsedUrl.pathname};
        signatureElements.date = headers.get('date') || headers.get('x-date');
        if (headers.get('digest')) {
            signatureElements.digest = headers.get('digest')
        }
        const keyID = data[0].split('=')[1].replaceAll('"','');
        const signatureHeader = data[1].split('=')[1].replaceAll('"','').split(" ");
        const signature = data[2].split('=')[1].replaceAll('"','');
        let signatureText="";
        signatureHeader.map((item) => {
            if (item === "(request-target)") signatureText += `(request-target): post ${signatureElements.path}\n`;
            else if (item === "host") signatureText += `host: ${signatureElements.host}\n`;
            else if (item === "date") signatureText += `date: ${signatureElements.date}\n`;
            else if (item === "digest") signatureText += `digest: ${signatureElements.digest}\n`;
        })
        signatureText = signatureText.slice(0,-1);
        console.log(signatureText)
        const result = await axios.get(keyID)
        const reqdata = result.data;
        if (!data) return false
        const publicKey = reqdata.publicKey.publicKeyPem;
        const verify = createVerify('SHA256');
        verify.update(signatureText);
        verify.end();
        const isVerfied = verify.verify(publicKey, signature, 'base64');
        return isVerfied
    } catch (error) {
        console.log(error)
        return false
    }
}

export { webfingerLookup, getActor, genSignature, verifySignature }