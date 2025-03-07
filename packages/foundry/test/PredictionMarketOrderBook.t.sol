// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketOrderBook } from "../contracts/PredictionMarketOrderBook.sol";
import { PredictionOptionTokenOrderBook } from "../contracts/PredictionOptionTokenOrderBook.sol";

///TODO: test edge cases....

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
        predictionMarket.createPosition{ value: 1 ether }(PredictionMarketOrderBook.Result.YES, 20);

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

    modifier tokensCreated() {
        test_takeSellOffer();
        _;
    }

    function test_takePosition() public {
        test_createPosition();

        (,,,, uint256 matchingETHAmount,,,) = predictionMarket.positions(0);

        uint256 expectedTokenAmount = 500 ether;

        vm.prank(gambler2);
        predictionMarket.takePosition{ value: matchingETHAmount }(0);

        assertEq(predictionMarket.i_yesToken().balanceOf(gambler1), expectedTokenAmount);
        assertEq(predictionMarket.i_noToken().balanceOf(gambler2), expectedTokenAmount);
    }

    function test_createSellOffer() public {
        test_takePosition();
        uint256 expectedYesTokenToSell = 200 ether;
        uint256 balanceBeforeGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);

        vm.startPrank(gambler1);
        predictionMarket.i_yesToken().approve(address(predictionMarket), expectedYesTokenToSell);
        predictionMarket.createSellOffer(PredictionMarketOrderBook.Result.YES, 20, expectedYesTokenToSell);
        vm.stopPrank();
        uint256 balanceAfterGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        (,,,, uint256 outstandingTokenAmount,,,,) = predictionMarket.offers(0);
        assertEq(outstandingTokenAmount, expectedYesTokenToSell);
        assertEq(balanceBeforeGambler1, balanceAfterGambler1 + expectedYesTokenToSell);
    }

    function test_takeSellOffer() public {
        test_createSellOffer();

        (,, uint256 chance,, uint256 outstandingTokenAmountBefore,,,,) = predictionMarket.offers(0);
        console.log("outstandingTokenAmount", outstandingTokenAmountBefore);

        // gambler2 buys 15 token from the outstanding amount
        uint256 tokenAmountToBuy = 15 ether;
        uint256 purchaseETHAmountGambler2 = predictionMarket.calculateEthValue(chance, tokenAmountToBuy);

        vm.prank(gambler2);
        predictionMarket.takeSellOffer{ value: purchaseETHAmountGambler2 }(0);

        (,,,, uint256 outstandingTokenAmountAfter,,,,) = predictionMarket.offers(0);

        assertEq(outstandingTokenAmountBefore - outstandingTokenAmountAfter, tokenAmountToBuy);
    }

    function test_closeSellOffer() public {
        test_takeSellOffer();

        (
            uint256 id,
            address creator,
            uint256 chance,
            ,
            uint256 outstandingTokenAmountBefore,
            bool isActive,
            uint256 ethAmount,
            bool isBuyOffer,
            PredictionMarketOrderBook.Result result
        ) = predictionMarket.offers(0);

        uint256 yesTokenBalanceBeforeGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        uint256 yesTokenBalanceBeforeGambler2 = predictionMarket.i_yesToken().balanceOf(gambler2);

        console.log("Close sell offer: yesTokenBalanceBeforeGambler1", yesTokenBalanceBeforeGambler1);
        console.log("Close sell offer: yesTokenBalanceBeforeGambler2", yesTokenBalanceBeforeGambler2);

        vm.prank(gambler1);
        predictionMarket.closeSellOffer(0);

        (,,,, uint256 outstandingTokenAmountAfter, bool isActiveAfter,,,) = predictionMarket.offers(0);

        uint256 yesTokenBalanceAfterGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        uint256 yesTokenBalanceAfterGambler2 = predictionMarket.i_yesToken().balanceOf(gambler2);

        console.log("Close sell offer: yesTokenBalanceAfterGambler1", yesTokenBalanceAfterGambler1);
        console.log("Close sell offer: yesTokenBalanceAfterGambler2", yesTokenBalanceAfterGambler2);
        assertEq(
            predictionMarket.i_yesToken().balanceOf(gambler1),
            yesTokenBalanceBeforeGambler1 + outstandingTokenAmountBefore
        );
        assertEq(outstandingTokenAmountAfter, 0);
        assertEq(isActiveAfter, false);
    }

    function test_createBuyOffer() public {
        test_takePosition(); //don't need it here
        uint256 balanceBefore = address(gambler2).balance;
        uint256 buyOfferAmount = 20 ether;
        uint256 buyChance = 20;
        uint256 initialPurchaseAmount = predictionMarket.calculateEthValue(buyChance, buyOfferAmount);

        vm.prank(gambler2);
        predictionMarket.createBuyOffer{ value: initialPurchaseAmount }(PredictionMarketOrderBook.Result.YES, buyChance);

        (
            ,
            ,
            uint256 chance,
            uint256 initialTokenAmount,
            uint256 outstandingTokenAmount,
            bool isActive,
            uint256 ethAmount,
            bool isBuyOffer,
        ) = predictionMarket.offers(0);

        uint256 balanceAfter = address(gambler2).balance;

        assertEq(balanceBefore - balanceAfter, initialPurchaseAmount);
        assertEq(isActive, true);
        assertEq(isBuyOffer, true);
        assertEq(ethAmount, initialPurchaseAmount);
    }

    uint256 amountToSellToBuyOrder = 15 ether;

    function test_takeBuyOffer() public {
        test_createBuyOffer();

        uint256 balanceBefore = address(gambler1).balance;

        (
            uint256 id,
            address creator,
            uint256 chance,
            uint256 initialTokenAmount,
            uint256 outstandingTokenAmountBefore,
            bool isActive,
            uint256 ethAmount,
            bool isBuyOffer,
            PredictionMarketOrderBook.Result result
        ) = predictionMarket.offers(0);

        // uint256 yesTokenBalanceBeforeGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        // uint256 yesTokenBalanceBeforeGambler2 = predictionMarket.i_yesToken().balanceOf(gambler2);

        // console.log("yesTokenBalanceBeforeGambler1", yesTokenBalanceBeforeGambler1);
        // console.log("yesTokenBalanceBeforeGambler2", yesTokenBalanceBeforeGambler2);

        vm.startPrank(gambler1);
        predictionMarket.i_yesToken().approve(address(predictionMarket), amountToSellToBuyOrder);
        predictionMarket.takeBuyOffer(0, amountToSellToBuyOrder);
        vm.stopPrank();

        // uint256 yesTokenBalanceAfterGambler1 = predictionMarket.i_yesToken().balanceOf(gambler1);
        // uint256 yesTokenBalanceAfterGambler2 = predictionMarket.i_yesToken().balanceOf(gambler2);

        // console.log("yesTokenBalanceAfterGambler1", yesTokenBalanceAfterGambler1);
        // console.log("yesTokenBalanceAfterGambler2", yesTokenBalanceAfterGambler2);

        (,,,, uint256 outstandingTokenAmountAfter,,,,) = predictionMarket.offers(0);

        // console.log("outstandingTokenAmountBefore", outstandingTokenAmountBefore);
        // console.log("outstandingTokenAmountAfter", outstandingTokenAmountAfter);
        uint256 balanceAfter = address(gambler1).balance;

        assertEq(outstandingTokenAmountBefore - outstandingTokenAmountAfter, amountToSellToBuyOrder);
    }

    function test_closeBuyOffer() public {
        test_takeBuyOffer();

        (,, uint256 chance,, uint256 outstandingTokenAmountBefore,,,,) = predictionMarket.offers(0);

        uint256 ethAmount = predictionMarket.calculateEthValue(chance, outstandingTokenAmountBefore);
        console.log("ethAmount", ethAmount);
        uint256 balanceBefore = address(gambler2).balance;
        console.log("balanceBefore", balanceBefore);

        vm.prank(gambler2);
        predictionMarket.closeBuyOffer(0);

        (,,,, uint256 outstandingTokenAmountAfter,,,,) = predictionMarket.offers(0);

        uint256 balanceAfter = address(gambler2).balance;
        console.log("balanceAfter", balanceAfter);
        // assertEq(balanceBefore - balanceAfter, outstandingTokenAmountBefore);
    }
}
