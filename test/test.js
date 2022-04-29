const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const truffleAssert = require('truffle-assertions');

const chainId = 31337;

log = (arg) => console.log(arg);

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

// const getAdminProxyAddress = async(proxyAddress) =>{
//   let provider = new ethers.providers.JsonRpcProvider();
//   // ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103" => (bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1))
//   let adminProxyAdd = await provider.getStorageAt(proxyAddress, "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103");
//   return adminProxyAdd;
// }

describe("Marketplace", function () {
  
    let asset, beacon, lazyTransferProxy, nftTransferProxy, factory, collectionProxy, erc20TransferProxy, royaltiesRegistry, exchange, token;
    let owner,addr1,producerUser, originFeeReceiver;
    let collectionProxyAddress;
    let movieCollectionName = "Moviecoin Collection";

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
    let SALT;

  before(async function () {

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    SALT = timestampBefore;

    [owner, addr1, producerUser, originFeeReceiver, hacker] = await ethers.getSigners();

    log(originFeeReceiver.address);

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
    let tx = await factory['createToken(string,string,string,string,address[],uint256)'](movieCollectionName, "MVC", "", "", [], 123456);
    let res = await tx.wait();
    for (const event of res.events) {
        if(event.event =="Create1155MoviecoinUserProxy") {
            collectionProxyAddress = event.args[0];
            console.log("Collection proxy deployed to = ", collectionProxyAddress);
            break;
        }
    }

    CD = await ethers.getContractFactory("contracts/ERC1155_ASSET/ERC1155Moviecoin.sol:ERC1155Moviecoin");
    collectionProxy = await CD.attach(collectionProxyAddress);

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
    // let adminProxy = await getAdminProxyAddress(exchange);
    // console.log("adminProxy of exchange =",adminProxy);

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

  it("direct BUY-SELL", async()=>{

    /*************************************************** NFT Asset Data *********************************************************/

    [ tokenId, tokenUri, supply, movieId, producer, NftRevealTime ] = [getTokenId(owner.address, 1), "ipfs://QmUjeTXzENaLu1UfyMpgdtuxCENvE2TXk9YxXHiLeJZqyw", 344, "abcd1234", producerUser.address, "167564623"];
    creatorsObjArray = [{account : owner.address, value: 10000}];
    royaltiesObjArray = [{account : owner.address, value: 700}];
    creators = [owner.address, 10000];
    royalties = [owner.address, 700];

    signatures = await getNftDataSignatures([owner], collectionProxyAddress, tokenId, tokenUri, supply, creatorsObjArray, royaltiesObjArray, movieId, producer, NftRevealTime);
    NFT_ASSET_DATA = getNftAssetData(collectionProxyAddress, tokenId, tokenUri, supply, movieId, producer, NftRevealTime, creators, royalties, signatures );

    /************************************************ SELL Order & Signature *****************************************************/
    
    [ SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE ] = [owner.address, "0x1cdfaa40", NFT_ASSET_DATA, 10 ];

    [ SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE ] = ["0x0000000000000000000000000000000000000000", "0x8ae85d84", getERC20AssetData( token.address ), "1000000000000000000"];

    [SELL_salt, SELL_start, SELL_end] = [SALT, 0, 0];
        
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
    
    /*Origin fees to address */
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
  await truffleAssert.reverts( 
    exchange.connect(hacker).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
    "VM Exception while processing transaction: reverted with reason string 'maker is not tx sender'"
    );
  
  for(let i=0; i<10;i++)
    await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);


  
})

it("already filled orders cant be filled", async()=>{

  await truffleAssert.reverts( 
    exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
    "VM Exception while processing transaction: reverted with reason string 'nothing to fill'"
    );
})

it("cancelled orders cant be executed", async()=>{
  SELL_salt = SALT + 1;
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

  await exchange.connect(owner).cancel(sellOrder);

  // await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature);

  await truffleAssert.reverts(
    exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
    "VM Exception while processing transaction: reverted with reason string 'SafeMath: subtraction overflow'"
  );

})

it("accept bids", async()=>{
  SELL_salt = 0;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

  BUY_salt = SALT+2;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
  
  buySignature = await signOrder(addr1, exchange.address,
    BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
    BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
    BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );

  await truffleAssert.reverts( 
    exchange.connect(hacker).matchOrders(sellOrder, "0x", buyOrder, buySignature),
    "VM Exception while processing transaction: reverted with reason string 'maker is not tx sender'"
  );

  await exchange.connect(owner).matchOrders(sellOrder, "0x", buyOrder, buySignature);

  /* other addresses can accept the bid if they have the seller signature */
  SELL_salt = SALT+3;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];
  sellSignature = await signOrder(owner, exchange.address,
    SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
    SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
    SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );

  BUY_salt = SALT+3;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
    
  buySignature = await signOrder(addr1, exchange.address,
    BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
    BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
    BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );
  // any user can accept bid for addr1 if they have signature
  await exchange.connect(hacker).matchOrders(sellOrder, sellSignature, buyOrder, buySignature);

})

it("accept timed bids", async()=>{

  const sevenDays = 7 * 24 * 60 * 60;

  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const timestampBefore = blockBefore.timestamp;

  [BUY_salt, BUY_start, BUY_end ]  = [SALT+4, timestampBefore, timestampBefore+sevenDays];
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
  BUY_salt = SALT+5;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];

  // Needed for bids
  buySignature = await signOrder(addr1, exchange.address,
      BUY_MAKER, BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE,
      BUY_TAKER, BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA, BUY_TAKEASSET_VALUE,
      BUY_salt, BUY_start, BUY_end, dataType, buyOrderData
  );

  await ethers.provider.send('evm_mine',[timestampBefore+sevenDays]);

  const blockNumAfter = await ethers.provider.getBlockNumber();
  const blockAfter = await ethers.provider.getBlock(blockNumAfter);
  const timestampAfter = blockAfter.timestamp;

  await truffleAssert.reverts(
   exchange.connect(owner).matchOrders( buyOrder, buySignature, sellOrder, sellSignature ),
   "VM Exception while processing transaction: reverted with reason string 'Order end validation failed'"
   );

})

it("incorrect exchange rate", async()=>{
  [BUY_start, BUY_end ] = [0,0]
  SELL_salt = SALT+6;
  sellOrder = [SELL_MAKER, [[SELL_MAKEASSET_ASSETCLASS,SELL_MAKEASSET_DATA], SELL_MAKEASSET_VALUE ],
    SELL_TAKER, [[SELL_TAKEASSET_ASSETCLASS,SELL_TAKEASSET_DATA], SELL_TAKEASSET_VALUE ], SELL_salt, SELL_start, SELL_end, dataType, sellOrderData ];

    sellSignature = await signOrder(owner, exchange.address,
        SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
        SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
        SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
    );


  BUY_MAKEASSET_VALUE = "10000000000000000"; // lesser amount that required
  BUY_salt = SALT+6;
  buyOrder = [BUY_MAKER, [[BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA], BUY_MAKEASSET_VALUE ],
    BUY_TAKER, [[BUY_TAKEASSET_ASSETCLASS, BUY_TAKEASSET_DATA], BUY_TAKEASSET_VALUE ], BUY_salt, BUY_start, BUY_end, dataType, buyOrderData ];
  
  await truffleAssert.reverts( 
    exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
    "VM Exception while processing transaction: reverted with reason string 'fillLeft: unable to fill'"
    );
})

it("incorrect sell signature", async()=>{
  sellSignature = await signOrder(hacker, exchange.address,
    SELL_MAKER, SELL_MAKEASSET_ASSETCLASS, SELL_MAKEASSET_DATA, SELL_MAKEASSET_VALUE,
    SELL_TAKER, SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE,
    SELL_salt, SELL_start, SELL_end, dataType, sellOrderData
  );

  await truffleAssert.reverts( 
    exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
    "VM Exception while processing transaction: reverted with reason string 'order signature verification error'"
    );
})

it("not approved sufficient erc20 balance", async()=>{
  BUY_salt = SALT+7;
  BUY_MAKEASSET_VALUE = "100000000000000000000000";
  SELL_salt = SALT+7;
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

    await truffleAssert.reverts( 
      exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature),
      "VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds allowance'"
    );

})

