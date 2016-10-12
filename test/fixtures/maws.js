'use strict';
const AWS = require('aws-sdk');
const deepEqual = require('core-assert').__deepEqual;

class KMS {
	decrypt(opts, cb) {
		const res = opts.CiphertextBlob.toString('base64');
		const ctx = opts.EncryptionContext;

		if (res === 'Zm9vYmFy' && deepEqual(ctx, {foo: 'bar'})) {
			cb(undefined, {Plaintext: new Buffer('5a8b3aa11b6047c967ba7c66fd02b2f851c95da80e0218f0aa6088db50565753', 'hex')});
			return;
		}

		if (res === 'Zm9vYmFy' && deepEqual(ctx, {foo: 'baz'})) {
			cb(undefined, {Plaintext: new Buffer('5a8b3aa11b6047c967ba7c66fd02b2f851c95da80e0218f0aa6088db50565753', 'hex')});
			return;
		}

		cb(undefined, {Plaintext: new Buffer('foo')});
	}
}

// Mock the KMS object
AWS.KMS = KMS;

module.exports = AWS;
