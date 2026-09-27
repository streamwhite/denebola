export type Cipher = {
  encrypt: (plaintext: string, key: string) => Promise<string> | string;
  decrypt: (ciphertext: string, key: string) => Promise<string> | string;
};

// Default cipher is identity: Expo SecureStore already encrypts at rest on device, so the
// template does not double-encrypt. Swap in a real Cipher (AES via expo-crypto + a KDF) when a
// threat model requires encryption above the keychain.
export const passthroughCipher: Cipher = { encrypt: (plaintext) => plaintext, decrypt: (ciphertext) => ciphertext };

export function createEncryptedStorageCipher(cipher: Cipher): Cipher {
  return cipher;
}
