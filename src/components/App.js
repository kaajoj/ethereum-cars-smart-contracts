import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import Carfactory from '../abis/CarFactory.json'
import Navbar from './Navbar'
import Main from './Main'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Carfactory.networks[networkId]
    if(networkData) {
      const carfactory = web3.eth.Contract(Carfactory.abi, networkData.address)
      this.setState({ carfactory: carfactory })
      const carCount = await carfactory.methods.carCount().call()
      // Load cars
      for (var i = 1; i <= carCount; i++) {
        const car = await carfactory.methods.cars(i).call()
        this.setState({
          cars: [...this.state.cars, car]
        })
      }
      this.setState({ loading: false })

    } else {
      window.alert('CarFactory contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      carCount: 0,
      cars: [],
      loading: true
    }

    this.createCar = this.createCar.bind(this)
    this.purchaseCar = this.purchaseCar.bind(this)
    this.changeOdometer = this.changeOdometer.bind(this)
  }

  createCar(vin, model, price){
    this.setState({ loading: true })
    this.state.carfactory.methods.createCar(vin, model, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseCar(id, price){
    this.setState({ loading: true })
    this.state.carfactory.methods.purchaseCar(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  changeOdometer(id, odometer){
    this.setState({ loading: true })
    this.state.carfactory.methods.changeOdometer(id, odometer).send({ from: this.state.account, value: odometer })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading 
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> 
                : <Main
                  cars={this.state.cars} 
                  createCar={this.createCar}
                  purchaseCar={this.purchaseCar}
                  changeOdometer={this.changeOdometer} /> 
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
