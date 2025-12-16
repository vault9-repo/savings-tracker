// src/context/SavingsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const SavingsContext = createContext();

export function SavingsProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);

  const fetchRecords = async () => {
    const { data } = await api.get("/savings");
    setRecords(data);
  };

  const fetchMembers = async () => {
    const { data } = await api.get("/users");
    setMembers(data);
  };

  useEffect(() => {
    fetchRecords();
    fetchMembers();
  }, []);

  return (
    <SavingsContext.Provider value={{ records, members, fetchRecords, fetchMembers }}>
      {children}
    </SavingsContext.Provider>
  );
}

export const useSavings = () => useContext(SavingsContext);
