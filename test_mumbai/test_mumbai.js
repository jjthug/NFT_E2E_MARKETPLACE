const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const truffleAssert = require('truffle-assertions');

const chainId = 80001;
const TOKENID = 49;
const TIME_OFFSET = 9;
const TIMEOUT = 10000;
log = (arg) => console.log(arg);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getTokenId = (userAddress, number) =>{
  return ethers.utils.solidityPack([ "address", "uint96" ], [userAddress, number]); 
  //0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3000000000000000000000001
}

const getNftDataSignatures = async(signers, _verifyingContractAddress, _tokenId, _tokenURI, _supply, _creators, _royalties, _movieId, _producer, _nftRevealTime) =>{
  const domain = {
      name: "Mint1155",
      version: "1",
      chainId: chainId, // hardhat chain id
      verifyingContract: _verifyingContractAddress
  };
  
  // The named list of all type definitions
  const types = {
      Mint1155: [
          {
            name: "tokenId",
            type: "uint256"
          },
          {
            name: "movieId",
            type: "string"
          },
          {
            name: "supply",
            type: "uint256"
          },
          {
            name: "nftRevealTime",
            type: "uint256"
          },
          {
            name: "producer",
            type: "address"
          },
          {
            name: "tokenURI",
            type: "string"
          },
          {
            name: "creators",
            type: "Part[]"
          },
          {
            name: "royalties",
            type: "Part[]"
          }
        ],
        Part: [
          {
            name: "account",
            type: "address"
          },
          {
            name: "value",
            type: "uint96"
          }
        ]
  };

  const value = {
      tokenId: _tokenId,
      tokenURI: _tokenURI,    
      supply: _supply,
      creators: _creators,
      royalties: _royalties,
      movieId: _movieId,
      producer: _producer,
      nftRevealTime: _nftRevealTime            
  };
  let signature;
  let signatures = [];
  let i = 0;
  for (i=0; i < signers.length; i++){
        // console.log("here is signer", signers[i].address);
        await signers[i]._signTypedData(domain, types, value).then((signature) => {
        // console.log("pass");
          signatures[i] = signature;
      })
      .catch((error) => {
          console.log(error);
      });
  }

  return signatures;
}

const getNftAssetData = (collectionAddress, tokenId, tokenUri, supply, movieId, producer, NftRevealTime, creators, royalties, signatures) => {
  return ethers.utils.defaultAbiCoder.encode([ "address", "tuple(uint256,string,uint256,string,address,uint256,tuple(address,uint96)[],tuple(address,uint96)[],bytes[])"],
  [collectionAddress,[tokenId, tokenUri, supply, movieId, producer, NftRevealTime, [creators],[royalties],signatures]]);
}

const getERC20AssetData = (tokenAddress) =>{
  return ethers.utils.defaultAbiCoder.encode([ "address" ],[tokenAddress]);
}

const getOrderData = (addressUser, share, isMakeFill) =>{
  return ethers.utils.defaultAbiCoder.encode([ "tuple(tuple(address,uint96)[],tuple(address,uint96)[],bool)" ],[ [ [],[[addressUser,share]],isMakeFill] ] );
}

const signOrder = async(owner, _verifyingContract,
    _maker, _makeAsset_assetClass, _makeAsset_data, _makeAsset_value,
    _taker, _takeAsset_assetClass, _takeAsset_data, _takeAsset_value,
    _salt, _start, _end, _dataType, _data ) => {

    const domain = {
        name: "Exchange",
        version: "2",
        chainId: chainId,
        verifyingContract: _verifyingContract
    };

    // The named list of all type definitions
    const types = {
        Order: [
            {name: "maker", type: "address"},
            {name: "makeAsset", type: "Asset"},
            {name: "taker", type: "address" },
            {name: "takeAsset", type: "Asset"},
            {name: "salt", type: "uint256"},
            {name: "start", type: "uint256"},
            {name: "end", type: "uint256"},
            {name: "dataType", type: "bytes4"},
            {name: "data", type: "bytes"}
        ],
        Asset: [
            { name: "assetType", type: "AssetType" },
            { name: "value", type: "uint256" }
        ],
        AssetType: [
            { name: "assetClass", type: "bytes4" },
            { name: "data", type: "bytes" }
        ]
    };

    const value = {
      maker: _maker,
        makeAsset: {
            assetType: {
                assetClass: _makeAsset_assetClass, // ERC1155_LAZY
                data: _makeAsset_data
            },
            value: _makeAsset_value
        },
        
      taker:_taker,
        takeAsset:{
            assetType:{
                assetClass: _takeAsset_assetClass, // ERC20 MVC
                data: _takeAsset_data // MVC
            },
            value: _takeAsset_value, //
        },
        salt: _salt, // can be passed in hex, will be used as int in solidity = 97528184178029362180697764875250076063719344752759381631305512499298703211080
        start: _start,
        end: _end,
        dataType: _dataType,  // Fixed
        data: _data
    };

    let signature = owner._signTypedData(domain, types, value);
    // .then((signature) => {  
        return signature;
    // })
    // .catch((error) => {
    //     console.log(error);
    // });
}

