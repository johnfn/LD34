class Group<T extends Sprite> {
  private _length: number = 0;

  private _dict: { [key: string]: T } = {};

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
    this._length++;
  }

  remove(member: T): void {
    delete this._dict[member.hash];
    this._length--;
  }

  contains(member: T): boolean {
    return !!this._dict[member.hash];
  }

  items(): T[] {
    const vals: T[] = [];

    for (var k in this._dict) {
      vals.push(this._dict[k]);
    }

    return vals;
  }

  length(): number {
    return this._length;
  }
}
