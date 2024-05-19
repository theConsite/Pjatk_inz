import { Injectable } from '@angular/core';
import * as libsignal from '@privacyresearch/libsignal-protocol-typescript';


@Injectable({
  providedIn: 'root',
})
export class SignalService {
  async generateIdentity(): Promise<{ identityKeyPair: libsignal.KeyPairType; registrationId: number }> {
    const identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
    const registrationId = await libsignal.KeyHelper.generateRegistrationId();
    return { identityKeyPair, registrationId };
  }

  async generatePreKeyBundle(identityKeyPair: libsignal.KeyPairType, registrationId: number): Promise<{
    identityKey: ArrayBuffer;
    registrationId: number;
    preKey: { keyId: number; publicKey: ArrayBuffer };
    signedPreKey: { keyId: number; publicKey: ArrayBuffer; signature: ArrayBuffer };
  }> {
    const preKey = await libsignal.KeyHelper.generatePreKey(registrationId + 1);
    const signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, registrationId + 1);
    return {
      identityKey: identityKeyPair.pubKey,
      registrationId,
      preKey: {
        keyId: preKey.keyId,
        publicKey: preKey.keyPair.pubKey,
      },
      signedPreKey: {
        keyId: signedPreKey.keyId,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature,
      },
    };
  }

  async encryptMessage(signalSession: libsignal.SessionCipher, message: string): Promise<libsignal.MessageType>  {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);
    const cipherText = await signalSession.encrypt(uint8Array.buffer);
    return cipherText;
  }

  async decryptMessage(signalSession: libsignal.SessionCipher, ciphertext: libsignal.MessageType): Promise<string> {
    const decryptedArrayBuffer = await signalSession.decryptPreKeyWhisperMessage(ciphertext.body as string, 'binary');
    return new TextDecoder().decode(decryptedArrayBuffer);
  }
}
