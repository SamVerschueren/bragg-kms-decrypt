/* eslint-disable import/no-unassigned-import */
import test from 'ava';
import './fixtures/maws';
import m from '../';

test('decrypt body', async t => {
	const ctx = {
		body: [
			{
				foo: 'bar',
				unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
				__cipher: 'Zm9vYmFy'
			},
			{
				foo: 'baz',
				unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
				__cipher: 'Zm9vYmFy'
			}
		]
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, [
		{
			foo: 'bar',
			unicorn: 'rainbow',
			__cipher: 'Zm9vYmFy'
		},
		{
			foo: 'baz',
			unicorn: 'rainbow',
			__cipher: 'Zm9vYmFy'
		}
	]);
});

test('decrypt promise body', async t => {
	const ctx = {
		body: Promise.resolve([
			{
				foo: 'bar',
				unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
				__cipher: 'Zm9vYmFy'
			},
			{
				foo: 'baz',
				unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
				__cipher: 'Zm9vYmFy'
			}
		])
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, [
		{
			foo: 'bar',
			unicorn: 'rainbow',
			__cipher: 'Zm9vYmFy'
		},
		{
			foo: 'baz',
			unicorn: 'rainbow',
			__cipher: 'Zm9vYmFy'
		}
	]);
});

test('do nothing if properties do not exist', async t => {
	const ctx = {
		body: [
			{
				foo: 'bar',
				unicorn: '6ca5fc8c1b0c9f2b4e549bbfb55dc63ca850c2919f862c',
				__cipher: 'Zm9vYmFy'
			},
			{
				foo: 'baz',
				__cipher: 'Zm9vYmFy'
			}
		]
	};

	const fn = m(['unicorn'], {encryptionContext: ['foo']});

	fn(ctx);

	t.deepEqual(await ctx.body, [
		{
			foo: 'bar',
			unicorn: 'rainbow',
			__cipher: 'Zm9vYmFy'
		},
		{
			foo: 'baz',
			__cipher: 'Zm9vYmFy'
		}
	]);
});