it("ETH as fees", async()=>{
  BUY_salt = SALT+8;
  [BUY_MAKEASSET_ASSETCLASS, BUY_MAKEASSET_DATA, BUY_MAKEASSET_VALUE] = ["0xaaaebeba","0x", "100"];
  SELL_salt = SALT+8;
  [SELL_TAKEASSET_ASSETCLASS, SELL_TAKEASSET_DATA, SELL_TAKEASSET_VALUE] = ["0xaaaebeba","0x", "100"];

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

  await exchange.connect(addr1).matchOrders(buyOrder, "0x", sellOrder, sellSignature, {value:"105"});
})

it("set movie details", async()=>{

  await truffleAssert.reverts( 
    collectionProxy.connect(addr1).setMovieProducer("324f","0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3"),
    "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  );

  await collectionProxy.setMovieProducer("324f","0x8218af9ea6b3f9fc6d3987ac9755bd96ef2534d3");

  let name = await collectionProxy.connect(addr1).name();
  assert.equal(name, movieCollectionName);
})

it("sets token uri", async()=>{
  let revealTokenUri = "abcd";
  producerSignature = await getProducerSignatureForTokenUri(producerUser, collectionProxyAddress, tokenId, revealTokenUri);

  await truffleAssert.reverts(
    collectionProxy.connect(hacker).updateTokenURI(tokenId, revealTokenUri, "0x"),
    "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  )

  /* Producer also cant set */
  await truffleAssert.reverts(
    collectionProxy.connect(producerUser).updateTokenURI(tokenId, revealTokenUri, producerSignature),
    "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  )

  let ownerSignature = await getProducerSignatureForTokenUri(owner, collectionProxyAddress, tokenId, revealTokenUri);

  /* Owner must have producer signature */
  await truffleAssert.reverts(
    collectionProxy.updateTokenURI(tokenId, revealTokenUri, ownerSignature),
    "VM Exception while processing transaction: reverted with reason string 'Invalid signature'"
  )

  /* Invalid signature length */
  await truffleAssert.reverts(
    collectionProxy.updateTokenURI(tokenId, revealTokenUri, "0x"),
    "VM Exception while processing transaction: reverted with reason string 'ECDSA: invalid signature length'"
  )

  await collectionProxy.updateTokenURI(tokenId, revealTokenUri, producerSignature);

})

it("sets movie producer", async()=>{
  await truffleAssert.reverts(
    collectionProxy.connect(hacker).setMovieProducer(tokenId,hacker.address),
    "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  )

  await truffleAssert.reverts(
    collectionProxy.setMovieProducer(tokenId,"0x0000000000000000000000000000000000000000"),
    "VM Exception while processing transaction: reverted with reason string 'Producer can't be zero address'"
  )

  await collectionProxy.setMovieProducer(tokenId,addr1.address);

})

it("sets Movie Reveal Time", async()=>{
  await truffleAssert.reverts(
    collectionProxy.connect(hacker).setMovieRevealTime(tokenId,"12345"),
    "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
  )

  await collectionProxy.setMovieRevealTime(tokenId,"6789");
})


})