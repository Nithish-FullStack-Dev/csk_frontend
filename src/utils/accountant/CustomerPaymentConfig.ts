import axios from "axios";

export const fetchCustomerPayments = async (customerId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer-payment/get/${customerId}`,
    { withCredentials: true },
  );

  return data.data;
};

export const addCustomerPayment = async ({
  customerId,
  payload,
}: {
  customerId: string;
  payload: any;
}) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/customer-payment/add/${customerId}`,
    payload,
    { withCredentials: true },
  );

  return data;
};

export const deleteCustomerPayment = async (paymentId: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/customer-payment/delete/${paymentId}`,
    { withCredentials: true },
  );

  return data;
};
