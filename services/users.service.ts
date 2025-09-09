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

const verifiedEmail = async (id: string, email: string) => {
    const user = await getUserbyId(id)
    if(!user)
    {
        throw new Error("User not found")
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
        throw new Error("User not found")
    }
    else{
        await pb.collection("users").requestPasswordReset(email)
    }
}

<<<<<<< HEAD
const resetPassword = async (id: string, newPassword: string, resetToken: string) =>
{
    const user = await getUserbyId(id)
    if(!user||!resetToken)
=======
const resetPassword = async (id: string, newPassword: string) =>{
    const user = await getUserbyId(id)
    if(!user)
>>>>>>> 3e0f48c89bfc04ecc72dc40b5b67586d3131d649
    {
        throw new Error("User not found")
    }
    else{
<<<<<<< HEAD
        await pb.collection("users").confirmPasswordReset(resetToken, newPassword, newPassword)
        return true
    }
}

export default {
    getUsers,
    getUserbyId,
    getUsersbyName,
    getUsersbyEmail,
    createUser,
    verifyEmailRequest,
    resetPasswordRequest,
    resetPassword
=======
        await pb.collection("users").confirmPasswordReset(user.id, newPassword, newPassword)
    }   
>>>>>>> 3e0f48c89bfc04ecc72dc40b5b67586d3131d649
}