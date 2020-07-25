pragma solidity 0.6;

contract Demo {
    event Echo(string message);

    function echo(string calldata message) external {
        emit Echo(message);
    }
}
