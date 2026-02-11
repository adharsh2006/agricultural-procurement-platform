const { ethers } = require("hardhat");

async function main() {
    try {
        const agriProcure = await ethers.deployContract("AgriProcure");
        await agriProcure.waitForDeployment();
        console.log(`AgriProcure deployed to ${agriProcure.target}`);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

main();
