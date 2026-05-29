import { CreateUser, userExist } from "db/client";
import bcrypt from "bcrypt";
import {Elysia,status,t} from "elysia";
import jwt from "@elysia/jwt";

export const authRoute = new Elysia({prefix :"/auth"})
    .use(
        jwt({
            name : 'jwt',
            secret : Bun.env.JWT_SECRET!,
            exp : '1d'
        })
    )
      .post("/signup",async ({body,jwt})=>{

        const email = body.email;
        const userexist = await userExist(email);
        if (userexist) {
            return status(401,"User Already Exist");
        }

        const hassedPassword = await bcrypt.hash(body.password,10);

        const user = await CreateUser(email,hassedPassword);

        const token = await jwt.sign({
            // sub is a subject you need to pass while token signing 
            sub : user.id
        })
        
        return status(200,`message:{
                User SignUp SucessFully\n,
                Token : ${token}
            }`
        )
      },{
        body: t.Object({
            email : t.String({
                format : "email",
                error : "Email must be Present"
            }),
            password : t.String({
                minLength: 8,
                pattern: '.*[0-9].*',
                error: 'Password must be at least 8 characters and contain at least one number',
            })
        })
      })