export const JURYCHAIN_ABI = [
  {
    "inputs": [],
    "name": "AlreadyVoted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CaseClosedAlready",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CaseNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotJuror",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VotingActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VotingClosed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "CaseClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "judge",
        "type": "address"
      }
    ],
    "name": "CaseCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "ResultAccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "juror",
        "type": "address"
      }
    ],
    "name": "VoteSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedGuiltyFlag",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isGuilty",
        "type": "bool"
      }
    ],
    "name": "castVoteDev",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "closeCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "jurors",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "votingPeriodSeconds",
        "type": "uint256"
      }
    ],
    "name": "createCase",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "caseIds",
        "type": "uint256[]"
      },
      {
        "internalType": "address",
        "name": "viewer",
        "type": "address"
      }
    ],
    "name": "getBatchCaseDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "caseId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "judge",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isClosed",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "votesCast",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "jurorCount",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "jurors",
            "type": "address[]"
          },
          {
            "internalType": "bool",
            "name": "hasVoted",
            "type": "bool"
          }
        ],
        "internalType": "struct JuryChain.CaseFullDetails[]",
        "name": "allDetails",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "getCase",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "caseId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "judge",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isClosed",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "votesCast",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "jurorCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct JuryChain.CaseSummary",
        "name": "summary",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "viewer",
        "type": "address"
      }
    ],
    "name": "getCaseFullDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "caseId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "judge",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isClosed",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "votesCast",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "jurorCount",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "jurors",
            "type": "address[]"
          },
          {
            "internalType": "bool",
            "name": "hasVoted",
            "type": "bool"
          }
        ],
        "internalType": "struct JuryChain.CaseFullDetails",
        "name": "details",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCaseIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "getCaseJurors",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "getEncryptedTallies",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "guilty",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "notGuilty",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      }
    ],
    "name": "getPlainTallies",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "guilty",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "notGuilty",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantResultAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "caseId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;