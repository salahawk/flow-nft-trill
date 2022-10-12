//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';

import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

import { getTotalSupply } from "./cadence/scripts/getTotalSupply_script";
import { getIDs } from "./cadence/scripts/getID_script";
import { getMetadata } from "./cadence/scripts/getMetadata_script";
import { mintNFT } from "./cadence/transactions/mintNFT_tx";

fcl.config({
  "flow.network": "testnet",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.title": "SmolRunners",
  "app.detail.icon": "https://pbs.twimg.com/profile_images/1483011452676067331/xJ92Ela6_400x400.jpg",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

function App() {

  const [user, setUser] = useState();
  const [network, setNetwork] = useState("");
  const [mintEnabled, setMintEnabled] = useState(false);
  const [images, setImages] = useState([]);

  const logIn = () => {
    fcl.authenticate();
  }
  const logOut = () => {
    setImages([]);
    fcl.unauthenticate();
  }

  const mint = async () => {
    let _totalSupply;
    
    setMintEnabled(false);

    try {
      _totalSupply = await fcl.query({
        cadence: getTotalSupply
      });
      if (_totalSupply > 5) {
        alert("Already sold out!!!")  ;
        return;
      }
      console.log(`Current total supply : ${_totalSupply}`);
    } catch (error) {
      console.log(error);
    }

    const _id = Number(_totalSupply) + 1;
    console.log(`Next NFT ID: ${_id}`);

    try {
      const txnId = await fcl.mutate({
        cadence: mintNFT,
        args: (arg, t) => [
          arg(user.addr, types.Address),  // address to which the NFT should be minted
          arg("SmolRunners #" + _id.toString(), types.String),  // name
          arg("SmolRunners NFT collection on Flow", types.String),  // description
          arg("https://ipfs.io/ipfs/QmbDPWN3bMEBNwJ4g1bpi9dtuMSZFjLdtcRFNL78Wfth2R/" + _id.toString() + ".avif", types.String), // thumbnail
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

    setMintEnabled(true);
  }

  const fetchNFTs = async () => {
    // Empty the images array
    setImages([]);
    let IDs = [];

    // Fetch the IDs with our script (no fees or signers necessary)
    try {
      IDs = await fcl.query({
        cadence: getIDs,
        args: (arg, t) => [
          arg(user.addr, types.Address),
        ],
      });
      console.log(IDs);
    } catch (error) {
      console.log("No NFTs Owned");
    }

    let _imageSrc = [];
    try {
      for (let i = 0; i < IDs.length; i++) {
        const _id = IDs[i];
        const result = await fcl.query({
          cadence: getMetadata,
          args: (arg, t) => [
            arg(user.addr, types.Address),
            arg(_id.toString(), types.UInt256),
          ],
        });

        _imageSrc.push(result["thumbnail"]);
      }
    } catch (error) {
      console.log(error);
    }

    if (images.length < _imageSrc.length) {
      setImages((Array.from({length: _imageSrc.length}, (_, i) => i).map((number, index) => (
        <img
          style={{margin: "10px", height: "150px"}}
          src={_imageSrc[index]}
          key={index}
          alt={"NFT #" + number}
        />
      ))))
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
    if (user && user.addr) {
      fetchNFTs();
    }
  }, [user, mintEnabled]);

  useEffect(() => {
    if (network !== 'testnet') {
      alert("This app works on testnet - please switch network to testnet!!!");
      setMintEnabled(false);
    } else {
      setMintEnabled(true);
    }
  }, [network]);

  const RenderGif = () => {
    const gifUrl = user?.addr
        ? "https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy-downsized.gif"
        : "https://i.giphy.com/media/Y2ZUWLrTy63j9T6qrK/giphy.webp";
    return <img className="gif-image" src={gifUrl} height="300px" alt="Funny gif"/>;
  };
  
  const RenderLogin = () => (
    <div>
      <button className="cta-button button-glow" onClick={() => logIn()}>
        Log In
      </button>
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
  const RenderMint = () => (
    <div>
      <div className="button-container">
        <button className="cta-button button-glow" onClick={() => mint()} disabled={!mintEnabled}>
          Mint
        </button>
      </div>
      {images.length > 0 
      ? <>
          <h2>Your NFTs</h2>
          <div className="image-container">
            {images}
          </div>
        </>
      : ""
      }
    </div>
  )
  
  return (
    <div className="App">
      <RenderLogout />
      <div className="container">
        <div className="header-container">
          <div className="logo-container">
            <img src="./logo.png" className="flow-logo" alt="flow logo"/>
            <p className="header">SmolRunners NFTs on Flow ✨</p>
          </div>
          <RenderGif />
          <p className="sub-text">The easiest NFT mint experience ever!</p>
        </div>

        {(user && user.addr) ? <RenderMint /> : <RenderLogin />}

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