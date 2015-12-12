class Group<T> {
  private _length: number = 0;

  private _dict: MagicDict<T, boolean>;

  constructor(members: MagicArray<T> = null) {
    this._dict = new MagicDict<T, boolean>();

    if (members !== null) {
      for (const m of members) {
        this.add(m);
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

  all(): T[] {
    return this._dict.keys();
  }

  length(): number {
    return this._dict.length();
  }
}
