pragma solidity ^0.7.0;

import "./UpgradeableBeacon.sol";

contract ERC1155MoviecoinBeacon is UpgradeableBeacon {
    constructor(address impl) UpgradeableBeacon(impl) {

    }
}