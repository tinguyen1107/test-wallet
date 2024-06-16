"use client";

import styles from "./page.module.css";
import { GalachainConnectClient, RepClient } from "../gala";
import { useState } from "react";

const client = new GalachainConnectClient();
const repClient = new RepClient(
  client,
  "https://proxy.dev-galachain-ops-api.rep.run/api/rep/rep-contract",
);

export default function Home() {
  const [addr, setAddr] = useState<string>("");
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        {addr}
        <button
          onClick={() => {
            console.log("hello");
            client.connectToMetaMask().then((addr) => setAddr(addr));
          }}
        >
          Click Me
        </button>
        <button
          onClick={() => {
            console.log("getaccounts");
            repClient
              .getAccounts()
              .then((addr) => console.log("Got accounts", addr))
              .catch((e) => console.log("Got Error", e));
          }}
        >
          Get accounts
        </button>
        <button
          onClick={() => {
            console.log("get pub");
            client
              .ensureUser()
              .then((addr) => console.log("Got accounts", addr))
              .catch((e) => console.log("Got Error", e));
          }}
        >
          Get Pub
        </button>
      </div>
    </main>
  );
}
