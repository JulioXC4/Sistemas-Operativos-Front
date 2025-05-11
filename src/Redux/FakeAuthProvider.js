// context/FakeAuthProvider.js
import { createContext, useContext } from "react";

const fakeUser = {
    sub: "Usuario|1",
    name: "Julio Castro",
    given_name: "Julio",
    family_name: "Castro",
    nickname: "julio",
    email: "julio@example.com",
    email_verified: true,
    picture: "https://s.gravatar.com/avatar/123abc456.png",
    updated_at: "2025-05-11T10:20:30.000Z",
};

const AuthContext = createContext({
    isAuthenticated: true,
    user: fakeUser,
});

export const useFakeAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    return (
        <AuthContext.Provider value={{ isAuthenticated: true, user: fakeUser }}>
            {children}
        </AuthContext.Provider>
    );
};
