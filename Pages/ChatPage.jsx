import "../Styles/Chatpage.css";
import Picker from 'emoji-picker-react';

import {
  AiOutlineEllipsis,
  AiOutlineSearch,
  AiOutlineCamera,
  AiOutlineDropbox
} from "react-icons/ai";
import Contact from "../Components/Contact";
import {
  BsFillCameraVideoFill,
  BsEmojiLaughing,
  BsInboxes
} from "react-icons/bs";
import { IoCallSharp } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import { GrAttachment, GrSend, GrFormClose } from "react-icons/gr";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { auth, db, storage } from "../src/Firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { signOut, updateEmail, updateProfile } from "firebase/auth";

const ChatPage = () => {
  const [selectedContact, setSelectedContact] = useState();
  const [sendImage, setSendImage] = useState();
  const [updateUser, setUpdateUser] = useState();
  const [noUpdate, setNoUpdate] = useState();
  const [allSearchContact, setAllSearchContact] = useState([]);
  const [enterPressed, setEnterPressed] = useState(false);
  const [currProfileContact, setCurrProfileContact] = useState([]);
  const [contactMsg, setContactMsg] = useState(null);
  const [showPicker,setShowPicker]= useState(false)

  window.setTimeout(function () {
    var elem = document.querySelector(".all-msg");
    if (elem) elem.scrollTop = elem.scrollHeight;
  }, 500);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "Accounts", auth.currentUser.uid),
      (doc) => {
        setUpdateUser(doc.data());
        setNoUpdate(doc.data());
      }
    );

    return () => unsub();
  }, []);

  //Getting All Profile Contact

  useEffect(() => {
    const q = query(
      collection(db, "Accounts", auth.currentUser.uid, "Contacts"),
      where("name", "!=", "test")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const contacts = [];
      querySnapshot.forEach((docs) => {
        contacts.push(docs.data());
      });

      contacts.forEach((user) => {
        const contactPath = doc(
          db,
          "Accounts",
          auth.currentUser.uid,
          "Contacts",
          user.uid
        );
        const accountPath = doc(db, "Accounts", user.uid);
        const gettingContact = async () => {
          const contact = await getDoc(accountPath);
          updateDoc(contactPath, { ...contact.data() });
        };

        gettingContact();
      });

      setCurrProfileContact([...contacts]);
    });

    return () => unsubscribe();
  }, []);

  const getAllMsg = (to) => {
    const ref = collection(
      db,
      "Accounts",
      auth.currentUser.uid,
      "Contacts",
      `${to}`,
      "Chats"
    );
    const q = query(ref, orderBy("timestamp"));

    onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });

      if (msgs.length === 0) setContactMsg(null);
      else setContactMsg([...msgs]);
      console.log(msgs, contactMsg);
    });
  };

  const plzSendMsg = () => {
    let val = document.getElementById("msg-inp-box").value;
    let dupVal = val;
    const from = auth.currentUser.uid;
    const to = selectedContact.uid;

    if (sendImage) {
      const path = collection(
        db,
        "Accounts",
        `${from}`,
        "Contacts",
        `${to}`,
        "Chats"
      );

      //Sending Text Message With Image
      setDoc(doc(path), {
        class: "send msg-img",
        msgValue: val,
        image: sendImage,
        timestamp: serverTimestamp(),
        attachment: true
      });

      //Recieve Text Message With Image
      const path1 = collection(
        db,
        "Accounts",
        `${to}`,
        "Contacts",
        `${from}`,
        "Chats"
      );

      setDoc(doc(path1), {
        class: "recieve msg-img",
        msgValue: val,
        image: sendImage,
        timestamp: serverTimestamp(),
        attachment: true
      });
    } else {
      const path = collection(
        db,
        "Accounts",
        `${from}`,
        "Contacts",
        `${to}`,
        "Chats"
      );

      //Sending Text Message
      setDoc(doc(path), {
        class: "send",
        msgValue: val,
        timestamp: serverTimestamp(),
        attachment: false
      });

      //Recieve Text Message
      const path1 = collection(
        db,
        "Accounts",
        `${to}`,
        "Contacts",
        `${from}`,
        "Chats"
      );

      setDoc(doc(path1), {
        class: "recieve",
        msgValue: val,
        timestamp: serverTimestamp(),
        attachment: false
      });
    }
    //Updating Contacts
    const cpath = doc(db, "Accounts", `${from}`, "Contacts", `${to}`);
    const cpath1 = doc(db, "Accounts", `${to}`, "Contacts", `${from}`);

    console.log(selectedContact);

    setDoc(cpath, {
      ...selectedContact,
      getSelectedContact: null,
      updateActiveMsg: null,
      getAllMsg: null,
      lastMessage: dupVal
    });
    //Setting Active Message that receieved Message
    const activeMsg = async () => {
      const recieve = await getDoc(cpath1);

      let currentActiveMessage = recieve.data()?.activeMessages;
      if (currentActiveMessage) {
        setDoc(cpath1, {
          ...noUpdate,
          lastMessage: dupVal,
          activeMessages: currentActiveMessage + 1
        });
      } else {
        setDoc(cpath1, {
          ...noUpdate,
          activeMessages: 1,
          lastMessage: dupVal
        });
      }
    };
    activeMsg();

    //Input Box Value Null
    document.getElementById("msg-inp-box").value = "";
    //Set Attachment Null
    setSendImage(null);
  };

  const searchConatct = async (e) => {
    if (e.key === "Enter") {
      setEnterPressed(true);
      const q = query(
        collection(db, "Accounts"),
        where("phoneno", "==", e.target.value),
        where("name", "!=", auth.currentUser.displayName)
      );

      const querySnapshot = await getDocs(q);
      let contact = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        contact.push(doc.data());
      });
      setAllSearchContact([...contact]);
    }
  };

  const updateUserData = (e) => {
    e.preventDefault();

    //Updating User Profile
    updateProfile(auth.currentUser, {
      photoURL: updateUser.file,
      displayName: updateUser.name
    });

    updateEmail(auth.currentUser, updateUser.email);

    console.log(auth.currentUser);
    //Updating Profile in Firestore
    const sref = doc(db, "Accounts", auth.currentUser.uid);
    setDoc(sref, {
      ...updateUser
    });
  };

  const updateActiveMsg = (to) => {
    const ref = doc(db, "Accounts", auth.currentUser.uid, "Contacts", `${to}`);
    updateDoc(ref, {
      activeMessages: null
    });
  };

  const getCurrentUserInfo = (e) => {
    if (e.target.id === "file") {
      const Ref = ref(storage, `profileImages/${updateUser.email}1`);
      //Upload Image
      uploadBytes(Ref, e.target.files[0])
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((url) => setUpdateUser({ ...updateUser, file: url }))
            .catch((err) => alert("No Url", err));
        })
        .catch((err) => alert(err));
    } else setUpdateUser({ ...updateUser, [e.target.id]: e.target.value });
  };

  const onSendImage = (e) => {
    //Upload Attachment
    const Ref = ref(storage, `attachments/${e.target.files[0].name}`);
    //Upload Image
    uploadBytes(Ref, e.target.files[0])
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url) => setSendImage(url))
          .catch((err) => alert("No Url", err));
      })
      .catch((err) => alert(err));
  };

  const profileInfo = () => {
    let profile = document.querySelector(".profile-update");
    profile.style.display = "block";
  };

  const close = (e) => {
    let profile = document.querySelector(".profile-update");
    profile.style.display = "none";
  };

  const viewMenu = (e) => {
    let menu = document.querySelector(".menu-list");
    menu.classList.toggle("toggle-view");
  };

  const showEmojiPicker= ()=>{
    setShowPicker(true)
  }

  const selectedEmoji= (emoji)=>{
    setShowPicker(false)
    const inpValue= document.querySelector('#msg-inp-box')
    inpValue.value +=emoji.emoji
  }
