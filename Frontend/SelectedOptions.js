const SelectedOptions = ({options}) => {
    return ( 
        <div className="px-4 py-1 gap-2 flex flex-row flex-wrap border-t-2 border-gray-300">
            {options.map((option) => (
                <span key={option} className="selected-item">{option.template_name}</span>
            ))}
        </div>
     );
}
 
export default SelectedOptions;