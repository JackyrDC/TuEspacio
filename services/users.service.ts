import pb from "../config/pocketbase.js"
import {User} from "../types/types.js"

const getUsers = async()=>{
    const users = await pb.collection("users").getList<User>()
}

const getUserbyId = async (id: string) => {
    const user = await pb.collection("users").getOne<User>(id)
    return user
}

const getUsersbyName = async (name: string) => {
    const users = await pb.collection("users").getList<User>(1, 50, { filter: `name = "${name}"` })
    return users
}

const getUsersbyEmail = async (email: string) => {
    const users = await pb.collection("users").getList<User>(1, 50, { filter: `email = "${email}"` })
    return users
}

const createUser = async (userData: User) => {
    const user = await pb.collection("users").create<User>(userData)
    return user
}

const verifyEmailRequest  = async (id: string, email: string) => {
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("User not found")
    }
    else{
        await pb.collection("users").requestVerification(email)
    }
}

const resetPasswordRequest = async (id: string, email: string ) =>
{
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("User not found")
    }
    else{
        await pb.collection("users").requestPasswordReset(email)
    }
}

//const resetPassword = async (id: string, new)