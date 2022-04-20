const { randomBytes, createCipheriv, createDecipheriv } = require('crypto');
const fs = require('fs');

const encrypt = () => {
  const file = '../fusebit-profile.json';
  if (fs.existsSync(file)) {
    const profile = JSON.stringify(require(file));
    const key = randomBytes(32);
    const iv = randomBytes(16);
    const alg = 'aes-256-gcm';
    const cipher = createCipheriv(alg, key, iv);
    let encrypted = cipher.update(profile, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encrypted,
      key: Buffer.from(key).toString('hex'),
      iv: Buffer.from(iv).toString('hex'),
      tag: Buffer.from(cipher.getAuthTag()).toString('hex'),
    };
  }
};

const decrypt = (key, iv, tag, content) => {
  const alg = 'aes-256-gcm';
  const decipher = createDecipheriv(alg, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encrypt, decrypt };
