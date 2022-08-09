import { SubstrateEvent, SubstrateExtrinsic } from "@subql/types";
import { Remarked } from "../types";

export async function handleParaInherent(
  extrinsic: SubstrateExtrinsic
): Promise<void> {
  const { block, events } = extrinsic;
  const blockNumber = block.block.header.number.toNumber();

  const upwardMessagesReceivedEvent = events.find(
    (e) =>
      e.event.section === "ump" &&
      e.event.method === "UpwardMessagesReceived"&&
      e.event.data[0].toString() === "2001"
  ) as SubstrateEvent;
  const executedUpwardEvent = events.find(
    (e) => e.event.section === "ump" && e.event.method === "ExecutedUpward"
  ) as SubstrateEvent;
  const remarkedEvents = events.filter(
    (e) => e.event.section === "system" && e.event.method === "Remarked"
  ) as SubstrateEvent[];

  if (
    remarkedEvents.length > 0 &&
    upwardMessagesReceivedEvent &&
    executedUpwardEvent
  ) {
      await Promise.all(
        remarkedEvents.map(async (remarkedEvent) => {
          const record = new Remarked(
            blockNumber.toString() + "-" + remarkedEvent.idx.toString()
          );
          const {
            event: {
              data: [account, hash],
            },
          } = remarkedEvent;

          const {
            event: {
              data: [result_hash, result],
            },
          } = executedUpwardEvent;

          record.block_height = blockNumber;
          record.event_id = remarkedEvent.idx;
          record.block_timestamp = remarkedEvent.block.timestamp;
          record.account = account.toString();
          record.hash = hash.toString();
          record.result = result.toString();
          await record.save();
        })
      );
  }
}
