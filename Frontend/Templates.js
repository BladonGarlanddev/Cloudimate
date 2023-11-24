import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./styling/Templates.css";

const NavigationButtons = () => {
  const location = useLocation();

  const checkActive = (templateType) => {
    return location.pathname.includes(templateType) ? '_button _active' : '_button';
  };

  return (
    <div className='page'>
      <div className='nav-buttons'>
        <Link
          to={"/app/templates/cron-templates"}
          className={checkActive("cron-templates")}
        >
          Cron Templates
        </Link>
        <Link
          to={"/app/templates/fleet-templates"}
          className={checkActive("fleet-templates")}
        >
          Fleet Templates
        </Link>
        <Link
          to={"/app/templates/environment-templates"}
          className={checkActive("environment-templates")}
        >
          Environment Templates
        </Link>
        <Link
          to={"/app/templates/resource-templates"}
          className={checkActive("resource-templates")}
        >
          Resource Templates
        </Link>
      </div>
    </div>
  );
};

export default NavigationButtons;
