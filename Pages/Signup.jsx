import Input from "../Components/Input";
import "../Styles/Signup.css";
import { BsCardImage, BsFillTelephoneFill } from "react-icons/bs";
import Button from "../Components/Button";
import { FaUserCircle } from "react-icons/fa";
import { AiFillMail, AiTwotoneLock } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../src/Firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { GrFormClose } from "react-icons/gr";

const Signup = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    phoneno: "",
    file: ""
  });
  const [status, setStatus] = useState({
    success: null,
    error: null
  });

  const hideErr1 = () => {
    let errBlock = document.querySelector(".err-msg-1");
    errBlock.style.display = "none";
    setStatus({ ...status, error: null });
  };
  const successMsg = () => {
    let successBlock = document.querySelector(".success-msg");
    successBlock.style.display = "none";
    setStatus({ ...status, success: null });
  };

  const changeHandler = (e) => {
    if (e.target.name !== "file")
      setFormValues({ ...formValues, [e.target.name]: e.target.value });
    else setFormValues({ ...formValues, [e.target.name]: e.target.files[0] });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, formValues.email, formValues.password)
      .then((userInfo) => {
        setStatus({ ...status, success: true });
        const profileImageRef = ref(
          storage,
          `profileImages/${formValues.email}`
        );
        const uploadTask = uploadBytesResumable(
          profileImageRef,
          formValues.file
        );

        //Uploading Image ........./......./....../
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
            }
          },
          (error) => {},
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log("File available at", downloadURL);
              updateProfile(userInfo.user, {
                displayName: formValues.name,
                photoURL: downloadURL
              });

              //Save Data Profile Data in Accounts
              const ref = doc(db, "Accounts", userInfo.user.uid);
              let delid;
              setDoc(ref, {
                ...formValues,
                file: downloadURL,
                uid: userInfo.user.uid
              }).then(() => {
                delid= doc(collection(ref,"Contacts"))
                 setDoc(delid,
                 {
                   testDoc: "testDoc",
                   name: "test"
                 })
                 .then(()=>
                 {
                   //On Success
                   navigate("/");
                 })
              });
            });
          }
        );
        //End Uploading Image
      })
      .catch((err) => setStatus({ ...status, error: err.message }));
  };
  return (
    <>
      <div id="signup-form-o">
        {status.error && (
          <div className="err-msg-1">
            <p>{status.error}</p>
            <span onClick={hideErr1}>
              <GrFormClose />
            </span>
          </div>
        )}

        {status.success && (
          <div className="success-msg">
            <p>Registeration Success</p>
            <span onClick={successMsg}>
              <GrFormClose />
            </span>
          </div>
        )}

        <div id="signup-form-i">
          <div id="form-head">
            <h1>Sign Up</h1>
          </div>
          <div id="form-1">
            <form>
              <Input
                type="text"
                placeholder="Name"
                Icon={<FaUserCircle />}
                name="name"
                value={formValues.name}
                ifValueChanges={changeHandler}
              />
              <Input
                type="email"
                placeholder="Email"
                Icon={<AiFillMail />}
                name="email"
                value={formValues.email}
                ifValueChanges={changeHandler}
              />
              <Input
                type="password"
                placeholder="Password"
                Icon={<AiTwotoneLock />}
                name="password"
                value={formValues.password}
                ifValueChanges={changeHandler}
              />
              <Input
                type="tel"
                placeholder="Phone no"
                Icon={<BsFillTelephoneFill />}
                name="phoneno"
                ifValueChanges={changeHandler}
                value={formValues.phoneno}
              />
              <div id="file-upload">
                <label htmlFor="file">
                  <BsCardImage />
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={changeHandler}
                />
              </div>

              <Button value="Create Account" ifClicked={submitHandler} />
            </form>
            <p className="page-link">
              Already a User
              <Link to="/">Signin</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
