pragma solidity ^0.5.0;

contract CarFactory {
    uint public carCount = 0;
    mapping(uint => Car) public cars;

    struct Car {
        uint id;
        string vin;
        string model;
        uint price;
        uint odometer;
        address payable owner;
    }

    event CarCreated(
        uint id,
        string vin,
        string model,
        uint price,
        uint odometer,
        address payable owner
    );

    event CarPurchased(
        uint id,
        string vin,
        string model,
        uint price,
        uint odometer,
        address payable owner
    );

    function createCar(string memory _vin, string memory _model, uint _price) public {
        uint odometer = 0;

        require(bytes(_vin).length > 0);
        require(bytes(_model).length > 0);
        require(_price > 0);

        carCount++;
        cars[carCount] = Car(carCount, _vin, _model, _price, odometer, msg.sender);

        // Trigger an event
        emit CarCreated(carCount,  _vin, _model, _price,  odometer, msg.sender);
    }
    

    function purchaseCar(uint _id) public payable {
        Car memory _car = cars[_id];
        address payable _seller = _car.owner;

        require(_car.id > 0 && _car.id <= carCount);
        // Require that there is enough Ether in the transcation
        require(msg.value >= _car.price);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);

        // Transfer ownership to the buyer
        _car.owner = msg.sender;
        // Update the product
        cars[_id] = _car;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value); 

        emit CarPurchased(carCount, _car.vin, _car.model, _car.price, _car.odometer, msg.sender);
    }
    
    
    function changeOdometer(uint _id, uint _odometer) public payable {
        Car memory _car = cars[_id];
        address payable _owner = _car.owner;

        require(_car.id > 0 && _car.id <= carCount);
        // Require that _odometer > than old odometer entry
        require(_odometer >= _car.odometer);
        // Require that the owner is owner
        require(_owner == msg.sender);
        // Change odometer
        _car.odometer = _odometer;
        // Update the product
        cars[_id] = _car;

        emit CarPurchased(carCount, _car.vin, _car.model, _car.price, _car.odometer, msg.sender);
    }
}
