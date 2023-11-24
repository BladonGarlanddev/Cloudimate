import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styles from "./styling/successPage.module.css";
import banner from "./assets/banner.png"

const SuccessPage = () => {
  const history = useHistory();
  const [timer, setTimer] = useState(4); // Initial timer value of 5 seconds

  const decrementTimer = () => {
    setTimer((prevTimer) => prevTimer - 1);
  };

  // Use useEffect to start the timer countdown
  useEffect(() => {
    const timerInterval = setInterval(() => {
      decrementTimer();
    }, 1000); // Decrease the timer every 1 second

    // Redirect to /app/ when the timer reaches 0
    if (timer === 0) {
      clearInterval(timerInterval); // Clear the interval to stop the timer
      history.push("/app/");
    }

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(timerInterval);
    };
  }, [history, timer]);

  return (
    <div className={styles.successPageContainer}>
      <div className={styles.banner}>
        <img src={banner}/>
      </div>
      <h1>Subscription was successful!</h1>
      <p>
        You will be redirected to your dashboard in {timer} seconds or{" "}
        <a href='/app/'>click here to go now</a>
      </p>
    </div>
  );
};

export default SuccessPage;
