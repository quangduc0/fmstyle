import React from 'react'
import {PayPalButtons, PayPalScriptProvider} from "@paypal/react-paypal-js"

const BankingButton = ({amount, onSuccess, onError}) => {
  return (
    <PayPalScriptProvider options={{"client-id": 
        "ATcdk87yO8pDTuzsiLc_LhgDBGC09LcoMMY4Hudgf6R5wOFiyd3m5LrCOAhW9nJTDfCRAVV1hh5EesXx"}}>
        <PayPalButtons style={{layout: "vertical"}}
        createOrder={(data, actions) => {
            return actions.order.create({
                purchase_units: [{amount: {value: amount}}]
            })
        }}
        onApprove={(data, actions) => {
            return actions.order.capture().then(onSuccess)
        }}
        onError={onError} />
    </PayPalScriptProvider>
  )
}

export default BankingButton