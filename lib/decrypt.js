'use strict';
const dotProp = require('dot-prop');
const jovi = require('jovi');
const encryptionContext = require('./encryption-context');
const kms = require('./kms');

const decryptValue = (value, key) => {
	if (typeof value !== 'string' && typeof value !== 'object') {
		throw new TypeError(`Expected value to be a \`string\` or an \`object\`, got \`${typeof value}\``);
	}

	if (typeof value === 'string') {
		const iv = new Buffer(value.substring(0, 32), 'hex');
		const data = new Buffer(value.substring(32), 'hex');

		return jovi.decrypt(data, key, iv).toString('utf8');
	}

	const ret = Object.create(null);
	const keys = Object.keys(value);

	for (const k of keys) {
		ret[k] = decryptValue(value[k], key);
	}

	return ret;
};

/**
 * Decrypts all the properties of `input` provided in `props` and returns a new decrypted object.
 *
 * @param 	{object}	input		Input object to be decrypted.
 * @param 	{string[]}	props		List of properties to be decrypted.
 * @returns	{Promise}				Promise that resolves the decrypted object.
 */
module.exports = (input, props, opts) => {
	if (typeof input !== 'object' || !input[opts.key]) {
		// If the input is not an object or no key was found, just return the input
		// as we don't have to decrypt anything.
		return input;
	}

	// Determine the `EncryptionContext`
	const context = encryptionContext.resolve(input, opts);
	const cipher = input[opts.key];
	const output = Object.assign({}, input);

	let promise = kms.decrypt(cipher, context, opts);

	for (const prop of props) {
		if (dotProp.has(input, prop)) {
			promise = promise
				.then(key => {
					const value = dotProp.get(input, prop);
					const result = decryptValue(value, key);

					dotProp.set(output, prop, result);

					return key;
				});
		}
	}

	return promise.then(() => output);
};
