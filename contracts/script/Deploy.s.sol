// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import { ValidatorRegistry } from "../src/core/ValidatorRegistry.sol";
import { RestakingStrategy } from "../src/core/RestakingStrategy.sol";
import { Vault } from "../src/core/Vault.sol";

/// @title Deploy
/// @notice Production deployment script for StakeFlow protocol
/// @dev Usage: forge script script/Deploy.s.sol --rpc-url <RPC> --broadcast --verify
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // ═══════════════════════════════════════════════════
        //           STEP 1: Deploy ValidatorRegistry
        // ═══════════════════════════════════════════════════
        ValidatorRegistry registry = new ValidatorRegistry();
        console.log("=== ValidatorRegistry ===");
        console.log("  Address:", address(registry));

        // ═══════════════════════════════════════════════════
        //           STEP 2: Deploy RestakingStrategy
        // ═══════════════════════════════════════════════════
        RestakingStrategy strategy = new RestakingStrategy(address(registry));
        console.log("=== RestakingStrategy ===");
        console.log("  Address:", address(strategy));

        // ═══════════════════════════════════════════════════
        //           STEP 3: Deploy Vault
        // ═══════════════════════════════════════════════════
        Vault vault = new Vault(address(strategy));
        console.log("=== Vault ===");
        console.log("  Address:", address(vault));

        // ═══════════════════════════════════════════════════
        //           STEP 4: Transfer Strategy Ownership
        // ═══════════════════════════════════════════════════
        // The Vault needs to call executeStrategy on the Strategy
        strategy.transferOwnership(address(vault));
        console.log("  Strategy ownership -> Vault");

        // ═══════════════════════════════════════════════════
        //           STEP 5: Register Initial Validators
        // ═══════════════════════════════════════════════════
        registry.registerValidator(
            address(0x1111111111111111111111111111111111111111),
            "Validator Alpha",
            500,     // 5% commission
            2_000,   // 20% risk
            100 ether // 100 ETH cap
        );

        registry.registerValidator(
            address(0x2222222222222222222222222222222222222222),
            "Validator Beta",
            300,     // 3% commission
            1_500,   // 15% risk
            150 ether // 150 ETH cap
        );

        registry.registerValidator(
            address(0x3333333333333333333333333333333333333333),
            "Validator Gamma",
            700,     // 7% commission
            3_000,   // 30% risk
            80 ether  // 80 ETH cap
        );

        // Set initial performance scores
        registry.updatePerformanceScore(
            address(0x1111111111111111111111111111111111111111),
            8_000  // 80%
        );

        registry.updatePerformanceScore(
            address(0x2222222222222222222222222222222222222222),
            9_000  // 90%
        );

        registry.updatePerformanceScore(
            address(0x3333333333333333333333333333333333333333),
            6_500  // 65%
        );

        // ═══════════════════════════════════════════════════
        //               DEPLOYMENT SUMMARY
        // ═══════════════════════════════════════════════════
        console.log("");
        console.log("========================================");
        console.log("   StakeFlow Protocol - Deployed!");
        console.log("========================================");
        console.log("  Registry :", address(registry));
        console.log("  Strategy :", address(strategy));
        console.log("  Vault    :", address(vault));
        console.log("  Validators: 3 registered");
        console.log("========================================");

        vm.stopBroadcast();
    }
}
