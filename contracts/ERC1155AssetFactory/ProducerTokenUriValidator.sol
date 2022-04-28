// SPDX-License-Identifier: MIT

// pragma solidity >=0.6.2 <0.8.0;
pragma solidity 0.7.6;
import "./Initializable.sol";
import "./LibSignature.sol";

contract ProducerTokenUriValidator is Initializable {
    bytes32 public constant PRODUCER_TOKENURI_TYPEHASH = keccak256("ProducerTokenUri(uint256 tokenId,string tokenURI)");
    
    bytes32 private DOMAIN_SEPARATOR;
    bytes32 private constant DOMAIN_TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    function __ProducerTokenUriValidator_init_unchained() internal initializer {

    uint256 chainId;
    assembly {
      chainId := chainid()
    }

    DOMAIN_SEPARATOR = keccak256(
      abi.encode(
        DOMAIN_TYPE_HASH,
        keccak256(bytes("ProducerTokenUri")),
        keccak256(bytes("1")),
        chainId,
        address(this)
      )
    );
    }

    function validateProducerTokenUriSignature(uint256 tokenId, string memory tokenUri, address producer, bytes memory signature) internal view returns (bool) {

      bytes32 digest = keccak256(
        abi.encodePacked(
          "\x19\x01",
          DOMAIN_SEPARATOR,
          keccak256(abi.encode(PRODUCER_TOKENURI_TYPEHASH,
                  tokenId,
                  keccak256(bytes(tokenUri))))
        )
      );
    
      address signer = LibSignature.recover(digest, signature);
      require(signer != address(0) && signer == producer,"Invalid signature");

      return true;
    }
}