import pb from "../config/pocketbase.js"

const login = async (email:string, password:string) => {
  try{
    const user = await pb.collection("users").authWithPassword(email, password)
    localStorage.setItem("user", JSON.stringify(user))
    return user
  } catch (error) {
    console.error("Login failed:", error)
    throw error
  }
}

const logout = async()=>{
    try {
        await pb.authStore.clear()
        localStorage.removeItem("user")
    } catch (error) {
        console.error("Logout failed:", error)
        throw error
    }
}

export default {
  login,
  logout
}