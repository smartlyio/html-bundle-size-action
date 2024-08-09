import {expect, describe, it} from '@jest/globals'
import * as fs from 'fs'
import nock from 'nock'
import bundleSize, {
  linkedAssets,
  absolutePath,
  assetSize
} from '../src/bundle-size'

// @ts-ignore
nock('http://assets.example')
  .persist()
  .head('/prototype.js')
  .reply(200, undefined, {
    // @ts-ignore
    'Content-Length': '123456'
  })
  .head('/scriptaculous.js')
  .reply(200, undefined, {
    // @ts-ignore
    'Content-Length': '654321'
  })
  .head('/blueprint.css')
  .reply(200, undefined, {
    // @ts-ignore
    'Content-Length': '1000000'
  })
  .head('/error.js')
  .reply(404, undefined, {
    // @ts-ignore
    'Content-Length': '1'
  })

describe('bundleSize', () => {
  it('returns 0 when file does not have any linked assets', async () => {
    expect(
      await bundleSize({path: './__tests__/fixtures/no-assets.html'})
    ).toBe(0)
  })

  it('returns sum of asset sizes', async () => {
    expect(
      await bundleSize({
        path: './__tests__/fixtures/assets.html',
        base: 'http://assets.example/'
      })
    ).toBe(1123456)
  })
})

describe('linkedAssets', () => {
  it('returns empty list when no files are linked', async () => {
    const html = await fs.promises.readFile(
      './__tests__/fixtures/no-assets.html',
      'utf-8'
    )
    expect(linkedAssets(html)).toEqual([])
  })

  it('returns JS and CSS files', async () => {
    const html = await fs.promises.readFile(
      './__tests__/fixtures/assets.html',
      'utf-8'
    )
    expect(linkedAssets(html)).toEqual([
      {type: 'script', href: '/prototype.js', async: false},
      {type: 'script', href: '/scriptaculous.js', async: true},
      {type: 'style', href: '/blueprint.css', async: false}
    ])
  })
})

describe('absolutePath', () => {
  describe('with empty base', () => {
    it('returns input path', () => {
      expect(absolutePath('/foo/bar/baz.js', '')).toEqual('/foo/bar/baz.js')
    })
  })

  describe('with base', () => {
    it('returns absoute URLs as is', () => {
      expect(
        absolutePath('http://foo/bar/baz.js', 'https://bar.example/')
      ).toEqual('http://foo/bar/baz.js')
    })

    it('prepends relative paths with base', () => {
      expect(absolutePath('/foo', 'https://bar.example/')).toEqual(
        'https://bar.example/foo'
      )
    })
  })
})

describe('assetSize', () => {
  it('gets asset size from server', async () => {
    const {size} = await assetSize({
      type: 'script',
      href: 'http://assets.example/prototype.js',
      async: false
    })
    expect(size).toBe(123456)
  })

  it('does not return content length when file does not exist', () => {
    return expect(
      assetSize({
        type: 'script',
        href: 'http://assets.example/error.js',
        async: false
      })
    ).rejects.toEqual(new Error('http://assets.example/error.js returned 404'))
  })
})
