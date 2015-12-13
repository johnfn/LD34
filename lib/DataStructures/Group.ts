class Group<T extends Sprite> {
  private _length: number = 0;

  private _dict: { [key: string]: T } = {};

  private _vals: T[] = [];

  constructor(...members: T[][]) {
    if (members !== null) {
      for (const membersList of members) {
        for (const member of membersList) {
          this.add(member);
        }
      }
    }
  }

  add(member: T): void {
    this._dict[member.hash] = member;
    this._vals.push(member);
    this._length++;
  }

  remove(member: T): void {
    delete this._dict[member.hash];
    this._vals.splice(this._vals.indexOf(member), 1);
    this._length--;
  }

  contains(member: T): boolean {
    return !!this._dict[member.hash];
  }

  items(): T[] {
    return this._vals;
  }

  length(): number {
    return this._length;
  }
}
