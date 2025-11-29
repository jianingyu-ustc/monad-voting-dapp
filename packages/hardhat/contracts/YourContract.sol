//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * Voting DApp Smart Contract
 * Allows users to create voting topics and cast votes with payment
 * @author Voting DApp
 */
contract YourContract {
    // State Variables
    address public immutable owner;

    // Voting System State Variables
    struct Topic {
        string title;
        string[] options;
        uint256[] voteCounts;
        address creator;
        uint256 topicId;
        uint256 totalVotes;
    }

    Topic[] public topics;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // topicId => voter => hasVoted
    uint256 public nextTopicId = 0;

    // Events
    event TopicCreated(address indexed creator, uint256 indexed topicId, string title, string[] options);
    event VoteCast(address indexed voter, uint256 indexed topicId, uint256 optionIndex, uint256 value);

    // Constructor: Called once on contract deployment
    constructor(address _owner) {
        owner = _owner;
    }

    // ============ Voting System Functions ============

    /**
     * Create a new voting topic
     * @param _title - The title of the topic
     * @param _options - Array of voting options
     * @return topicId - The ID of the created topic
     */
    function createTopic(string memory _title, string[] memory _options) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length >= 2, "Must have at least 2 options");
        require(_options.length <= 10, "Cannot have more than 10 options");

        uint256 topicId = nextTopicId;
        nextTopicId++;

        Topic storage newTopic = topics.push();
        newTopic.title = _title;
        newTopic.creator = msg.sender;
        newTopic.topicId = topicId;
        newTopic.totalVotes = 0;

        // Initialize options and vote counts
        for (uint256 i = 0; i < _options.length; i++) {
            require(bytes(_options[i]).length > 0, "Option cannot be empty");
            newTopic.options.push(_options[i]);
            newTopic.voteCounts.push(0);
        }

        emit TopicCreated(msg.sender, topicId, _title, _options);
        return topicId;
    }

    /**
     * Vote on a topic (payable function)
     * @param _topicId - The ID of the topic to vote on
     * @param _optionIndex - The index of the option to vote for
     * Requires exactly 0.001 MON to vote
     */
    function vote(uint256 _topicId, uint256 _optionIndex) public payable {
        require(_topicId < topics.length, "Topic does not exist");
        require(msg.value == 0.001 ether, "Must send exactly 0.001 MON to vote");

        Topic storage topic = topics[_topicId];
        require(!hasVoted[_topicId][msg.sender], "Already voted on this topic");
        require(_optionIndex < topic.options.length, "Invalid option index");

        hasVoted[_topicId][msg.sender] = true;
        topic.voteCounts[_optionIndex]++;
        topic.totalVotes++;

        emit VoteCast(msg.sender, _topicId, _optionIndex, msg.value);
    }

    /**
     * Get topic information
     * @param _topicId - The ID of the topic
     * @return title - The title of the topic
     * @return options - Array of options
     * @return voteCounts - Array of vote counts for each option
     * @return creator - Address of the creator
     * @return totalVotes - Total number of votes
     */
    function getTopic(
        uint256 _topicId
    )
        public
        view
        returns (
            string memory title,
            string[] memory options,
            uint256[] memory voteCounts,
            address creator,
            uint256 totalVotes
        )
    {
        require(_topicId < topics.length, "Topic does not exist");
        Topic storage topic = topics[_topicId];
        return (topic.title, topic.options, topic.voteCounts, topic.creator, topic.totalVotes);
    }

    /**
     * Check if an address has voted on a topic
     * @param _topicId - The ID of the topic
     * @param _voter - The address to check
     * @return - Whether the address has voted
     */
    function checkHasVoted(uint256 _topicId, address _voter) public view returns (bool) {
        require(_topicId < topics.length, "Topic does not exist");
        return hasVoted[_topicId][_voter];
    }

    /**
     * Get total number of topics
     * @return count - Total number of topics
     */
    function getTopicCount() public view returns (uint256) {
        return topics.length;
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     */
    function withdraw() public {
        require(msg.sender == owner, "Not the Owner");
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
