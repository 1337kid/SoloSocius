import jobWorker, { JOB_TYPES } from "./index.js";

export const createUserJob = async (inboxUrl: string, activity: any) => {
  jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
    inboxUrl,
    activity,
    isSystemActor: false,
  });
};

export const createSystemUserJob = async (inboxUrl: string, activity: any) => {
  jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
    inboxUrl,
    activity,
    isSystemActor: true,
  });
};
