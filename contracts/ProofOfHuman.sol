// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import {CountryCodes} from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";

/**
 * @title ProofOfHuman - Aadhaar Verification Contract
 * @notice Implementation of Self Protocol verification system with special focus on Aadhaar
 * @dev Extends SelfVerificationRoot for onchain verification on Hedera Testnet
 */

contract ProofOfHuman is SelfVerificationRoot {
    // Events
    event UserVerified(
        address indexed user,
        uint256 indexed timestamp,
        string documentType,
        uint256 minimumAge,
        string nationality
    );
    
    event VerificationFailed(
        address indexed user,
        uint256 indexed timestamp,
        string reason
    );

    // Storage
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    
    // Mapping to track verified users
    mapping(address => bool) public verifiedUsers;
    mapping(address => uint256) public verificationTimestamps;
    mapping(address => string) public userNationalities;
    
    // Statistics
    uint256 public totalVerifications;
    uint256 public aadhaarVerifications;
    
    // Owner
    address private _owner;
    
    /**
     * @notice Constructor for ProofOfHuman contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeSeed Unique scope identifier for this application
     */

    constructor(
        address identityVerificationHubV2Address,
        string memory scopeSeed
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed) {
        _owner = msg.sender;
        _setupVerificationConfig(identityVerificationHubV2Address);
    }
    
    /**
     * @notice Setup verification configuration with Aadhaar-optimized settings
     * @param hubAddress Address of the verification hub
     */

    function _setupVerificationConfig(address hubAddress) private {
        
        string[] memory forbiddenCountries = new string[](3);
        forbiddenCountries[0] = CountryCodes.IRAN;
        forbiddenCountries[1] = CountryCodes.NORTH_KOREA;
        forbiddenCountries[2] = CountryCodes.RUSSIA;
        
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = 
            SelfUtils.UnformattedVerificationConfigV2({
                olderThan: 18, // Minimum age
                forbiddenCountries: forbiddenCountries,
                ofacEnabled: false // OFAC compliance
            });
        
        verificationConfig = SelfUtils.formatVerificationConfigV2(rawConfig);
        verificationConfigId = IIdentityVerificationHubV2(hubAddress)
            .setVerificationConfigV2(verificationConfig);
    }
    
    /**
     * @notice Returns the verification config ID for this contract
     * @dev Required override from SelfVerificationRoot
     */

    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
    
    /**
     * @notice Custom verification hook called after successful verification
     * @dev Required override from SelfVerificationRoot
     * @param output Verification output from the hub
     * @param userData User context data
     */

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        // Decode userData
        address user = abi.decode(userData, (address));
        
        // Mark user as verified
        verifiedUsers[user] = true;
        verificationTimestamps[user] = block.timestamp;
        
        // Store nationality if disclosed
        if (bytes(output.nationality).length > 0) {
            userNationalities[user] = output.nationality;
        }
        
        // Update statistics
        totalVerifications++;
        
        // Check if this is an Aadhaar verification (India nationality)
        if (keccak256(abi.encodePacked(output.nationality)) == 
            keccak256(abi.encodePacked("IND"))) {
            aadhaarVerifications++;
        }
        
        // Emit verification event
        emit UserVerified(
            user,
            block.timestamp,
            _getDocumentType(uint256(output.attestationId)),
            output.olderThan,
            output.nationality
        );
    }
    
    /**
     * @notice Get document type string from attestation ID
     * @param attestationId The attestation ID from verification
     * @return Document type as string
     */


    function _getDocumentType(uint256 attestationId) private pure returns (string memory) {
        if (attestationId == 1) return "E_PASSPORT";
        if (attestationId == 2) return "EU_ID_CARD";
        if (attestationId == 3) return "AADHAAR";
        return "UNKNOWN";
    }
    
    /**
     * @notice Check if a user is verified
     * @param user Address to check
     * @return Whether the user is verified
     */


    function isUserVerified(address user) external view returns (bool) {
        return verifiedUsers[user];
    }
    
    /**
     * @notice Get verification details for a user
     * @param user Address to check
     * @return isVerified Whether user is verified
     * @return timestamp When user was verified
     * @return nationality User's nationality
     */

    function getUserVerificationDetails(address user) 
        external 
        view 
        returns (bool isVerified, uint256 timestamp, string memory nationality) 
    {
        return (
            verifiedUsers[user],
            verificationTimestamps[user],
            userNationalities[user]
        );
    }
    
    /**
     * @notice Get verification statistics
     * @return total Total number of verifications
     * @return aadhaar Number of Aadhaar verifications
     */

    function getVerificationStats() 
        external 
        view 
        returns (uint256 total, uint256 aadhaar) 
    {
        return (totalVerifications, aadhaarVerifications);
    }
    
    
    
    /**
     * @notice Get the owner of the contract
     */
    function owner() public view returns (address) {
        return _owner;
    }
    
}