import { useState, useEffect } from "react";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import RefreshBtn from "./RefreshBtn";
import SuccessMessage from "./SuccessMessage";
import TableHead from "./TableHead";
import Detail from "./Detail";
import Header from "./Header";
import Popup from "./Popup";
import GenDiagram from "./GenDiagram";
import EnvironmentPopup from "./EnvironmentPopup";
import EnvironmentTemplateList from "./EnvironmentTemplateList";
import useAxios from "./api/axiosConfig";

const EnvironmentTemplatesTable = () => {
  const axios = useAxios();
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [pop, setPop] = useState({ open: false });

  const [editPop, setEditPop] = useState({ open: false });
  const [popup, setPopup] = useState(false);
  const [environmentTemplates, setEnvironmentTemplates] = useState([null]);

  const [selected, setSelected] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [search, setSearch] = useState("");

  const [details, setDetails] = useState(null);

  const [requestMade, setRequestMade] = useState(false);

  useEffect(() => {
    
    fetchData();

    return () => {};
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/getEnvironmentTemplates");

      if (response.data && Array.isArray(response.data)) {
        const parsedData = response.data.map((item) => ({
          ...item,
          environment_structure: JSON.parse(item.environment_structure),
        }));

        setEnvironmentTemplates(parsedData);
      }
    } catch (error) {
      console.log(error);
    }
    setRequestMade(true);
  };

  useEffect(() => {
    if (selected.length === 1) {
      const templateToSet = environmentTemplates.find(
        (template) => template.template_name === selected[0]
      );
      console.log(selected[0]);
      if (templateToSet) {
        setSelectedTemplate(templateToSet);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [selected]);

  const handleClickAll = (e) => {
    let updatedEnvironmentTemplates = [];
    let updatedSelected = [];

    if (e.target.checked) {
      environmentTemplates.map((environmentTemplate) => {
        environmentTemplate.checked = true;
        updatedEnvironmentTemplates.push(environmentTemplate);
        updatedSelected.push(environmentTemplate.template_name);
      });

      setSelected(updatedSelected);
    } else {
      environmentTemplates.map((environmentTemplate) => {
        environmentTemplate.checked = false;
        updatedEnvironmentTemplates.push(environmentTemplate);
      });

      setSelected(updatedSelected);
    }
  };

  const handleCheck = (template) => {
    let updatedEnvironmentTemplates = [];
    let updatedSelected = [];

    environmentTemplates.map((environmentTemplate) => {
      if (environmentTemplate.id === template.id) {
        console.log("Environment template id: " + environmentTemplate.id);
        console.log("template id: " + template.id);

        if (environmentTemplate.checked) {
          environmentTemplate.checked = false;
        } else {
          environmentTemplate.checked = true;
          updatedSelected.push(environmentTemplate.template_name);
        }

        updatedEnvironmentTemplates.push(environmentTemplate);
      } else {
        if (environmentTemplate.checked) {
          updatedSelected.push(environmentTemplate.template_name);
        }

        updatedEnvironmentTemplates.push(environmentTemplate);
      }
    });
    setSelected(updatedSelected);
  };

  const deleteTemplates = async () => {
    try {
      for (let template_name in selected) {
        console.log(selected);
        console.log(template_name);
        const response = await axios.delete(
          `/api/deleteEnvironmentTemplate/${selected[template_name]}`
        )
        .then((response) => {
          const filteredTemplates = environmentTemplates.filter(
            (template) => !selected[template_name].includes(template.template_name)
          );
          setEnvironmentTemplates(filteredTemplates);
        })
        .catch((error) => {
          console.log(error);
        })

      }
    } catch (error) {
      console.error("Error deleting templates:", error);
    }
  };

  return (
    <div className='ml-auto mr-auto w-11/12 h-full'>
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
        {popup && (
          <EnvironmentPopup
            popup={popup}
            setPopup={setPopup}
            environmentTemplates={environmentTemplates}
            setEnvironmentTemplates={setEnvironmentTemplates}
            selectedTemplate={selected}
            setSelectedTemplate={setSelectedTemplate}
          />
        )}
        <div className='p-4 flex md:flex-row flex-col justify-between md:items-center md:space-y-0 space-y-3'>
          {environmentTemplates ? (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Environment Templates [{environmentTemplates.length}]
            </h3>
          ) : (
            <h3 className='google-text font-normal whitespace-nowrap'>
              Environment Templates
            </h3>
          )}
          <div>
            <div className='flex flex-row space-x-2'>
              <RefreshBtn />

              {selected.length > 0 ? (
                <button
                  onClick={() => deleteTemplates()}
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
              <button className='primary-button' onClick={() => setPopup(true)}>
                <p className='md:flex hidden'>New Template</p>
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
            <div className='flex-col mt-4'>
              <input
                onChange={(e) => setSearch(e.target.value)}
                className='input-text'
                type='text'
                name='SearchBar'
                id='SearchBar'
                placeholder='Search by purpose...'
              />
            </div>
          </div>
        </div>

        {environmentTemplates ? (
          <div className='w-full overflow-x-auto'>
            <table className='table-auto border-t text-sm text-center border-gray-300 w-full'>
              <TableHead
                handleClickAll={handleClickAll}
                columns={["name", "purpose"]}
              />
              {search.length === 0 ? (
                <EnvironmentTemplateList
                  setDetails={setDetails}
                  environmentTemplates={environmentTemplates}
                  handleCheck={handleCheck}
                  requestMade={requestMade}
                />
              ) : (
                <EnvironmentTemplateList
                  setDetails={setDetails}
                  environmentTemplates={environmentTemplates.filter((template) =>
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

        <div className='flex flex-grow-2 w-full'>
          {selectedTemplate != null && (
            <div className='w-full mt-10 mb-3 pt-10 border-t border-gray-300'>
              <GenDiagram selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentTemplatesTable;
