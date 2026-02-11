export const AGRI_PROCURE_ABI = [
    "function listCrop(string memory _crop, uint _quantity, uint _minPrice) external",
    "function verifyProduce(uint _listingId, uint _verifiedQuantity, uint8 _grade) external",
    "function placeBid(uint _listingId, uint _bidPerQuintal) external",
    "function depositEscrow(uint _listingId) external payable",
    "function confirmDelivery(uint _listingId) external",
    "function listings(uint) view returns (uint, address, string, uint, uint8, uint, uint, address, uint8, uint, bool)",
    "event CropListed(uint indexed id, address indexed farmer, string crop, uint8 grade)",
    "event NewBid(uint indexed id, address indexed bidder, uint amount)"
];

export const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
