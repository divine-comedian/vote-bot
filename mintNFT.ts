import { sendNFT, sendGas, Credentials} from "./utils/relayerFunction";
require('dotenv').config();


// testing functions

const credentials: Credentials = {
    apiKey: process.env.RELAYER_API as string,
    secretKey: process.env.RELAYER_SECRET as string,
  };

  console.log(credentials);
sendNFT(credentials, "0xAC4cda272DEF2019e36CB227D506b5969aA3b248", 1);

// sendGas(credentials, "0xAC4cda272DEF2019e36CB227D506b5969aA3b248", 1000000000);
