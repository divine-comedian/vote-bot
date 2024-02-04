import { createPublicClient, http } from 'viem'
import { auroraTestnet } from 'viem/chains'
 
let client = createPublicClient({ 
  chain: auroraTestnet, 
  transport: http(), 
}) 

export default client