import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEVM } from "@fhevm/hardhat";

describe("FHELottery", function () {
  let fhevm: FHEVM;
  
  before(async function () {
    fhevm = await FHEVM.init();
  });

  it("Should create a lottery", async function () {
    const FHELottery = await ethers.getContractFactory("FHELottery");
    const lottery = await FHELottery.deploy();
    await lottery.waitForDeployment();
    
    const tx = await lottery.createLottery("Test Lottery", 10);
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
    
    const lotteryCount = await lottery.getLotteryCount();
    expect(lotteryCount).to.equal(1);
  });

  it("Should not allow creating lottery with empty name", async function () {
    const FHELottery = await ethers.getContractFactory("FHELottery");
    const lottery = await FHELottery.deploy();
    await lottery.waitForDeployment();
    
    await expect(lottery.createLottery("", 10)).to.be.revertedWith("Lottery name cannot be empty");
  });
});
