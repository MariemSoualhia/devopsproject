import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { data } from "autoprefixer";
import { API_BASE_URL } from "../config";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!user) {
      axios
        .get(API_BASE_URL + "/profile")
        .then(({ data }) => {
          setUser(data);
          setReady(true);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
          setReady(true); // Set ready to true even on error to prevent endless loading
        });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
