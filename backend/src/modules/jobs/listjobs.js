export function makeListJobs({ jobsRepo }) {
  return async function listJobs() {
    return jobsRepo.listAll({ limit: 100, offset: 0 });
  };
}
