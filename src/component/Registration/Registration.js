// Node modules
import React, { useEffect, useState } from "react";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Election from "../../contracts/Election.json";

export default function Registration() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [election, setElection] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isElStarted, setIsElStarted] = useState(false);
  const [isElEnded, setIsElEnded] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [voters, setVoters] = useState([]);
  const [currentVoter, setCurrentVoter] = useState({
    address: "",
    name: "",
    phone: "",
    hasVoted: false,
    isVerified: false,
    isRegistered: false,
  });

  // Load blockchain data
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = Election.networks[networkId];

        if (!deployedNetwork) {
          alert("Smart contract not deployed on this network.");
          return;
        }

        const instance = new web3Instance.eth.Contract(
          Election.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setElection(instance);
        setAccount(accounts[0]);

        // Admin check
        const admin = await instance.methods.getAdmin().call();
        setIsAdmin(accounts[0] === admin);

        // Start/End flags
        const start = await instance.methods.getStart().call();
        setIsElStarted(start);
        const end = await instance.methods.getEnd().call();
        setIsElEnded(end);

        // Load all voters
        const voterCount = await instance.methods.getTotalVoter().call();
        const voterList = [];
        for (let i = 0; i < voterCount; i++) {
          const voterAddress = await instance.methods.voters(i).call();
          const voter = await instance.methods.voterDetails(voterAddress).call();
          voterList.push({
            address: voter.voterAddress,
            name: voter.name,
            phone: voter.phone,
            hasVoted: voter.hasVoted,
            isVerified: voter.isVerified,
            isRegistered: voter.isRegistered,
          });
        }
        setVoters(voterList);

        // Current voter
        const voter = await instance.methods.voterDetails(accounts[0]).call();
        setCurrentVoter({
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load Web3, accounts, or contract. Check console.");
      }
    };

    loadBlockchainData();
  }, []);

  const registerAsVoter = async (e) => {
    e.preventDefault();
    if (!election) return;

    try {
      await election.methods
        .registerAsVoter(voterName, voterPhone)
        .send({ from: account, gas: 1000000 });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error while registering. Check console for details.");
    }
  };

  if (!web3) {
    return (
      <>
        {isAdmin ? <NavbarAdmin /> : <Navbar />}
        <center>Loading Web3, accounts, and contract...</center>
      </>
    );
  }

  return (
    <>
      {isAdmin ? <NavbarAdmin /> : <Navbar />}

      {!isElStarted && !isElEnded ? (
        <NotInit />
      ) : (
        <>
          <div className="container-item info">
            <p>Total registered voters: {voters.length}</p>
          </div>

          <div className="container-main">
            <h3>Registration</h3>
            <small>Register to vote.</small>
            <form onSubmit={registerAsVoter}>
              <div className="div-li">
                <label className="label-r">
                  Account Address
                  <input
                    className="input-r"
                    type="text"
                    value={account}
                    disabled
                    style={{ width: "400px" }}
                  />
                </label>
              </div>
              <div className="div-li">
                <label className="label-r">
                  Name
                  <input
                    className="input-r"
                    type="text"
                    placeholder="eg. Ava"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                  />
                </label>
              </div>
              <div className="div-li">
                <label className="label-r">
                  Phone number <span style={{ color: "tomato" }}>*</span>
                  <input
                    className="input-r"
                    type="number"
                    placeholder="eg. 9841234567"
                    value={voterPhone}
                    onChange={(e) => setVoterPhone(e.target.value)}
                  />
                </label>
              </div>

              <p className="note">
                <span style={{ color: "tomato" }}>Note:</span>
                <br /> Make sure your account address and Phone number are
                correct. <br /> Admin might not approve if the phone number does
                not match their records.
              </p>

              <button
                className="btn-add"
                disabled={
                  voterPhone.length !== 10 || currentVoter.isVerified
                }
              >
                {currentVoter.isRegistered ? "Update" : "Register"}
              </button>
            </form>
          </div>

          <div
            className="container-main"
            style={{
              borderTop: currentVoter.isRegistered ? null : "1px solid",
            }}
          >
            {loadCurrentVoter(currentVoter, currentVoter.isRegistered)}
          </div>

          {isAdmin && (
            <div className="container-main" style={{ borderTop: "1px solid" }}>
              <small>Total Voters: {voters.length}</small>
              {loadAllVoters(voters)}
            </div>
          )}
        </>
      )}
    </>
  );
}

export function loadCurrentVoter(voter, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tbody>
            <tr>
              <th>Account Address</th>
              <td>{voter.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{voter.name}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>{voter.phone}</td>
            </tr>
            <tr>
              <th>Voted</th>
              <td>{voter.hasVoted ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Verification</th>
              <td>{voter.isVerified ? "True" : "False"}</td>
            </tr>
            <tr>
              <th>Registered</th>
              <td>{voter.isRegistered ? "True" : "False"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function loadAllVoters(voters) {
  return (
    <>
      <center>List of voters</center>
      {voters.map((voter, idx) => (
        <div className="container-list success" key={idx}>
          <table>
            <tbody>
              <tr>
                <th>Account address</th>
                <td>{voter.address}</td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{voter.name}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{voter.phone}</td>
              </tr>
              <tr>
                <th>Voted</th>
                <td>{voter.hasVoted ? "True" : "False"}</td>
              </tr>
              <tr>
                <th>Verified</th>
                <td>{voter.isVerified ? "True" : "False"}</td>
              </tr>
              <tr>
                <th>Registered</th>
                <td>{voter.isRegistered ? "True" : "False"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
