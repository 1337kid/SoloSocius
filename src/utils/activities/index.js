import { createSign, createHash, createVerify } from "crypto";
import { INSTANCE } from "@/constants";
import axios from "axios";
import { genUserAgent } from "@/utils";

const webfingerLookup = async (user,domain) => {
    const url = `https://${domain}/.well-known/webfinger?resource=acct:${user}@${domain}`
    const result = await axios.get(url)
    console.log(result.status)
    return result.data  
}

const getActor = async(actorUrl) => {
    const result = await axios.get(actorUrl, {
        headers: {
            "Accept": "application/activity+json"
        }
    })
    return result.data 
}

const getActorFromWebfinger = async (user,domain) => {
    const webfingerResult = await webfingerLookup(user,domain);
    let actorUrl = ''
    webfingerResult.links.map((link) => {
        if (link.rel === "self") {
            actorUrl = link.href
        }
    })
    return await getActor(actorUrl);
}

const genSignature = (privateKey, url, activityJSON, senderPubKey) => {
    const currentDate = new Date().toGMTString();
    const parsedUrl = new URL(url);
    const digestHash = createHash("sha256").update(JSON.stringify(activityJSON)).digest('base64');
    const signatureText = `(request-target): post ${parsedUrl.pathname}\nhost: ${parsedUrl.hostname}\ndate: ${currentDate}\ndigest: SHA-256=${digestHash}`;
    const sign = createSign("RSA-SHA256");
    sign.update(signatureText);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    const signatureHeader = `keyId="${senderPubKey}",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature}"`
    const digestHeader = `SHA-256=${digestHash}`
    return { currentDate, signatureHeader, digestHeader };
}

const sendSignedRequest = async (privateKey, url, activityJSON, senderPubKey) => {
    const {currentDate, signatureHeader, digestHeader} = genSignature(
        privateKey,
        url,
        activityJSON,
        senderPubKey
    );
    const result = await axios.post(url, activityJSON , {
        headers: {
            "Date": currentDate,
            "Signature": signatureHeader,
            "Digest": digestHeader,
            "User-Agent": genUserAgent(),
            "Content-Type": "application/activity+json",
            "Algorithm": "rsa-sha256"
        }
    })
    if (result.status >= 200 && result.status <= 300) return true;
    else return false;
}

const verifySignature = async (headers, url) => {
    try {
        const parsedUrl = new URL(url);
        const data = headers.get('signature').split(',');
        if (!data) return false
        const signatureElements = {
            host: INSTANCE,
            path: parsedUrl.pathname,
            date: headers.get('date') || headers.get('x-date'),
            userAgent: headers.get('User-Agent'),
            contentType: headers.get('Content-Type'),
            digest: headers.get('Digest') || null
        };
        data.map((item) => {
            const keyVal = item.split('=');
            signatureElements[[keyVal[0]]]=keyVal[1].replaceAll('"','')
        })
        const result = await axios.get(signatureElements.keyId, {
            headers: {
                "Accept": "application/activity+json"
            }
        })
        if (result.status != 200) return false;
        const reqdata = result.data;
        const signatureHeader = signatureElements.headers.split(" ");
        let signatureText="";
        signatureHeader.map((item) => {
            if (item === "(request-target)") signatureText += `(request-target): post ${signatureElements.path}\n`;
            else if (item === "host") signatureText += `host: ${signatureElements.host}\n`;
            else if (item === "date") signatureText += `date: ${signatureElements.date}\n`;
            else if (item === "digest") signatureText += `digest: ${signatureElements.digest}\n`;
            else if (item === "user-agent") signatureText += `user-agent: ${signatureElements.userAgent}\n`;
            else if (item === "content-type") signatureText += `content-type: ${signatureElements.contentType}\n`;
        })
        signatureText = signatureText.slice(0,-1);
        const publicKey = reqdata.publicKey.publicKeyPem;
        const verify = createVerify(signatureElements.algorithm || "rsa-sha256");
        verify.update(signatureText);
        verify.end();
        const isVerfied = verify.verify(publicKey, signatureElements.signature, 'base64');
        return isVerfied
    } catch (error) {
        console.log(error)
        return false
    }
}

export { webfingerLookup, getActor, genSignature, verifySignature, sendSignedRequest, getActorFromWebfinger }