// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHELottery is SepoliaConfig {
    struct Lottery {
        uint256 id;
        address creator;
        string name;
        uint256 maxParticipants;
        uint256 participantCount;
        bool isActive;
        bool isDrawn;
        euint32 winningNumber;
        address winner;
        mapping(address => bool) participants;
        mapping(address => euint32) encryptedNumbers;
        mapping(address => uint256) participantNumbers;
    }

    uint256 public lotteryCount;
    mapping(uint256 => Lottery) public lotteries;

    event LotteryCreated(uint256 indexed lotteryId, address indexed creator, string name, uint256 maxParticipants);
    event ParticipantRegistered(uint256 indexed lotteryId, address indexed participant, euint32 encryptedNumber);
    event WinnerDrawn(uint256 indexed lotteryId, euint32 winningNumber);
    event WinnerDecrypted(uint256 indexed lotteryId, address winnerAddress, uint256 winningNumber);

    function createLottery(string memory _name, uint256 _maxParticipants) external returns (uint256) {
        require(bytes(_name).length > 0, "Lottery name cannot be empty");
        require(_maxParticipants > 0, "Max participants must be greater than 0");

        lotteryCount++;
        Lottery storage newLottery = lotteries[lotteryCount];
        newLottery.id = lotteryCount;
        newLottery.creator = msg.sender;
        newLottery.name = _name;
        newLottery.maxParticipants = _maxParticipants;
        newLottery.participantCount = 0;
        newLottery.isActive = true;
        newLottery.isDrawn = false;

        emit LotteryCreated(lotteryCount, msg.sender, _name, _maxParticipants);
        return lotteryCount;
    }

    function registerParticipant(uint256 _lotteryId, externalEuint32 _encryptedNumber, bytes calldata _inputProof) external {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
        require(lottery.isActive, "Lottery is not active");
        require(!lottery.participants[msg.sender], "Already registered");
        require(lottery.participantCount < lottery.maxParticipants, "Lottery is full");

        euint32 encryptedNumber = FHE.fromExternal(_encryptedNumber, _inputProof);
        lottery.encryptedNumbers[msg.sender] = encryptedNumber;
        lottery.participants[msg.sender] = true;
        lottery.participantCount++;

        FHE.allowThis(encryptedNumber);
        FHE.allow(encryptedNumber, msg.sender);

        emit ParticipantRegistered(_lotteryId, msg.sender, encryptedNumber);
    }

    function getParticipantNumber(uint256 _lotteryId, address _participant) external view returns (uint256) {
        return lotteries[_lotteryId].participantNumbers[_participant];
    }

    function drawWinner(uint256 _lotteryId) external {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
        require(lottery.creator == msg.sender, "Only creator can draw winner");
        require(lottery.isActive, "Lottery is not active");
        require(!lottery.isDrawn, "Winner already drawn");
        require(lottery.participantCount > 0, "No participants to draw from");

        euint32 randomEncryptedNumber = FHE.randBounded(uint32(lottery.participantCount), FHE.Euint32);
        lottery.winningNumber = randomEncryptedNumber;
        lottery.isDrawn = true;
        lottery.isActive = false;

        FHE.allowThis(lottery.winningNumber);
        FHE.allow(lottery.winningNumber, msg.sender);

        emit WinnerDrawn(_lotteryId, randomEncryptedNumber);
    }


    function getLotteryInfo(uint256 _lotteryId) external view returns (
        uint256 id,
        address creator,
        string memory name,
        uint256 maxParticipants,
        uint256 participantCount,
        bool isActive,
        bool isDrawn,
        address winner
    ) {
        Lottery storage lottery = lotteries[_lotteryId];
        return (
            lottery.id,
            lottery.creator,
            lottery.name,
            lottery.maxParticipants,
            lottery.participantCount,
            lottery.isActive,
            lottery.isDrawn,
            lottery.winner
        );
    }

    function getWinningNumber(uint256 _lotteryId) external view returns (euint32) {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.isDrawn, "Winner not yet drawn");
        return lottery.winningNumber;
    }

    function isParticipant(uint256 _lotteryId, address _participant) external view returns (bool) {
        return lotteries[_lotteryId].participants[_participant];
    }

    function getLotteryCount() external view returns (uint256) {
        return lotteryCount;
    }
}












