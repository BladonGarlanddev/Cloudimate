import Detail from "./Detail";
import Header from "./Header";
import { useEffect, useState } from "react";

const EditPopUp = ({title, selected, templates, cancelVal, handleAction, confirmVal, mode}) => {

    const [newTemplate, setNewTemplate] = useState({})

    useEffect(() => {
        templates.map((template) => {
            if (template.template_name === selected) setNewTemplate({ ...template });
        })
    }, [])


    return ( 
        <div className="fixed flex justify-center place-items-center bg-gray-300 bg-opacity-60 top-0 left-0 h-screen w-screen">
            <div className="h-fit flex flex-col max-w-md w-full mx-4 rounded-sm text-start bg-white shadow shadow-gray-400">
                <Header title={title}/>
                <div className="p-4 space-y-4">
                    <div className="space-y-1">
                        {mode === "cron" && (
                            <>
                                <Detail label={"Template Name"} />
                                <input onChange={(e) => setNewTemplate({...newTemplate, template_name:e.target.value})} type="text" className="input-text" value={newTemplate.template_name} />
                            </>
                        )}
                        {mode === "fleet" && (
                            <>
                                <Detail label={"Fleet Name"} />
                                <input onChange={(e) => setNewTemplate({...newTemplate, template_name:e.target.value})} type="text" className="input-text" value={newTemplate.template_name} />
                            </>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Detail label={"Description"} />
                        <textarea onChange={(e) => setNewTemplate({...newTemplate, description:e.target.value})} className="input-text" value={newTemplate.description} maxLength={200} cols="20" rows="2"></textarea>
                    </div>
                </div>
                <div className="flex flex-row p-4 space-x-4 justify-end">
                    <button onClick={() => handleAction(cancelVal)} className="secondary-button">Cancel</button>
                    <button onClick={() => handleAction(confirmVal, selected, true, newTemplate)} className="primary-button">Confirm</button>
                </div>
            </div>        
        </div>
     );
}
 
export default EditPopUp;