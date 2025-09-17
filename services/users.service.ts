import pb from "../config/pocketbase"
import {User} from "../types/types.js"

const getUsers = async()=>{
    const users = await pb.collection("users").getList()
}

const getUserbyId = async (id: string) => {
    const user = await pb.collection("users").getOne(id)
    return user
}

const getUsersbyName = async (name: string) => {
    const users = await pb.collection("users").getList(1, 50, { filter: `name = "${name}"` })
    return users
}

const getUsersbyEmail = async (email: string) => {
    const users = await pb.collection("users").getList(1, 50, { filter: `email = "${email}"` })
    return users
}

const createUser = async (userData: User) => {
    const user = await pb.collection("users").create(userData)
    return user
}

const verifyEmailRequest  = async (id: string, email: string) => {
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("Usuario no encontrado")
  }
    else{
        await pb.collection("users").requestVerification(email)
    }
}

const verifiedEmail = async (id: string, email: string) => {
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("Usuario no encontrado")
    }
    else{
        await pb.collection("users").confirmVerification(email)
    }
}

const resetPasswordRequest = async (id: string, email: string ) =>
{
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("Usuario no encontrado")
    }
    else{
        await pb.collection("users").requestPasswordReset(email)
    }
}

const resetPassword = async (id: string, newPassword: string) =>{
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("Usuario no encontrado")
    }
    else{
        await pb.collection("users").confirmPasswordReset(user.id, newPassword, newPassword)
    }   
}