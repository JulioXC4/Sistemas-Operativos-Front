import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useFakeAuth } from "../Redux/FakeAuthProvider";

const Login = () => {
  const { loginWithRedirect } = useFakeAuth();
  return (
    <div>
      <button onClick={() => loginWithRedirect()}>INGRESAR</button>
    </div>
  );
};

export default Login;
