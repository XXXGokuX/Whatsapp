import { onAuthStateChanged, signOut } from "firebase/auth";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ChatPage from "../Pages/ChatPage";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import { auth } from "./Firebase";

const ProtectedRoutes = (props) => {
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("/");
    }
  });

  if (auth.currentUser) return props.Component;
  else return <Navigate to="/" />;
};

const SignInAndSignOutRoute = (props) => {
  if (auth.currentUser) {
    signOut(auth);
    return <Login />;
  } else return props.Component;
};

const Navigation = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<SignInAndSignOutRoute Component={<Login />} />}
        />
        <Route
          path="/signup"
          element={<SignInAndSignOutRoute Component={<Signup />} />}
        />
        <Route
          path="/chats"
          element={<ProtectedRoutes Component={<ChatPage />} />}
        />
      </Routes>
    </>
  );
};

export default Navigation;
