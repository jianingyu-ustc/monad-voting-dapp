import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract - Voting DApp", function () {
  let yourContract: YourContract;
  let owner: any;
  let voter1: any;
  let voter2: any;

  before(async () => {
    [owner, voter1, voter2] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(owner.address)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await yourContract.owner()).to.equal(owner.address);
    });

    it("Should have zero topics initially", async function () {
      expect(await yourContract.getTopicCount()).to.equal(0);
    });
  });

  describe("Topic Creation", function () {
    it("Should create a new topic", async function () {
      const title = "Test Topic";
      const options = ["Option A", "Option B"];

      await yourContract.createTopic(title, options);

      expect(await yourContract.getTopicCount()).to.equal(1);

      const topic = await yourContract.getTopic(0);
      expect(topic.title).to.equal(title);
      expect(topic.options.length).to.equal(2);
      expect(topic.options[0]).to.equal("Option A");
      expect(topic.options[1]).to.equal("Option B");
      expect(topic.creator).to.equal(owner.address);
    });

    it("Should reject empty title", async function () {
      await expect(yourContract.createTopic("", ["Option A", "Option B"])).to.be.revertedWith("Title cannot be empty");
    });

    it("Should reject less than 2 options", async function () {
      await expect(yourContract.createTopic("Test", ["Option A"])).to.be.revertedWith("Must have at least 2 options");
    });

    it("Should reject more than 10 options", async function () {
      const options = Array(11).fill("Option");
      await expect(yourContract.createTopic("Test", options)).to.be.revertedWith("Cannot have more than 10 options");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Create a topic before each vote test
      await yourContract.createTopic("Vote Test", ["Yes", "No"]);
    });

    it("Should allow voting with exact 0.001 ether", async function () {
      const voteAmount = ethers.parseEther("0.001");

      await expect(yourContract.connect(voter1).vote(0, 0, { value: voteAmount })).to.emit(yourContract, "VoteCast");

      const topic = await yourContract.getTopic(0);
      expect(topic.voteCounts[0]).to.equal(1);
      expect(topic.totalVotes).to.equal(1);
      const hasVoted = await yourContract.checkHasVoted(0, voter1.address);
      expect(hasVoted).to.be.true;
    });

    it("Should reject voting with wrong amount", async function () {
      const wrongAmount = ethers.parseEther("0.002");

      await expect(yourContract.connect(voter1).vote(0, 0, { value: wrongAmount })).to.be.revertedWith(
        "Must send exactly 0.001 MON to vote",
      );
    });

    it("Should reject voting without payment", async function () {
      await expect(yourContract.connect(voter1).vote(0, 0, { value: 0 })).to.be.revertedWith(
        "Must send exactly 0.001 MON to vote",
      );
    });

    it("Should prevent double voting", async function () {
      const voteAmount = ethers.parseEther("0.001");

      await yourContract.connect(voter1).vote(0, 0, { value: voteAmount });

      await expect(yourContract.connect(voter1).vote(0, 1, { value: voteAmount })).to.be.revertedWith(
        "Already voted on this topic",
      );
    });

    it("Should allow multiple voters", async function () {
      const voteAmount = ethers.parseEther("0.001");

      await yourContract.connect(voter1).vote(0, 0, { value: voteAmount });
      await yourContract.connect(voter2).vote(0, 1, { value: voteAmount });

      const topic = await yourContract.getTopic(0);
      expect(topic.voteCounts[0]).to.equal(1);
      expect(topic.voteCounts[1]).to.equal(1);
      expect(topic.totalVotes).to.equal(2);
    });
  });

  describe("Withdraw", function () {
    it("Should allow owner to withdraw", async function () {
      // Create topic and vote to accumulate funds
      await yourContract.createTopic("Withdraw Test", ["Yes", "No"]);
      const voteAmount = ethers.parseEther("0.001");
      await yourContract.connect(voter1).vote(1, 0, { value: voteAmount });

      const contractBalance = await ethers.provider.getBalance(await yourContract.getAddress());

      await yourContract.withdraw();

      // Note: balance check might be approximate due to gas costs
      expect(contractBalance).to.equal(voteAmount);
    });

    it("Should reject withdraw from non-owner", async function () {
      await expect(yourContract.connect(voter1).withdraw()).to.be.revertedWith("Not the Owner");
    });
  });
});
