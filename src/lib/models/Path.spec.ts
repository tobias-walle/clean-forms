import {
  asPath,
  combinePaths,
  getPathAsString,
  getPathSegments,
  path,
  pathSegmentsAsPath,
  pathStringAsPath,
} from './Path';

interface MyObject {
  a: {
    b?: {
      c: number;
    };
    d: string;
    e: MySubObject;
  };
}

interface MySubObject {
  x: {
    y: boolean;
  };
}

describe('Path', () => {
  it('should create typesafe path of an object', () => {
    const p = path<MyObject>().a.b.c;

    expect(getPathSegments(p)).toEqual(['a', 'b', 'c']);
    expect(getPathAsString(p)).toEqual('a.b.c');
  });

  it('should work with empty path', () => {
    const p = path<MyObject>();

    expect(getPathSegments(p)).toEqual([]);
    expect(getPathAsString(p)).toEqual('');
  });

  it('should be immutable', () => {
    const p1 = path<MyObject>().a;
    const p2 = p1.b;
    const p3 = p1.d;

    expect(getPathSegments(p1)).toEqual(['a']);
    expect(getPathSegments(p2)).toEqual(['a', 'b']);
    expect(getPathSegments(p3)).toEqual(['a', 'd']);
  });
});

describe('asPath', () => {
  it('should convert path like types to path', () => {
    expect(getPathSegments(asPath('a.b'))).toEqual(['a', 'b']);
    expect(getPathSegments(asPath('a[0].b'))).toEqual(['a', '0', 'b']);
    expect(getPathSegments(asPath(['e', 'd']))).toEqual(['e', 'd']);
    expect(getPathSegments(asPath(path<any>().f.g.h))).toEqual(['f', 'g', 'h']);
  });
});

describe('pathSegmentsAsPath', () => {
  it('should create path from array', () => {
    const segments = ['a', 'b'];
    const p = pathSegmentsAsPath(segments);

    expect(getPathSegments(p)).toEqual(segments);
  });
});

describe('pathStringAsPath', () => {
  it('should create path from string', () => {
    const p = pathStringAsPath('a.b');

    expect(getPathSegments(p)).toEqual(['a', 'b']);
  });

  it('should create path from empty string', () => {
    const p = pathStringAsPath('');

    expect(getPathSegments(p)).toEqual([]);
  });
});

describe('combinePaths', () => {
  it('should combine paths', () => {
    const p1 = path<MyObject>().a.e;
    const p2 = path<MySubObject>().x.y;
    const combined = combinePaths(p1, p2);

    expect(getPathSegments(combined)).toEqual(['a', 'e', 'x', 'y']);
  });
});
