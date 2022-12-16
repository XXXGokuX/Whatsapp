import "../ComponentStyle/Contact.css";

var prevItem = null;
const updateSelectedContact = (e, props) => {
  if (prevItem) prevItem.classList.remove("active");

  if (e.target.classList.contains("contact-card")) {
    e.target.classList.add("active");
    prevItem = e.target;
  } else {
    let currItem = e.target;
    while (!currItem.classList.contains("contact-card"))
      currItem = currItem.parentNode;

    currItem.classList.add("active");
    prevItem = currItem;
  }
  props.updateActiveMsg && props.updateActiveMsg(props.uid)
  props.getAllMsg(props.uid)
  props.getSelectedContact(props);
};

const Contact = (props) => {
  return (
    <div
      className={props.category}
      onClick={(e) => updateSelectedContact(e, props)}
    >
      <div className="contact-card">
        <div className="cimage-cinfo">
          <div className="contact-image">
            <img src={props.image} alt="cimg" />
          </div>
          <div className="contact-info">
            <p className="contact-name">{props.name}</p>
            {props.lastMessage && (
              <p className="last-message">{props.lastMessage}</p>
            )}
          </div>
        </div>
        {props.actveMessage && (
          <div className="recieve-image">{props.actveMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Contact;
