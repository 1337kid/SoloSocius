export const remoteFetch = async (destination: string) => {
  return await fetch(destination, {
    headers: { Accept: "application/activity+json" },
  });
};
