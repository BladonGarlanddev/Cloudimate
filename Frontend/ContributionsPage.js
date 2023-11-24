import styles from "./styling/ContributionsPage.module.css";
import Linkedin from "./assets/linkedin.png";
import Gear from "./assets/gear.png";
import Billing from "./assets/billing.png";
import UserIcon from "./assets/profile.png";
import Calender from "./assets/calendar.png";

const ContributionsPage = () => {
return (
  <div className={styles.contributionsPage}>

    <div className={styles.contributors}>
      <div className={styles.contributor}></div>
      <div className={styles.contributor}>
        <div className={styles.details}>
          <h1>Julio Sica Perez</h1>
          <p>
            This project originated at an internship. At this
            internship, Julio and I met. Julio is an astonishing programmer with
            a laser focus. Julio originally made the largest contribution to this project.
            After he left, I carried on with the project and worked to build it into what it is now.
            Portions of his work on the frontend still remain on the site today, a true testament to his
            ability.
          </p>
        </div>
        <div className={styles.image}>
          <a
            href='https://www.linkedin.com/in/juliosp/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={Linkedin} alt='LinkedIn Profile' />
          </a>
        </div>
      </div>
      <div className={styles.contributor}>
        <div className={styles.details}>
          <h1>Bladon Garland</h1>
          <p>
            Hi, I'm the dev. After my internship ended, I decided I would
            continue developing this application to prove my competency as a
            developer. Initially, I thought I could simply add a few new
            features and make things tiddy and it be ready. Along the lines I
            decided this application should have some way to genereate revenue
            to cover my expenses. Doing that forced me to make the application worth
            paying for which meant A LOT of work. Overall, it's turned into something
            I can be proud of and I've learned so much along the way.
          </p>
        </div>
        <div className={styles.image}>
          <a
            href='https://www.linkedin.com/in/bladon-garland-b99886228/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img src={Linkedin} alt='LinkedIn Profile' />
          </a>
        </div>
      </div>
    </div>
    <div className={styles.iconArea}>
      <a href='https://www.flaticon.com/free-icons/gear' title='gear icons'>
        <img src={Gear} />
        <p>Gear icons created by Freepik - Flaticon</p>
      </a>
      <a
        href='https://www.flaticon.com/free-icons/invoice'
        title='invoice icons'
      >
        <img src={Billing} />
        <p>Invoice icons created by Kiranshastry - Flaticon</p>
      </a>
      <a href='https://www.flaticon.com/free-icons/user' title='user icons'>
        <img src={UserIcon} />
        <p>User icons created by Freepik - Flaticon</p>
      </a>
      <a
        href='https://www.flaticon.com/free-icons/calendar'
        title='calendar icons'
      >
        <img src={Calender} />
        <p>Calendar icons created by Freepik - Flaticon Icon by </p>
      </a>
      <a
        href='https://www.flaticon.com/free-icons/linkedin'
        title='linkedin icons'
      >
        <img src={Linkedin} />
        <p> Linkedin icons created by Freepik - Flaticon</p>
      </a>
    </div>
  </div>
);
}

export default ContributionsPage;