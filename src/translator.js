'use strict';
const runtime = `
'use strict';
function compare(arr, pred){
  var res = true;
  for(var i = 0; i < arr.length; i++){
    if(arr[i + 1] != null && res){
      res = res && pred(arr[i], arr[i + 1]);
    } else {
      break;
    }
  }
  return res;
}
function add(a, b){ return a + b };
function substract(a, b){ return a - b };
function multiply(a, b){ return a * b };
function devide(a, b){ return a / b };
function greater(arr){ return compare(arr, function(a, b){ return a > b})};
function less(arr){ return compare(arr, function(a, b){ return a < b})};
function greaterOrEqual(arr){ return compare(arr, function(a, b){ return a >= b})};
function lessOrEqual(arr){ return compare(arr, function(a, b){ return a <= b})};
function equal(arr){ return compare(arr, function(a, b){ return a == b})};
function getArrayFromArgs(args){
var result = [];
  for(var i = 0; i < args.length; i++){
    result.push(args[i]);
  }
  return result;
}

`;

const add = `(function(){
 return getArrayFromArgs(arguments).reduce(add);
})`
const substract = `(function(){
 return getArrayFromArgs(arguments).reduce(substract);
})`
const multiply = `(function(){
 return getArrayFromArgs(arguments).reduce(multiply);
})`
const devide = `(function(){
 return getArrayFromArgs(arguments).reduce(devide);
})`
const greater = `(function(){
 return greater(getArrayFromArgs(arguments));
})`
const less = `(function(){
 return less(getArrayFromArgs(arguments));
})`
const greaterOrEqual = `(function(){
 return greaterOrEqual(getArrayFromArgs(arguments));
})`
const lessOrEqual = `(function(){
 return lessOrEqual(getArrayFromArgs(arguments));
})`
const equal = `(function(){
 return equal(getArrayFromArgs(arguments));
})`

const _call = expr => {}

const _parseIf = def => {
  return `(function(){
if (${parse(def.cond)}){
  return ${parse(def.true)}
}else {
  return ${parse(def.false)}
}
})()`
}

const _parseTypedExpression = expr => {
  if (expr.type === 'lambda') {
    return `function(${expr.expr.id}){return ${parse(expr.values[0])}}`;
  }
}

const _prepareLetVariables = expr => {
  return expr.map(v => {
    return {
      expr: v.id,
      values: v.values,
      type: 'var'
    }
  });
}

const _prepareLetSubDefinitions = def => {
  if (def.values.some(v => v.type != null)) {
    def.values.map(v => {
      v.internal = true;
    });
    return def.values.map(_parseDefinition).join('');
  } else {
    return def.values.map(parse);
  }
}

const _parseLetDefinitions = def => {
  def.expr = _prepareLetVariables(def.expr);
  const vars = def.expr.map(_parseDefinition).join('');
  let expr = _prepareLetSubDefinitions(def);
  let lastExpr;
  if (Array.isArray(expr)) {
    lastExpr = expr.pop();
  }

  return `;${def.internal ? 'return' : ''}(function(){${vars}\n${expr};\n ${lastExpr ? 'return ' + lastExpr : ''}})()`
}

const collectArgs = (values, value) => {
  if (Array.isArray(value)) {
    values = values.concat(value);
  } else {
    values.push(value);
  }
  return values;
}


const _parseDefinition = def => {
  if (def.type === 'var') {
    return `let ${def.expr} = ${parse(def.values[0])};`
  } else if (def.type === 'function') {
    return `function ${def.expr.id}(${def.expr.values}){ return ${parse(def.values[0])} };`;
  } else if (def.type === 'let') {
    return _parseLetDefinitions(def);
  } else if (def.type === 'if') {
    return _parseIf(def);
  } else if (def.type === 'lambda') {
    return _parseTypedExpression(def);
  }
}

const _constructFunctionCall = expr => {
  if (expr.values.length > 1) {
    return `${expr.id}(${expr.values.map(parse)})`;
  } else if (expr.values.length === 1) {
    return `${expr.id}(${expr.values.map(parse)})`;
  } else {
    return `if(typeof ${expr.id} === 'function') {${expr.id}()} else {${expr.id}}`
  }
}

const prepareFunctionName = expr => {
  expr.values = expr.values ? expr.values : [];
  return expr;
}

const parse = expr => {
  if (expr.type) {
    return _parseDefinition(expr);
  } else if (expr.values) {
    return  _constructFunctionCall(expr);
  } else {
    return expr;
  }
}

module.exports = {
  collectArgs,
  add,
  substract,
  multiply,
  devide,
  greater,
  less,
  greaterOrEqual,
  lessOrEqual,
  equal,
  parse,
  prepareFunctionName,
  runtime
}
