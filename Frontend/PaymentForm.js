import React, { useState, useRef, useContext } from "react";
import { useHistory } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import useAxios from "./api/axiosConfig";
import styles from "./styling/PaymentForm.module.css";
import checkMark from "./assets/CheckMark.png";
import { UserContext } from "./context/UserContext";

const CARD_OPTIONS = {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "#c4f0ff",
      fontWeight: 500,
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#87bbfd" },
    },
    invalid: {
      iconColor: "#ffc7ee",
      color: "#ffc7ee",
    },
  },
};

function PaymentForm({ stripePromise }) {
  const couponCode = useRef(null);
  const axios = useAxios();
  const { user, setUser } = useContext(UserContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usingCoupon, setUsingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [couponResponse, setCouponResponse] = useState(null);
  const [paymentError, setPaymentError] = useState(false);

  const subscriptionType = useRef("");
  const cardError = useRef(false);
  
  const elements = useElements();
  const stripe = useStripe();
  const history = useHistory();
  
  

  if (window.location.pathname.includes("free-trial")) {
    subscriptionType.current = "free-trial"; // Update the value without triggering re-render
  } else if (window.location.pathname.includes("subscription")) {
    subscriptionType.current = "subscription"; // Update the value without triggering re-render
  } else {
    subscriptionType.current = "subscription"; // Update the value without triggering re-render
  }

  try {
    if (!user.email) {
      history.push("/login");
    }
  } catch (error) {
    history.push("/login");
  }  

  const handleCoupon = (event) => {
      event.preventDefault();
      console.log("Coupon code: " + couponCode.current.value);
      axios.post('/api/checkCoupon', {coupon_code: couponCode.current.value})
      .then((response) => {
        setUsingCoupon(true);
        setCouponError(false);
        try {
          setCouponResponse(response.data.coupon);
        } catch {

        }
      })
      .catch((response) => {
        setCouponError(true);
        setUsingCoupon(false);
        couponCode.current.value = null;
      })
  }

  const handlePayment = async (event) => {
    event.preventDefault();
    try {
      if(couponResponse !== 'free') {
        const stripe = await stripePromise;

        const cardElement = elements.getElement(CardElement);

        // Create a PaymentMethod
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

        if (error) {
          cardError.current = true;
          setIsProcessing(false);
        }
        const { id } = paymentMethod;

        const requestData = {
          user: user,
          id,
          subscription_type: subscriptionType.current,
          coupon_code: couponCode.current.value,
        };
        if (error) {
          console.error(error);
          // Handle tokenization error
        } else {
          try {
            //if (user.stripe_id) {
            axios
              .post("/api/stripe/createUser", requestData)
              .then((response) => {
                const updatedUser = {
                  ...user,
                  stripe_id: response.data.stripe_id,
                };
                setIsProcessing(false); // Stop processing
                setUser(updatedUser);
                history.push("/successPage");
              })
              .catch((error) => {
                setIsProcessing(false); // Stop processing
                setPaymentError(true);
                console.log(error);
                console.log("fail");
              });
            console.log(isProcessing);
            //}
            /*
 else {
            console.log("creating subscription");
            axios
              .post("/api/stripe/createUser", {
                customer_id: user.stripe_id,
              })
              .then((response) => {
                console.log(
                  "Subscription created:",
                  response.data.subscription
                );
              })
              .catch((error) => {
                console.error("Error creating subscription:", error);
              });
          }
          // Send the paymentMethod.id to your server for payment processing
          const response = await axios.post(
            "/api/payment-intent/create",
            {
              id,
            }
          );

          const clientSecret = response.data.clientSecret; // Handle success message
          console.log("Client Secret: " + clientSecret);
          const { paymentIntent, error } = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: {
                card: cardElement,
              },
            }
          );

          if (error) {
            console.error(error); // Handle payment error
          } else if (paymentIntent.status === "succeeded") {
            console.log("Payment succeeded!"); // Handle successful payment
          }

          const paymentIntent_ = clientSecret.split("_secret")[0];

          axios
            .post("/api/payment-intent/confirm", {
              paymentIntentID: paymentIntent_,
              user: user,
            })
            .then((response) => {
              console.log(response.data); // Handle success message
            })
            .catch((error) => {
              console.error("Error:", error);
            });
            */
          } catch (error) {
            console.error("Error:", error);
            setIsProcessing(false); // Stop processing and handle errors
          }
        }
      } else {
        const headers = {
          "X-User-Email": user.email
        }
        axios
          .post("/api/stripe/createUser", {coupon_code: couponCode.current.value}, {headers: headers })
          .then((response) => {
            const updatedUser = {
              ...user,
              stripe_id: response.data.stripe_id,
            };
            setIsProcessing(false); // Stop processing
            setUser(updatedUser);
            history.push("/successPage");
          })
          .catch((error) => {
            setIsProcessing(false); // Stop processing
            setPaymentError(true);
            console.log(error);
            console.log("fail");
          });
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.paymentContainer}>
        <div className={styles.leftBanner}>
          <section className={styles.orderDetails}>
            <h1>Order Summary</h1>
            <p>Billing Plan:</p>
            {subscriptionType.current == "subscription" ? (
              <div>
                <h2> Subscription</h2>
                <h3> Billed Monthly</h3>
                <h3> Billed today: 15$</h3>
              </div>
            ) : (
              <div className={styles.txt}>
                <h2> Free trial</h2>
                <h3> Billed today: 0$</h3>
                <h5> After 7 days, billed 15$ per month</h5>
              </div>
            )}
          </section>
          <section className={styles.paymentSection}>
            <form className={styles.couponForm} onSubmit={handleCoupon}>
              <label>Coupon</label>
              <input
                name='coupon_code'
                ref={couponCode}
                readOnly={usingCoupon}
                style={{ backgroundColor: usingCoupon ? "#e0e0e0" : "white" }}
              ></input>
              {!usingCoupon && (
                <button
                  type='submit'
                  disabled={usingCoupon}
                  className={styles.paymentButton + " " + styles.couponButton}
                >
                  Apply
                </button>
              )}
            </form>
            <div className={styles.cardError + " " + styles.couponError}>
              {couponError && <p>Invalid Coupon</p>}
              {usingCoupon && !couponError && (
                <span style={{ color: "#4CAF50", marginLeft: "10px" }}>
                  ✅ Coupon Applied!
                </span>
              )}
            </div>
            <form className={styles.paymentForm} onSubmit={handlePayment}>
              {couponResponse !== 'free' &&
              <fieldset>
                <div>
                  <label htmlFor='card-element'>Card information</label>
                  <CardElement options={CARD_OPTIONS} id='card-element' />
                </div>
              </fieldset>
              }
              {!cardError.current && paymentError && (
                <span
                  style={{
                    color: "#FF0A0A",
                    fontWeight: 400,
                    marginTop: "10px",
                  }}
                >
                  Payment method failed
                </span>
              )}
              {cardError.current && (
                <div className={styles.cardError}>
                  <p>Something with your payment method went wrong</p>
                </div>
              )}
              <button
                disabled={isProcessing}
                type='submit'
                className={styles.paymentButton}
                onClick={(event) => {
                  setIsProcessing(true);
                  handlePayment(event);
                }}
              >
                <span>{isProcessing ? "Processing... " : "Pay now"}</span>
              </button>
            </form>
          </section>
        </div>
        <section className={styles.rightBanner}>
          <ul>
            <li className={styles.listItem}>
              <img
                src={checkMark}
                className={styles.checkmarkImage}
                alt='Check Mark'
              />
              <p>View financial statements from a centralized location</p>
            </li>
            <li className={styles.listItem}>
              <img
                src={checkMark}
                className={styles.checkmarkImage}
                alt='Check Mark'
              />
              <p>Make fleet templates</p>
            </li>
            <li className={styles.listItem}>
              <img
                src={checkMark}
                className={styles.checkmarkImage}
                alt='Check Mark'
              />
              <p>Make CRON templates</p>
            </li>
            <li className={styles.listItem}>
              <img
                src={checkMark}
                className={styles.checkmarkImage}
                alt='Check Mark'
              />
              <p>Make network templates</p>
            </li>
            <li className={styles.listItem}>
              <img
                src={checkMark}
                className={styles.checkmarkImage}
                alt='Check Mark'
              />
              <p>Provision resources from templates</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PaymentForm;
