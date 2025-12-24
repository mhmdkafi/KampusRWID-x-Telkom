export function makeListJobs({ jobsRepo }) {
  return async function listJobs({ limit = 10, offset = 0 } = {}) {
    return jobsRepo.listAll({ limit, offset });
  };
}
