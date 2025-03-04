// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketOrderBook } from "../contracts/PredictionMarketOrderBook.sol";
import { PredictionOptionTokenOrderBook } from "../contracts/PredictionOptionTokenOrderBook.sol";

contract PredictionMarketTest is Test {
    PredictionMarketOrderBook public predictionMarket;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        predictionMarket = new PredictionMarketOrderBook(oracle);
        deal(gambler1, 10 ether);
        deal(gambler2, 10 ether);
        deal(gambler3, 10 ether);
    }

    function test_createPosition() public {
        vm.prank(gambler1);
        predictionMarket.createPosition{ value: 1 ether }(60);

        // Get individual fields from the offer
        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 ethAmount,
            uint256 matchingETHAmount,
            uint256 tokenAmount,
            bool isActive
        ) = predictionMarket.positions(0);
        console.log("id", id);
        console.log("creator", creator);
        console.log("chance", chance);
        console.log("ethAmount", ethAmount);
        console.log("matchingETHAmount", matchingETHAmount);
        console.log("tokenAmount", tokenAmount);
        console.log("isActive", isActive);
    }

    function test_takePosition() public {
        vm.prank(gambler1);
        predictionMarket.createPosition{ value: 1 ether }(60);

        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 ethAmount,
            uint256 matchingETHAmount,
            uint256 tokenAmount,
            bool isActive
        ) = predictionMarket.positions(0);

        vm.prank(gambler2);
        predictionMarket.takePosition{ value: matchingETHAmount }(0);

        console.log("balanceOf(gambler1)", predictionMarket.i_yesToken().balanceOf(gambler1));
        console.log("balanceOf(gambler2)", predictionMarket.i_noToken().balanceOf(gambler2));

        assertEq(predictionMarket.i_yesToken().balanceOf(gambler1), tokenAmount);
        assertEq(predictionMarket.i_noToken().balanceOf(gambler2), tokenAmount);
    }

    function test_createOffer() public {
        vm.prank(gambler1);
        predictionMarket.createPosition{ value: 1 ether }(60);

        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 ethAmount,
            uint256 matchingETHAmount,
            uint256 tokenAmount,
            bool isActive
        ) = predictionMarket.positions(0);

        vm.prank(gambler2);
        predictionMarket.takePosition{ value: matchingETHAmount }(0);

        console.log("balanceOf(gambler1)", predictionMarket.i_yesToken().balanceOf(gambler1));

        vm.startPrank(gambler1);
        predictionMarket.i_yesToken().approve(address(predictionMarket), 1 ether);
        predictionMarket.createOffer(60, 1 ether);
        vm.stopPrank();

        console.log("balanceOf(gambler1)", predictionMarket.i_yesToken().balanceOf(gambler1));
    }

    function test_takeOffer() public {
        test_createOffer();

        uint256 expectedBalanceOfGambler2AfterTakeOffer = 1 ether;

        (uint256 id, address creator, uint256 chance, uint256 tokenAmount, bool isActive) = predictionMarket.offers(0);
        console.log("tokenAmount", tokenAmount);

        uint256 ethAmount = predictionMarket.calculateEthValue(tokenAmount);
        vm.prank(gambler2);
        predictionMarket.takeOffer{ value: ethAmount }(0);

        console.log("balanceOf(gambler2)", predictionMarket.i_yesToken().balanceOf(gambler2));
        assertEq(predictionMarket.i_yesToken().balanceOf(gambler2), expectedBalanceOfGambler2AfterTakeOffer);
    }

    function test_closeOffer() public {
        test_createOffer();
        uint256 expectedBalanceOfGambler1AfterCloseOffer = 100 ether;

        vm.prank(gambler1);
        predictionMarket.closeOffer(0);

        assertEq(predictionMarket.i_yesToken().balanceOf(gambler1), expectedBalanceOfGambler1AfterCloseOffer);
    }
}
