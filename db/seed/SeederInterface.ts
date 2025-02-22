export interface Seeder {
  seed(): Promise<void>;
}
