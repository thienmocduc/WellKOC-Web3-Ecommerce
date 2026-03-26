const { ethers, upgrades } = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();
  const net = (await ethers.provider.getNetwork()).name;
  const bal = ethers.formatEther(await ethers.provider.getBalance(deployer.address));
  console.log(`\n🚀 WellKOC Contracts Deploying...\n   Deployer: ${deployer.address}\n   Network:  ${net}\n   Balance:  ${bal} MATIC\n`);
  const TREASURY = process.env.PLATFORM_TREASURY || deployer.address;

  console.log("1/5 CommissionDistributor (UUPS)...");
  const CD = await ethers.getContractFactory("CommissionDistributor");
  const cd = await upgrades.deployProxy(CD,[deployer.address,deployer.address,TREASURY],{kind:"uups"});
  await cd.waitForDeployment();
  const cdAddr = await cd.getAddress();

  console.log("2/5 DPPFactory...");
  const DPP = await ethers.getContractFactory("DPPFactory");
  const dpp = await DPP.deploy(deployer.address, deployer.address);
  await dpp.waitForDeployment();
  const dppAddr = await dpp.getAddress();

  console.log("3/5 WKToken...");
  const WK = await ethers.getContractFactory("WKToken");
  const wk = await WK.deploy(deployer.address);
  await wk.waitForDeployment();
  const wkAddr = await wk.getAddress();

  console.log("4/5 ReputationNFT...");
  const REP = await ethers.getContractFactory("ReputationNFT");
  const rep = await REP.deploy(deployer.address, deployer.address);
  await rep.waitForDeployment();
  const repAddr = await rep.getAddress();

  console.log("5/5 CreatorTokenFactory...");
  const CTF = await ethers.getContractFactory("CreatorTokenFactory");
  const ctf = await CTF.deploy();
  await ctf.waitForDeployment();
  const ctfAddr = await ctf.getAddress();

  console.log(`\n✅ ALL CONTRACTS DEPLOYED\n`);
  console.log(`COMMISSION_CONTRACT_ADDRESS=${cdAddr}`);
  console.log(`DPP_FACTORY_ADDRESS=${dppAddr}`);
  console.log(`WK_TOKEN_ADDRESS=${wkAddr}`);
  console.log(`REPUTATION_NFT_ADDRESS=${repAddr}`);
  console.log(`CREATOR_TOKEN_FACTORY=${ctfAddr}`);
  console.log(`\n📝 Add these to your .env file!`);
}
main().catch(e=>{console.error(e);process.exit(1)});
