
import postgres from "postgres";

const dbUrl = Bun.env.DATABASE_URL;
if(!dbUrl){
    throw new Error("DB url missing");
}

console.log(dbUrl);

const sql = postgres(dbUrl);

export async function  ConnectDb(){
    try {
        await sql`SELECT 1`
        console.log("DB Connected");
    }catch(e){
        console.log("DB Connection Failed",e);
    }
}