import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../services/jwt";


interface GoogleTokenResult {
    iss?:string,
    nbf?:string,
    aud?:string,
    sub?:string,
    email:string,
    email_verified:string,
    azp?:string,
    name?:string,
    picture?:string,
    given_name:string,
    family_name?:string,
    iat?:string,
    exp?:string,
    jti?:string,
    alg?:string,
    kid?:string,
    typ?:string,
}

export const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        try {
            const googleToken = token;
            const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`;

            const { data } = await axios.get<GoogleTokenResult>(url.toString(), { responseType: 'json' });
            console.log(data);


            const user = await prismaClient.user.findUnique({where:{email: data.email}})

            if(!user){
                await prismaClient.user.create({
                    data:{
                        email:data.email,
                        firstName:data.given_name,
                        lastName:data.family_name,
                        profileImageUrl:data.picture,

                    }
                })


                const userInDb = await prismaClient.user.findUnique({where:{email:data.email},})

                if(!userInDb) throw new Error("User creation failed");

                const token = JWTService.generateTokenForUser(userInDb)

                return token

            }


        } catch (error) {
            console.error("Error verifying Google token:", error);

            // Return error as a JSON string
            return JSON.stringify({
                status: "error",
                message: "Failed to verify Google token",
            });
        }
    },
};

export const resolvers = { queries };
