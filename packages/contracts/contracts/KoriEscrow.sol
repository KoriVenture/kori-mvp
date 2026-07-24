// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title KoriEscrow
/// @notice Minimal milestone escrow for the Kori buildathon MVP.
contract KoriEscrow {
  using SafeERC20 for IERC20;

  error ZeroAddress();
  error ZeroAmount();
  error Unauthorized();
  error AlreadyReleased();
  error MilestoneNotReached();
  error NoFunds();

  IERC20 public immutable token;
  address public immutable safe;
  address public immutable startup;
  address public milestoneVerifier;

  bool public milestoneReached;
  bool public released;
  uint256 public totalDeposited;

  mapping(address investor => uint256 amount) public deposits;

  event Deposited(address indexed investor, uint256 amount);
  event MilestoneUpdated(bool reached, address indexed verifier);
  event FundsReleased(address indexed startup, uint256 amount);

  constructor(
    address token_,
    address safe_,
    address startup_,
    address milestoneVerifier_
  ) {
    if (
      token_ == address(0) ||
      safe_ == address(0) ||
      startup_ == address(0) ||
      milestoneVerifier_ == address(0)
    ) {
      revert ZeroAddress();
    }

    token = IERC20(token_);
    safe = safe_;
    startup = startup_;
    milestoneVerifier = milestoneVerifier_;
  }

  function deposit(uint256 amount) external {
    if (released) revert AlreadyReleased();
    if (amount == 0) revert ZeroAmount();

    deposits[msg.sender] += amount;
    totalDeposited += amount;

    token.safeTransferFrom(msg.sender, address(this), amount);

    emit Deposited(msg.sender, amount);
  }

  function setMilestone(bool reached) external {
    if (msg.sender != milestoneVerifier) revert Unauthorized();
    if (released) revert AlreadyReleased();

    milestoneReached = reached;

    emit MilestoneUpdated(reached, msg.sender);
  }

  function release() external {
    if (msg.sender != safe) revert Unauthorized();
    if (released) revert AlreadyReleased();
    if (!milestoneReached) revert MilestoneNotReached();

    uint256 balance = token.balanceOf(address(this));
    if (balance == 0) revert NoFunds();

    released = true;

    token.safeTransfer(startup, balance);

    emit FundsReleased(startup, balance);
  }
}
