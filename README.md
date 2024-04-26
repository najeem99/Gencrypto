# Gencrypto
nodeJs program in typescript, that will deploy an ERC20 smart contract on the Base blockchain


# ERC20 Smart Contract Deployment Program

This Node.js program written in TypeScript deploys an ERC20 smart contract on the Base blockchain, utilizing any of the Base testnets to avoid spending real funds. It includes functionality to obtain test Ether (ETH) from a faucet to cover gas costs during contract deployment.

## Features

- **ERC20 Contract Deployment**: Deploy an ERC20 smart contract on the Base blockchain testnet.
- **Testnet Compatibility**: Utilize Base testnets to prevent expenditure of real funds.
- **ETH Balance Management**: Fetch and display the ETH balance of the user before and after contract deployment.
- **Transaction Scanner Link**: Output the link to the transaction scanner after contract deployment for verification.

## Requirements

- Node.js
- TypeScript
- Access to Base blockchain testnets
- Access to a faucet for obtaining test ETH

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install dependencies using npm:

npm install


## Usage

1. Set up your environment variables by creating a `.env` file in the root directory with the following content:

INFURA_API_KEY=<Infura-private-key>

Replace `<Infura-private-key>` with your respective values.

2. Add your wallet private keys to  `accounts.json` :

"pvtKey": "YOUR-ACCOUNT-PRIVATE-KEY"

Replace `YOUR-ACCOUNT-PRIVATE-KEY` with your respective values.

3. Run the program using the following commands:

npx tsc
touch src/solc-lib.ts 
node build/index.js    


## Program Structure

- **`index.ts`**: Main TypeScript file containing the program logic.
- **`contracts/MyToken.sol`**: Solidity source code for the ERC20 smart contract.
- **`.env`**: Environment variable configuration file.
- **`package.json`**: Dependency and script configuration file.

## License

This program is licensed under the [MIT License](LICENSE).


