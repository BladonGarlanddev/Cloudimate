import styles from "./styling/footer.module.css";
import { Link, useLocation } from "react-router-dom"; // Importing useLocation
import Logo from "./assets/blue-cloud-logo.png";

const Footer = () => {
  const location = useLocation();

  const logoLinkPath = location.pathname.includes("/app") ? "/app" : "/";

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLeft}>
        <Link to={logoLinkPath}>
          <img src={Logo} alt='Cloudimate Logo' className={styles.footerLogo} />
        </Link>
        <p>Copyright © 2023 Cloudimate</p>
      </div>

      <div className={styles.footerCenter}>
        <Link to='/contributions' className={styles.footerLink}>
          Contributors
        </Link>
        <p>
          Customer Support:{" "}
          <a href='mailto:tech@cloudimate.tech'>tech@cloudimate.tech</a>
        </p>
      </div>

      <div className={styles.footerRight}>
        <Link to='/terms-of-service' className={styles.footerLink}>
          Terms of Service
        </Link>
        <Link to='/privacy-policy' className={styles.footerLink}>
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
