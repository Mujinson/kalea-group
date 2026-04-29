const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_MAX_ROWS = 1_000_000;

type FetchAllRowsOptions = {
  batchSize?: number;
  maxRows?: number;
};

export const fetchAllRows = async <T = any>(
  query: any,
  { batchSize = DEFAULT_BATCH_SIZE, maxRows = DEFAULT_MAX_ROWS }: FetchAllRowsOptions = {}
): Promise<T[]> => {
  const rows: T[] = [];

  for (let from = 0; from < maxRows; from += batchSize) {
    const to = Math.min(from + batchSize - 1, maxRows - 1);
    const { data, error } = await query.range(from, to);

    if (error) throw error;

    const batch = (data || []) as T[];
    rows.push(...batch);

    if (batch.length < batchSize) break;
  }

  return rows;
};