import React from "react";
import styles from "./styling/Popup.module.css"; // Assuming you'll be using this CSS file

const Popup = ({ show, message, showInput, onClose, buttonText, handleAction }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showInput) {
      const inputValue = e.target.input.value;
      onClose(inputValue);
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <form
        className={styles.popupContent}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        {message && <p>{message}</p>}
        {showInput && <input type='text' name='input' />}
        <button type='submit'>{buttonText}</button>
      </form>
    </div>
  );
};

export default Popup;
