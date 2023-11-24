import React, { useState } from 'react';
import './styling/EnvironmentPopup.css'; // Import the CSS file

const EnvironmentPopup = ({ popup, setPopup, environmentTemplates, setEnvironmentTemplates, selectedTemplate, setSelectedTemplate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const emptyStructure = {
      VPC: {
        name: "Choose Name",
        IGW: false,
        IP: null,
        availabilityZones: [
          {
            name: null,
            subnets: [
              {
                name: "Choose Name",
                IP: null,
                IGW: false,
                resources: [],
                routeTable: {
                  name: null,
                  entries: [
                    {
                      destination: null,
                      target: null,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
  };

  const handleSubmit = (e) => {
    setPopup(false);
    const newTemplate = {
      template_name: name,
      environment_structure: emptyStructure,
      description: description
    };

    setEnvironmentTemplates([...environmentTemplates, newTemplate])
    setSelectedTemplate(newTemplate);
    //write name submission to database
  };

  return (
    <div className='environment-popup'>
      <div className='popup-content'>
        <form onSubmit={handleSubmit}>
          <label>Enter your name:</label>
          <input
            type='text'
            onChange={(e) => setName(e.target.value)}
            placeholder='Your Name'
          />
          <label>Description: </label>
          <input
            type='text'
            onChange={(e) => setDescription(e.target.value)}
            placeholder='description'
          />
          <div className='button-container'>
            <button
              type='button'
              className='cancel-button'
              onClick={() => setPopup(false)}
            >
              Cancel
            </button>
            <button type='submit' className='submit-button'>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnvironmentPopup;
