// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.7.6;

contract Emitter {
    
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

    function emitIt(address blabla, address yoyo, address toto, uint256 idid, uint256 valval) public {
        emit TransferSingle(blabla, yoyo, toto,  idid,  valval);
    }
}