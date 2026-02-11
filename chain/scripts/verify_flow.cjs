const { ethers } = require("hardhat");

async function main() {
    const [owner, officer, farmer, buyer] = await ethers.getSigners();
    console.log("Testing with accounts:", owner.address, officer.address, farmer.address, buyer.address);

    // Deploy
    const AgriProcure = await ethers.getContractFactory("AgriProcure");
    const agriProcure = await AgriProcure.deploy();
    await agriProcure.waitForDeployment();
    console.log("AgriProcure deployed to:", await agriProcure.getAddress());

    // 1. Farmer Lists
    console.log("\n1. Listing Crop...");
    await agriProcure.connect(farmer).listCrop("Wheat", 100, 2000);
    let listing = await agriProcure.listings(1);
    console.log(`Status: ${listing.status} (Expected: 0 PENDING)`);

    // 2. Officer Verifies
    console.log("\n2. Officer Verifying...");
    // owner is officer by default
    await agriProcure.connect(owner).verifyProduce(1, 100, 1); // Grade A
    listing = await agriProcure.listings(1);
    console.log(`Status: ${listing.status} (Expected: 2 BIDDING_OPEN)`);

    // 3. Buyer Bids
    console.log("\n3. Buyer Bidding...");
    await agriProcure.connect(buyer).placeBid(1, 2100);
    listing = await agriProcure.listings(1);
    console.log(`Highest Bid: ${listing.highestBid}`);

    // 4. Buyer Escrow
    console.log("\n4. Depositing Escrow...");
    const totalAmount = BigInt(2100) * BigInt(100);
    await agriProcure.connect(buyer).depositEscrow(1, { value: totalAmount });
    listing = await agriProcure.listings(1);
    console.log(`Status: ${listing.status} (Expected: 3 LOCKED_IN_ESCROW)`);
    console.log(`Escrow Amount: ${listing.escrowAmount}`);

    // 5. Confirm Delivery
    console.log("\n5. Confirming Delivery...");
    const balanceBefore = await ethers.provider.getBalance(farmer.address);
    await agriProcure.connect(buyer).confirmDelivery(1);
    const balanceAfter = await ethers.provider.getBalance(farmer.address);

    listing = await agriProcure.listings(1);
    console.log(`Status: ${listing.status} (Expected: 4 COMPLETED)`);
    console.log(`Farmer Balance Increase: ${balanceAfter - balanceBefore}`);

    console.log("\nFlow Verification Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
