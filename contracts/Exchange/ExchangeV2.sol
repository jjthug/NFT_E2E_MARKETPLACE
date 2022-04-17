// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "./ExchangeV2Core.sol";
import "./MoviecoinTransferManager.sol";
import "./IRoyaltiesProvider.sol";

contract ExchangeV2 is ExchangeV2Core, MoviecoinTransferManager {
    function __ExchangeV2_init(
        INftTransferProxy _transferProxy,
        ITransferProxy _ERC1155lazyTransferProxy,
        IERC20TransferProxy _erc20TransferProxy,
        uint newProtocolFee,
        address newDefaultFeeReceiver,
        IRoyaltiesProvider newRoyaltiesProvider
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __TransferExecutor_init_unchained(_transferProxy, _ERC1155lazyTransferProxy, _erc20TransferProxy);
        __MoviecoinTransferManager_init_unchained(newProtocolFee, newDefaultFeeReceiver, newRoyaltiesProvider);
        __OrderValidator_init_unchained();
    }
}