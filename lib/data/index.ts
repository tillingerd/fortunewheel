import type { DataRepository } from "@/lib/data/repositories";
import { MemoryDataRepository } from "@/lib/data/adapters/memory/memory-data-store";

// TODO: replace with FirebaseDataRepository once Firebase integration starts.
export const dataRepository: DataRepository = new MemoryDataRepository();
