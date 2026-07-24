import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("KoriEscrow", async function () {
  const { viem, networkHelpers } = await network.create();

  const USDC = 1_000_000n;

  async function deployFixture() {
    const [owner, investor, secondInvestor, startup, verifier, safe, outsider] =
      await viem.getWalletClients();

    const mockUSDC = await viem.deployContract("MockUSDC", [
      owner.account.address,
    ]);

    const escrow = await viem.deployContract("KoriEscrow", [
      mockUSDC.address,
      safe.account.address,
      startup.account.address,
      verifier.account.address,
    ]);

    return {
      owner,
      investor,
      secondInvestor,
      startup,
      verifier,
      safe,
      outsider,
      mockUSDC,
      escrow,
    };
  }

  it("deploys MockUSDC with 6 decimals", async function () {
    const { mockUSDC } = await networkHelpers.loadFixture(deployFixture);

    assert.equal(await mockUSDC.read.name(), "Kori Mock USDC");
    assert.equal(await mockUSDC.read.symbol(), "mUSDC");
    assert.equal(await mockUSDC.read.decimals(), 6);
  });

  it("allows the owner to mint MockUSDC", async function () {
    const { investor, mockUSDC } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 1_000n * USDC]);

    assert.equal(
      await mockUSDC.read.balanceOf([investor.account.address]),
      1_000n * USDC,
    );
  });

  it("rejects MockUSDC minting by a non-owner", async function () {
    const { investor, mockUSDC } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      mockUSDC.write.mint([investor.account.address, USDC], {
        account: investor.account,
      }),
      mockUSDC,
      "OwnableUnauthorizedAccount",
    );
  });

  it("accepts deposits after investor approval", async function () {
    const { investor, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 1_000n * USDC]);
    await mockUSDC.write.approve([escrow.address, 250n * USDC], {
      account: investor.account,
    });

    await viem.assertions.emitWithArgs(
      escrow.write.deposit([250n * USDC], { account: investor.account }),
      escrow,
      "Deposited",
      [investor.account.address, 250n * USDC],
    );

    assert.equal(await mockUSDC.read.balanceOf([escrow.address]), 250n * USDC);
    assert.equal(
      await escrow.read.deposits([investor.account.address]),
      250n * USDC,
    );
    assert.equal(await escrow.read.totalDeposited(), 250n * USDC);
  });

  it("rejects zero deposits", async function () {
    const { investor, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      escrow.write.deposit([0n], { account: investor.account }),
      escrow,
      "ZeroAmount",
    );
  });

  it("rejects deposits without allowance", async function () {
    const { investor, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 1_000n * USDC]);

    await viem.assertions.revertWithCustomError(
      escrow.write.deposit([100n * USDC], { account: investor.account }),
      mockUSDC,
      "ERC20InsufficientAllowance",
    );
  });

  it("tracks multiple investor deposits", async function () {
    const { investor, secondInvestor, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 1_000n * USDC]);
    await mockUSDC.write.mint([secondInvestor.account.address, 1_000n * USDC]);

    await mockUSDC.write.approve([escrow.address, 100n * USDC], {
      account: investor.account,
    });
    await mockUSDC.write.approve([escrow.address, 300n * USDC], {
      account: secondInvestor.account,
    });

    await escrow.write.deposit([100n * USDC], { account: investor.account });
    await escrow.write.deposit([300n * USDC], {
      account: secondInvestor.account,
    });

    assert.equal(
      await escrow.read.deposits([investor.account.address]),
      100n * USDC,
    );
    assert.equal(
      await escrow.read.deposits([secondInvestor.account.address]),
      300n * USDC,
    );
    assert.equal(await escrow.read.totalDeposited(), 400n * USDC);
  });

  it("allows only the milestone verifier to update the milestone", async function () {
    const { verifier, outsider, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWithCustomError(
      escrow.write.setMilestone([true], { account: outsider.account }),
      escrow,
      "Unauthorized",
    );

    await viem.assertions.emitWithArgs(
      escrow.write.setMilestone([true], { account: verifier.account }),
      escrow,
      "MilestoneUpdated",
      [true, verifier.account.address],
    );

    assert.equal(await escrow.read.milestoneReached(), true);
  });

  it("allows the verifier to reset the milestone before release", async function () {
    const { verifier, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await escrow.write.setMilestone([true], { account: verifier.account });
    await escrow.write.setMilestone([false], { account: verifier.account });

    assert.equal(await escrow.read.milestoneReached(), false);
  });

  it("rejects release before milestone approval", async function () {
    const { investor, safe, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 100n * USDC]);
    await mockUSDC.write.approve([escrow.address, 100n * USDC], {
      account: investor.account,
    });
    await escrow.write.deposit([100n * USDC], { account: investor.account });

    await viem.assertions.revertWithCustomError(
      escrow.write.release({ account: safe.account }),
      escrow,
      "MilestoneNotReached",
    );
  });

  it("allows only Safe to release approved escrow funds", async function () {
    const { investor, startup, verifier, safe, outsider, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 500n * USDC]);
    await mockUSDC.write.approve([escrow.address, 500n * USDC], {
      account: investor.account,
    });
    await escrow.write.deposit([500n * USDC], { account: investor.account });
    await escrow.write.setMilestone([true], { account: verifier.account });

    await viem.assertions.revertWithCustomError(
      escrow.write.release({ account: outsider.account }),
      escrow,
      "Unauthorized",
    );

    await viem.assertions.emitWithArgs(
      escrow.write.release({ account: safe.account }),
      escrow,
      "FundsReleased",
      [startup.account.address, 500n * USDC],
    );

    assert.equal(await escrow.read.released(), true);
    assert.equal(await mockUSDC.read.balanceOf([escrow.address]), 0n);
    assert.equal(
      await mockUSDC.read.balanceOf([startup.account.address]),
      500n * USDC,
    );
  });

  it("rejects double release and deposits after release", async function () {
    const { investor, verifier, safe, mockUSDC, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await mockUSDC.write.mint([investor.account.address, 500n * USDC]);
    await mockUSDC.write.approve([escrow.address, 500n * USDC], {
      account: investor.account,
    });
    await escrow.write.deposit([250n * USDC], { account: investor.account });
    await escrow.write.setMilestone([true], { account: verifier.account });
    await escrow.write.release({ account: safe.account });

    await viem.assertions.revertWithCustomError(
      escrow.write.release({ account: safe.account }),
      escrow,
      "AlreadyReleased",
    );

    await viem.assertions.revertWithCustomError(
      escrow.write.deposit([250n * USDC], { account: investor.account }),
      escrow,
      "AlreadyReleased",
    );
  });

  it("rejects release when no funds are escrowed", async function () {
    const { verifier, safe, escrow } =
      await networkHelpers.loadFixture(deployFixture);

    await escrow.write.setMilestone([true], { account: verifier.account });

    await viem.assertions.revertWithCustomError(
      escrow.write.release({ account: safe.account }),
      escrow,
      "NoFunds",
    );
  });
});
