import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import DropdownBtn from "./DropdownBtn";
import OGPopup from "./OGPopup";
import TableHead from "./TableHead";
import SelectedOptions from "./SelectedOptions";
import SchedulePopUp from "./SchedulePopUp";
import ErrorMessage from "./ErrorMessage";
import FleetList from "./FleetList";
import SuccessMessage from "./SuccessMessage";
import Loading from "./Loading";
import RefreshBtn from "./RefreshBtn";
import CreateFleetPopUp from "./CreateFleetPopUp";
import axiosInstance from "./api/axiosConfig";

const FleetTable = ({ selectedAccount }) => {
  const axios = axiosInstance();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Holds the Fetch data that is used in the Fleet Table
  const [fleets, setFleets] = useState([null]);

  const populateFleetTable = () => {
    axios
      .get("/api/aws/indexFleets")
      .then((response) => {
        const processedFleets = response.data.map(fleet => {
          return { 
            Name: fleet.Name,
            Arn: fleet.Arn,
            State: fleet.State,
            checked: false
          };
        });
        // Sets the fleets state to the data that was retrieved
        setFleets(processedFleets);
      })
      .catch((error) => {
        console.log("ERROOOOOOOOOOOOOOOOOOOOOOOORRRRRRRRRRRRRRRRRRRR: " + error);
        //setErrorMessage(error);
        //setError(true);
      });
  };

  useEffect(() => {
    populateFleetTable();
  }, []);

  useEffect(() => {
    handleRefresh();
  }, [selectedAccount]);

  // Holds a list of schools that are selected in the table
  const [selected, setSelected] = useState([]);

  // Handles when the user clicks on the "Select All" checkbox
  const handleClickAll = (e) => {
    let updatedFleets = [];
    let updatedSelected = [];

    // If the checkbox is checked
    if (e.target.checked) {
      // For each school do the following:
      fleets.map((fleet) => {
        fleet.checked = true;
        updatedFleets.push(fleet);
        updatedSelected.push(fleet.Name);
      });

      // Performs the updates
      setSelected(updatedSelected);
      setFleets(updatedFleets);
    }
    // If the checkbox is unchecked
    else {
      // For each school
      fleets.map((fleet) => {
        fleet.checked = false;
        updatedFleets.push(fleet);
      });

      // Performs the updates
      setSelected(updatedSelected);
      setFleets(updatedFleets);
    }
  };

  // Handles when the users clicks on a single checkbox
  const handleCheck = (template) => {
    let updatedFleets = [];
    let updatedSelected = [];

    fleets.map((fleet) => {
      if (fleet.Name === template.Name) {
        if (fleet.checked) {
          fleet.checked = false;
        } else {
          fleet.checked = true;
          updatedSelected.push(fleet.Name);
        }
        updatedFleets.push(fleet);
      } else {
        if (fleet.checked) {
          updatedSelected.push(fleet.Name);
        }

        updatedFleets.push(fleet);
      }
    });

    setSelected(updatedSelected);
    setFleets(updatedFleets);
  };

  // Function that is used to show a Success or Error message after making a fetch request
  const RequestOutput = (data) => {
    if (data["statusCode"] === 200) {
      setSuccess(true);
      setSuccessMessage(data["body"]);
    } else {
      setError(true);
      setErrorMessage(data["body"]);
    }

    setPop({ open: false });
    handleRefresh();
  };

  // Holds the state for the search bar
  const [search, setSearch] = useState("");

  // Handles the updates made to the search bar
  const handleSearch = (e) => {
    // Updates the state of the search bar when something is typed
    if (e.target.value === "") {
      setSearch("");
    } else {
      setSearch(e.target.value);
    }
  };

  // Sets the state of the pop-up screen
  const [pop, setPop] = useState({ open: false });

  // Sets the state of the pop-up screen for scheduling
  const [PopSchedule, setPopSchedule] = useState(false);

  // Sets the state for the refresh button
  const [refresh, setRefresh] = useState(false);

  // Sends a fetch request to refresh the Fleets Table
  const handleRefresh = () => {
    if (error) {
      setError(false);
      setErrorMessage(null);
    }
    if (success) {
      setSuccess(false);
      setSuccessMessage(null);
    }

    setRefresh(true);
    setFleets(null);
    setSelected([]);
    populateFleetTable();
    setRefresh(false);
  };

  const [createFleetPop, setCreateFleetPop] = useState(false);

  // Handles the operations performed by the different Actions in the dropdown menu
  const handleAction = (option, selected, bool) => {
    if (option === 0) {
      if (createFleetPop === false) {
        setCreateFleetPop(true);
      } else {
        setCreateFleetPop(false);
      }
    } else if (option === 1) {
      // ACTION: start fleet(s)
      if (bool === true) {
        const filteredFleets = fleets.filter(fleet => fleet.checked);
        for(let fleet of filteredFleets) {
          axios.post( "/api/aws/startFleet", {name: fleet.Name})
          .then((response) => {
            RequestOutput(response.data);
          })
          .catch((error) => {
            setError(true);
            setErrorMessage(String(error));
            setPop({ open: false });
          });
        } 
        
      } else {
        setPop({
          open: true,
          option: 1,
          message: "START the following fleet(s)?",
          note: "RUNNING fleets will not be affected",
        });
      }
    } else if (option === 2) {
      // ACTION: stop fleet
      if (bool === true) {        
        const filteredFleets = fleets.filter((fleet) => fleet.checked);
        for (let fleet of filteredFleets) {
          axios
            .post("/api/aws/stopFleet", { name: fleet.Name })
            .then((response) => {
              RequestOutput(response.data);
            })
            .catch((error) => {
              setError(true);
              setErrorMessage(String(error));
              setPop({ open: false });
            });
        } 
      } else {
        setPop({
          open: true,
          option: 2,
          message: "STOP the following fleet(s)?",
          note: "STOPPED fleets will not be affected",
        });
      }
    } else {
      setPop({ open: false });
    }
  };

  return (
    <div className='page'>
      {createFleetPop && (
        <CreateFleetPopUp
          handleAction={handleAction}
          selectedAccount={selectedAccount}
        />
      )}

      <div className='container w-11/12'>
        {success && (
          <SuccessMessage
            setSuccessMessage={setSuccessMessage}
            setSuccess={setSuccess}
            successMessage={successMessage}
          />
        )}

        {error && (
          <ErrorMessage
            setErrorMessage={setErrorMessage}
            errorMessage={errorMessage}
          />
        )}
      </div>

      <div className='container w-11/12'>
        <Helmet>
          <title>Cloudimate | Fleets</title>
        </Helmet>

        <div className='p-4 flex md:flex-row flex-col justify-between md:items-center md:space-y-0 space-y-3'>
          {fleets ? (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Fleets [{fleets.length}]
            </h3>
          ) : (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Fleets
            </h3>
          )}
          <div className='flex flex-row space-x-2'>
            <RefreshBtn handleRefresh={handleRefresh} />
            {selected.length > 0 ? (
              <>
                <button
                  className='secondary-button'
                  title='Start'
                  onClick={() => handleAction(1, selected, false)}
                >
                  <p className='md:flex hidden'>Start</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                    />
                  </svg>
                </button>
                <button
                  className='secondary-button'
                  title='Stop'
                  onClick={() => handleAction(2, selected, false)}
                >
                  <p className='md:flex hidden'>Stop</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457L3 3m5.457 5.457l7.086 7.086m0 0L21 21'
                    />
                  </svg>
                </button>
                <button
                  className='secondary-button'
                  title='Delete'
                  onClick={() => handleAction(4, selected, false)}
                >
                  <p className='md:flex hidden'>Delete</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  disabled
                  className='secondary-button-disabled'
                  onClick={() => handleAction(1, selected, false)}
                >
                  <p className='md:flex hidden'>Start</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                    />
                  </svg>
                </button>
                <button
                  disabled
                  className='secondary-button-disabled'
                  onClick={() => handleAction(2, selected, false)}
                >
                  <p className='md:flex hidden'>Stop</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457L3 3m5.457 5.457l7.086 7.086m0 0L21 21'
                    />
                  </svg>
                </button>
                <button
                  disabled
                  className='secondary-button-disabled'
                  onClick={() => handleAction(4, selected, false)}
                >
                  <p className='md:flex hidden'>Delete</p>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='md:hidden w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                    />
                  </svg>
                </button>
              </>
            )}
            <button
              className='primary-button'
              title='Delete'
              onClick={() => handleAction(0, selected, false)}
            >
              <p className='md:flex hidden'>Create Fleet</p>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='md:hidden w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4.5v15m7.5-7.5h-15'
                />
              </svg>
            </button>
          </div>
        </div>

        <div className='p-4'>
          <input
            onChange={handleSearch}
            className='input-text'
            type='text'
            name='SearchBar'
            id='SearchBar'
            placeholder='Search by name...'
          />
        </div>

        {selected.length > 0 && <SelectedOptions options={selected} />}

        {fleets ? (
          <div className='w-full overflow-auto'>
            <table className='table-auto w-full border-t text-sm text-center border-gray-300'>
              <TableHead
                handleClickAll={handleClickAll}
                columns={["Name", "ARN", "Status"]}
              />
              {search.length === 0 ? (
                <FleetList
                  fleets={fleets}
                  handleCheck={handleCheck}
                  selected={selected}
                />
              ) : (
                <FleetList
                  fleets={fleets.filter((fleet) => fleet.Name.includes(search))}
                  handleCheck={handleCheck}
                />
              )}
            </table>
          </div>
        ) : (
          !error && <Loading />
        )}

        {pop.open === true && (
          <OGPopup
            message={pop.message}
            option={pop.option}
            note={pop.note}
            selected={selected}
            btnMessage='Confirm'
            handleAction={handleAction}
            cancelVal={6}
          />
        )}

        {PopSchedule === true && (
          <SchedulePopUp
            selectedAccount={selectedAccount}
            RequestOutput={RequestOutput}
            btnMessage='Schedule'
            handleFleetStatus={handleAction}
            selected={selected}
          />
        )}
      </div>
    </div>
  );
};

export default FleetTable;
