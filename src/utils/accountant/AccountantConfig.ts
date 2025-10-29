import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";


export const fetchRecentInvoices = async () => {

    const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices?limit=3&sort=-issueDate`,
        { withCredentials: true }
    );
    return (data);

};

export const fetchInvoices = async () => {

    const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/invoices`,
        { withCredentials: true }
    );
    return (data);

};
export const fetchPayments = async () => {

    const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/payments/accountant`,
        { withCredentials: true }
    );
    return (data);

};

const fetchCashFlowData = async () => {
    const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/budget/cashflow`,
        { withCredentials: true }
    );
    return res.data; // array of { month, inflow, outflow, net }
};

export const useCashFlow = () => {
    return useQuery({
        queryKey: ["cashFlow"],
        queryFn: fetchCashFlowData,
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
};

