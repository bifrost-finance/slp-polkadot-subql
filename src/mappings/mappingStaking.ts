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
  Remarked
} from "../types";

export async function staking(block: SubstrateBlock): Promise<void> {
  const blockNumber = (
    block.block.header.number as Compact<BlockNumber>
  ).toBigInt();
  const stakingEvents = block.events.filter(
    (e) => e.event.section === "staking"
  ) as unknown as SubstrateEvent[];

  for (let stakingEvent of stakingEvents) {
    const {
      event: { data, method },
    } = stakingEvent;
    const record = new StakingInfo(
      blockNumber.toString() + "-" + stakingEvent.idx.toString()
    );
    record.block_height = blockNumber;
    record.block_timestamp = block.timestamp;
    record.method = method.toString();
    record.data = data.toString();
    await record.save();
  }
  const result = await api.query.system.account('13YMK2eeopZtUNpeHnJ1Ws2HqMQG6Ts9PGCZYGyFbSYoZfcm');
  const balanceRecord = new ParaAccountInfo(blockNumber.toString());
  balanceRecord.block_height = blockNumber;
  balanceRecord.block_timestamp = block.timestamp;
  balanceRecord.free = (result.data.free as Balance).toBigInt();
  balanceRecord.reserved =(result.data.reserved as Balance).toBigInt();
  balanceRecord.miscFrozen =(result.data.miscFrozen as Balance).toBigInt();
  balanceRecord.feeFrozen =(result.data.feeFrozen as Balance).toBigInt();

  await balanceRecord.save();
  return;
}

export async function handleStakingErapaid(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const record = new StakingErapaid(`${blockNumber}-${event.idx.toString()}`);
  const {
    event: {
      data: [index, validator_payout, remainder],
    },
  } = event;
  const erasTotalStake= await api.query.staking.erasTotalStake(Number(index.toString())-1);
  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
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
  const record = new StakingBonded(`${blockNumber}-${event.idx.toString()}`);
  const {
    event: {
      data: [account, balance],
    },
  } = event;

  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakinUnbonded(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const record = new StakingUnbonded(`${blockNumber}-${event.idx.toString()}`);
  const {
    event: {
      data: [account, balance],
    },
  } = event;

  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakingWithdrawn(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const record = new StakingWithdrawn(`${blockNumber}-${event.idx.toString()}`);
  const {
    event: {
      data: [account, balance],
    },
  } = event;

  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
  record.balance = (balance as Balance)?.toBigInt();
  record.account = account.toString();

  await record.save();
}

export async function handleStakingPayoutstarte(
  event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const record = new StakingPayoutstarte(
    `${blockNumber}-${event.idx.toString()}`
  );
  const {
    event: {
      data: [era_index, account],
    },
  } = event;

  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
  record.era_index = era_index.toString();
  record.account = account.toString();

  await record.save();
}

export async function handleRemark(
    event: SubstrateEvent
): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const record = new Remarked(`${blockNumber}-${event.idx.toString()}`);
  const {
    event: {
      data: [account, hash],
    },
  } = event;

  record.event_id = event.idx;
  record.block_height = blockNumber;
  record.block_timestamp = event.block.timestamp;
  record.account = account.toString();
  record.hash = hash.toString();

  await record.save();
}