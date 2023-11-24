const Header = ({title, note}) => {
    return ( 
        <div className="flex flex-col bg-gray-100 rounded-t-md p-4 border-b border-b-gray-200">
            <h1 className="google-text font-normal">{title}</h1>
            { note && <p className="text-xs google-text">{note}</p> }
        </div>
     );
}
 
export default Header;