import { sql } from "..";

export async function userExist(email:string):Promise<boolean>{

    const userEmail = await sql`
    SELECT id,email FROM users
    WHERE email=${email}
    `
    return userEmail.length>0
}
interface User{
    id : string,
    email : string,
    password : string,
    createdAt : string
}
export async function CreateUser(email:string,password:string):Promise<User>{
    const [user] = await sql<User[]> `
    INSERT INTO users(email,password)
    VALUES (${email},${password})
    RETURNING *
    `;

    if(!user){
        throw new Error("User is Not Defined");
    }
    return user 
}