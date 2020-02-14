import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
        <div className="content">
        <h2>Create car</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const vin = this.carVin.value
          const model = this.carModel.value
          const price = window.web3.utils.toWei(this.carPrice.value.toString(), 'Ether')
          this.props.createCar(vin, model, price)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="carVin"
              type="text"
              ref={(input) => { this.carVin = input }}
              className="form-control"
              placeholder="VIN"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="carModel"
              type="text"
              ref={(input) => { this.carModel = input }}
              className="form-control"
              placeholder="Model"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="carPrice"
              type="text"
              ref={(input) => { this.carPrice = input }}
              className="form-control"
              placeholder="Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add car</button>
        </form>
        <p>&nbsp;</p>
        <h2>Update odometer</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const id = this.carId.value
          const odometer = this.carOdometer.value
          this.props.changeOdometer(id, odometer)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="carId"
              type="text"
              ref={(input) => { this.carId = input }}
              className="form-control"
              placeholder="Id"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="carOdometer"
              type="text"
              ref={(input) => { this.carOdometer = input }}
              className="form-control"
              placeholder="Odomcounter counter"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Change</button>
        </form>
        <p>&nbsp;</p>
        <h2>Buy car / Change owner</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">VIN</th>
              <th scope="col">Model</th>
              <th scope="col">Price</th>
              <th scope="col">Odometer</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="carList">
              { this.props.cars.map((car, key) => {
                 return(
                    <tr key={key}>
                        <th scope="row">{car.id.toString()}</th>
                        <td>{car.vin}</td>
                        <td>{car.model}</td>
                        <td>{window.web3.utils.fromWei(car.price.toString(), 'Ether')} Eth</td>
                        <td>{car.odometer.toString()}</td>
                        <td>{car.owner}</td>
                        <td>
                          { !car.purchased
                          ? <button
                              name={car.id}
                              value={car.price}
                              onClick={(event) => {
                                this.props.purchaseCar(event.target.name, event.target.value)
                            }}
                          >
                            Buy/Change
                          </button>
                          : null
                        }  
                        </td>
                    </tr>
                 )
              })}

          </tbody>
        </table>
         </div> 
    );
  }
}

export default Main;
