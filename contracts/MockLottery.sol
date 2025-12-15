// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Mock Lottery contract for local testing (without FHE)
contract MockLottery {
    struct Lottery {
        uint256 id;
        address creator;
        string name;
        uint256 maxParticipants;
        uint256 participantCount;
        bool isActive;
        bool isDrawn;
        uint256 winningNumber;
        address winner;
    }

    uint256 public lotteryCount;
    mapping(uint256 => Lottery) public lotteries;
    mapping(uint256 => mapping(address => bool)) public participants;
    mapping(uint256 => mapping(address => uint256)) public participantNumbers;
    mapping(uint256 => address[]) public participantList;

    event LotteryCreated(uint256 indexed lotteryId, address indexed creator, string name, uint256 maxParticipants);
    event ParticipantRegistered(uint256 indexed lotteryId, address indexed participant, uint256 number);
    event WinnerDrawn(uint256 indexed lotteryId, uint256 winningIndex, address winner);

    function createLottery(string memory _name, uint256 _maxParticipants) external returns (uint256) {
        require(bytes(_name).length > 0, "Lottery name cannot be empty");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_maxParticipants <= 1000, "Max participants cannot exceed 1000");

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

    function registerParticipant(uint256 _lotteryId, bytes32 _number, bytes calldata) external {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
        require(lottery.isActive, "Lottery is not active");
        require(!participants[_lotteryId][msg.sender], "Already registered");
        require(lottery.participantCount < lottery.maxParticipants, "Lottery is full");

        uint256 number = uint256(_number);
        participantNumbers[_lotteryId][msg.sender] = number;
        participants[_lotteryId][msg.sender] = true;
        participantList[_lotteryId].push(msg.sender);
        lottery.participantCount++;

        emit ParticipantRegistered(_lotteryId, msg.sender, number);
    }

    function drawWinner(uint256 _lotteryId) external {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
        require(lottery.creator == msg.sender, "Only creator can draw winner");
        require(lottery.isActive, "Lottery is not active");
        require(!lottery.isDrawn, "Winner already drawn");
        require(lottery.participantCount > 0, "No participants to draw from");

        // Simple pseudo-random selection (NOT secure, only for testing)
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) %
            lottery.participantCount;

        lottery.winningNumber = randomIndex;
        lottery.winner = participantList[_lotteryId][randomIndex];
        lottery.isDrawn = true;
        lottery.isActive = false;

        emit WinnerDrawn(_lotteryId, randomIndex, lottery.winner);
    }

    function getLotteryInfo(
        uint256 _lotteryId
    )
        external
        view
        returns (
            uint256 id,
            address creator,
            string memory name,
            uint256 maxParticipants,
            uint256 participantCount,
            bool isActive,
            bool isDrawn,
            address winner
        )
    {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
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

    function getWinningNumber(uint256 _lotteryId) external view returns (bytes32) {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.id > 0, "Lottery does not exist");
        require(lottery.isDrawn, "Winner not yet drawn");
        return bytes32(lottery.winningNumber);
    }

    function isParticipant(uint256 _lotteryId, address _participant) external view returns (bool) {
        return participants[_lotteryId][_participant];
    }

    function getLotteryCount() external view returns (uint256) {
        return lotteryCount;
    }

    function getParticipantNumber(uint256 _lotteryId, address _participant) external view returns (uint256) {
        require(participants[_lotteryId][_participant], "Not a participant");
        return participantNumbers[_lotteryId][_participant];
    }
}
