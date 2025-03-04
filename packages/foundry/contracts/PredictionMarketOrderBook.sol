//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionTokenOrderBook } from "./PredictionOptionTokenOrderBook.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { console } from "forge-std/console.sol";

// TODO: ownable, reentrancy guard, fallback, receive
contract PredictionMarketOrderBook {
    using Strings for uint256;

    string public constant QUESTION = "Is the price of ETH going to be above $10,000 in 30 days?";
    string[2] public OPTIONS = ["Yes", "No"];
    uint256 public constant PRECISION = 1e18;
    uint256 public constant TOKEN_VALUE = 0.01 ether; // per token

    PredictionOptionTokenOrderBook public immutable i_yesToken;
    PredictionOptionTokenOrderBook public immutable i_noToken;
    address public immutable i_oracle;

    uint256 public positionId = 0;
    uint256 public offerId = 0;

    mapping(address => uint256) public yesTokenBalance;

    struct Position {
        uint256 id;
        address creator;
        uint256 chance;
        uint256 ethAmount;
        uint256 matchingETHAmount;
        uint256 tokenAmount;
        bool isActive;
    }

    struct Offer {
        uint256 id;
        address creator;
        uint256 chance;
        uint256 tokenAmount;
        bool isActive;
    }

    Position[] public positions;
    Offer[] public offers;

    event PositionCreated(uint256 indexed offerId, address creator, uint256 chance, uint256 amount);
    event PositionTaken(uint256 indexed offerId, address taker);
    event OfferCreated(uint256 indexed offerId, address creator, uint256 chance, uint256 amount);
    event OfferTaken(uint256 indexed offerId, address taker);
    event OfferClosed(uint256 indexed offerId, address closer);

    constructor(address _oracle) {
        i_yesToken = new PredictionOptionTokenOrderBook("Yes Token", "YES");
        i_noToken = new PredictionOptionTokenOrderBook("No Token", "NO");
        i_oracle = _oracle;
    }

    /// only for yes token right now!
    function createPosition(uint256 _chance) public payable {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");

        uint256 matchingETHAmount = calculateMatchingETHValue(_chance, msg.value);
        uint256 tokenAmount = calculateTokenAmount(msg.value);

        // Store the offer details
        Position memory newPosition = Position({
            id: positionId,
            creator: msg.sender,
            chance: _chance,
            ethAmount: msg.value,
            matchingETHAmount: matchingETHAmount,
            tokenAmount: tokenAmount,
            isActive: true
        });

        positions.push(newPosition);
        emit PositionCreated(positionId, msg.sender, _chance, msg.value);
        positionId++;
    }

    function takePosition(uint256 _positionId) external payable {
        require(_positionId < positions.length, "Position does not exist");
        Position storage position = positions[_positionId];
        require(position.isActive, "Position is not active");
        require(msg.value == position.matchingETHAmount, "Must match position amount");

        // Mint tokens for both parties
        i_yesToken.mint(position.creator, position.tokenAmount);
        i_noToken.mint(msg.sender, position.tokenAmount);

        position.isActive = false;
        emit PositionTaken(_positionId, msg.sender);
    }

    //// Only for yes token right now!
    function createOffer(uint256 _chance, uint256 tokenAmount) public {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(tokenAmount > 0, "Must send tokens to create offer");

        Offer memory newOffer =
            Offer({ id: offerId, creator: msg.sender, chance: _chance, tokenAmount: tokenAmount, isActive: true });
        offers.push(newOffer);
        yesTokenBalance[msg.sender] += tokenAmount;

        i_yesToken.transferFrom(msg.sender, address(this), tokenAmount);
        emit OfferCreated(offerId, msg.sender, _chance, tokenAmount);
        offerId++;
    }

    function takeOffer(uint256 _offerId) external payable {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        uint256 ethAmount = calculateEthValue(offer.tokenAmount);
        require(msg.value == ethAmount, "Must match offer amount");

        i_yesToken.transfer(msg.sender, offer.tokenAmount);

        offer.isActive = false;
        emit OfferTaken(_offerId, msg.sender);
        (bool success,) = offer.creator.call{ value: msg.value }("");
        require(success, "ETH transfer failed");
    }

    function closeOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.creator == msg.sender, "Only creator can close offer");
        offer.isActive = false;
        emit OfferClosed(_offerId, msg.sender);
        i_yesToken.transfer(offer.creator, offer.tokenAmount);
    }

    /////////////////////////
    /// Helper functions ///
    /////////////////////////

    /**
     * @notice Calculate the matching ETH amount needed for a given probability
     * @param _probability The probability percentage (1-100)
     * @param _ethToMatch The ETH amount to match against
     * @return The required ETH amount to match the given probability
     */
    function calculateMatchingETHValue(uint256 _probability, uint256 _ethToMatch) public pure returns (uint256) {
        uint256 yesProb = _probability;
        uint256 matchingAmount = ((100 - yesProb) * _ethToMatch) / yesProb;
        return matchingAmount;
    }

    function calculateEthValue(uint256 _tokenAmount) public pure returns (uint256) {
        return _tokenAmount / PRECISION * TOKEN_VALUE;
    }

    function calculateTokenAmount(uint256 _ethAmount) public pure returns (uint256) {
        return _ethAmount / TOKEN_VALUE * PRECISION;
    }
}
