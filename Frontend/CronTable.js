import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import RefreshBtn from "./RefreshBtn";
import SelectedOptions from "./SelectedOptions";
import SuccessMessage from "./SuccessMessage";
import TableHead from "./TableHead";
import CronList from "./CronList";
import Header from "./Header";
import Detail from "./Detail";
import OGPopup from "./OGPopup";
import EditPopUp from "./EditPopUp";
import useAxios from "./api/axiosConfig";

const CronTable = () => {
  const axios = useAxios();
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showList, setShowList] = useState(false);
  const [cronTemplates, setCronTemplates] = useState([]);

  const [selected, setSelected] = useState([]);

  const [search, setSearch] = useState("");

  const [details, setDetails] = useState(null);

  const [pop, setPop] = useState({ open: false });

  const [editPop, setEditPop] = useState({ open: false });

  const [requestMade, setRequestMade] = useState(false);

  const fetchData = async () => {
    try {
      const response = axios
        .get("/api/getCronTemplates")
        .then((response) => {
          console.log(response.data);
          const processedData = response.data.map((cron) => {
            return { ...cron, checked: false };
          });
          setCronTemplates(processedData);
          setShowList(true);
          setRequestMade(true);
          console.log("use effect finished");
          console.log("processed Data: " + processedData);
        })
        .catch((error) => {
          console.log(error);
          setRequestMade(true);
          setShowList(false);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClickAll = (e) => {
    let updatedCronTemplates = [];
    let updatedSelected = [];

    if (e.target.checked) {
      cronTemplates.map((cronTemplate) => {
        cronTemplate.checked = true;
        updatedCronTemplates.push(cronTemplate);
        updatedSelected.push(cronTemplate.template_name);
      });
    } else {
      cronTemplates.map((cronTemplate) => {
        cronTemplate.checked = false;
        updatedCronTemplates.push(cronTemplate);
      });
    }
    setSelected(updatedSelected);
    setCronTemplates(updatedCronTemplates);
  };

  const handleCheck = (template) => {
    let updatedCronTemplates = [];
    let updatedSelected = [];

    cronTemplates.map((cronTemplate) => {
      if (cronTemplate.id === template.id) {
        if (cronTemplate.checked) {
          cronTemplate.checked = false;
        } else {
          cronTemplate.checked = true;
          updatedSelected.push(cronTemplate.template_name);
        }

        updatedCronTemplates.push(cronTemplate);
      } else {
        if (cronTemplate.checked) {
          updatedSelected.push(cronTemplate.template_name);
        }

        updatedCronTemplates.push(cronTemplate);
      }
    });

    setSelected(updatedSelected);
    setCronTemplates(updatedCronTemplates);
  };

  // Handles the actions taken on a template
  const handleAction = (action, selected, confirmation, value) => {
    switch (action) {
      case 0:
        switch (confirmation) {
          case true:
            console.log(action, selected, confirmation, value);
            console.log("Editing the selected template");
            editTemplate(selected, value);
            // Make request to the appropriate php endpoint to edit the selected fleets
            break;
          case false:
            setEditPop({ open: true, title: selected[0], action: 0 });
            break;
        }
        break;
      case 1:
        switch (confirmation) {
          case true:
            console.log("Deleting selected templates");
            deleteTemplates();
            // Make request to the appropriate php endpoint to delete the selected fleets via their FLEET_PURPOSE (name)
            break;
          case false:
            setPop({
              open: true,
              message: "Delete the following template(s)?",
              note: "",
              action: 1,
            });
            break;
        }
        break;
      case 2:
        // Cancel button functionality
        setPop({ open: false });
        break;
      case 3:
        setEditPop({ open: false });
        break;
    }
  };

  const editTemplate = async (selected, newTemplate) => {
    try {
      setEditPop(false);
      let templateToSend = { ...newTemplate };
      delete templateToSend.checked;

      axios.put(
        `/api/editCronTemplate/${selected}`,
        templateToSend
      )
      .then((response) => {
        fetchData();
      })
      .catch((error) => {

      })
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const deleteTemplates = async () => {
    try {
      for (let template_name in selected) {
        console.log(selected);
        console.log(template_name);

        axios.delete(
          `/api/deleteCronTemplate/${selected[template_name]}`
        )
        .then((response) => {
          setPop({open: false});
          const filteredTemplates = cronTemplates.filter(template => !selected[template_name].includes(template.template_name))
          setCronTemplates(filteredTemplates);
        })
        .catch((error) => {
          console.log(error);
        })

  

        console.log(`Template ${template_name} deleted successfully`);
      }
    } catch (error) {
      console.error("Error deleting templates:", error);
    }
  };


  useEffect(() => {
    
    fetchData(); 

  }, []);

  return (
    <div className='ml-auto mr-auto flex justify-center sm:flex-row flex-col w-11/12 sm:space-y-0 space-y-5 sm:space-x-5 space-x-0 mx-5'>
      <div className='container'>
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

        <div className='p-4 flex md:flex-row flex-col justify-between md:items-center md:space-y-0 space-y-3'>
          {cronTemplates ? (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Cron Templates [{cronTemplates.length}]
            </h3>
          ) : (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Cron Templates
            </h3>
          )}
          <div className='flex flex-row space-x-2'>
            <RefreshBtn />
            {selected.length === 1 ? (
              <button
                onClick={() => handleAction(0, selected, false)}
                className='secondary-button'
              >
                <p className='md:flex hidden'>Edit</p>
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
                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                  />
                </svg>
              </button>
            ) : (
              <button disabled className='secondary-button-disabled'>
                <p className='md:flex hidden'>Edit</p>
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
                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
                  />
                </svg>
              </button>
            )}
            {selected.length > 0 ? (
              <button
                onClick={() => handleAction(1, selected, false)}
                className='secondary-button'
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
            ) : (
              <button disabled className='secondary-button-disabled'>
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
            )}
            <Link to='/app/templates/cron'>
              <button className='primary-button'>
                <p className='md:flex hidden'>Build Template</p>
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
            </Link>
          </div>
        </div>

        <div className='p-4'>
          <input
            onChange={(e) => setSearch(e.target.value)}
            className='input-text'
            type='text'
            name='SearchBar'
            id='SearchBar'
            placeholder='Search by name...'
          />
        </div>

        {selected.length > 0 && <SelectedOptions options={selected} />}

        {cronTemplates ? (
          <div className='w-full overflow-x-auto'>
            <table className='w-full table-auto border-t text-sm text-center border-gray-300'>
              <TableHead
                handleClickAll={handleClickAll}
                columns={[
                  "name",
                  "minute",
                  "hour",
                  "day of month",
                  "month",
                  "day of week",
                  "year",
                ]}
              />
              {search.length === 0 && showList ? (
                <CronList
                  setDetails={setDetails}
                  cronTemplates={cronTemplates}
                  handleCheck={handleCheck}
                />
              ) : (
                <CronList
                  setDetails={setDetails}
                  cronTemplates={cronTemplates.filter((template) =>
                    template.template_name.includes(search)
                  )}
                  handleCheck={handleCheck}
                  requestMade={requestMade}
                />
              )}
            </table>
          </div>
        ) : (
          !error && <Loading />
        )}

        {editPop.open && (
          <EditPopUp
            mode={"cron"}
            title={editPop.title}
            templates={cronTemplates}
            selected={selected[0]}
            confirmVal={0}
            cancelVal={3}
            handleAction={handleAction}
          />
        )}

        {pop.open && (
          <OGPopup
            handleAction={handleAction}
            message={pop.message}
            note={pop.note}
            option={pop.action}
            selected={selected}
            btnMessage={"Confirm"}
            cancelVal={2}
          />
        )}
      </div>
      {details && (
        <div className='flex flex-col sm:w-1/4 space-y-2'>
          <div className='container'>
            <Header title={details["template_name"]} />
            <div className='grid grid-cols-1 p-4 gap-4'>
              <Detail label={"Description"} detail={details["description"]} />
              <Detail
                label={"Cron Expression"}
                detail={
                  "cron( " +
                  details["min"] +
                  " " +
                  details["hour"] +
                  " " +
                  details["day_of_month"] +
                  " " +
                  details["month"] +
                  " " +
                  details["day_of_week"] +
                  " " +
                  details["year"] +
                  " )"
                }
              />
              <button
                onClick={() => setDetails(null)}
                className='secondary-button'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronTable;
