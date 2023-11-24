import { useState } from "react";
import Header from "./Header";

const Popup = ({ message, option, note, selected, btnMessage, handleAction, cancelVal }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = (e) => {
    if (e.target.value === "confirm") {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div className='fixed flex justify-center place-items-center bg-gray-300 bg-opacity-60 top-0 left-0 h-screen w-screen'>
      <div className='h-fit flex flex-col max-w-md w-full mx-4 rounded-sm text-start bg-white shadow shadow-gray-400'>
        <Header title={message} note={note} />
        <div className='p-4'>
          <ul className='list-disc px-4 py-2 justify-center text-sm'>
            {selected.map((item) => (
              <li>{item.template_name}</li>
            ))}
          </ul>
        </div>
        <div className='px-4'>
          <label className='text-sm font-thin' htmlFor='confirm_deletion'>
            Type <i>"confirm"</i> to continue.
          </label>
          <input
            onChange={handleConfirm}
            className='input-text'
            placeholder='confirm'
            autoFocus
            type='text'
            name='confirm_deletion'
            id='confirm_deletion'
          />
        </div>
        <div className='flex flex-row p-4 space-x-4 justify-end'>
          <button
            onClick={() => handleAction(cancelVal)}
            className='secondary-button'
          >
            Cancel
          </button>
          {open === true ? (
            <button
              onClick={() => handleAction(option, selected, true)}
              className='primary-button'
            >
              {btnMessage}
            </button>
          ) : (
            <button disabled className='primary-button-disabled'>
              {btnMessage}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
