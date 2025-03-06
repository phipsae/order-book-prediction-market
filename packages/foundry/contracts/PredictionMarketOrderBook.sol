//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionTokenOrderBook } from "./PredictionOptionTokenOrderBook.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { console } from "forge-std/console.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// TODO: ONLY FOR YES TOKEN RIGHT NOW!
contract PredictionMarketOrderBook is Ownable {
    using Strings for uint256;

    enum Result {
        YES,
        NO
    }

    string public constant QUESTION = "Is the price of ETH going to be above $10,000 in 30 days?";
    string[2] public RESULTS = ["Yes", "No"];
    uint256 public constant PRECISION = 1e18;
    uint256 public constant TOKEN_VALUE = 0.01 ether; // per token

    PredictionOptionTokenOrderBook public immutable i_yesToken;
    PredictionOptionTokenOrderBook public immutable i_noToken;
    address public immutable i_oracle;

    uint256 public s_positionId = 0;
    uint256 public s_offerId = 0;
    bool public s_isReported;
    address public s_winningToken;
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
        uint256 ethAmount;
        bool isBuyOffer;
    }

    Position[] public positions;
    Offer[] public offers;

    event PositionCreated(uint256 indexed offerId, address creator, uint256 chance, uint256 amount);
    event PositionTaken(uint256 indexed offerId, uint256 indexed chance, uint256 indexed ethAmount, address taker);
    event OfferCreated(uint256 indexed offerId, address creator, uint256 chance, uint256 amount);
    event BuyOfferCreated(uint256 indexed offerId, address creator, uint256 chance, uint256 amount, uint256 ethAmount);
    event OfferTaken(uint256 indexed offerId, uint256 indexed chance, uint256 indexed ethAmount, address taker);
    event BuyOfferTaken(uint256 indexed offerId, uint256 indexed chance, uint256 indexed tokenAmount, address taker);
    event OfferClosed(uint256 indexed offerId, address closer);
    event BuyOfferClosed(uint256 indexed offerId, address closer);
    event PositionClosed(uint256 indexed positionId, address closer);

    constructor(address _oracle) Ownable(msg.sender) {
        i_yesToken = new PredictionOptionTokenOrderBook("Yes Token", "YES");
        i_noToken = new PredictionOptionTokenOrderBook("No Token", "NO");
        i_oracle = _oracle;
    }

    ////////////////////////////////
    /// Position functions /////////
    ////////////////////////////////

    function createPosition(uint256 _chance) public payable {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");

        uint256 tokenAmount = calculateTokenAmount(_chance, msg.value);
        uint256 matchingETHAmount = calculateMatchingETHValue(_chance, tokenAmount);
        console.log("matchingETHAmount", matchingETHAmount);

        // Store the offer details
        Position memory newPosition = Position({
            id: s_positionId,
            creator: msg.sender,
            chance: _chance,
            ethAmount: msg.value,
            matchingETHAmount: matchingETHAmount,
            tokenAmount: tokenAmount,
            isActive: true
        });

        positions.push(newPosition);
        emit PositionCreated(s_positionId, msg.sender, _chance, msg.value);
        s_positionId++;
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
        emit PositionTaken(_positionId, position.chance, position.ethAmount, msg.sender);
    }

    function closePosition(uint256 _positionId) external {
        require(_positionId < positions.length, "Position does not exist");
        Position storage position = positions[_positionId];
        require(position.isActive, "Position is not active");
        require(position.creator == msg.sender, "Only creator can close position");
        position.isActive = false;
        emit PositionClosed(_positionId, msg.sender);
        uint256 ethAmount = position.ethAmount;
        (bool success,) = position.creator.call{ value: ethAmount }("");
        require(success, "ETH transfer failed");
    }

    ////////////////////////////////
    /// Sell offer functions ////////
    ////////////////////////////////

    function createSellOffer(uint256 _chance, uint256 tokenAmount) public {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(tokenAmount > 0, "Must send tokens to create offer");

        Offer memory newOffer = Offer({
            id: s_offerId,
            creator: msg.sender,
            chance: _chance,
            tokenAmount: tokenAmount,
            isActive: true,
            ethAmount: 0,
            isBuyOffer: false
        });
        offers.push(newOffer);
        yesTokenBalance[msg.sender] += tokenAmount;

        i_yesToken.transferFrom(msg.sender, address(this), tokenAmount);
        emit OfferCreated(s_offerId, msg.sender, _chance, tokenAmount);
        s_offerId++;
    }

    function takeSellOffer(uint256 _offerId) external payable {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        uint256 ethAmount = calculateEthValue(offer.chance, offer.tokenAmount);
        console.log("ethAmount", ethAmount);
        require(msg.value == ethAmount, "Must match offer amount");

        i_yesToken.transfer(msg.sender, offer.tokenAmount);

        offer.isActive = false;
        emit OfferTaken(_offerId, offer.chance, ethAmount, msg.sender);
        (bool success,) = offer.creator.call{ value: msg.value }("");
        require(success, "ETH transfer failed");
    }

    function closeSellOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.creator == msg.sender, "Only creator can close offer");
        offer.isActive = false;
        emit OfferClosed(_offerId, msg.sender);
        i_yesToken.transfer(offer.creator, offer.tokenAmount);
    }

    ////////////////////////////////
    /// Buy offer functions ///////////
    ////////////////////////////////

    function createBuyOffer(uint256 _chance) public payable {
        /// add some ether to the contract matching the token amount
        /// store the offer details
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");
        console.log("msg.value", msg.value);
        console.log("msg.sender", msg.sender);

        uint256 tokenAmount = calculateTokenAmount(_chance, msg.value);
        Offer memory newOffer = Offer({
            id: s_offerId,
            creator: msg.sender,
            chance: _chance,
            tokenAmount: tokenAmount,
            isActive: true,
            ethAmount: msg.value,
            isBuyOffer: true
        });
        offers.push(newOffer);

        emit BuyOfferCreated(s_offerId, msg.sender, _chance, tokenAmount, msg.value);
        s_offerId++;
    }

    function takeBuyOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.isBuyOffer, "Offer is not a buy offer");
        uint256 tokenAmount = offer.tokenAmount;
        uint256 tokenBalance = i_yesToken.balanceOf(msg.sender);
        require(tokenBalance >= tokenAmount, "Insufficient balance");

        // Transfer tokens from msg.sender to offer creator
        i_yesToken.transferFrom(msg.sender, offer.creator, tokenAmount);

        // Transfer ETH from contract to msg.sender in return
        (bool success,) = msg.sender.call{ value: offer.ethAmount }("");
        require(success, "ETH transfer failed");

        offer.isActive = false;
        emit BuyOfferTaken(_offerId, offer.chance, offer.tokenAmount, msg.sender);
    }

    function closeBuyOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.isBuyOffer, "Offer is not a buy offer");
        require(offer.creator == msg.sender, "Only creator can close offer");
        offer.isActive = false;
        (bool success,) = msg.sender.call{ value: offer.ethAmount }("");
        require(success, "ETH transfer failed");
        emit BuyOfferClosed(_offerId, msg.sender);
    }

    /////////////////////////
    /// Helper functions ///
    /////////////////////////

    /**
     * @notice Calculate the matching ETH amount needed for a given probability
     * @param _tokenAmount The token amount to match against
     * @param _chance The probability percentage (1-100)
     * @return The required ETH amount to match the given probability
     */
    function calculateMatchingETHValue(uint256 _chance, uint256 _tokenAmount) public pure returns (uint256) {
        uint256 counterChance = 100 - _chance;
        uint256 matchingAmount = (TOKEN_VALUE * _tokenAmount * counterChance) / (PRECISION * 100);
        return matchingAmount;
    }

    function calculateEthValue(uint256 _chance, uint256 _tokenAmount) public pure returns (uint256) {
        return _tokenAmount * TOKEN_VALUE * _chance / (PRECISION * 100);
    }

    function calculateTokenAmount(uint256 _chance, uint256 _ethAmount) public pure returns (uint256) {
        return (_ethAmount * PRECISION * 100) / (TOKEN_VALUE * _chance);
    }

    ///////////////////////
    /// Getter functions ///
    ///////////////////////

    function prediction()
        external
        view
        returns (
            string memory question,
            string memory outcome1,
            string memory outcome2,
            address oracle,
            uint256 initialTokenValue,
            uint256 token1Reserve,
            uint256 token2Reserve,
            bool isReported,
            address yesTokenAddress,
            address noTokenAddress,
            address predictionMarketOwner,
            address winningToken
        )
    {
        question = QUESTION;
        outcome1 = i_yesToken.name();
        outcome2 = i_noToken.name();
        oracle = i_oracle;
        initialTokenValue = TOKEN_VALUE;
        token1Reserve = i_yesToken.balanceOf(address(this));
        token2Reserve = i_noToken.balanceOf(address(this));
        isReported = s_isReported;
        yesTokenAddress = address(i_yesToken);
        noTokenAddress = address(i_noToken);
        predictionMarketOwner = owner();
        winningToken = address(s_winningToken);
    }
}
