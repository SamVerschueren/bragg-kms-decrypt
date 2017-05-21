'use strict';
const AWS = require('aws-sdk');
const pify = require('pify');
const mem = require('mem');

const kms = new AWS.KMS();
let decryptFn;

const decrypt = (params, opts) => {
	if (!decryptFn) {
		decryptFn = pify(kms.decrypt.bind(kms));

		if (opts.maxAge && opts.maxAge > 0) {
			// If `maxAge` is provided, use memoization
			decryptFn = mem(decryptFn, {maxAge: opts.maxAge});
		}
	}

	return decryptFn(params);
};

/**
 * Decrypt the input with AWS KMS with the encryption context provided.
 *
 * @param 	{string}	input				The input value that should be decrypted.
 * @param 	{object}	encryptionContext	The options object.
 * @returns	{Promise}						Promise that resolves the decrypted cipher buffer.
 */
exports.decrypt = (input, encryptionContext, opts) => {
	// Build up the params
	const params = {
		CiphertextBlob: Buffer.from(input, opts.encoding),
		EncryptionContext: encryptionContext
	};

	// Decrypt the data
	return decrypt(params, opts).then(result => {
		if (!result.Plaintext) {
			throw new Error('Could not fullfill decrypt attempt');
		}

		return result.Plaintext;
	});
};
