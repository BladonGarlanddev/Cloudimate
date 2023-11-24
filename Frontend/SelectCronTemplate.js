import { Link } from "react-router-dom/cjs/react-router-dom";
import Detail from "./Detail";
import { useState } from "react";

const SelectFleetTemplate = ({handleTemplateSelection, currentCronTemplate}) => {

    const [cronTemplates, setCronTemplates] = useState([{id: 0, template_name:"Testing", description:"Description for template", minute:"10", hour:"20", day_of_month:"?", month:"1", day_of_week:"*", year:"2030", checked: false}, {id: 1, template_name:"Tacos", description:"Tacos are delicious", minute:"5", hour:"15", day_of_month:"?", month:"1", day_of_week:"*", year:"2025", checked: false}]);

    return ( 
        <div className="border-b border-t bg-gray-50 overflow-y-auto flex flex-col items-center p-4 space-y-4 max-h-96">
            {cronTemplates[0] ? (
                    cronTemplates.map((template) => (
                        <div key={template.id} className="container space-y-2 p-3">
                            <div className="flex flex-row justify-between">
                                <h1 className="text-base">{template.template_name}</h1>
                                {template.template_name === currentCronTemplate.template_name ? (
                                    <input type="radio" defaultChecked name="template" onClick={() => handleTemplateSelection(template)}/>
                                ) :(
                                    <input type="radio" name="template" onClick={() => handleTemplateSelection(template)}/>
                                )}
                            </div>
                            <div className="flex flex-row space-x-2">
                                <Detail detail={"Cron (" + template.minute + " " + template.hour + " " + template.day_of_month + " " + template.month + " " + template.day_of_week + " " + template.year + ")"}/>
                            </div>
                            {template && (
                                <p className="border-t pt-2 text-xs border-gray-300">
                                    {template.description}
                                </p>
                            )}
                        </div>
                    ))
            ) : (
                <p className="text-sm">Looks empty. Create a template <Link className="underline text-yellow-900 hover:text-yellow-950" to="/templates/cron">here!</Link></p>
            )}
        </div>   
     );
}
 
export default SelectFleetTemplate;