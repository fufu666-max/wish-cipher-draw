import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFHELottery = await deploy("FHELottery", {
    from: deployer,
    log: true,
  });

  console.log(`FHELottery contract: `, deployedFHELottery.address);
};

export default func;
func.id = "deploy_fheLottery";
func.tags = ["FHELottery"];
