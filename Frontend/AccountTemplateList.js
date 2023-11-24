const AccountTemplateList = ({AccountTemplates, handleCheck, setDetails}) => {
    return ( 
        <tbody className="text-gray-600">
                {AccountTemplates.map((template) => (
                    <tr key={template.id} className="table-row-body">
                        {template.checked ? (
                            <td className="p-2 text-ellipsis overflow-x-clip max-w-md"><input onClick={() => handleCheck(template)} checked type="checkbox"/></td>
                        ) : (
                            <td className="p-2 text-ellipsis overflow-x-clip max-w-md"><input onClick={() => handleCheck(template)} type="checkbox"/></td>
                        )}
                        <td onClick={() => setDetails(template)} className="p-2 hover:underline hover:cursor-pointer text-ellipsis">{template["template_name"]}</td>
                        <td className="p-2 text-ellipsis">{template["instance_type"]}</td>
                        <td className="p-2 text-ellipsis">{template["Account_type"]}</td>
                        <td className="p-2 text-ellipsis">{template["stream_view"]}</td>
                        <td className="p-2 text-ellipsis">{template["scale_policy"]}</td>
                    </tr>
                ))}
        </tbody>
     );
}
 
export default AccountTemplateList;