import "../ComponentStyle/Button.css";

const Button = (props) => {
  return (
    <>
      <div className="btn">
        <button onClick={props.ifClicked}>{props.value}</button>
      </div>
    </>
  );
};

export default Button;
