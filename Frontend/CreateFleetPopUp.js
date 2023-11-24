import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Header from "./Header";
import Detail from "./Detail";
import ErrorMessage from "./ErrorMessage";
import SelectFleetTemplate from "./SelectFleetTemplate";
import axiosInstance from "./api/axiosConfig";

const CreateFleetPopUp = ({selectedAccount, handleAction}) => {
  const axios = axiosInstance();
  // List of AWS Images that is populated by the CC API
  const [images, setImages] = useState([]);
  // Holds the AWS Image that the user selects
  const [selectedImage, setSelectedImage] = useState(false);

  // Holds the state describing if there is an error or not
  const [error, setError] = useState(false);
  // Holds the state describing an error message
  const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {

        axios.get("/api/aws/describeImages")
            .then((response) => {
                const processedImages = response.data.map(image => {
                    return {
                        
                    }
                })
                setImages(response.data);
                console.log("images: " + JSON.stringify(response.data));
            })
            .catch((error) => {
                setError(true);
                setErrorMessage(error);
            })

    }, []);
    

  const [selectedTemplate, setSelectedTemplate] = useState(false);
  const [data, setData] = useState({
    name: "",
    template: {},
    image: {},
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = {
    0: {
      title: "Templates",
      description: "Select a template.",
    },
    1: {
      title: "Images",
      description: "Select an image.",
    },
  };

  const handleSubmission = (payload) => {
    const request = {
      headers: {
        "X-Api-Key": process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json",
      },
      mode: "cors",
      method: "POST",
      body: JSON.stringify({
        fleet_name: payload["name"],
        disconnect_timeout: payload["template"]["disconnect_timeout"],
        fleet_type: payload["template"]["fleet_type"],
        idle_disconnect_timeout: payload["template"]["idle_disconnect_timeout"],
        instance_type: payload["template"]["instance_type"],
        max_cap: payload["template"]["max_cap"],
        min_cap: payload["template"]["min_cap"],
        max_session: payload["template"]["max_session"],
        scale_policy: payload["template"]["scale_policy"],
        stream_view: payload["template"]["stream_view"],
        image_arn: payload["image"]["Arn"],
      }),
    };
  };

  const handleTemplateSelection = (template) => {
    setSelectedTemplate(true);
    setData({ ...data, template: template });
  };

  const handleImageSelection = (image) => {
    setSelectedImage(true);
    setData({ ...data, image: image });
  };

  return (
    <div className='fixed flex justify-center place-items-center bg-gray-300 bg-opacity-60 top-0 left-0 h-screen w-screen'>
      <div className='flex flex-col max-w-3xl h-fit w-full mx-4 rounded-md text-start bg-white shadow-lg'>
        <Header title={"Create Fleet"} />

        <div className='flex flex-col space-y-4 p-4'>
          {error && <ErrorMessage errorMessage={errorMessage} />}

          {currentStep === 0 && (
            <div>
              <Detail
                label={"Fleet Name"}
                detail={"Your fleet and stack will have identical names."}
                required={true}
              />
              <input
                type='text'
                value={data["name"]}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className='input-text'
                placeholder='fleet-name'
              />
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <Detail label={"Select a template"} required={true} />
              <SelectFleetTemplate
                currentFleetTemplate={data.template.template_name}
                handleTemplateSelection={handleTemplateSelection}
              />
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <Detail label={"Select an image"} required={true} />
              <div className='border-b border-t bg-gray-50 overflow-y-auto flex flex-col items-center p-4 space-y-4 max-h-96'>
                {images[0] ? (
                  images.map((image) => (
                    <div key={image.id} className='container space-y-2 p-3'>
                      <div className='flex flex-row space-x-2 justify-between w-full'>
                        <h1 className='text-base break-words'>{image.Name}</h1>
                        {image.Name === data.image.Name ? (
                          <input
                            type='radio'
                            defaultChecked
                            name='template'
                            onClick={() => handleImageSelection(image)}
                          />
                        ) : (
                          <input
                            type='radio'
                            name='template'
                            onClick={() => handleImageSelection(image)}
                          />
                        )}
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <Detail label={"Arn"} detail={image["Arn"]} />
                        <Detail label={"Platform"} detail={image["Platform"]} />
                        <Detail
                          label={"Visibility"}
                          detail={image["Visibility"]}
                        />
                      </div>
                      {image.Description && (
                        <p className='border-t pt-2 text-xs border-gray-300'>
                          {image.Description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <span className='flex flex-row items-center space-x-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-1/12'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z'
                      />
                    </svg>
                    <p className='text-sm w-full'>
                      It seems that our system couldn't retrieve any images from
                      the API. This could be due to an IAM issue or a lack of
                      available images.
                    </p>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className='flex flex-row justify-between space-x-2'>
            <div className='flex flex-row space-x-4'>
              <button
                onClick={() => handleAction(0)}
                className='secondary-button'
              >
                Cancel
              </button>
              {currentStep >= 1 && currentStep <= 2 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className='secondary-button'
                >
                  Back
                </button>
              )}
              {currentStep >= 0 && currentStep < 2 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className='secondary-button'
                >
                  Next
                </button>
              )}
            </div>
            {selectedTemplate && selectedImage ? (
              <button
                onClick={() => handleSubmission(data)}
                className='primary-button'
              >
                Create
              </button>
            ) : (
              <button disabled className='primary-button-disabled'>
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default CreateFleetPopUp;