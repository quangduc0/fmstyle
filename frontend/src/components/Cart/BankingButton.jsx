import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { formatter } from "../../utils/fomater";

const BankingButton = ({ amount, onSuccess, onError }) => {
  const [{ isPending, isResolved }] = usePayPalScriptReducer();

  if (!isResolved) return <p>Đang tải PayPal...</p>;

  const usdAmount = (amount / 26000).toFixed(2);

  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">
        Thanh toán: {formatter(amount)} {" "} ({usdAmount} USD)
      </p>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{ 
              amount: { 
                value: usdAmount,
                currency_code: "USD"
              }
            }]
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(onSuccess);
        }}
        onError={onError}
      />
    </div>
  );
};

export default BankingButton;