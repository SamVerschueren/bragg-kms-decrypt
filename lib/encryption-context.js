'use strict';
const dotProp = require('dot-prop');

/**
 * Parse the encryption context depending on the input and the option.
 *
 * @param 	{object}	input		The input object to be decrypted.
 * @param 	{object}	opts		The options object.
 * @returns	{object}				The encryption context object.
 */
exports.resolve = (input, opts) => {
	let context = Object.create(null);

	if (Array.isArray(opts.encryptionContext)) {
		for (const e of opts.encryptionContext) {
			if (typeof e === 'object') {
				context = Object.assign(e, context);
			} else {
				const value = dotProp.get(input, e);

				dotProp.set(context, e, value);
			}
		}
	} else {
		return opts.encryptionContext;
	}

	return context;
};
