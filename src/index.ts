import { resolve } from 'path';
import { compileSols, writeOutput } from './solc-lib'
const { Web3, ETH_DATA_FORMAT, DEFAULT_RETURN_FORMAT } = require('web3');
import type { Web3BaseProvider, AbiStruct, Address } from 'web3-types'

let fs = require('fs')
const path = require('path');
require("dotenv").config();

/**
 * Helper class to calculate adjusted gas value that is higher than estimate
 */
class GasHelper {
    static gasMulptiplier = 1.2 // Increase by 20%

    static gasPay(gasLimit: string) {
        return Math.ceil(Number(gasLimit) * GasHelper.gasMulptiplier).toString()
    }
}

/**
 * Init WebSocket provider
 */
const initProvider = (): Web3BaseProvider => {
    try {
        const network = process.env.ETHEREUM_NETWORK;
        return new Web3.providers.HttpProvider(`https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`)
    } catch (error) {
        throw 'Cannot read provider'
    }
}

/**
 * Get an account given its name
 */
const getAccount = (web3: typeof Web3, pvtKey: string) => {
    try {
        const accountPvtKey = pvtKey

        // Build an account object given private key
        web3.eth.accounts.wallet.add(accountPvtKey)
    } catch (error) {
        console.log(error)
        throw 'Cannot read account'
    }
}

/**
 * Get ABI of given contract
 */
const getABI = (contractName: string, buildPath: string): AbiStruct => {
    try {
        const filePath = path.resolve(buildPath, contractName + '.json')
        const contractData = fs.readFileSync(filePath, 'utf8')
        const contractJson = JSON.parse(contractData)
        return contractJson[contractName][contractName].abi
    } catch (error) {
        throw 'Cannot read account'
    }
}
    //ETH balance of the user  
const getBalanceFromAddress =   async (web3: typeof Web3,address: string,message:string): Promise<void>  => {
     try {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
        console.log(message, address, 'is:', balanceEther, 'ETH');
        } catch (error) {
        console.error(error)
    }

}

const contractDeployment =   async (
     web3: typeof Web3,
     contractName:string ,
     tokenName:string ,
     tokenSymbol:string ,
     tokenTotalSupply:number ,
     pvtKey: string
): Promise<void>  => {
    const buildPath = path.resolve(__dirname, '');
    try {
        getAccount(web3, pvtKey)
    } catch (error) {
        console.error(error)
        throw 'Cannot access accounts'
    }
    console.log('Accessing account: ' + pvtKey)

    getBalanceFromAddress(web3,web3.eth.accounts.wallet[0].address,"Current ETH balance of ")

    let from = web3.eth.accounts.wallet[0].address


    // Compile contract and save it into a file for future use
    let compiledContract: any
    try {
        compiledContract = compileSols([contractName])
        writeOutput(compiledContract, buildPath)
    } catch (error) {
        console.error(error)
        throw 'Error while compiling contract'
    }
    console.log('Contract compiled')

    // Deploy contract
    const contract = new web3.eth.Contract(compiledContract.contracts[contractName][contractName].abi)
    const data = compiledContract.contracts[contractName][contractName].evm.bytecode.object
    const args = [tokenName, tokenSymbol, tokenTotalSupply]
    let contractAddress: Address
    
    // Deploy contract with given constructor arguments
    try {
        const contractSend = contract.deploy({
            data,
            arguments: args
        });

        // Get current average gas price
        const gasPrice = await web3.eth.getGasPrice(ETH_DATA_FORMAT)
        const gasLimit = await contractSend.estimateGas(
            { from },
            DEFAULT_RETURN_FORMAT, // the returned data will be formatted as a bigint
        );
        const tx = await contractSend.send({
            from,
            gasPrice,
            gas: GasHelper.gasPay(gasLimit)
        })
        console.log('\n Contract contract deployed at address: ' + tx.options.address)
        contractAddress = tx.options.address
    } catch (error) {
        console.error(error)
        throw 'Error while deploying contract'
    }

    // Transact with deployed contract
    
    const abi = getABI(contractName, buildPath)
    const contractDeployed = new web3.eth.Contract(abi, contractAddress)

    // Verify token symbol
    try {
        const symbol = await contractDeployed.methods.symbol().call()
        console.log(`Token symbol is: ${symbol}`)
    } catch (error) {
        console.error('Error while checking symbol')
        console.error(error)
    }

    // Verify total token supply
    try {
        const totalSupply = await contractDeployed.methods.totalSupply().call()
        console.log(`Token supply is: ${totalSupply}`)
    } catch (error) {
        console.error('Error while checking total supply')
        console.error(error)
    }

    // Check token balance as token deployer
    from = web3.eth.accounts.wallet[0].address
    try {
        const balance = await contractDeployed.methods.balanceOf(from).call()
        console.log(`Balance of token deployer is: ${balance}`)
    } catch (error) {
        console.error(error)
    }
    getBalanceFromAddress(web3,web3.eth.accounts.wallet[0].address,"Current ETH balance of ")


}

(async () => {

    let web3Provider: Web3BaseProvider
    let web3: typeof Web3
    const buildPath = path.resolve(__dirname, '');

    // Init Web3 provider
    try {
        web3Provider = initProvider()
        web3 = new Web3(web3Provider)
    } catch (error) {
        console.error(error)
        throw 'Web3 cannot be initialized.'
    }
    console.log('Connected to Web3 provider.')

    // Deploy contract as account 0
    const contractName = 'MyToken'
    const tokenName = 'My Token'
    const tokenSymbol = 'MyT'
    const tokenTotalSupply = 100000
    const pvtKey:string = process.env.SIGNER_PRIVATE_KEY || ''
    
    contractDeployment(web3,contractName,tokenName,tokenSymbol,tokenTotalSupply,pvtKey)

    process.exitCode = 0

})()