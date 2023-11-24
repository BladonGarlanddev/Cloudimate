import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import bannerWithText from "./assets/blue-banner-no-text.png";
import Footer from "./Footer.js";
import { Link } from "react-router-dom";
import styles from "./styling/LandingPage.module.css";
import Logo from "./assets/white-cloud-logo.png";
import etss from "./assets/etss.png";
import ftss from "./assets/ftss.png";
import gss from "./assets/gss.png";
import cli from "./assets/cli.png";
import { UserContext } from "./context/UserContext";

const LandingPage = () => {
  const { user, setUser } = useContext(UserContext);
  const history = useHistory();
  return (
    <div className={styles.landingPage}>
      <nav>
        <img src={Logo} className={styles.logo} />
        <ul className={styles.navLinks}>
          {user ? (
            <>
              <li>
                <Link to='/free-trial'>Free Trial</Link>
              </li>
              <li>
                <Link to='/subscription'>Subscription</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/free-trial/signup'>Free Trial</Link>
              </li>
              <li>
                <Link to='/subscription/signup'>Subscription</Link>
              </li>
            </>
          )}

          <li>
            <Link to='/signin'>Sign In</Link>
          </li>
        </ul>
      </nav>
      <div className={styles.bannerContainer}></div>
      <img
        src={bannerWithText}
        className={styles.banner}
        alt='Banner with text'
      />
      <div className={styles.overlayText}>
        Automate With Cloudimate <br />{" "}
        <p>Save the repetetive tasks for the robots </p>
        {user ? (
          <>
            <Link to='/free-trial'>
              <button>See What Easy Feels Like</button>
            </Link>
          </>
        ) : (
          <>
            <Link to='/free-trial/signup'>
              <button>See What Easy Feels Like</button>
            </Link>
          </>
        )}
      </div>
      <div className={styles.landingPageTextArea}>
        <section className={styles.lps}>
          <h1 className={styles.flagShipTitle}>Our Flagship Feature</h1>
          <div className={styles.flagShipText}>
            <img src={etss} className={styles.etss} />
            <div className='ml-9'>
              <p className='mb-2'>
                With Cloudimate, provisioning a complete AWS environment is just
                a 10-second task, achieved with a single command via its CLI.
                This powerful tool allows for the creation of templates for
                resources like EC2 and RDS, and the seamless setup of network
                configurations.
              </p>{" "}
              By utilizing environment templates, Cloudimate not only minimizes
              human error but also makes infrastructure setup accessible to all
              skill levels. Senior developers can design templates, empowering
              junior developers to deploy environments efficiently. Cloudimate
              ensures a streamlined, reliable, and incredibly fast process for
              setting up AWS environments.
            </div>
          </div>
        </section>
        <section className={styles.lps}>
          <h1 className={styles.flagShipTitle}>
            Cloudimate: Streamlining Appstream Operations
          </h1>
          <span className='mt-10'>a</span>
          <div className={styles.flagShipText}>
            <img src={ftss} className={styles.etss} />
            <div className='ml-9 flex flex-col'>
              <p className='flex flex-col'>
                For Appstream users, Cloudimate is all about enhancing
                efficiency. Set up your fleets quickly and tailor them to your
                needs. Our CRON templates come in handy for scheduling your
                fleets, ensuring they run exactly when needed. This smart
                approach not only saves time but also helps manage costs
                effectively. With Cloudimate, you're in control, making your
                operations smoother and more cost-effective.
              </p>
            </div>
          </div>
        </section>
        <section className={styles.lps}>
          <h1 className={styles.graphTitle}>Resource Monitoring</h1>
          <div className={styles.graphText}>
            <img src={gss} className={styles.gss} />
            <p>
              If you want to take a quick glance at your resources and thier
              performance metrics, set up resource monitoring in Cloudimate.
            </p>
          </div>
        </section>
        <section className={styles.lps}>
          <h1 className={styles.cliTitle}>One Command Is All It Takes</h1>
          <div className={styles.flagShipText}>
            <img src={cli} className={styles.gss} />
            <div className="flex flex-col">
              <p>
                Cloudimates CLI allows users to provision entire environments in
                seconds with a single command.
              </p>
              <p>Follow these steps:</p>
              <ul class='list-disc pl-5 flex flex-col'>
                <li>open a terminal</li>
                <li>type 'pip install Cloudimate'</li>
                <li>type 'cm set credentials'</li>
                <li>You're ready to go!</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
