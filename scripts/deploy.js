const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const Voting_ = await Voting.deploy(["Duy", "Quân", "A", "Uy"], 3);

  await Voting_.deployed();

  console.log(`Contract address : ${Voting_.address}`);
}

main().catch((errors) => {
  console.error(errors);
  process.exitCode = 1;
});
