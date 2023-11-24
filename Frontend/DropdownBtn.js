import { useState } from "react";

const DropdownBtn = ({name, listOptions, enabled, selected}) => {

    // Holds the state of the Dropdown button (enabled/disabled)
    const [open, setOpen] = useState(false);

    // Handles the dropdown state
    const handleDropdown = () => {
        if (open === false){
            setOpen(true);
        } else {
            setOpen(false);
        }
    }

    return ( 
        <div className="relative">
            <button onClick={handleDropdown} className="dropdown-button">
                <span>{name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            {open && (
                <ul className="absolute flex flex-col w-full rounded-sm mt-1 text-sm text-center shadow-sm shadow-blue-900 bg-gray-100">
                    {enabled ? listOptions.map((option) => (
                        <li key={option.Name}>
                            <button onClick={() => {option.Function(option.Param, selected, false); handleDropdown();} } className="dropdown-option">{option.Name}</button>
                        </li>
                    )) : listOptions.map((option) => (
                        <li key={option.Name}>
                            <button disabled className="dropdown-option-disabled">{option.Name}</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
     );
}
 
export default DropdownBtn;