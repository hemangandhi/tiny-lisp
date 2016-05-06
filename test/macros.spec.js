const i = require('../../lib/interpreter.js');

describe('macros', () => {
  it('should replicate each', () => {
    const res = i.exec(`
                    (defmacro (fr arr fun) 
                       (map (fn (x) fun) arr))
                    (fr \`(1 2 3 4) \`("+" x x))
                    `);

    expect(res).toEqual([2, 4, 6, 8]);
  });
});
