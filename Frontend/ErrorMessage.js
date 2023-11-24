const ErrorMessage = ({errorMessage, errorMessageS}) => {
    return ( 
        <span className="bg-red-300 text-red-950 w-full flex flex-col p-3 rounded-md">
            <div className="flex flex-row justify-between items-center">
                <span className="google-text text-md font-normal">Error</span>
            </div>
            {errorMessageS && (
                <ul className="flex flex-col space-y-2">
                    {errorMessageS.map((error) => (
                        <li className="google-text text-xs">{error}</li>
                    ))}
                </ul>
            )}
            {errorMessage && (
                <p className="google-text text-xs">{String(errorMessage)}</p>
            )}
        </span>
     );
}
 
export default ErrorMessage;