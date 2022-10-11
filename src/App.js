//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';
import twitterLogo from "./assets/twitter-logo.svg";

import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

fcl.config({
  "flow.network": "testnet",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.title": "TrillNode",
  "app.detail.icon": "https://cdn.shopify.com/s/files/1/0500/2936/3362/files/TRILLESTLOGO1_3_d05e1621-75cf-4f93-9dd1-1f1019a42b77_180x.png",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

const TWITTER_HANDLE = "salahawk";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {

  const [user, setUser] = useState();
  const [network, setNetwork] = useState("");

  const logIn = () => {
    fcl.authenticate();
  }
  const logOut = () => {
    fcl.unauthenticate();
  }

  useEffect(() => {
    // This listens to changes in the user objects
    // and updates the connected user
    fcl.currentUser().subscribe(setUser);

    // This is an event listener for all messages that are sent to the window
    window.addEventListener("message", d => {
      // This only works for Lilico testnet to mainnet changes
      if (d.data.type === 'LILICO:NETWORK') {
        setNetwork(d.data.network);
      }
    })
  }, []);
  
  const RenderLogin = () => (
    <div>
      <button className="cta-button button-glow" onClick={() => logIn()}>Log In</button>
    </div>
  )
  const RenderLogout = () => (
    user && user.addr && (
      <div className="logout-container">
        <button className="cta-button logout-btn" onClick={() => logOut()}>
          ❎ {"  "}
          {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length-4)}
        </button>
      </div>
    )
  )
  
  return (
    <div className="App">
      <RenderLogout />
      <div className="container">
        <div className="header-container">
          <div className="logo-container">
            <img src="./logo.png" className="flow-logo" alt="flow logo"/>
            <p className="header">Trillest NFTs on Flow ✨</p>
          </div>

          <p className="sub-text">The easiest NFT mint experience ever!</p>
        </div>

        {(user && user.addr) ? "Wallet connected!" : <RenderLogin />}

        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;