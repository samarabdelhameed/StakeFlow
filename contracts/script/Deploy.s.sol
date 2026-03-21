// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import { ValidatorRegistry } from "../src/core/ValidatorRegistry.sol";
import { RestakingStrategy } from "../src/core/RestakingStrategy.sol";
import { Vault } from "../src/core/Vault.sol";

/// @title Deploy
/// @notice Deployment script for StakeFlow protocol
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ValidatorRegistry
        ValidatorRegistry registry = new ValidatorRegistry();
        console.log("ValidatorRegistry deployed at:", address(registry));

        // 2. Deploy RestakingStrategy
        RestakingStrategy strategy = new RestakingStrategy(address(registry));
        console.log("RestakingStrategy deployed at:", address(strategy));

        // 3. Deploy Vault
        Vault vault = new Vault(address(strategy));
        console.log("Vault deployed at:", address(vault));

        // 4. Register some initial validators
        registry.registerValidator(
            address(0x1111111111111111111111111111111111111111),
            "Validator Alpha",
            500 // 5% commission
        );

        registry.registerValidator(
            address(0x2222222222222222222222222222222222222222),
            "Validator Beta",
            300 // 3% commission
        );

        registry.registerValidator(
            address(0x3333333333333333333333333333333333333333),
            "Validator Gamma",
            700 // 7% commission
        );

        console.log("=== StakeFlow Deployment Complete ===");
        console.log("Registry:", address(registry));
        console.log("Strategy:", address(strategy));
        console.log("Vault:", address(vault));

        vm.stopBroadcast();
    }
}
