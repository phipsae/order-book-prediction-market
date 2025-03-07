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

    /////////////////
    /// Errors //////
    /////////////////

    error PredictionMarketOrderBook__PredictionAlreadyResolved();
    error PredictionMarketOrderBook__InvalidOption();
    error PredictionMarketOrderBook__OnlyOracleCanReport();
    error PredictionMarketOrderBook__AmountMustBeGreaterThanZero();
    error PredictionMarketOrderBook__PredictionNotResolved();
    error PredictionMarketOrderBook__InsufficientWinningTokens();
    error PredictionMarketOrderBook__ETHTransferFailed();

    //////////////////////////
    /// State Variables //////
    //////////////////////////

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
    PredictionOptionTokenOrderBook public s_winningToken;

    mapping(address => uint256) public yesTokenBalance; // not sure if this is needed
    mapping(address => uint256) public noTokenBalance; // not sure if this is needed

    struct Position {
        uint256 id;
        address creator;
        uint256 chance;
        uint256 ethAmount;
        uint256 matchingETHAmount;
        uint256 tokenAmount;
        bool isActive;
        Result result;
    }

    struct Offer {
        uint256 id;
        address creator;
        uint256 chance;
        uint256 initialTokenAmount; //initial token amount, do I even need this? Maybe to calculate some probabilities?
        uint256 outstandingTokenAmount; //token amount left to be taken
        bool isActive;
        uint256 ethAmount;
        bool isBuyOffer;
        Result result;
    }

    Position[] public positions;
    Offer[] public offers;

    /////////////////////////
    /// Evens ///
    /////////////////////////

    event PositionCreated(
        uint256 indexed offerId, Result indexed result, address creator, uint256 chance, uint256 amount
    );
    event PositionTaken(
        uint256 indexed offerId, Result indexed result, uint256 indexed chance, uint256 ethAmount, address taker
    );
    event SellOfferCreated(
        uint256 indexed offerId, Result indexed result, address creator, uint256 chance, uint256 amount
    );
    event BuyOfferCreated(
        uint256 indexed offerId,
        Result indexed result,
        address creator,
        uint256 chance,
        uint256 amount,
        uint256 ethAmount
    );
    event SellOfferTaken(
        uint256 indexed offerId, Result indexed result, uint256 indexed chance, uint256 ethAmount, address taker
    );
    event BuyOfferTaken(
        uint256 indexed offerId, Result indexed result, uint256 indexed chance, uint256 tokenAmount, address taker
    );
    event OfferClosed(uint256 indexed offerId, address closer);
    event BuyOfferClosed(uint256 indexed offerId, address closer);
    event PositionClosed(uint256 indexed positionId, address closer);
    event MarketReported(address indexed oracle, Result indexed winningOption, address indexed winningToken);
    event WinningTokensRedeemed(address indexed redeemer, uint256 amount, uint256 ethReceived);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyPredictionOpen() {
        if (s_isReported) {
            revert PredictionMarketOrderBook__PredictionAlreadyResolved();
        }
        _;
    }

    modifier withValidOption(Result _option) {
        if (_option != Result.YES && _option != Result.NO) {
            revert PredictionMarketOrderBook__InvalidOption();
        }
        _;
    }

    /////////////////
    /// Functions ///
    /////////////////

    constructor(address _oracle) Ownable(msg.sender) {
        i_yesToken = new PredictionOptionTokenOrderBook("Yes Token", "YES");
        i_noToken = new PredictionOptionTokenOrderBook("No Token", "NO");
        i_oracle = _oracle;
    }

    ////////////////////////////////
    /// Position functions /////////
    ////////////////////////////////

    function createPosition(Result _result, uint256 _chance) public payable {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");

        uint256 tokenAmount = calculateTokenAmount(_chance, msg.value);
        uint256 matchingETHAmount = calculateMatchingETHValue(_chance, tokenAmount);

        // Store the offer details
        Position memory newPosition = Position({
            id: s_positionId,
            creator: msg.sender,
            chance: _chance,
            ethAmount: msg.value,
            matchingETHAmount: matchingETHAmount,
            tokenAmount: tokenAmount,
            isActive: true,
            result: _result
        });

        positions.push(newPosition);
        emit PositionCreated(s_positionId, _result, msg.sender, _chance, msg.value);
        s_positionId++;
    }

    function takePosition(uint256 _positionId) external payable {
        require(_positionId < positions.length, "Position does not exist");
        Position storage position = positions[_positionId];
        require(position.isActive, "Position is not active");
        require(msg.value == position.matchingETHAmount, "Must match position amount");
        Result result = position.result;

        // Mint tokens for both parties
        if (result == Result.YES) {
            i_yesToken.mint(position.creator, position.tokenAmount);
            i_noToken.mint(msg.sender, position.tokenAmount);
        } else {
            i_noToken.mint(position.creator, position.tokenAmount);
            i_yesToken.mint(msg.sender, position.tokenAmount);
        }

        position.isActive = false;
        emit PositionTaken(_positionId, result, position.chance, position.ethAmount, msg.sender);
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

    function createSellOffer(Result _result, uint256 _chance, uint256 initialTokenAmount) public {
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(initialTokenAmount > 0, "Must send tokens to create offer");

        Offer memory newOffer = Offer({
            id: s_offerId,
            creator: msg.sender,
            chance: _chance,
            initialTokenAmount: initialTokenAmount,
            outstandingTokenAmount: initialTokenAmount,
            isActive: true,
            ethAmount: 0,
            isBuyOffer: false,
            result: _result
        });
        offers.push(newOffer);
        if (_result == Result.YES) {
            yesTokenBalance[msg.sender] += initialTokenAmount;
            i_yesToken.transferFrom(msg.sender, address(this), initialTokenAmount);
        } else {
            noTokenBalance[msg.sender] += initialTokenAmount;
            i_noToken.transferFrom(msg.sender, address(this), initialTokenAmount);
        }

        emit SellOfferCreated(s_offerId, newOffer.result, msg.sender, _chance, initialTokenAmount);
        s_offerId++;
    }

    function takeSellOffer(uint256 _offerId) external payable {
        require(_offerId < offers.length, "Offer does not exist");
        require(msg.value > 0, "Must send ETH to take offer");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        /// calculate token amount to be taken
        uint256 tokenAmount = calculateTokenAmount(offer.chance, msg.value);
        require(tokenAmount <= offer.outstandingTokenAmount, "Insufficient outstanding token amount");

        if (offer.result == Result.YES) {
            i_yesToken.transfer(msg.sender, tokenAmount);
        } else {
            i_noToken.transfer(msg.sender, tokenAmount);
        }

        offer.outstandingTokenAmount -= tokenAmount;
        if (offer.outstandingTokenAmount == 0) {
            offer.isActive = false;
        }
        emit SellOfferTaken(_offerId, offer.result, offer.chance, msg.value, msg.sender);
        (bool success,) = offer.creator.call{ value: msg.value }("");
        require(success, "ETH transfer failed");
    }

    function closeSellOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.creator == msg.sender, "Only creator can close offer");
        offer.isActive = false;
        uint256 returnTokenAmount = offer.outstandingTokenAmount;
        offer.outstandingTokenAmount = 0;

        emit OfferClosed(_offerId, msg.sender);
        if (offer.result == Result.YES) {
            i_yesToken.transfer(offer.creator, returnTokenAmount);
        } else {
            i_noToken.transfer(offer.creator, returnTokenAmount);
        }
    }

    ////////////////////////////////
    /// Buy offer functions ///////////
    ////////////////////////////////

    function createBuyOffer(Result _result, uint256 _chance) public payable {
        /// add some ether to the contract matching the token amount
        /// store the offer details
        require(_chance > 0 && _chance <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");

        uint256 tokenAmount = calculateTokenAmount(_chance, msg.value);
        Offer memory newOffer = Offer({
            id: s_offerId,
            creator: msg.sender,
            chance: _chance,
            initialTokenAmount: tokenAmount,
            outstandingTokenAmount: tokenAmount,
            isActive: true,
            ethAmount: msg.value,
            isBuyOffer: true,
            result: _result
        });
        offers.push(newOffer);

        emit BuyOfferCreated(s_offerId, newOffer.result, msg.sender, _chance, tokenAmount, msg.value);
        s_offerId++;
    }

    function takeBuyOffer(uint256 _offerId, uint256 _tokenAmount) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.isBuyOffer, "Offer is not a buy offer");
        require(_tokenAmount <= offer.outstandingTokenAmount, "Insufficient outstanding token amount");
        offer.outstandingTokenAmount -= _tokenAmount;
        if (offer.result == Result.YES) {
            uint256 tokenBalance = i_yesToken.balanceOf(msg.sender);
            require(tokenBalance >= _tokenAmount, "Insufficient balance");
            i_yesToken.transferFrom(msg.sender, offer.creator, _tokenAmount);
        } else {
            uint256 tokenBalance = i_noToken.balanceOf(msg.sender);
            require(tokenBalance >= _tokenAmount, "Insufficient balance");
            i_noToken.transferFrom(msg.sender, offer.creator, _tokenAmount);
        }
        if (offer.outstandingTokenAmount == 0) {
            offer.isActive = false;
        }

        // Transfer ETH from contract to msg.sender in return
        (bool success,) = msg.sender.call{ value: offer.ethAmount }("");
        require(success, "ETH transfer failed");

        emit BuyOfferTaken(_offerId, offer.result, offer.chance, _tokenAmount, msg.sender);
    }

    function closeBuyOffer(uint256 _offerId) external {
        require(_offerId < offers.length, "Offer does not exist");
        Offer storage offer = offers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(offer.isBuyOffer, "Offer is not a buy offer");
        require(offer.creator == msg.sender, "Only creator can close offer");
        uint256 ethAmount = calculateEthValue(offer.chance, offer.outstandingTokenAmount);
        offer.outstandingTokenAmount = 0;
        offer.isActive = false;
        (bool success,) = offer.creator.call{ value: ethAmount }("");
        require(success, "ETH transfer failed");
        emit BuyOfferClosed(_offerId, msg.sender);
    }

    /////////////////////////
    /// Reporting functions ///
    /////////////////////////

    /**
     * @notice Report the winning option for the prediction
     * @param _winningOption The winning option (YES or NO)
     */
    function report(Result _winningOption) external onlyPredictionOpen withValidOption(_winningOption) {
        if (msg.sender != i_oracle) {
            revert PredictionMarketOrderBook__OnlyOracleCanReport();
        }
        // Set winning option
        s_winningToken = _winningOption == Result.YES ? i_yesToken : i_noToken;
        s_isReported = true;
        emit MarketReported(msg.sender, _winningOption, address(s_winningToken));
    }

    /////////////////////////
    /// Helper functions ///
    /////////////////////////
    /**
     * @notice Redeem winning tokens for ETH after prediction is resolved, winning tokens are burned and user receives ETH
     * @param _amount The amount of winning tokens to redeem
     */
    function redeemWinningTokens(uint256 _amount) external {
        if (_amount == 0) {
            revert PredictionMarketOrderBook__AmountMustBeGreaterThanZero();
        }

        if (!s_isReported) {
            revert PredictionMarketOrderBook__PredictionNotResolved();
        }

        if (s_winningToken.balanceOf(msg.sender) <= _amount) {
            revert PredictionMarketOrderBook__InsufficientWinningTokens();
        }

        uint256 ethToReceive = (_amount * TOKEN_VALUE) / PRECISION;

        s_winningToken.burn(msg.sender, _amount);

        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        if (!success) {
            revert PredictionMarketOrderBook__ETHTransferFailed();
        }

        emit WinningTokensRedeemed(msg.sender, _amount, ethToReceive);
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
