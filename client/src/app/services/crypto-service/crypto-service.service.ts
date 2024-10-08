import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { BigInteger } from 'jsbn';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private p: BigInteger;
  private g: BigInteger;
  public pass: string | null = null;

  constructor() {
    this.p = new BigInteger('FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08' +
      '8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
      'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381FFFFFFFFFFFFFFFF', 16);
    this.g = new BigInteger('2', 10);
  }

  generateKeyPair() {
    const privateKeyHex = CryptoJS.lib.WordArray.random(32).toString();
    const privateKey = new BigInteger(privateKeyHex, 16).mod(this.p.subtract(BigInteger.ONE)).add(BigInteger.ONE);
    const publicKey = this.g.modPow(privateKey, this.p);
    return { privateKey, publicKey };
  }

  deriveSharedKey(secret: BigInteger): string {
    return CryptoJS.SHA256(secret.toString(16)).toString();
  }

  computeSecret(theirPublicKey: string, myPrivateKey: BigInteger) {
    const theirPublic = new BigInteger(theirPublicKey, 16);
    const secret = theirPublic.modPow(myPrivateKey, this.p);
    return secret;
  }

  encryptMessage(message: string, key: string): string {
    return CryptoJS.AES.encrypt(message, key+this.pass).toString();
  }

  decryptMessage(ciphertext: string, key: string): string {
    let bytes = CryptoJS.AES.decrypt(ciphertext, key+this.pass);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}