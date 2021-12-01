<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# HTML Bundle Size Action

Calculate the total size of a HTML bundle's assets.

### Limitations

* does not include transitive dependencies, e.g. dynamic imports, images in stylesheets
* images are not handled

## Inputs

### path

**Required** Path to HTML file

### base

**Optional** Base URL for assets referenced with relative URLs

## Outputs

### size

Total bundle size of assets in bundle in bytes.

## Example usage

```yaml
- uses: smartlyio/html-bundle-size-action@main
  id: bundle
  with:
    path: ./bundle.html
    base: https://cdn.example
- run: |
    echo "Bundle size: $BUNDLE_SIZE"
  env:
    BUNDLE_SIZE: ${{ steps.bundle.outputs.size }}
```

## Development

npm run all
