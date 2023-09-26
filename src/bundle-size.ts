import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'

import {load} from 'cheerio'
import type {CheerioAPI} from 'cheerio'
import {URL} from 'url'

export type Asset = {
  readonly type: 'script' | 'style'
  readonly href: string
  readonly async: boolean
}

export type AssetWithSize = Asset & {
  readonly size: number
}

const scriptAssets = ($: CheerioAPI): Asset[] =>
  $('script[src]')
    .toArray()
    .map(el => ({
      type: 'script',
      href: el.attribs.src,
      async: el.attribs.async !== undefined
    }))

const styleAssets = ($: CheerioAPI): Asset[] =>
  $('link[rel=stylesheet]')
    .toArray()
    .map(el => ({
      type: 'style',
      href: el.attribs.href,
      async: false
    }))

export const linkedAssets = (html: string): Asset[] => {
  const $ = load(html)
  return [...scriptAssets($), ...styleAssets($)]
}

export const absolutePath = (path: string, base?: string): string => {
  if (base) {
    return new URL(path, base).toString()
  } else {
    return path
  }
}

const request = (
  url: string,
  callback: (res: http.IncomingMessage) => void
): http.ClientRequest => {
  if (url.startsWith('https://')) {
    return https.request(url, {method: 'HEAD'}, callback)
  } else {
    return http.request(url, {method: 'HEAD'}, callback)
  }
}

export const assetSize = async (asset: Asset): Promise<AssetWithSize> =>
  new Promise<AssetWithSize>((resolve, reject) => {
    request(asset.href, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`${asset.href} returned ${res.statusCode}`))
      } else {
        resolve({...asset, size: Number(res.headers['content-length'])})
      }
    })
      .on('error', err => {
        reject(err)
      })
      .end()
  })

const bundleSize = async (options: {
  path: string
  base?: string
}): Promise<number> => {
  const html = await fs.promises.readFile(options.path, 'utf8')
  const assets: Asset[] = linkedAssets(html)
    .filter(({async}) => !async)
    .map(asset => ({...asset, href: absolutePath(asset.href, options.base)}))
  const sizes = await Promise.all(assets.map(assetSize))
  return sizes.reduce((acc, {size}) => acc + size, 0)
}

export default bundleSize
