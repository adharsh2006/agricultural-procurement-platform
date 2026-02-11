// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



contract AgriProcure {
    
    // REFACTORED STATUS for Real-World Workflow
    enum Status { PENDING, MINTED, BIDDING, ACCEPTED, ESCROWED, RELEASED, DISPUTED }
    enum Grade { A_PLUS, A, B, C }

    struct CropListing {
        uint id;
        address farmer;
        string cropName; 
        uint quantity;  // In Quintals (Verified by Officer)
        Grade quality;  // Verified by Officer
        uint minPrice;  // Set by Farmer
        uint highestBid;
        address highestBidder;
        Status status;
        uint256 escrowAmount; 
        bool paymentReleased;
    }

    uint public listingCount;
    mapping(uint => CropListing) public listings;
    
    address public officer; // Single officer for simplicity (or use RBAC)

    mapping(address => uint) public farmerReputation;
    mapping(address => uint) public buyerReputation;

    event CropListed(uint indexed id, address indexed farmer, string crop);
    event ProduceVerified(uint indexed id, address indexed officer, uint quantity, Grade grade);
    event NewBid(uint indexed id, address indexed bidder, uint amount);
    event EscrowLocked(uint indexed id, address indexed bidder, uint amount);
    event PaymentReleased(uint indexed id, address indexed farmer, uint amount);

    constructor() {
        officer = msg.sender; // Deployer is Officer for demo
    }

    modifier onlyOfficer() {
        require(msg.sender == officer, "Only Officer");
        _;
    }

    // --- Farmer Functions ---
    function listCrop(string memory _crop, uint _expectedQuantity, uint _minPrice) external {
        if(farmerReputation[msg.sender] == 0) farmerReputation[msg.sender] = 50; 

        listingCount++;
        listings[listingCount] = CropListing({
            id: listingCount,
            farmer: msg.sender,
            cropName: _crop,
            quantity: _expectedQuantity, // Tentative until verified
            quality: Grade.B, // Default until verified
            minPrice: _minPrice,
            highestBid: 0,
            highestBidder: address(0),
            status: Status.PENDING,
            escrowAmount: 0,
            paymentReleased: false
        });

        emit CropListed(listingCount, msg.sender, _crop);
    }

    // --- Officer Functions ---
    function verifyProduce(uint _listingId, uint _verifiedQuantity, Grade _grade) external onlyOfficer {
        CropListing storage item = listings[_listingId];
        require(item.status == Status.PENDING, "Already Verified or Invalid Status");

        item.quantity = _verifiedQuantity;
        item.quality = _grade;
        // STATUS TRANSITION: MINTED (Digital Twin Created) -> BIDDING (Open for Market)
        item.status = Status.MINTED; 
        item.status = Status.BIDDING; 

        emit ProduceVerified(_listingId, msg.sender, _verifiedQuantity, _grade);
    }

    // --- Farmer Functions (continued) ---
    function acceptBid(uint _listingId) external {
        CropListing storage item = listings[_listingId];
        require(msg.sender == item.farmer, "Only Farmer");
        require(item.status == Status.BIDDING, "Not in Bidding Phase");
        require(item.highestBid > 0, "No Bids to Accept");

        item.status = Status.ACCEPTED;
        // Emit event if needed
    }

    // --- Buyer Functions ---
    function placeBid(uint _listingId, uint _bidPerQuintal) external {
        CropListing storage item = listings[_listingId];
        require(item.status == Status.BIDDING, "Bidding Closed");
        
        // Encryption Simulation: In real ZKP, this would be a hash. 
        // Here we keep it public for the demo but UI shows "Sealed".
        require(_bidPerQuintal >= item.minPrice, "Bid Below Asking Price!");
        require(_bidPerQuintal > item.highestBid, "Bid too low");

        item.highestBid = _bidPerQuintal;
        item.highestBidder = msg.sender;

        emit NewBid(_listingId, msg.sender, _bidPerQuintal);
    }

    function depositEscrow(uint _listingId) external payable {
        CropListing storage item = listings[_listingId];
        require(msg.sender == item.highestBidder, "Not highest bidder");
        // Update: Must be ACCEPTED by Farmer first
        require(item.status == Status.ACCEPTED, "Bid not accepted by Farmer yet");
        require(msg.value == (item.highestBid * item.quantity), "Incorrect Amount"); 
        
        item.escrowAmount = msg.value;
        item.status = Status.ESCROWED;
        
        emit EscrowLocked(_listingId, msg.sender, msg.value);
    }

    // Called by BUYER to confirm receipt and release funds
    function confirmDelivery(uint _listingId) external {
        CropListing storage item = listings[_listingId];
        require(msg.sender == item.highestBidder, "Only Buyer can confirm delivery");
        require(item.status == Status.ESCROWED, "No funds in Escrow");

        uint amount = item.escrowAmount;
        item.escrowAmount = 0;
        item.status = Status.RELEASED;
        item.paymentReleased = true;

        farmerReputation[item.farmer] += 5;
        buyerReputation[item.highestBidder] += 5;

        (bool sent, ) = payable(item.farmer).call{value: amount}("");
        require(sent, "Transfer Failed");

        emit PaymentReleased(_listingId, item.farmer, amount);
    }
}
