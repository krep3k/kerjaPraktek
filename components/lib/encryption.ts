import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

export function encrypt(text: string) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const chiper = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY as string), iv);
    let encrypted = chiper.update(text);
    encrypted = Buffer.concat([encrypted, chiper.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string) {
    if(!text) return text;
    try {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift() as string, "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");
        const dechiper = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY as string), iv);
        let decrypted = dechiper.update(encryptedText);
        decrypted = Buffer.concat([decrypted, dechiper.final()]);
        return decrypted.toString();
    } catch {
        return text;
    }
}

export function hashEmail(email: string) {
    return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}