import crypto from "crypto";

const returnKeyPair = () => {
    const key = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    return {
        publicKey: key.publicKey,
        privateKey: key.privateKey
    }
}

export default returnKeyPair;