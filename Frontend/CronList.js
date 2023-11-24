import Loading from "./Loading";

const CronList = ({ cronTemplates, handleCheck, setDetails, requestMade }) => {
  console.log("request made: " + requestMade);
  return (
    <tbody className='text-gray-600'>
      {cronTemplates && cronTemplates.length > 0 ? (
        cronTemplates
          .filter((f) => f !== null)
          .map((template) => (
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
              <td
                onClick={() => setDetails(template)}
                className='p-2 hover:underline cursor-pointer text-ellipsis'
              >
                {template["template_name"]}
              </td>
              {Object.keys(template).map(
                (column) =>
                  column != "description" &&
                  column != "id" &&
                  column != "template_name" &&
                  column != "checked" && (
                    <td key={column} className='p-2 text-ellipsis'>
                      {template[column]}
                    </td>
                  )
              )}
            </tr>
          ))
      ) : requestMade == false && (
          <Loading />
      )}
    </tbody>
  );
};

export default CronList;
