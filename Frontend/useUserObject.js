import { useState } from "react";

const useUserObject = () => {
    
    const getUser = () => {
        const userString = sessionStorage.getItem('user');
        if (!userString) return null;
        return JSON.parse(userString);
    };

    const[user, setUser] = useState(getUser());

    const saveUser = (userObject) => {
        sessionStorage.setItem("user", JSON.stringify(userObject));
        setUser(userObject);
    }

    return {
        setUser: saveUser,
        user
    }
}
 
export default useUserObject;