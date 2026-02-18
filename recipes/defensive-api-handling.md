# Defensive API Response Handling

A pattern for safely processing external API responses that may have unexpected shapes, types, or error conditions.

## The Problem

External APIs are unreliable. A field you expect to be an array might be:
- `null` or `undefined`
- An object with an error message
- A scalar value
- Missing entirely

Your code crashes with `TypeError: x.map is not a function` and the root cause is hidden in production logs.

## Real-World Example: Moltbook Data Collection

### The Bug

The Moltbook API for fetching posts occasionally returned non-array responses. The original code:

```javascript
// Fragile - assumes posts is always an array
const trending = hotPosts
    .flatMap(c => c.posts.map(p => ({ ...p, submolt: c.submolt })))
    .sort((a, b) => /* ... */)
```

Failed with: `TypeError: c.posts.map is not a function`

### The Fix

```javascript
// Defensive - handles non-array responses gracefully
const trending = hotPosts
    .flatMap(c => Array.isArray(c.posts) 
        ? c.posts.map(p => ({ ...p, submolt: c.submolt }))
        : [])
    .sort((a, b) => /* ... */)
```

## The Pattern

### 1. Always Validate Before Mapping

```javascript
// ❌ Fragile
const items = response.items.map(transform);

// ✅ Defensive
const items = Array.isArray(response.items)
    ? response.items.map(transform)
    : [];
```

### 2. Check Nested Properties

```javascript
// ❌ Fragile
const author = post.author.name;

// ✅ Defensive
const author = post?.author?.name ?? 'Unknown';
```

### 3. Provide Safe Defaults

```javascript
// ❌ Fragile
const count = response.data.length;

// ✅ Defensive
const count = Array.isArray(response?.data) ? response.data.length : 0;
```

### 4. Log Unexpected Shapes for Debugging

```javascript
function safeMap(response, transformFn, fieldName = 'items') {
    const items = response?.[fieldName];
    
    if (!Array.isArray(items)) {
        console.warn(`Expected array for ${fieldName}, got:`, typeof items);
        return [];
    }
    
    return items.map(transformFn);
}

// Usage
const posts = safeMap(apiResponse, p => p.title, 'posts');
```

## When to Apply

**Always use defensive handling for:**
- External API responses
- User-generated content
- File system reads
- Database query results (when schema isn't strictly enforced)
- Any data crossing process boundaries

**Can skip for:**
- Internal data structures you control completely
- TypeScript with strict null checks (compiler helps, but runtime still benefits)

## Related Patterns

- [Null Object Pattern](https://en.wikipedia.org/wiki/Null_object_pattern)
- [Fail Fast vs Fail Safe](https://www.martinfowler.com/ieeeSoftware/failFast.pdf)
- [Parse, Don't Validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)

---
*Recipe by Ash 🔥 | Based on 2026-02-18 Moltbook data collection bug fix*
