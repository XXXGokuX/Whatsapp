import "../ComponentStyle/Input.css";
const Input = (props) => {
  return (
    <>
      <div className="inp-field">
        <div id="icon">{props.Icon && props.Icon}</div>
        <input
          type={props.type}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.ifValueChanges}
          name={props.name}
        />
      </div>
    </>
  );
};

export default Input;
