import { TransactionType } from "./transaction-type.enum";

export class Transaction {
  constructor(
    public readonly date: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly balance: number
  ) {
    Object.freeze(this);
  }

  /**
   * Retourne le montant signé selon le type de transaction
   * Dépôt: positif, Retrait: négatif
   */
  getSignedAmount(): number {
    return this.type === TransactionType.DEPOSIT ? this.amount : -this.amount;
  }
}