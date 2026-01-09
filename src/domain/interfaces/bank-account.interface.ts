export interface BankAccount {
  deposit(amount: number): void;
  withdraw(amount: number): void;
  printStatement(): void;
}