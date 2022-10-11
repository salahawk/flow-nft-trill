//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';

import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

import { getTotalSupply } from "./cadence/scripts/getTotalSupply_script";
import { mintNFT } from "./cadence/transactions/mintNFT_tx";

fcl.config({
  "flow.network": "testnet",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.title": "TrillNode",
  "app.detail.icon": "https://cdn.shopify.com/s/files/1/0500/2936/3362/files/TRILLESTLOGO1_3_d05e1621-75cf-4f93-9dd1-1f1019a42b77_180x.png",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

function App() {

  const [user, setUser] = useState();
  const [network, setNetwork] = useState("");
  const [mintEnabled, setMintEnabled] = useState(false);

  const logIn = () => {
    fcl.authenticate();
  }
  const logOut = () => {
    fcl.unauthenticate();
  }

  const mint = async () => {
    let _totalSupply;
    
    try {
      _totalSupply = await fcl.query({
        cadence: getTotalSupply
      });
      console.log(`Current total supply : ${_totalSupply}`);
    } catch (error) {
      console.log(error);
    }

    // const _id = _totalSupply + 1;
    // console.log(`Next NFT ID: ${_id}`);

    try {
      const txnId = await fcl.mutate({
        cadence: mintNFT,
        args: (arg, t) => [
          arg(user.addr, types.Address),  // address to which the NFT should be minted
          arg("TrillNode"/* + _id.toString()*/, types.String),  // name
          arg("Super rare Epic node on Flow", types.String),  // description
          arg("https://gateway.pinata.cloud/ipfs/QmVcJcMEndDFmD3dJASFgS1Mqd8LkBY4cbFrHuVgoD55VF/Large.mp4", types.String), // thumbnail
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 99
      });
      console.log(`Minting NFT now with transaction ID`, txnId);
      const txn = await fcl.tx(txnId).onceSealed();
      console.log(`Testnet explorer link: https://testnet.flowscan.org/transaction/${txnId}`);
      console.log(txn);
      alert("NFT minted successfully!");
    } catch (error) {
      console.log(error);
    }
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
  useEffect(() => {
    if (network !== 'testnet') {
      alert("This app works on testnet - please switch network to testnet!!!");
      setMintEnabled(false);
    } else {
      setMintEnabled(true);
    }
  }, [network]);
  
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
  const RenderMintButton = () => (
    <div>
      <button className="cta-button button-glow" onClick={() => mint()} disabled={!mintEnabled}>
        Mint
      </button>
    </div>
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

        {(user && user.addr) ? <RenderMintButton /> : <RenderLogin />}

        {/* <div className="footer-container">
          <div className="footer-text">
            &copy;
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default App;