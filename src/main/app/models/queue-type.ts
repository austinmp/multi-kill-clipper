import LeagueClient from '../apis/league-client';

const queueIdToQueueDetails: any = {};

export default async function getQueueType(queueId: number): Promise<string> {
  if (!queueIdToQueueDetails[queueId]) {
    const queueData = await LeagueClient.getQueues();
    queueData.forEach((queue: any) => {
      queueIdToQueueDetails[Number(queue.id)] = queue;
    });
  }
  return queueIdToQueueDetails[queueId].name;
};
