<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# HTML Bundle Size Action

Calculate the total size of a HTML bundle's assets.

## Inputs

### path

**Required** Path to HTML file

### base

**Optional** Base URL for assets referenced with relative URLs

## Example usage

```yaml
uses: smartlyio/html-bundle-size-action
with:
  path: ./bundle.html
  base: https://cdn.example
```

## Development

npm run all
