import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const SavingsContext = createContext();

export const SavingsProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [records, setRecords] = useState([]);

  const fetchMembers = async () => {
    const res = await api.get("/users");
    setMembers(res.data);
  };

  const fetchRecords = async () => {
    const res = await api.get("/savings");
    setRecords(res.data);
  };

  useEffect(() => {
    fetchMembers();
    fetchRecords();
  }, []);

  return (
    <SavingsContext.Provider
      value={{ members, records, fetchMembers, fetchRecords }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = () => useContext(SavingsContext);
