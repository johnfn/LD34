class Group<T> {
  private _length: number = 0;

  private _dict: MagicDict<T, boolean>;

  constructor(...members: MagicArray<T>[]) {
    this._dict = new MagicDict<T, boolean>();

    if (members !== null) {
      for (const membersList of members) {
        for (const member of membersList) {
          this.add(member);
        }
      }
    }
  }

  add(member: T): void {
    this._dict.put(member, true);
  }

  remove(member: T): void {
    this._dict.remove(member);
  }

  contains(member: T): boolean {
    return this._dict.contains(member);
  }

  items(): MagicArray<T> {
    return new MagicArray(this._dict.keys());
  }

  length(): number {
    return this._dict.length();
  }
}
