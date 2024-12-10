const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const Voting_ = await Voting.deploy(["Mark", "Mike", "George"], 20);

  await Voting_.deployed();

  console.log(`Contract address : ${Voting_.address}`);
}

main().catch((errors) => {
  console.error(errors);
  process.exitCode = 1;
});
