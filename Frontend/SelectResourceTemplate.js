import { useState } from 'react';
import EC2IMG from "./assets/EC2.png";
import RDS from "./assets/RDS.png";
import ELB from "./assets/elb-icon.png"
import styles from "./styling/SelectResourceTemplate.module.css";
import { useHistory } from 'react-router-dom';

const SelectResourceTemplate = ({ setPage }) => {
    const history = useHistory();
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='blurred absolute inset-0'></div>
        <div className='container flex justify-center relative z-10 w-1/2'>
          <div className='container-header'>
            <h1 className='text-center mt-5'>Select A Resource</h1>
          </div>
          <div className={styles.resourceSelectBody}>
            <div
              onClick={() => {setPage(0o10)}}
              className='container container-hover mt-5 mb-5 p-5'
            >
              <div>
                <img className={styles.iconStyle} src={EC2IMG} />
              </div>
              <h2 className='google-text font-medium'>EC2</h2>
            </div>
            <div
              onClick={() => setPage(0o20)}
              className='container container-hover mt-5 mb-5 p-5'
            >
              <div className='flex items-center'>
                <img className={styles.iconStyle} src={RDS} />
              </div>
              <h2 className='google-text font-medium'>RDS Databases</h2>
            </div>
            <div
              onClick={() => setPage(0o30)}
              className='container container-hover mt-5 mb-5 p-5'
            >
              <div>
                <img className={styles.iconStyle} src={ELB} />
              </div>
              <h2 className='google-text font-medium'>Elastic Load Balancer</h2>
            </div>
          </div>
          <div className={styles.footer}>
            <button
              onClick={(e) => {
                e.preventDefault();
                history.push("/app/templates");
              }}
              className={styles.closeIcon}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
}

export default SelectResourceTemplate;