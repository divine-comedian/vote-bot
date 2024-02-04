import { Defender } from'@openzeppelin/defender-sdk';
import miBarrioABI from '../contract/MiBarrioABI.json';
import { encodeFunctionData, numberToHex } from 'viem';
require('dotenv').config();

export interface Credentials {
    apiKey: string;
    secretKey: string;
}


export async function sendNFT(credentials: Credentials, recipient: string, tokenId: number) {
    const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS as string;
    console.log('this is the nft contract address', nftContractAddress);
    console.log('these are the credentials inside the function',credentials);
    const client = new Defender({relayerApiKey: credentials.apiKey, relayerApiSecret: credentials.secretKey});
    const hexedTokenId = numberToHex(tokenId)
    const data = encodeFunctionData({
        abi: miBarrioABI.abi,
        functionName: 'safeMint',
        args: [recipient, 1],
    });
    console.log('this is the data', data);
    let txRes: any;
    try {
        txRes = await client.relaySigner.sendTransaction({
         to: nftContractAddress,
         value: 0,
         speed: 'fast',
         gasLimit: '21000',
         data: data
       });
       console.log(txRes);
    } catch (err) {
        console.log(err);
    }
  
    console.log(txRes);
    return txRes.hash;
  }

export async function sendGas(credentials: Credentials, recipient: string, amount: number) {
    console.log('these are the credentials inside the function',credentials);
    const client = new Defender({relayerApiKey: credentials.apiKey, relayerApiSecret: credentials.secretKey});
    const txRes = await client.relaySigner.sendTransaction({
      to: recipient,
      value: amount,
      speed: 'fast',
      gasLimit: '21000',
      data: '0x'
    });
  
    console.log(txRes);
    return txRes.hash;
  }
