import Loading from "./Loading";

const ResourceTemplateList = ({
  resourceTemplates,
  handleCheck,
  setDetails,
  selectedTemplate,
  setSelectedTemplate,
  requestMade,
}) => {
  return (
    <tbody className='text-gray-600'>
      {resourceTemplates && resourceTemplates.length !== 0
        ? resourceTemplates.map(
            (template) =>
              template && (
                <tr key={template.id} className='table-row-body'>
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
                    {template['template_name']}
                  </td>
                  <td className='p-2 text-ellipsis'>
                    {template['resource_type']}
                  </td>
                  <td className='p-2 text-ellipsis'>
                    {template["description"]}
                  </td>
                </tr>
              )
          )
        : requestMade == false && <Loading />}
    </tbody>
  );
};

export default ResourceTemplateList;
