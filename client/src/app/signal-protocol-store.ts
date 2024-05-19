import { StorageType } from "@privacyresearch/libsignal-protocol-typescript";
import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';


export class SignalProtocolStore implements StorageType {
  store: Map<string, any> = new Map();

  constructor() {}

  async getIdentityKeyPair(): Promise<libsignal.KeyPairType | undefined> {
    return this.store.get('identityKey');
  }

  async getLocalRegistrationId(): Promise<number | undefined> {
    return this.store.get('registrationId');
  }

  async isTrustedIdentity(identifier: string, identityKey: ArrayBuffer, direction: libsignal.Direction): Promise<boolean> {
    // Implement trust logic here. For now, return true.
    return true;
  }

  async saveIdentity(encodedAddress: string, publicKey: ArrayBuffer, nonblockingApproval?: boolean): Promise<boolean> {
    this.store.set('identityKey'+encodedAddress, publicKey)
    return true;
  }

  async loadPreKey(encodedAddress: string | number): Promise<libsignal.KeyPairType | undefined> {
    return this.store.get('identityKey'+encodedAddress)
  }

  async storePreKey(keyId: number | string, keyPair: libsignal.KeyPairType): Promise<void> {
    this.store.set('25519KeypreKey'+keyId, keyPair)
  }

  async removePreKey(keyId: number | string): Promise<void> {
    this.store.delete('25519KeypreKey'+keyId)
  }

  async loadSession(encodedAddress: string): Promise<libsignal.SessionRecordType | undefined> {
    return this.store.get('session'+encodedAddress);
  }

  async storeSession(encodedAddress: string, record: libsignal.SessionRecordType): Promise<void> {
    this.store.set('session'+encodedAddress,record);
  }

  async loadSignedPreKey(keyId: number | string): Promise<libsignal.KeyPairType | undefined> {
    return this.store.get('25519KeysignedKey'+keyId);
  }

  async storeSignedPreKey(keyId: number | string, keyPair: libsignal.KeyPairType): Promise<void> {
    this.store.set('25519KeysignedKey'+keyId,keyPair);
  }

  async removeSignedPreKey(keyId: number | string): Promise<void> {
    this.store.delete('25519KeysignedKey'+keyId)
  }
}