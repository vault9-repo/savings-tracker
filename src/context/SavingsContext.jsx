import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // use the updated api.js

const SavingsContext = createContext();

export const SavingsProvider = ({ children }) => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);

  const fetchRecords = async () => {
    try {
      const res = await api.get("/savings");
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get("/users");
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
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
};

export const useSavings = () => useContext(SavingsContext);
