import React, { useEffect } from 'react';
import { Link } from "react-router-dom/cjs/react-router-dom";
import Detail from "./Detail";
import { useState } from "react";
import axiosInstance from "./api/axiosConfig";

const SelectFleetTemplate = ({handleTemplateSelection, currentFleetTemplate}) => {
    const axios = axiosInstance();
    const [fleetTemplates, setFleetTemplates] = useState([]);

    useEffect(() => {
      const response = axios
        .get("/api/getFleetTemplates")
        .then((response) => {
          setFleetTemplates(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, []);

    return ( 
        <div className="border-b border-t bg-gray-50 overflow-y-auto flex flex-col items-center p-4 space-y-4 max-h-96">
        {fleetTemplates.length > 0 ? (
                fleetTemplates.map((template) => (
                    <div key={template.id} className="container space-y-2 p-3">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-base">{template.template_name}</h1>
                            {template.template_name === currentFleetTemplate ? (
                                <input type="radio" defaultChecked name="template" onClick={() => handleTemplateSelection(template)}/>
                            ) :(
                                <input type="radio" name="template" onClick={() => handleTemplateSelection(template)}/>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Detail label={"Fleet Type"} detail={template["fleet_type"]} />
                            <Detail label={"Instance Type"} detail={template["instance_type"]} />
                            <Detail label={"Max Session"} detail={template["max_session"] + " min."} />
                            <Detail label={"Disconnect Timeout"} detail={template["disconnect_timeout"] + " min."} />
                            <Detail label={"Idle Disconnect Timeout"} detail={template["idle_disconnect_timeout"]} />
                            <Detail label={"Min Capacity"} detail={template["min_cap"]} />
                            <Detail label={"Max Capacity"} detail={template["max_cap"]} />
                            <Detail label={"Stream View"} detail={template["stream_view"]} />
                            <Detail label={"Scale Policy"} detail={template["scale_policy"]} />
                        </div>
                        {template && (
                            <p className="border-t pt-2 text-xs border-gray-300">
                                {template.description}
                            </p>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-sm">Looks empty. Create a template <Link className="underline text-yellow-900 hover:text-yellow-950" to="/templates/fleets">here!</Link></p>
            )}
        </div>   
     );
}
 
export default SelectFleetTemplate;