import { Link } from "react-router-dom";
import Loading from "./Loading";

const FleetList = ({ fleets, handleCheck, requestMade }) => {
  return (
    <tbody className='text-gray-600'>
      {fleets &&
        fleets.length > 0 ? (
          fleets
          .filter((f) => f !== null)
          .map((fleet) => (
            <tr key={fleet.Name} className='table-row-body'>
              {fleet.checked ? (
                <td className='p-2 text-ellipsis overflow-x-clip max-w-md'>
                  <input
                    onClick={() => handleCheck(fleet)}
                    checked={fleet.checked}
                    type='checkbox'
                    name={fleet.Name}
                  />
                </td>
              ) : (
                <td className='p-2 text-ellipsis overflow-x-clip max-w-md'>
                  <input
                    onClick={() => handleCheck(fleet)}
                    type='checkbox'
                    name={fleet.Name}
                  />
                </td>
              )}
              <td className='p-2 text-ellipsis overflow-x-clip max-w-md hover:underline hover:text-yello-900'>
                {" "}
                <Link to={"/fleets/" + fleet.Name}>{fleet.Name}</Link>{" "}
              </td>
              <td className='p-2 text-ellipsis'>{fleet.Arn}</td>
              {fleet.State === "RUNNING" || fleet.State === "STARTING" ? (
                <td className='p-1 text-ellipsis'>
                  <span className='green-tag'>{fleet.State}</span>
                </td>
              ) : (
                <td className='p-1 text-ellipsis'>
                  <span className='red-tag'>{fleet.State}</span>
                </td>
              )}
            </tr>
          ))) : requestMade == false && (
            <Loading/>
          )
        }
    </tbody>
  );
};

export default FleetList;
