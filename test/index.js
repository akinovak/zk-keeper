const { FastSemaphore } = require('semaphore-lib');
const bigintConversion = require('bigint-conversion');

console.log('hello world');

// (async () => {
//     window.addEventListener('load', async (event) => {
//         const client = await injected.connect(); 
//         const identityCommitment = await client.getIdentity();
//         const payload = generateData(identityCommitment);

//         // console.log(payload)
//         const proof = await client.semaphoreProof(payload)
//         console.log(proof)
//     });
    
// })();

// const generateData = (identityCommitment) => {
//     const leafIndex = 3;

//     FastSemaphore.setHasher('poseidon');
    
//     const tree = FastSemaphore.createTree(5, BigInt(0), 2);

//     for (let i=0; i<leafIndex;i++) {
//       const tmpIdentity = FastSemaphore.genIdentity();
//       const tmpCommitment = FastSemaphore.genIdentityCommitment(tmpIdentity);
//       tree.insert(tmpCommitment);
//     }
//     tree.insert(identityCommitment);

//     const externalNullifier = FastSemaphore.genExternalNullifier("voting_1");
//     const signal = '0x111';

//     const wasmFilePath = 'http://localhost:8000/semaphore.wasm';
//     const finalZkeyPath = 'http://localhost:8000/semaphore_final.zkey';

//     const merkleProof = tree.genMerklePath(leafIndex);
    
//     merkleProof.leaf = bigintConversion.bigintToHex(merkleProof.leaf);
//     // merkleProof.indices = JSON.stringify(merkleProof.indices);

//     merkleProof.pathElements = merkleProof.pathElements.map((path) => {
//         return path.map((elem) => { console.log(elem); return bigintConversion.bigintToHex(elem) })
//     })

//     merkleProof.root = ''
//     console.log(merkleProof)

//     return { merkleProof, externalNullifier, signal, wasmFilePath, finalZkeyPath };
// }