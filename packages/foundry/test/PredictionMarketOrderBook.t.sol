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
        predictionMarket.createPosition{ value: 1 ether }(20);

        // // Get individual fields from the offer
        // (
        //     uint256 id,
        //     address creator,
        //     uint256 chance,
        //     uint256 ethAmount,
        //     uint256 matchingETHAmount,
        //     uint256 tokenAmount,
        //     bool isActive
        // ) = predictionMarket.positions(0);
    }

    function test_takePosition() public {
        test_createPosition();

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

        assertEq(predictionMarket.i_yesToken().balanceOf(gambler1), tokenAmount);
        assertEq(predictionMarket.i_noToken().balanceOf(gambler2), tokenAmount);
    }

    function test_createSellOffer() public {
        vm.prank(gambler1);
        predictionMarket.createPosition{ value: 1 ether }(20);

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
        predictionMarket.i_yesToken().approve(address(predictionMarket), 500 ether);
        predictionMarket.createSellOffer(20, 500 ether);
        vm.stopPrank();

        console.log("balanceOf(gambler1)", predictionMarket.i_yesToken().balanceOf(gambler1));
    }

    function test_takeSellOffer() public {
        test_createSellOffer();

        // uint256 expectedBalanceOfGambler2AfterTakeOffer = 1 ether;

        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 tokenAmount,
            bool isActive,
            uint256 ethAmount,
            bool isBuyOffer
        ) = predictionMarket.offers(0);
        console.log("tokenAmount", tokenAmount);

        uint256 ethAmountCalculated = predictionMarket.calculateEthValue(chance, tokenAmount);
        console.log("ethAmount", ethAmount);
        console.log("ethAmountCalculated", ethAmountCalculated);
        vm.prank(gambler2);
        predictionMarket.takeSellOffer{ value: ethAmount }(0);

        console.log("balanceOf(gambler2)", predictionMarket.i_yesToken().balanceOf(gambler2));
        // assertEq(predictionMarket.i_yesToken().balanceOf(gambler2), expectedBalanceOfGambler2AfterTakeOffer);
    }

    function test_closeSellOffer() public {
        test_createSellOffer();
        uint256 expectedBalanceOfGambler1AfterCloseOffer = 100 ether;

        vm.prank(gambler1);
        predictionMarket.closeSellOffer(0);

        assertEq(predictionMarket.i_yesToken().balanceOf(gambler1), expectedBalanceOfGambler1AfterCloseOffer);
    }

    function test_createBuyOffer() public {
        uint256 balanceBefore = address(gambler2).balance;
        uint256 initialPurchaseAmount = 1 ether;

        vm.prank(gambler2);
        predictionMarket.createBuyOffer{ value: initialPurchaseAmount }(20);

        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 tokenAmount,
            bool isActive,
            uint256 ethAmount,
            bool isBuyOffer
        ) = predictionMarket.offers(0);

        uint256 balanceAfter = address(gambler2).balance;
        // console.log("chance", chance);
        // console.log("tokenAmount", tokenAmount);
        assertEq(balanceBefore - balanceAfter, initialPurchaseAmount);
        assertEq(isActive, true);
        assertEq(isBuyOffer, true);
        assertEq(ethAmount, initialPurchaseAmount);
    }

    function test_takeBuyOffer() public {
        test_takePosition();
        test_createBuyOffer();

        uint256 balanceBefore = address(gambler1).balance;
        uint256 yesTokenBalanceBeforeGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        uint256 noTokenBalanceBeforeGambler2 = predictionMarket.i_noToken().balanceOf(gambler2);

        (,,, uint256 tokenAmount,,,) = predictionMarket.offers(0);

        vm.startPrank(gambler1);
        predictionMarket.i_yesToken().approve(address(predictionMarket), tokenAmount);
        predictionMarket.takeBuyOffer(0);
        vm.stopPrank();

        uint256 yesTokenBalanceAfterGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        uint256 noTokenBalanceAfterGambler2 = predictionMarket.i_noToken().balanceOf(gambler2);
        uint256 yesTokenBalanceAfterGambler2 = predictionMarket.i_yesToken().balanceOf(gambler2);

        uint256 balanceAfter = address(gambler1).balance;
        console.log("yesTokenBalanceBeforeGambler1", yesTokenBalanceBeforeGambler1);
        console.log("noTokenBalanceBeforeGambler2", noTokenBalanceBeforeGambler2);
        console.log("--------------------------------");
        console.log("yesTokenBalanceAfterGambler1", yesTokenBalanceAfterGambler1);
        console.log("noTokenBalanceAfterGambler2", noTokenBalanceAfterGambler2);
        console.log("yesTokenBalanceAfterGambler2", yesTokenBalanceAfterGambler2);
        console.log("--------------------------------");
        console.log("balanceBefore", balanceBefore);
        console.log("balanceAfter", balanceAfter);
        // assertEq(balanceBefore - balanceAfter, tokenAmount);
    }
}