const getProducerSignatureForTokenUri = async(producer, _verifyingContractAddress, _tokenId, _tokenURI) =>{
  const domain = {
      name: "ProducerTokenUri",
      version: "1",
      chainId: chainId, // hardhat chain id
      verifyingContract: _verifyingContractAddress
  };
  
  // The named list of all type definitions
  const types = {
    ProducerTokenUri: [
          {name: "tokenId", type: "uint256"},
          {name: "tokenURI", type: "string"}
        ]
  };

  const value = {
      tokenId: _tokenId,
      tokenURI: _tokenURI
  };

  let signature= producer._signTypedData(domain, types, value);
  return signature;
  
}

const getOrderFillHash = (_erc20AssetData, _nftAssetData, _maker, _salt, _orderData) =>{

  const assetTypeHash = "0x452a0dc408cb0d27ffc3b3caff933a5208040a53a9dbecd8d89cad2c0d40e00c";

  // USDC hash
  const erc20AssetClass = "0x8ae85d84";
  // let erc20AssetData = "0x0000000000000000000000001b4581b71a642c551830e6b5b1f319aa6427009e";
  let usdcHash = utils.keccak256(utils.defaultAbiCoder.encode(["bytes32", "bytes4", "bytes32" ], 
    [assetTypeHash, erc20AssetClass, utils.keccak256(_erc20AssetData) ]));

  // NFT asset hash
  const erc1155LazyAssetClass = "0x1cdfaa40";
  // let nftAssetData = "0x00000000000000000000000065fd28bb09215e6219c82f4e4d9faf2ca60244260000000000000000000000000000000000000000000000000000000000000040c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000019000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000180000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000002800000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d65376974635964735a6b78355145535277777779644b7377766f58635635336f463948686364676955696a660000000000000000000000000000000000000000000000000000000000000000000000000000000000001836316262333431646663643436393030313137333333663500000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c0a0aea4f8457caa8c47ed5b5da410e40efcbf3c00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000412307895217429b450458cea7628b5e5bf55919fd5c1f987b34038be1f43e758d1c0af9248f32c12e48d4df8b9fdeaaf75a1900fc359d2e2b157a232876ba49711b00000000000000000000000000000000000000000000000000000000000000";
  let nftHash = utils.keccak256(utils.defaultAbiCoder.encode(["bytes32", "bytes4", "bytes32" ], 
    [assetTypeHash, erc1155LazyAssetClass, utils.keccak256(_nftAssetData) ]));

  // let maker ="0xc0a0aea4f8457caa8c47ed5b5da410e40efcbf3c";
  // let salt = "1650529658287";
  // let thedataaa = "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000023f7f82eb917a49a722e970580ee138af5f71d7400000000000000000000000000000000000000000000000000000000000000fa";
  let val = utils.keccak256(utils.defaultAbiCoder.encode(["address","bytes32", "bytes32", "uint256", "bytes"], [_maker, nftHash, usdcHash, _salt, _orderData]));
}

