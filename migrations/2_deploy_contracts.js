const CarFactory = artifacts.require("CarFactory");

module.exports = function(deployer) {
  deployer.deploy(CarFactory);
};
