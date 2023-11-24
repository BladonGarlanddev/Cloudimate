import { Link } from "react-router-dom/cjs/react-router-dom.min";

const Detail = ({label, detail, link, padding, required}) => {
    return (
        padding ? (
            <span className="mb-1 px-4 flex flex-col google-text">
                {required ? (
                    <label className="text-gray-700 break-words sm:whitespace-nowrap font-normal text-sm">{label} <span className="required">*</span> </label>
                ) : (
                    <label className="text-gray-700 break-words sm:whitespace-nowrap font-normal text-sm">{label}</label>
                )}
                { link ? (
                    <Link to={link}>{detail}</Link>
                ) : (
                    <p className="text-xs break-words">{detail}</p>
                ) }
             </span>
        ) : (
            <span className="mb-1 flex flex-col google-text">
                {required ? (
                    <label className="text-gray-700 break-words sm:whitespace-nowrap font-normal text-sm">{label} <span className="required">*</span> </label>
                ) : (
                    <label className="text-gray-700 break-words sm:whitespace-nowrap font-normal text-sm">{label}</label>
                )}
                { link ? (
                    <Link to={link}>{detail}</Link>
                ) : (
                    <p className="text-xs break-words">{detail}</p>
                ) }
             </span>
        )
     );
}
 
export default Detail;