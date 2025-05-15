import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const BankingButton = ({ amount, onSuccess, onError }) => {
  const [{ isPending, isResolved }] = usePayPalScriptReducer();

  if (!isResolved) return <p>Đang tải PayPal...</p>;

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: parseFloat(amount).toFixed(2) } }]
        });
      }}
      onApprove={(data, actions) => {
        return actions.order.capture().then(onSuccess);
      }}
      onError={onError}
    />
  );
};


export default BankingButton