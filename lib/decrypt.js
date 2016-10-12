'use strict';
const dotProp = require('dot-prop');
const jovi = require('jovi');
const encryptionContext = require('./encryption-context');
const kms = require('./kms');
const utils = require('./utils');

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

const decryptObject = (ctx, input, props, opts) => {
	if (!utils.validateProps(input, props)) {
		return input;
	}

	// Determine the `EncryptionContext`
	const context = encryptionContext.resolve(ctx, input, opts);
	const cipher = input[opts.key];

	return kms.decrypt(cipher, context, opts)
		.then(key => {
			const output = Object.assign({}, input);

			for (const prop of props) {
				if (dotProp.has(input, prop)) {
					const value = dotProp.get(input, prop);
					const result = decryptValue(value, key);

					dotProp.set(output, prop, result);
				}
			}

			return output;
		});
};

/**
 * Decrypts all the properties of `input` provided in `props` and returns a new decrypted object.
 *
 * @param	{object}	ctx			The Bragg context object.
 * @param	{object}	input		Input object to be decrypted.
 * @param	{string[]}	props		List of properties to be decrypted.
 * @param	{object}	opts		The options object.
 * @returns	{Promise}				Promise that resolves the decrypted object.
 */
module.exports = (ctx, input, props, opts) => {
	if (!utils.validateInput(input, props, opts)) {
		// Just return the input if it is not valid.
		return input;
	}

	if (Array.isArray(input)) {
		return Promise.all(input.map(x => decryptObject(ctx, x, props, opts)));
	}

	return decryptObject(ctx, input, props, opts);
};
