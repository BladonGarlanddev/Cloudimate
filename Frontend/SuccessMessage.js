const SuccessMessage = ({setSuccessMessage, setSuccess, successMessage}) => {
    return ( 
        <span className="bg-green-300 text-green-950 w-full flex flex-col p-3 rounded-md">
            <div className="flex flex-row justify-between items-center">
                <span className="google-text text-md font-normal">Success</span>
                <button onClick={() => {
                    setSuccessMessage(null);
                    setSuccess(false);
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="stroke-green-950 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <p className="google-text text-xs">{successMessage}</p>
        </span>
     );
}
 
export default SuccessMessage;