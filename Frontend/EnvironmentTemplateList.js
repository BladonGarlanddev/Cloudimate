import Loading from "./Loading";


const EnvironmentTemplateList = ({ environmentTemplates, handleCheck, setDetails, selectedTemplate, setSelectedTemplate, requestMade }) => {
  return (
    <tbody className='text-gray-600'>
      {environmentTemplates && environmentTemplates.length !== 0 ? (environmentTemplates.map(
        (template) =>
          template && (
            <tr
              key={template.id}
              className='table-row-body'
            >
                {template.checked ? (
                  <td className='p-2 text-ellipsis overflow-x-clip max-w-md'>
                    <input
                      onClick={() => handleCheck(template)}
                      checked
                      type='checkbox'
                    />
                  </td>
                ) : (
                  <td className='p-2 text-ellipsis overflow-x-clip max-w-md'>
                    <input
                      onClick={() => handleCheck(template)}
                      type='checkbox'
                    />
                  </td>
                )}
              
              <td className='p-2 text-ellipsis'>
                {template.template_name}
              </td>
              <td className='p-2 text-ellipsis'>{template["description"]}</td>
            </tr>
          )
      )) : requestMade == false && (
        <Loading/>
      ) }
    </tbody>
  );
};

export default EnvironmentTemplateList;
