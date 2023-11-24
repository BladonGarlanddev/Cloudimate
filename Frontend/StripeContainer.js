import React from 'react'
import {Elements} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import PaymentForm from "./PaymentForm"

const PUBLIC_KEY = process.env.REACT_APP_STRIPE_PK_TEST;
console.log("Key: " +PUBLIC_KEY);
const stripePromise = loadStripe(PUBLIC_KEY);

const StripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm stripePromise={stripePromise}/>
    </Elements>
  );
};

export default StripeContainer;