const CarFactory = artifacts.require('./CarFactory.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('CarFactory', ([deployer, seller, buyer]) => {
  let carfactory

  before(async () => {
    carfactory = await CarFactory.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await carfactory.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })
  })

  describe('cars', async () => {
    let result, carCount
    
    before(async () => {
      result = await carfactory.createCar('123456789', 'Fiesta', web3.utils.toWei('1', 'Ether'), { from: seller })
      carCount = await carfactory.carCount()
    })

    it('creates cars', async () => {
      // SUCCESS
      assert.equal(carCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), carCount.toNumber(), 'id is correct')
      assert.equal(event.vin, '123456789', 'vin is correct')
      assert.equal(event.model, 'Fiesta', 'Model is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      
      // FAILURE: Car must have a vin   
      await carfactory.createCar('','', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Car must have a model
      await carfactory.createCar('123456789','', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Car must have a price   
      await carfactory.createCar('123456789','Fiesta', 0, { from: seller }).should.be.rejected;
    })

    it('lists cars', async () => {
      const car = await carfactory.cars(carCount)
      assert.equal(car.id.toNumber(), carCount.toNumber(), 'id is correct')
      assert.equal(car.vin, '123456789', 'vin is correct')
      assert.equal(car.model, 'Fiesta', 'name is correct')
      assert.equal(car.price, '1000000000000000000', 'price is correct')
      assert.equal(car.owner, seller, 'owner is correct')
    })

    
    it('sells cars', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      result = await carfactory.purchaseCar(carCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), carCount.toNumber(), 'id is correct')
      assert.equal(event.vin, '123456789', 'vin is correct')
      assert.equal(event.model, 'Fiesta', 'model is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.odometer, '0', 'odometer is correct')
      assert.equal(event.owner, buyer, 'owner is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const expectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), expectedBalance.toString())

      // FAILURE: Tries to buy a car that does no exist, i.e., product must have valid id
      await carfactory.purchaseCar(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
      // FAILURE: Buyer tries to buy without enough ether
      await carfactory.purchaseCar(carCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;
      // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await carfactory.purchaseCar(carCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })


    it('change odometer', async () => {
      // SUCCESS: Owner changes odometer
      // result = await carfactory.purchaseCar(carCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
      result = await carfactory.changeOdometer(carCount, 500, { from: buyer, value: web3.utils.toWei('1', 'Ether')})

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), carCount.toNumber(), 'id is correct')
      assert.equal(event.vin, '123456789', 'vin is correct')
      assert.equal(event.odometer, '500', 'odometer is correct')

      // FAILURE: Odometer should be > than older entry
      await carfactory.changeOdometer(carCount, 300, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })


  })
})
