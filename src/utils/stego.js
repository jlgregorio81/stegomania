/**
 * LSB steganography with password-based XOR encryption.
 *
 * Payload layout stored in image LSBs:
 *   [4 bytes: payload length (big-endian)] [payload bytes]
 * where payload = MAGIC (6 bytes) + UTF-8 message
 * Everything XORed with a deterministic key stream derived from the password.
 *
 * On decode, XOR the first 4 bytes to recover the length, then XOR the rest
 * and check the MAGIC prefix to verify the password is correct.
 */

const MAGIC = 'STEGO\x00'

/** Deterministic byte stream seeded from password (LCG). */
function keyStream(password, length) {
  const passBytes = new TextEncoder().encode(password || '')

  let seed = 0
  for (let i = 0; i < passBytes.length; i++) {
    seed = (Math.imul(seed, 31) + passBytes[i]) | 0
  }

  const stream = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    stream[i] = (seed >>> 24) & 0xff
  }
  return stream
}

/** Write one bit into the LSB of an R/G/B channel (skipping alpha). */
function setBit(pixels, bitIndex, bit) {
  const channel = bitIndex % 3
  const byteIndex = Math.floor(bitIndex / 3) * 4 + channel
  pixels[byteIndex] = (pixels[byteIndex] & 0xfe) | (bit & 1)
}

/** Read `byteCount` bytes from image LSBs starting at `byteOffset`. */
function readBytes(pixels, byteOffset, byteCount) {
  const out = new Uint8Array(byteCount)
  const startBit = byteOffset * 8
  for (let i = 0; i < byteCount; i++) {
    let byte = 0
    for (let b = 0; b < 8; b++) {
      const bitIndex = startBit + i * 8 + b
      const channel = bitIndex % 3
      const byteIdx = Math.floor(bitIndex / 3) * 4 + channel
      byte = (byte << 1) | (pixels[byteIdx] & 1)
    }
    out[i] = byte
  }
  return out
}

/**
 * Encode `message` into the image held by `ctx` using `password`.
 * Mutates the canvas in-place.
 */
export function encodeMessage(ctx, width, height, message, password) {
  const encoder = new TextEncoder()
  const magicBytes = encoder.encode(MAGIC)
  const msgBytes = encoder.encode(message)

  const payloadLen = magicBytes.length + msgBytes.length
  const fullData = new Uint8Array(4 + payloadLen)
  // big-endian 4-byte length header
  fullData[0] = (payloadLen >>> 24) & 0xff
  fullData[1] = (payloadLen >>> 16) & 0xff
  fullData[2] = (payloadLen >>> 8) & 0xff
  fullData[3] = payloadLen & 0xff
  fullData.set(magicBytes, 4)
  fullData.set(msgBytes, 4 + magicBytes.length)

  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  const maxBytes = Math.floor((pixels.length / 4) * 3 / 8)
  if (fullData.length > maxBytes) {
    throw new Error(`Mensagem muito longa para esta imagem. Máximo: ~${maxBytes - 16} bytes`)
  }

  const ks = keyStream(password, fullData.length)
  let bitIndex = 0
  for (let i = 0; i < fullData.length; i++) {
    const enc = fullData[i] ^ ks[i]
    for (let b = 7; b >= 0; b--) {
      setBit(pixels, bitIndex++, (enc >> b) & 1)
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Decode a message from the image held by `ctx` using `password`.
 * Throws an Error with message 'Wrong password' if the password is incorrect.
 */
export function decodeMessage(ctx, width, height, password) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  // Recover the 4-byte length header
  const encLen = readBytes(pixels, 0, 4)
  const ks4 = keyStream(password, 4)
  let payloadLen = 0
  for (let i = 0; i < 4; i++) {
    payloadLen = payloadLen * 256 + (encLen[i] ^ ks4[i])
  }

  const maxBytes = Math.floor((pixels.length / 4) * 3 / 8)
  if (payloadLen <= 0 || payloadLen > 10_000_000 || 4 + payloadLen > maxBytes) {
    throw new Error('Wrong password')
  }

  // Recover the payload
  const encPayload = readBytes(pixels, 4, payloadLen)
  const ksFull = keyStream(password, 4 + payloadLen)
  const payload = new Uint8Array(payloadLen)
  for (let i = 0; i < payloadLen; i++) {
    payload[i] = encPayload[i] ^ ksFull[i + 4]
  }

  // Verify MAGIC prefix
  const magicBytes = new TextEncoder().encode(MAGIC)
  for (let i = 0; i < magicBytes.length; i++) {
    if (payload[i] !== magicBytes[i]) throw new Error('Wrong password')
  }

  return new TextDecoder().decode(payload.slice(magicBytes.length))
}
