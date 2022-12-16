import Button from "../Components/Button";
import Input from "../Components/Input";
import "../Styles/Login.css";
import { Link } from "react-router-dom";
import { GrFormClose } from "react-icons/gr";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/Firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: ""
  });

  const [loginStatus, setLoginStatus] = useState({
    success: false,
    error: false
  });
  const navigate = useNavigate();

  const hideErr = () => {
    let errBlock = document.querySelector(".err-msg");
    errBlock.style.display = "none";
    setLoginStatus({ ...loginStatus, error: false });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userInfo) => {
        navigate("/chats");
      })
      .catch((err) => setLoginStatus({ ...loginStatus, error: err.message }));
  };

  const changeHandler = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div id="login-form-o">
        {loginStatus.error && (
          <div className="err-msg">
            <p>{loginStatus.error}</p>
            <span onClick={hideErr}>
              <GrFormClose />
            </span>
          </div>
        )}
        <div id="login-form-i">
          {/* Left Part */}
          <div id="login-left-o">
            <div id="login-left-i">
              <p>Nice to see You Again</p>
              <h1>Welcome Back</h1>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </p>
            </div>
          </div>

          {/* Right Part */}
          <div id="login-right-o">
            <div id="login-right-i">
              <div id="form-header">
                <h1>Login Account</h1>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s.
                </p>
              </div>
              <div id="form">
                <form>
                  <Input
                    type="email"
                    placeholder="Email Id"
                    ifValueChanges={changeHandler}
                    name="email"
                    value={values.email}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    ifValueChanges={changeHandler}
                    name="password"
                    value={values.password}
                  />
                  <Button value="Login" ifClicked={submitHandler} />
                </form>
                <p className="page-link">
                  Need An Account
                  <Link to="/signup">SIGNUP</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
