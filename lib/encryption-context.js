'use strict';
const dotProp = require('dot-prop');

/**
 * Parse the encryption context depending on the input and the option.
 *
 * @param	{object}	ctx			The Bragg context object.
 * @param	{object}	input		The input object to be decrypted.
 * @param	{object}	opts		The options object.
 * @returns	{object}				The encryption context object.
 */
exports.resolve = (ctx, input, opts) => {
	let context = Object.create(null);
	let encryptionContext = opts.encryptionContext;

	if (typeof encryptionContext === 'function') {
		// Call the function and pass in the Bragg context
		encryptionContext = encryptionContext(ctx);

		if (!Array.isArray(encryptionContext) && typeof encryptionContext !== 'object') {
			throw new TypeError(`Expected the \`EncryptionContext\` function to generate an \`object\` or an \`Array\`, got \`${typeof encryptionContext}\``);
		}
	}

	if (Array.isArray(encryptionContext)) {
		for (const e of encryptionContext) {
			if (typeof e === 'object') {
				context = Object.assign(e, context);
			} else {
				const value = dotProp.get(input, e);

				dotProp.set(context, e, value);
			}
		}
	} else {
		return encryptionContext;
	}

	return context;
};
