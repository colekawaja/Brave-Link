import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON, removeKeys } from "../lib/storage";

/* App-wide state: account, subscription, and scan history — persisted so
 * progress survives restarts. */

const KEYS = {
  user: "clarity.user",
  sub: "clarity.subscribed",
  history: "clarity.history",
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

let _id = 0;
const nextId = () => `${Date.now()}_${_id++}`;

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const [u, s, h] = await Promise.all([
        loadJSON(KEYS.user, null),
        loadJSON(KEYS.sub, false),
        loadJSON(KEYS.history, []),
      ]);
      setUser(u);
      setSubscribed(Boolean(s));
      setHistory(Array.isArray(h) ? h : []);
      setReady(true);
    })();
  }, []);

  const signIn = useCallback((u) => {
    setUser(u);
    saveJSON(KEYS.user, u);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setSubscribed(false);
    setHistory([]);
    removeKeys([KEYS.user, KEYS.sub, KEYS.history]);
  }, []);

  const subscribe = useCallback(() => {
    setSubscribed(true);
    saveJSON(KEYS.sub, true);
  }, []);

  // Save a completed scan to history; returns the stored record.
  const addScan = useCallback((result, meta = {}) => {
    const record = { id: nextId(), date: new Date().toISOString(), demo: !!meta.demo, ...result };
    setHistory((prev) => {
      const next = [...prev, record];
      saveJSON(KEYS.history, next);
      return next;
    });
    return record;
  }, []);

  const value = useMemo(() => {
    const latest = history.length ? history[history.length - 1] : null;
    const previous = history.length > 1 ? history[history.length - 2] : null;
    return { ready, user, subscribed, history, latest, previous, signIn, signOut, subscribe, addScan };
  }, [ready, user, subscribed, history, signIn, signOut, subscribe, addScan]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
