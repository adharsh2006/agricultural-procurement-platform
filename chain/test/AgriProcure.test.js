const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgriProcure Notary Flow", function () {
    let agriProcure;
    let owner, officer, farmer, buyer;

    before(async function () {
        [owner, officer, farmer, buyer] = await ethers.getSigners();

        // Deploy with Officer (using owner/deployer as officer for simplicity as per constructor)
        const AgriProcure = await ethers.getContractFactory("AgriProcure");
        agriProcure = await AgriProcure.deploy();
        await agriProcure.waitForDeployment();

        console.log("Deployed to:", await agriProcure.getAddress());
    });

    it("Should allow Farmer to list crop (PENDING)", async function () {
        await agriProcure.connect(farmer).listCrop("Wheat", 100, 2000); // 100 Quintals, 2000/Qt
        const listing = await agriProcure.listings(1);
        expect(listing.status).to.equal(0); // PENDING
        expect(listing.minPrice).to.equal(2000);
    });

    it("Should allow Officer to verify produce (PENDING -> BIDDING_OPEN)", async function () {
        // Grade.A is enum index 1 (A_PLUS=0, A=1, B=2, C=3)
        // Verify 100 Qt, Grade A
        await agriProcure.connect(owner).verifyProduce(1, 100, 1);
        const listing = await agriProcure.listings(1);
        expect(listing.status).to.equal(2); // BIDDING_OPEN (OFFICER_VERIFIED -> OPEN)
        expect(listing.quality).to.equal(1);
    });

    it("Should allow Buyer to place bid", async function () {
        await agriProcure.connect(buyer).placeBid(1, 2100);
        const listing = await agriProcure.listings(1);
        expect(listing.highestBid).to.equal(2100);
        expect(listing.highestBidder).to.equal(buyer.address);
    });

    it("Should allow Buyer to deposit escrow (BIDDING_OPEN -> LOCKED_IN_ESCROW)", async function () {
        const totalAmount = 2100 * 100; // 2,10,000
        await agriProcure.connect(buyer).depositEscrow(1, { value: totalAmount });

        const listing = await agriProcure.listings(1);
        expect(listing.status).to.equal(3); // LOCKED_IN_ESCROW
        expect(listing.escrowAmount).to.equal(totalAmount);
    });

    it("Should allow Buyer to confirm delivery and release funds (LOCKED -> COMPLETED)", async function () {
        const listingBefore = await agriProcure.listings(1);
        const farmerBalanceBefore = await ethers.provider.getBalance(farmer.address);

        await agriProcure.connect(buyer).confirmDelivery(1);

        const listingAfter = await agriProcure.listings(1);
        expect(listingAfter.status).to.equal(4); // COMPLETED
        expect(listingAfter.paymentReleased).to.be.true;

        const farmerBalanceAfter = await ethers.provider.getBalance(farmer.address);
        expect(farmerBalanceAfter).to.be.gt(farmerBalanceBefore);
    });
});