describe("Marketplace", function () {
  
    let asset, beacon, lazyTransferProxy, nftTransferProxy, factory, collectionProxy, erc20TransferProxy, royaltiesRegistry, exchange, token;
    let owner,addr1,producerUser, originFeeReceiver;
    let collectionProxyAddress;
    let movieCollectionName = "Moviecoin Collection v3";

    let tokenId, tokenUri, supply, movieId, producer, NftRevealTime;
    let creatorsObjArray, royaltiesObjArray, creators, royalties, signatures;
    let NFT_ASSET_DATA;

    const dataType = "0x23d235ef"; // LibOrderV2

    let SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE;
    let SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE;
    let SELL_salt, SELL_start, SELL_end;  
    const isMakeFillSellOrder = true;
    let sellOrder, sellSignature;
    let sellOrderData;


    let BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE;
    let BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE;
    let BUY_salt, BUY_start, BUY_end;
    const isMakeFillBuyOrder = false;
    let buyOrder, buySignature;
    let buyOrderData;

    let producerSignature;
    let tx;
    let receipt;
    let SALT;
    let failCounter = 0;

  before(async function () {

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    SALT = timestampBefore;

    [owner, addr1, producerUser, originFeeReceiver, hacker] = await ethers.getSigners();

    log(originFeeReceiver.address);

    let CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    asset = await CD.attach("0xa0d792c751de9a5987a1e6993051934981abd9f7");
    console.log("asset Deployed to : ", asset.address);

    CD = await ethers.getContractFactory("contracts/BEACON/ERC1155MVCBeacon.sol:ERC1155MoviecoinBeacon");
    beacon = await CD.attach("0xc0844Ff94C7C6f64DA5A838Da149026443fc3D58");
    console.log("beacon Deployed to : ", beacon.address);

    CD = await ethers.getContractFactory("contracts/LazyTransferProxy/ERC1155LazyMintTransferProxy.sol:ERC1155LazyMintTransferProxy");
    lazyTransferProxy = await CD.attach("0x60aF776251c277717d4E1eBDB7C48A1cae4f0a18");
    console.log("lazyTransferProxy Deployed to : ", lazyTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/NFTTransferProxy/TransferProxy.sol:NftTransferProxy");   
    nftTransferProxy = await CD.attach("0x12ab59b03B18df0A200323419D13A341B878c525");
    console.log("nftTransferProxy Deployed to : ", nftTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/ERC1155AssetFactory/ERC1155MoviecoinFactoryC2.sol:ERC1155MoviecoinFactoryC2");
    factory = await CD.attach("0x799a7E7627B9A02c7422Ac61Eb27dfE647Cc5219");
    console.log("factory Deployed to : ", factory.address);
    collectionProxyAddress = "0x6e2566fF7E9d511C99EFAc9F9C9711eF7E87E71d";
    console.log("Collection proxy deployed to = ", collectionProxyAddress);


    CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    collectionProxy = await CD.attach(collectionProxyAddress);

    CD = await ethers.getContractFactory("contracts/ERC20TransferProxy/ERC20TransferProxy.sol:ERC20TransferProxy");
    erc20TransferProxy = await CD.attach("0xb35848fFdF52e69dF9CE5c3e4eD141Aae6d08C25");
    console.log("erc20TransferProxy Deployed to : ", erc20TransferProxy.address);

    CD = await ethers.getContractFactory("contracts/RoyaltiesRegistry/RoyaltiesRegistry.sol:RoyaltiesRegistry");
    royaltiesRegistry = await CD.attach("0x443d436203e18ef16eE1Cecf7e49182e68ad4F5e");
    console.log("royaltiesRegistry Deployed to : ", royaltiesRegistry.address);

    CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    exchange = await CD.attach("0x951EED6F11243835A1E5133CE3026CbBCBbe0869");
    console.log("exchange Deployed to : ", exchange.address);

    CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");
    token = await CD.attach("0x1B4581B71A642c551830E6B5B1F319aA6427009E");
    console.log("token Deployed to : ", token.address);
    log("done1");

  });

  it("direct BUY-SELL", async()=>{

    /*************************************************** NFT Asset Data *********************************************************/

    [ tokenId, tokenUri, supply, movieId, producer, NftRevealTime ] = [getTokenId(owner.address, TOKENID), "ipfs://QmUjeTXzENaLu1UfyMpgdtuxCENvE2TXk9YxXHiLeJZqyw", 344, "abcd1234", producerUser.address, "167564623"];
    creatorsObjArray = [{account : owner.address, value: 10000}];
    console.log("tokenid=",getTokenId(owner.address, TOKENID));
    royaltiesObjArray = [{account : owner.address, value: 700}];
    creators = [owner.address, 10000];
    royalties = [owner.address, 700];

    signatures = await getNftDataSignatures([owner], collectionProxyAddress, tokenId, tokenUri, supply, creatorsObjArray, royaltiesObjArray, movieId, producer, NftRevealTime);
    NFT_ASSET_DATA = getNftAssetData(collectionProxyAddress, tokenId, tokenUri, supply, movieId, producer, NftRevealTime, creators, royalties, signatures );

    /************************************************ SELL Order & Signature *****************************************************/
    
    [ SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE ] = [owner.address, "0x1cdfaa40", NFT_ASSET_DATA, 2 ];

    [ SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE ] = ["0x0000000000000000000000000000000000000000", "0x8ae85d84", getERC20AssetData( token.address ), "200000000000000000"];

    [SELL_salt, SELL_start, SELL_end] = [SALT, 0, 0];
      console.log("SALT is", SALT);
    /*Origin fees to address */
    sellOrderData = getOrderData(originFeeReceiver.address, 250, isMakeFillSellOrder);

    sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );

    /************************************************ BUY Order & Signature *****************************************************/
    
    [ BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE ] = [addr1.address, "0x8ae85d84", getERC20AssetData( token.address ), "100000000000000000" ];

    [ BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE] = ["0x0000000000000000000000000000000000000000", "0x1cdfaa40", NFT_ASSET_DATA, 1];

    [BUY_salt, BUY_start, BUY_end ]  = [0, 0, 0];
    
    /* Origin fees to address */
    buyOrderData = getOrderData(originFeeReceiver.address, 250, isMakeFillBuyOrder);

    buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

    // Not necessary for direct buys
    // Needed for bids
    buySignature = await signOrder(addr1, exchange.address,
        BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
        BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
        BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
    );

  /************************************************ Match Order *****************************************************/

  // only buyer can match the order without the original buyer's signature
  try{
    tx = await exchange.connect(hacker).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    await tx.wait();
  }catch(e){
    failCounter++;
  }

  // try{
  // tx = await exchange.connect(hacker).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
  // receipt = tx.wait();
  // if(!receipt.status){
  //   console.log("reverted, found in receipt");
  // }
  // } catch(e){}
  

  for(let i=0; i<2;i++){
    tx = await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    console.log("tx hash=",tx.hash);
    receipt = await tx.wait(1);
    console.log("1. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
  }
})

it("already filled orders cant be filled", async()=>{

  try{ 
    tx= await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    receipt = await tx.wait(1);
    console.log("2. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
    }catch(e){
      failCounter++;
    }
})

it("cancelled orders cant be executed", async()=>{
  SELL_salt = SALT + 5;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );
  
  // let orderHash = getOrderFillHash( getERC20AssetData( token.address ), NFT_ASSET_DATA, owner.address, SELL_salt, sellOrderData);   // (_erc20AssetData, _nftAssetData, _maker, _salt, _orderData)
  // console.log("orderHash=",orderHash)

  await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);

  tx = await exchange.connect(owner).cancel(sellOrder);
  receipt = await tx.wait();
  console.log("_3. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);


  try{
    await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
  } catch(e){
    failCounter++;
  }

})

it("accept bids", async()=>{
  SELL_salt = 0;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

  BUY_salt = SALT;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
  
  buySignature = await signOrder(addr1, exchange.address,
    BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
    BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
    BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );

  try{ 
    tx = await exchange.connect(hacker).matchOrders(sellOrder, "0x", buyOrder, buySignature);
    receipt = await tx.wait(1);
    console.log("3. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
  }catch(e){
    failCounter++;
  }

  tx = await exchange.connect(owner).matchOrders(sellOrder, "0x", buyOrder, buySignature);
  receipt = await tx.wait(1);
  console.log("3. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);

  /* other addresses can accept the bid if they have the seller signature */
  SELL_salt = SALT+1;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];
  sellSignature = await signOrder(owner, exchange.address,
    SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
    SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
    SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );

  BUY_salt = SALT+1;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
    
  buySignature = await signOrder(addr1, exchange.address,
    BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
    BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
    BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );
  // any user can accept bid for addr1 if they have signature
  tx = await exchange.connect(hacker).matchOrders(sellOrder, sellSignature, buyOrder, buySignature);
  // TODO check why
  receipt = await tx.wait();
  console.log("3. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
})

it("accept timed bids", async()=>{

  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const timestampBefore = blockBefore.timestamp;

  [BUY_salt, BUY_start, BUY_end ]  = [SALT+8, timestampBefore, timestampBefore+TIME_OFFSET];
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

  // Needed for bids
  buySignature = await signOrder(addr1, exchange.address,
      BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
      BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
      BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );

  [SELL_salt, SELL_start, SELL_end] = [0, 0, 0];

  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

  sellSignature = await signOrder(owner, exchange.address,
      SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
      SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
      SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );

  await exchange.connect(owner).matchOrders( buyOrder, buySignature, sellOrder, sellSignature );



  /* Accepting bids after the bid end time (should fail) */
  await timeout(TIMEOUT);

  BUY_salt = SALT+9;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

  // Needed for bids
  buySignature = await signOrder(addr1, exchange.address,
      BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
      BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
      BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );

  try{
   await exchange.connect(owner).matchOrders( buyOrder, buySignature, sellOrder, sellSignature );
   }catch(e){
   failCounter++;
   }

})

it("incorrect exchange rate", async()=>{
  [BUY_start, BUY_end ] = [0,0]
  SELL_salt = SALT+2;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );


  BUY_MAKEASSET_VALUE = "10000000000000000"; // lesser amount that required
  BUY_salt = SALT+2;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
  
  try{ 
    tx = await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    receipt = await tx.wait(1);
    console.log("4. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
  }catch(e){
    failCounter++;
  }
})

it("incorrect sell signature", async()=>{
  sellSignature = await signOrder(originFeeReceiver, exchange.address,
    SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
    SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
    SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );

  try{ 
    tx = await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    receipt = await tx.wait(1);
    console.log("5. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
  }catch(e){
    failCounter++;
  }
})

it("not approved sufficient erc20 balance", async()=>{
  BUY_salt = SALT+3;
  BUY_MAKEASSET_VALUE = "100000000000000000000000";
  SELL_salt = SALT+3;
  SELL_TAKEASSET_VALUE = "100000000000000000000000";

  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );

    buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

    try{ 
      await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);
    }catch(e){
      failCounter++;
    }
})

it("ETH as fees", async()=>{
  BUY_salt = SALT+4;
  [BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE] = ["0xaaaebeba","0x", "1000"];
  SELL_salt = SALT+4;
  [SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE] = ["0xaaaebeba","0x", "1000"];

  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

  sellSignature = await signOrder(owner, exchange.address,
      SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
      SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
      SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );
  buyOrderData = getOrderData(originFeeReceiver.address, 500, isMakeFillBuyOrder); // 5% origin fees from buyer side

  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
  BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

  tx = await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature, {value:"1050"});
  receipt = await tx.wait(1);
  console.log("_7. receipt hash =",receipt.transactionHash, ", status = ",receipt.status);
})

it("set movie details", async()=>{

  try{ 
    await collectionProxy.connect(addr1).setMovieProducer("324f","0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3");
  }catch(e){
    failCounter++;
  }

  tx = await collectionProxy.setMovieProducer("324f","0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3");
  tx.wait(1);

  let name = await collectionProxy.connect(addr1).name();
  // name.wait(1);
  assert.equal(name, movieCollectionName);
})

it("sets token uri", async()=>{
  let revealTokenUri = "abcd";
  producerSignature = await getProducerSignatureForTokenUri(producerUser, collectionProxyAddress, tokenId, revealTokenUri);

  try{
    tx = await collectionProxy.connect(hacker).updateTokenURI(tokenId, revealTokenUri, "0x");
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  /* Producer also cant set */
  try{
    tx = await collectionProxy.connect(producerUser).updateTokenURI(tokenId, revealTokenUri, producerSignature);
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  let ownerSignature = await getProducerSignatureForTokenUri(owner, collectionProxyAddress, tokenId, revealTokenUri);

  /* Owner must have producer signature */
  try{
    tx = await collectionProxy.updateTokenURI(tokenId, revealTokenUri, ownerSignature);
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  /* Invalid signature length */
  try{
    tx = await collectionProxy.updateTokenURI(tokenId, revealTokenUri, "0x");
    tx.wait(1);
  }catch(e){
  failCounter++;
  }

  tx = await collectionProxy.updateTokenURI(tokenId, revealTokenUri, producerSignature);
  tx.wait(1);

})

it("sets movie producer", async()=>{
  try{
    tx = await collectionProxy.connect(hacker).setMovieProducer(tokenId,hacker.address);
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  try{
    tx = await collectionProxy.setMovieProducer(tokenId,"0x0000000000000000000000000000000000000000");
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  tx = await collectionProxy.setMovieProducer(tokenId,addr1.address);
  tx.wait(1);

})

it("sets Movie Reveal Time", async()=>{
  try{
    tx = await collectionProxy.connect(hacker).setMovieRevealTime(tokenId,"12345");
    tx.wait(1);
  }catch(e){
    failCounter++;
  }

  tx = await collectionProxy.setMovieRevealTime(tokenId,"6789");
  tx.wait(1);

  assert.equal(failCounter,16);
})


})