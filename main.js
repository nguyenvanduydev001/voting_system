let WALLET_CONNECTED = "";
let contractAddress = "0x417bbAA40B86C37500FF748b102EfE1F8e45F6d2"; // đổi địa chỉ khi chạy npx hardhat run --network zkEVM scripts/deploy.js
let contractAbi = [
  {
    inputs: [
      {
        internalType: "string[]",
        name: "_candidateNames",
        type: "string[]",
      },
      {
        internalType: "uint256",
        name: "_durationInMinutes",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVotesOfCandiates",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct Voting.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRemainingTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVotingStatus",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidateIndex",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voters",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingEnd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingStart",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const connectMetamask = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  WALLET_CONNECTED = await signer.getAddress();
  document.getElementById("metamasknotification").innerHTML =
    "Metamask is connected : " + WALLET_CONNECTED;

  await announceWinner();
};

const addVote = async () => {
  if (WALLET_CONNECTED) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const voteInput = document.getElementById("vote");
    const feedback = document.getElementById("cand");
    feedback.innerHTML = "Checking voting status...";

    try {
      // Kiểm tra trạng thái bỏ phiếu và thời gian còn lại
      const currentStatus = await contractInstance.getVotingStatus();
      const remainingTime = await contractInstance.getRemainingTime();

      if (!currentStatus || remainingTime <= 0) {
        feedback.innerHTML = "Voting has ended. You cannot vote anymore.";
        return;
      }

      feedback.innerHTML =
        "Please wait, adding a vote to the smart contract...";
      const tx = await contractInstance.vote(voteInput.value);
      await tx.wait();
      feedback.innerHTML = "Vote successfully added!";
    } catch (error) {
      feedback.innerHTML = "An error occurred while adding the vote.";
    }
  } else {
    document.getElementById("cand").innerHTML =
      "Please connect Metamask first.";
  }
};

const voteStatus = async () => {
  if (WALLET_CONNECTED) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const status = document.getElementById("status");
    const remainingTime = document.getElementById("time");

    try {
      const currentStatus = await contractInstance.getVotingStatus();
      const time = await contractInstance.getRemainingTime();

      // Chuyển đổi thời gian từ giây sang hh:mm:ss
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = time % 60;

      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      status.innerHTML = currentStatus
        ? "Voting is currently open."
        : "Voting is finished.";
      remainingTime.innerHTML = currentStatus
        ? `Remaining time: ${formattedTime}`
        : "No time remaining.";
    } catch (error) {
      status.innerHTML = "An error occurred while fetching the voting status.";
    }
  } else {
    document.getElementById("status").innerHTML =
      "Please connect Metamask first.";
  }
};

const getAllCandidates = async () => {
  if (WALLET_CONNECTED) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const feedback = document.getElementById("p3");
    feedback.innerHTML = "Fetching all candidates...";

    try {
      const candidates = await contractInstance.getAllVotesOfCandiates();
      console.log("Fetched candidates:", candidates);
      const table = document.getElementById("myTable");
      table.innerHTML = ""; // Clear previous rows

      candidates.forEach((candidate, index) => {
        const row = table.insertRow();
        row.insertCell().innerHTML = index;
        row.insertCell().innerHTML = candidate.name;
        row.insertCell().innerHTML = candidate.voteCount;
      });

      feedback.innerHTML = "Candidate data updated.";
    } catch (error) {
      feedback.innerHTML = "An error occurred while fetching candidates.";
    }
  } else {
    document.getElementById("p3").innerHTML = "Please connect Metamask first.";
  }
};

const announceWinner = async () => {
  if (WALLET_CONNECTED) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const winnerMessage = document.getElementById("winner");
    try {
      const currentStatus = await contractInstance.getVotingStatus();
      const remainingTime = await contractInstance.getRemainingTime();
      console.log("Remaining Time:", remainingTime.toNumber());

      if (remainingTime.toNumber() > 0) {
        winnerMessage.innerHTML =
          "Voting is still ongoing. Please wait until it ends.";
        return;
      }

      const candidates = await contractInstance.getAllVotesOfCandiates();
      if (candidates.length === 0) {
        winnerMessage.innerHTML = "No candidates available.";
        return;
      }

      let maxVotes = 0;
      let winner = "No winner";

      candidates.forEach((candidate) => {
        console.log(
          `Candidate: ${
            candidate.name
          }, Votes: ${candidate.voteCount.toString()}`
        );
        if (candidate.voteCount.toNumber() > maxVotes) {
          maxVotes = candidate.voteCount.toNumber();
          winner = candidate.name;
        }
      });

      winnerMessage.innerHTML = `The winner is ${winner} with ${maxVotes} votes. `;

      console.log("Winner:", winner);
    } catch (error) {
      console.error("Error in announceWinner:", error);
      winnerMessage.innerHTML =
        "An error occurred while determining the winner.";
    }
  } else {
    document.getElementById("winner").innerHTML =
      "Please connect Metamask first.";
  }
};