console.log(showPicker)
  return (
    <>
      <div className="container">
        {/* Left Side */}
        <div id="contacts">
          <div className="acc-details">
            <div className="acc-info">
              <div className="user-image">
                <img className="img" src={noUpdate?.file} alt="user-image" />
              </div>
              <div className="user-name">
                <p>{noUpdate?.name}</p>
                <p className="status">Available</p>
              </div>
            </div>
            <div className="icon" onClick={profileInfo}>
              <AiOutlineEllipsis />
            </div>
          </div>

          {/*Search Bar*/}
          <div className="search-bar-wrapper">
            <div className="search-bar">
              <AiOutlineSearch />
              <input
                type="text"
                placeholder="Search for people"
                onKeyDown={searchConatct}
              />
            </div>
          </div>

          {/* Search result */}

          {allSearchContact &&
            allSearchContact.map((i) => {
              return (
                <Contact
                  category="search-contact"
                  name={i.name}
                  image={i.file}
                  lastMessage="last Message"
                  uid={i.uid}
                  phoneno={i.phoneno}
                  key={i.uid}
                  getSelectedContact={setSelectedContact}
                  getAllMsg={getAllMsg}
                />
              );
            })}

          {allSearchContact.length === 0 && enterPressed ? (
            <div className="nocontacts">
              <div className="icon-bg">
                <BsInboxes />
              </div>
              <p>No Contacts Found</p>
            </div>
          ) : (
            ""
          )}

          {/* All Conact */}
          <div className="all-contacts">
            <h5 className="contact-head">Contacts</h5>
            <div className="contacts-details">
              <div className="contact-details-i">
                {currProfileContact &&
                  currProfileContact.map((i) => {
                    return (
                      <Contact
                        name={i.name}
                        image={i.image ? i.image : i.file}
                        lastMessage={i.lastMessage}
                        actveMessage={i.activeMessages}
                        uid={i.uid}
                        phoneno={i.phoneno}
                        key={i.uid}
                        getSelectedContact={setSelectedContact}
                        updateActiveMsg={updateActiveMsg}
                        getAllMsg={getAllMsg}
                      />
                    );
                  })}
              </div>
            </div>
          </div>

          {/*Profile Update*/}
          <div className="profile-update">
            <div className="prev-info">
              <div className="close-icon" onClick={close}>
                <GrFormClose />
              </div>
              <div className="acc-details">
                <div className="acc-img">
                  <div className="acc-img-i">
                    <label htmlFor="file">
                      <img src={updateUser?.file} alt="curr-img" />
                      <span className="img-bg">
                        <span className="img-icon">
                          <AiOutlineCamera />
                        </span>
                      </span>
                    </label>

                    <input
                      type="file"
                      id="file"
                      onChange={getCurrentUserInfo}
                    />
                  </div>

                  <div className="curr-acc-form">
                    <form onSubmit={updateUserData}>
                      <label htmlFor="name">Your Name</label> <br />
                      <input
                        type="text"
                        value={updateUser?.name}
                        onChange={getCurrentUserInfo}
                        id="name"
                      />
                      <br />
                      <label htmlFor="email">Email</label>
                      <br />
                      <input
                        type="email"
                        value={updateUser?.email}
                        onChange={getCurrentUserInfo}
                        id="email"
                      />
                      <div className="update-btn">
                        <div className="btn">
                          <input type="submit" value="Update" />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}

        {!selectedContact && (
          <div className="emptyMessage">
            <div className="eicon">
              <AiOutlineDropbox />
            </div>
            <div className="emsg">No Contacts Selected Yet</div>
          </div>
        )}

        {selectedContact && (
          <div id="messages">
            {/* Current Contact */}
            <div className="active-conact">
              <div className="active-account-info">
                <div className="active-account-img">
                  <img src={selectedContact.image} alt="current-user" />
                </div>
                <div className="active-user-name">
                  <p className="active-name">{selectedContact.name}</p>
                  <p>{selectedContact.phoneno}</p>
                </div>
              </div>

              <div className="icons">
                <BsFillCameraVideoFill />
                <IoCallSharp />
                <div className="menu" onClick={viewMenu}>
                  <HiDotsVertical />
                  <div className="menu-list">
                    <ul>
                      <li value="acc-info" onClick={profileInfo}>
                        Account
                      </li>
                      <li value="settings">settings</li>
                      <li value="logout" onClick={() => signOut(auth)}>
                        Logout
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Message-Box */}
            <div className="msg-box">
              <div className="all-msg">
                <div className="msgs">
                  <ul>
                    {contactMsg?.map((message) => {
                      if (message.attachment) {
                        //Checking for sending or recieving message

                        if (message.class.indexOf("recieve") !== -1) {
                          return (
                            <li className="recieve msg-img">
                              <div className="chat-img">
                                <img
                                  src={selectedContact.image}
                                  alt="chatimg"
                                />
                              </div>
                              <p>
                                <img src={message.image} alt="recieved-image" />
                                <span>{message.msgValue}</span>
                              </p>
                            </li>
                          );
                        } else {
                          return (
                            <li className="send msg-img">
                              <p>
                                <img src={message.image} alt="send-image" />
                                <span>{message.msgValue}</span>
                              </p>
                            </li>
                          );
                        }
                      } else {
                        //Checking for sending or recieving message

                        if (message.class.indexOf("recieve") !== -1) {
                          return (
                            <li className="recieve">
                              <div className="chat-img">
                                <img
                                  src={selectedContact.image}
                                  alt="chatimg"
                                />
                              </div>
                              <p>{message.msgValue}</p>
                            </li>
                          );
                        } else {
                          return (
                            <li className="send">
                              <p>{message.msgValue}</p>
                            </li>
                          );
                        }
                      }
                    })}
                  </ul>
                </div>
              </div>
              {sendImage && (
                <div className="attached-image">
                  <div
                    className="close-image-icon"
                    onClick={() => setSendImage(null)}
                  >
                    <GrFormClose />
                  </div>
                  <div className="image">
                    <img src={sendImage} />
                  </div>
                </div>
              )}

              <div className="inp-box">
                <div className="inp-field">
                  <input
                    type="text"
                    placeholder="Type Message..."
                    id="msg-inp-box"
                  />
                  <div className="icons-1">
                  
                   <div className='emoji-picker' onClick={showEmojiPicker}> 
                    <BsEmojiLaughing />
                     {/*Emoji Picker*/}
                     {showPicker ?
                     <div className='picker'>
                       <Picker theme="dark" onEmojiClick= {selectedEmoji}/>
                     </div>:""}
                   </div> 
                    <div className="attachment">
                      <label htmlFor="send-img">
                        <GrAttachment />
                      </label>
                      <input type="file" id="send-img" onChange={onSendImage} />
                    </div>
                    <div className="sendbt" onClick={plzSendMsg}>
                      <GrSend />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ChatPage;
