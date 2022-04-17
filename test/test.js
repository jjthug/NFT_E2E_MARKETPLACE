const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const truffleAssert = require('truffle-assertions');

const getTokenId = (userAddress, number) =>{
  return ethers.utils.solidityPack([ "address", "uint96" ], [userAddress, number]); 
  //0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3000000000000000000000001
}

const getNftDataSignatures = async(signers, _verifyingContractAddress, _tokenId, _tokenURI, _supply, _creators, _royalties, _movieId, _producer, _nftRevealTime) =>{
  const domain = {
      name: "Mint1155",
      version: "1",
      chainId: 31337, // hardhat chain id
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
          console.log("signature of Mint ERC1155 Data =",signature);
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
        chainId: 31337,
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

    let signature = await owner._signTypedData(domain, types, value);
    // .then((signature) => {  
        console.log("signature of Order Data =", signature);
        return signature;
    // })
    // .catch((error) => {
    //     console.log(error);
    // });
}

describe("Marketplace", function () {
  
    let asset, beacon, lazyTransferProxy, nftTransferProxy, factory, erc20TransferProxy,royaltiesRegistry, exchange, token;
    let owner,addr1,addr2,addr3,producerUser, originFeeReceiver;
    let collectionProxy;

  before(async function () {

    [owner, addr1, addr2, addr3, producerUser, originFeeReceiver] = await ethers.getSigners();

    let CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    asset = await CD.deploy();
    await asset.deployed();
    console.log("asset Deployed to : ", asset.address);

    CD = await ethers.getContractFactory("contracts/BEACON/ERC1155MVCBeacon.sol:ERC1155MoviecoinBeacon");
    beacon = await CD.deploy(asset.address);
    await beacon.deployed();
    console.log("beacon Deployed to : ", beacon.address);

    CD = await ethers.getContractFactory("contracts/LazyTransferProxy/ERC1155LazyMintTransferProxy.sol:ERC1155LazyMintTransferProxy");
    lazyTransferProxy = await CD.deploy();
    await lazyTransferProxy.deployed();
    console.log("lazyTransferProxy Deployed to : ", lazyTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/NFTTransferProxy/TransferProxy.sol:NftTransferProxy");   
    nftTransferProxy = await CD.deploy();
    await nftTransferProxy.deployed();
    console.log("nftTransferProxy Deployed to : ", nftTransferProxy.address);

    CD = await ethers.getContractFactory("contracts/ERC1155AssetFactory/ERC1155MoviecoinFactoryC2.sol:ERC1155MoviecoinFactoryC2");
    factory = await CD.deploy(beacon.address, nftTransferProxy.address, lazyTransferProxy.address);
    await factory.deployed();
    console.log("factory Deployed to : ", factory.address);
    let tx = await factory['createToken(string,string,string,string,address[],uint256)']("Moviecoin Collection", "MVC", "", "", [], 123456);
    let res = await tx.wait();
    for (const event of res.events) {
        if(event.event =="Create1155MoviecoinUserProxy") {
            collectionProxy = event.args[0];
            console.log("Collection proxy deployed to = ", collectionProxy);
            break;
        }
    }

    CD = await ethers.getContractFactory("contracts/ERC20TransferProxy/ERC20TransferProxy.sol:ERC20TransferProxy");
    erc20TransferProxy = await CD.deploy();
    await erc20TransferProxy.deployed();
    console.log("erc20TransferProxy Deployed to : ", erc20TransferProxy.address);

    CD = await ethers.getContractFactory("contracts/RoyaltiesRegistry/RoyaltiesRegistry.sol:RoyaltiesRegistry");
    royaltiesRegistry = await upgrades.deployProxy(CD, [], {initializer:"__RoyaltiesRegistry_init"});
    await royaltiesRegistry.deployed();
    console.log("royaltiesRegistry Deployed to : ", royaltiesRegistry.address);

    CD = await ethers.getContractFactory("contracts/Exchange/ExchangeV2.sol:ExchangeV2");
    exchange = await upgrades.deployProxy(CD, [nftTransferProxy.address,lazyTransferProxy.address,erc20TransferProxy.address,0,"0x23F7F82Eb917A49a722E970580Ee138Af5f71D74",royaltiesRegistry.address], {initializer:"__ExchangeV2_init"});
    await exchange.deployed();
    console.log("exchange Deployed to : ", exchange.address);

    CD = await ethers.getContractFactory("contracts/TEST_ERC20/Token.sol:Token");
    token = await CD.deploy("US Dollar Coin", "USDC", "10000000000000000000000000");
    await token.deployed();
    console.log("token Deployed to : ", token.address);
    await token.transfer(addr1.address, "100000000000000000000000");

    /* Adding exchange operator to lazy transfer proxy and erc20 proxy */
    await lazyTransferProxy.__OperatorRole_init();
    await lazyTransferProxy.addOperator(exchange.address);
    await erc20TransferProxy.__OperatorRole_init();
    await erc20TransferProxy.addOperator(exchange.address);
    await token.connect(addr1).approve(erc20TransferProxy.address, "10000000000000000000000");

    /* Owner address */
    // let theowner = await beacon.owner();
    // console.log("theowner",theowner);
    // console.log("owner",owner.address);

  });

  it("BUY-SELL", async()=>{

    /*************************************************** NFT Asset Data *********************************************************/

    let[ tokenId, tokenUri, supply, movieId, producer, NftRevealTime ] = [getTokenId(owner.address, 1), "ipfs://", 344, "abcd1234", producerUser.address, "167564623"];
    let creatorsObjArray = [{account : owner.address, value: 10000}];
    let royaltiesObjArray = [{account : owner.address, value: 700}];
    let creators = [owner.address, 10000];
    let royalties = [owner.address, 700];

    let signatures = await getNftDataSignatures([owner], collectionProxy, tokenId, tokenUri, supply, creatorsObjArray, royaltiesObjArray, movieId, producer, NftRevealTime);
    console.log("signatures=",signatures[0]);
    let NFT_ASSET_DATA = getNftAssetData(collectionProxy, tokenId, tokenUri, supply, movieId, producer, NftRevealTime, creators, royalties, signatures );

    /************************************************ SELL Order & Signature *****************************************************/
    
    let [ SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE ] = [owner.address, "0x1cdfaa40", NFT_ASSET_DATA, 1 ];

    let [ SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE ] = ["0x0000000000000000000000000000000000000000", "0x8ae85d84", getERC20AssetData( token.address ), "1000000000000000000000"];

    let [SELL_salt, SELL_start, SELL_end] = [123456, 0, 0] ;
    const dataType = "0x23d235ef"; // LibOrderV2
    const isMakeFillSellOrder = true;
    
    /*Origin fees to address */
    const sellOrderData = getOrderData(originFeeReceiver.address, 250, isMakeFillSellOrder);

    let sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    console.log("sellOrderData",sellOrderData);

    let sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );

    /************************************************ BUY Order & Signature *****************************************************/
    
    let [ BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE ] = [addr1.address, "0x8ae85d84", getERC20AssetData( token.address ), "1000000000000000000000" ];

    let [ BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE] = ["0x0000000000000000000000000000000000000000", "0x1cdfaa40", NFT_ASSET_DATA, 1];

    let [BUY_salt, BUY_start, BUY_end ]  = [123456, 0, 0]; 
    const isMakeFillBuyOrder = false;
    
    /*Origin fees to address */
    const buyOrderData = getOrderData(originFeeReceiver.address, 250, isMakeFillBuyOrder);

    let buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

    // Not necessary for diirect buys
    // Needed for bids
    let buySignature = await signOrder(addr1, exchange.address,
        BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
        BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
        BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
    );

    console.log("buySignature",buySignature);

  /************************************************ Match Order *****************************************************/

  await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);


})

})