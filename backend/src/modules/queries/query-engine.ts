type Ast = { type: 'ALIAS'; value: string } | { type: 'NOT'; child: Ast } | { type: 'AND' | 'OR'; left: Ast; right: Ast };
type Token = { type: 'ALIAS' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN'; value: string };
const keyword = new Set(['AND','OR','NOT']);

export function tokenize(expression: string): Token[] {
  const raw = expression.match(/[A-Za-z_][A-Za-z0-9_]*|\(|\)|&&|\|\||!/g) ?? [];
  return raw.map((value) => {
    const upper = value.toUpperCase();
    if (value === '(') return { type: 'LPAREN', value };
    if (value === ')') return { type: 'RPAREN', value };
    if (value === '&&' || upper === 'AND') return { type: 'AND', value: 'AND' };
    if (value === '||' || upper === 'OR') return { type: 'OR', value: 'OR' };
    if (value === '!' || upper === 'NOT') return { type: 'NOT', value: 'NOT' };
    return { type: 'ALIAS', value: upper };
  });
}

export function parseQuery(expression: string, aliases: Array<{ alias: string }>, universe: string) {
  void universe;
  const allowed = new Set(aliases.map((a) => a.alias.toUpperCase()));
  const errors: Array<{ field: string; code: string; message: string }> = [];
  for (const alias of aliases) {
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,19}$/.test(alias.alias) || keyword.has(alias.alias.toUpperCase())) errors.push({ field: 'aliases', code: 'INVALID_ALIAS', message: `Invalid alias ${alias.alias}` });
  }
  const tokens = tokenize(expression);
  const referenced = [...new Set(tokens.filter((t)=>t.type==='ALIAS').map((t)=>t.value))];
  for (const name of referenced) if (!allowed.has(name)) errors.push({ field: 'expression', code: 'UNKNOWN_ALIAS', message: `Unknown alias ${name}` });
  let index = 0;
  const primary = (): Ast => {
    const token = tokens[index];
    if (!token) throw new Error('Unexpected end of expression');
    if (token.type === 'NOT') { index += 1; return { type: 'NOT', child: primary() }; }
    if (token.type === 'LPAREN') { index += 1; const value = or(); if (tokens[index]?.type !== 'RPAREN') throw new Error('Missing closing parenthesis'); index += 1; return value; }
    if (token.type === 'ALIAS') { index += 1; return { type: 'ALIAS', value: token.value }; }
    throw new Error(`Unexpected token ${token.value}`);
  };
  const and = (): Ast => { let left = primary(); while (tokens[index]?.type === 'AND') { index += 1; left = { type: 'AND', left, right: primary() }; } return left; };
  const or = (): Ast => { let left = and(); while (tokens[index]?.type === 'OR') { index += 1; left = { type: 'OR', left, right: and() }; } return left; };
  let ast: Ast | null = null;
  if (!tokens.length) errors.push({ field: 'expression', code: 'EMPTY_EXPRESSION', message: 'Expression is required' });
  if (!errors.length) { try { ast = or(); if (index !== tokens.length) throw new Error(`Unexpected token ${tokens[index]?.value}`); } catch (error) { errors.push({ field: 'expression', code: 'PARSE_ERROR', message: error instanceof Error ? error.message : 'Parse error' }); } }
  return { valid: errors.length === 0, normalized_expression: errors.length ? null : tokens.map((t)=>t.value).join(' '), ast: errors.length ? null : ast, referenced_aliases: referenced, errors };
}

export function evaluateQuery(ast: Ast, aliases: Record<string, Set<string>>, universe: Set<string>): Set<string> {
  if (ast.type === 'ALIAS') return new Set(aliases[ast.value] ?? []);
  if (ast.type === 'NOT') { const child = evaluateQuery(ast.child, aliases, universe); return new Set([...universe].filter((id)=>!child.has(id))); }
  const left = evaluateQuery(ast.left, aliases, universe); const right = evaluateQuery(ast.right, aliases, universe);
  if (ast.type === 'AND') return new Set([...left].filter((id)=>right.has(id)));
  return new Set([...left, ...right]);
}
