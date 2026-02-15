import bcrypt from "bcryptjs";

export async function createHash(pass: string){
    return bcrypt.hash(pass,14)
}

export async function compareHash(pass: string, hash: string){
    return bcrypt.compare(pass,hash)
}
