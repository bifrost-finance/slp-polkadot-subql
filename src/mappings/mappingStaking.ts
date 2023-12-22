import { SubstrateBlock, SubstrateEvent } from "@subql/types";
import { Balance, BlockNumber } from "@polkadot/types/interfaces";
import { Compact } from "@polkadot/types";
import {
  ParaAccountInfo,
  StakingBonded,
  StakingErapaid,
  StakingPayoutstarte,
  StakingUnbonded,
  StakingWithdrawn,
  StakingInfo,
} from "../types";

export async function staking(block: SubstrateBlock): Promise<void> {
  const blockNumber = (
    block.block.header.number as Compact<BlockNumber>
  ).toBigInt();
  if(Number(blockNumber) % 50 === 0){
    const result = await api.query.system.account('13YMK2eeopZtUNpeHnJ1Ws2HqMQG6Ts9PGCZYGyFbSYoZfcm');
    const balanceRecord = new ParaAccountInfo(blockNumber.toString(), blockNumber, block.timestamp);

    balanceRecord.free = (result.data.free as Balance)?.toBigInt();
    balanceRecord.reserved = (result.data.reserved as Balance)?.toBigInt();
    balanceRecord.feeFrozen = (result.data.frozen as Balance)?.toBigInt();

    const delegators = await Promise.all(
        [
          "14vtfeKAVKh1Jzb3s7e43SqZ3zB5MLsdCxZPoKDxeoCFKLu5",
          "14QkQ7wVVDRrhbC1UqHsFwKFUns1SRud94CXMWGHWB8Jhtro",
          "13hLwqcVHqjiJMbZhR9LtfdhoxmTdssi7Kp8EJaW2yfk3knK",
        ].map(async (account) => (await api.query.system.account(account)).data.free)
    ) as unknown as number[];

    // save delegators amount in miscFrozen
    balanceRecord.miscFrozen = delegators.reduce((a, c) => BigInt(a) + BigInt(c), BigInt(0)) as unknown as bigint;


    await balanceRecord.save();
  }
  // const stakingEvents = block.events.filter(
  //   (e) => e.event.section === "staking"
  // ) as unknown as SubstrateEvent[];

  // for (let stakingEvent of stakingEvents) {
  //   const {
  //     event: { data, method },
  //   } = stakingEvent;
  //   const record = new StakingInfo(blockNumber.toString() + "-" + stakingEvent.idx.toString(), blockNumber, block.timestamp, method.toString(), data.toString());
  //
  //   await record.save();
  // }

  return;
}

export async function handleStakingErapaid(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const {
    event: {
      data: [index, validator_payout, remainder],
    },
  } = event;
  const erasTotalStake = await api.query.staking.erasTotalStake(Number(index.toString()) - 1);
  const record = new StakingErapaid(`${blockNumber}-${event.idx.toString()}`, event.idx, blockNumber, event.block.timestamp);

  record.era_index = index.toString();
  record.validator_payout = (validator_payout as Balance)?.toBigInt();
  record.remainder = (remainder as Balance)?.toBigInt();
  record.total_staked = (erasTotalStake as Balance)?.toBigInt();

  await record.save();
}

export async function handleStakingBonded(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const {
    event: {
      data: [account, balance],
    },
  } = event;
  const record = new StakingBonded(`${blockNumber}-${event.idx.toString()}`, event.idx, blockNumber, event.block.timestamp);

  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakinUnbonded(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const {
    event: {
      data: [account, balance],
    },
  } = event;
  const record = new StakingUnbonded(`${blockNumber}-${event.idx.toString()}`, event.idx, blockNumber, event.block.timestamp);

  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakingWithdrawn(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const {
    event: {
      data: [account, balance],
    },
  } = event;
  const record = new StakingWithdrawn(`${blockNumber}-${event.idx.toString()}`, event.idx, blockNumber, event.block.timestamp);

  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakingPayoutstarte(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const {
    event: {
      data: [era_index, account],
    },
  } = event;
  const record = new StakingPayoutstarte(
      `${blockNumber}-${event.idx.toString()}`,
      event.idx,
      blockNumber,
      event.block.timestamp,
  );

  record.era_index = era_index.toString();
  record.account = account.toString();

  await record.save();
}