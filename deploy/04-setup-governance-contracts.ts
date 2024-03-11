import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
 
import {   ADDRESS_ZERO } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments  } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
   
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  //timeLock is kind of president who executes all the proposals which passed through governance
  //governor contract is somethibg like senates of house

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // Setting roles so that only governor can send thing to the timeLock
  // would be great to use multicall here...
  const proposerRole = await timeLock.PROPOSER_ROLE() // getting bytes of proposer role
  const executorRole = await timeLock.EXECUTOR_ROLE() // getting bytes of executeor role
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE() // getting bytes of admin role

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
  await proposerTx.wait(1)
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO) // zero address means no body can execute other than governor
  await executorTx.wait(1)
  const revokeTx = await timeLock.revokeRole(adminRole, deployer); // deployer was admin as contract is deployed by deployer
  await revokeTx.wait(1)
  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
}

export default setupContracts
setupContracts.tags = ["all", "setup"]
