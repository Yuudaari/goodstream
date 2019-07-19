/// <reference types="mocha" />

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import Stream from "../Stream";
import { tuple } from "../util/Arrays";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Stream", () => {
	describe("creation helper", () => {
		describe("'empty'", () => {
			it("should produce an empty stream", () => {
				expect([...Stream.empty()]).empty;
			});
		});

		describe("'of'", () => {
			it("should contain the exact items passed", () => {
				for (let i = 0; i < 100; i++) {
					const set = new Set();
					for (let j = 0; j < i; j++)
						set.add(`${Math.random()}-${j}-${i}`);

					const stream = Stream.of(...set);
					for (const value of stream)
						set.add(value);

					expect(set.size).eq(i);
				}
			});
		});

		describe("'from'", () => {
			it("should stream the iterator of an array", () => {
				expect([...Stream.from([1, 2, 3])]).ordered.members([1, 2, 3]);
			});

			it("should stream the iterator of a set", () => {
				expect([...Stream.from(new Set([1, 2, 3]))]).ordered.members([1, 2, 3]);
			});

			it("should stream the entries of a map", () => {
				expect([...Stream.from(new Map([[1, 2], [2, 3]]))]).deep.ordered.members([[1, 2], [2, 3]]);
			});

			it("should stream the entries of another stream", () => {
				expect([...Stream.from(Stream.of(1, 2, 3))]).ordered.members([1, 2, 3]);
			});

			it("should stream the entries of an iterable", () => {
				expect([...Stream.from([1, 2, 3][Symbol.iterator]())]).ordered.members([1, 2, 3]);
			});
		});

		describe("'values'", () => {
			it("should stream the values of a map", () => {
				expect([...Stream.values(new Map([[1, 2], [8, 9]]))]).ordered.members([2, 9]);
			});

			it("should stream the values of an array", () => {
				expect([...Stream.values([1, 2, 3])]).ordered.members([1, 2, 3]);
			});

			it("should error on streaming an array with a decimal step", () => {
				expect(() => Stream.values([1, 2, 3], 0.1)).throw();
			});

			it("should skip the values of an array with a positive step", () => {
				expect([...Stream.values([1, 2, 3, 4], 2)]).ordered.members([2, 4]);
			});

			it("should reverse the values of an array with negative step", () => {
				expect([...Stream.values([1, 2, 3, 4], -1)]).ordered.members([4, 3, 2, 1]);
				expect([...Stream.values([1, 2, 3, 4], -2)]).ordered.members([3, 1]);
			});

			it("should stream the values of an object", () => {
				expect([...Stream.values({ foo: 0, bar: 1 })]).members([0, 1]);
			});
		});

		describe("'keys'", () => {
			it("should stream the keys of a map", () => {
				expect([...Stream.keys(new Map([[1, 2], [8, 9]]))]).ordered.members([1, 8]);
			});

			it("should stream the keys of an object", () => {
				expect([...Stream.keys({ foo: 0, bar: 1 })]).members(["foo", "bar"]);
			});
		});

		describe("'entries'", () => {
			it("should stream the entries of a map", () => {
				expect([...Stream.entries(new Map([[1, 2], [8, 9]]))]).deep.ordered.members([[1, 2], [8, 9]]);
			});

			it("should stream the entries of an array", () => {
				expect([...Stream.entries([1, 2, 3])]).deep.ordered.members([[0, 1], [1, 2], [2, 3]]);
			});

			it("should error on streaming an array with a decimal step", () => {
				expect(() => Stream.entries([1, 2, 3], 0.1)).throw();
			});

			it("should skip the entries of an array with a positive step", () => {
				expect([...Stream.entries([1, 2, 3, 4], 2)]).deep.ordered.members([[1, 2], [3, 4]]);
			});

			it("should reverse the entries of an array with negative step", () => {
				expect([...Stream.entries([1, 2, 3, 4], -1)]).deep.ordered.members([[3, 4], [2, 3], [1, 2], [0, 1]]);
				expect([...Stream.entries([1, 2, 3, 4], -2)]).deep.ordered.members([[2, 3], [0, 1]]);
			});

			it("should stream the entries of an object", () => {
				expect([...Stream.entries({ foo: 0, bar: 1 })]).deep.members([["foo", 0], ["bar", 1]]);
			});
		});

		describe("'range'", () => {
			it("should contain ints from zero till the given number (exclusive)", () => {
				expect([...Stream.range(3)]).ordered.members([0, 1, 2]);
			});

			it("should contain ints from the given start (inclusive) till the given end (exclusive)", () => {
				expect([...Stream.range(1, 3)]).ordered.members([1, 2]);
			});

			it("should produce decimal numbers with decimal start or end", () => {
				expect([...Stream.range(1.5)]).ordered.members([0, 1]);
				expect([...Stream.range(2, 5.5)]).ordered.members([2, 3, 4, 5]);
				expect([...Stream.range(3.5, 6.5)]).ordered.members([3.5, 4.5, 5.5]);
			});

			it("should produce a range in reverse if the end is less than the start", () => {
				expect([...Stream.range(3, 1)]).ordered.members([3, 2]);
			});

			it("should produce a range in reverse if the end is less than the start", () => {
				expect([...Stream.range(3, 1)]).ordered.members([3, 2]);
			});

			it("should error if given a step of zero", () => {
				expect(() => Stream.range(0, 1, 0)).throw();
			});

			it("should skip around with a different step", () => {
				expect([...Stream.range(0, 6, 2)]).ordered.members([0, 2, 4]);
				expect([...Stream.range(0, 6, -2)]).ordered.members([6, 4, 2]);
			});

			it("should produce decimal numbers with a decimal step", () => {
				expect([...Stream.range(0, 1, 0.2)]).ordered.members([0, 0.2, 0.4, 0.2 * 3, 0.8]);
			});
		});

		describe("'zip'", () => {
			it("should produce an array of tuples", () => {
				expect([...Stream.zip([1, 2, 3], [4, 5, 6])]).deep.ordered.members([[1, 4], [2, 5], [3, 6]]);
			});

			it("should ignore extra values from the bigger list", () => {
				expect([...Stream.zip([1, 2, 3], [4])]).deep.ordered.members([[1, 4]]);
				expect([...Stream.zip([5], [2, 7, 3])]).deep.ordered.members([[5, 2]]);
			});
		});
	});

	describe("manipulation method", () => {
		describe("'filter'/'filter2'", () => {
			it("should only include values that pass a predicate", () => {
				expect([...Stream.range(5).filter(v => v % 2)]).ordered.members([1, 3]);
				expect([...Stream.range(5).filter2(v => v % 2)]).ordered.members([1, 3]);
			});

			it("should not filter the current stream", () => {
				const stream = Stream.range(7);
				const filteredStream = stream.filter(v => v % 2);
				filteredStream.next();
				filteredStream.next();
				expect([...stream]).ordered.members([4, 5, 6]);
			});
		});

		describe("'map'", () => {
			it("should replace values with a mapped version", () => {
				expect([...Stream.range(3).map(v => v * 2)]).ordered.members([0, 2, 4]);
			});

			it("should not replace values in the current stream", () => {
				const stream = Stream.range(5);
				const mappedStream = stream.map(v => v * 2);
				mappedStream.next();
				mappedStream.next();
				expect([...stream]).ordered.members([2, 3, 4]);
			});
		});

		describe("'flatMap'", () => {
			it("should iterate through each value of each iterable", () => {
				expect([...Stream.of([0, 0], [1, 2], [2, 4]).flatMap()]).ordered.members([0, 0, 1, 2, 2, 4]);
			});

			it("should stream non-iterable values normally", () => {
				expect([...Stream.of(0, [1, 2], [2, 4]).flatMap()]).ordered.members([0, 1, 2, 2, 4]);
			});

			it("should not break apart strings", () => {
				expect([...Stream.of("foo", "bar").flatMap()]).ordered.members(["foo", "bar"]);
			});

			it("should allow a mapping function to be passed", () => {
				expect([...Stream.of("foo", "bar").flatMap(str => str.split(""))]).ordered.members(["f", "o", "o", "b", "a", "r"]);
			});

			it("should not split strings produced by the mapping function", () => {
				expect([...Stream.of("foo", "bar").flatMap(str => str)]).ordered.members(["foo", "bar"]);
			});

			it("should not replace values in the current stream", () => {
				const stream = Stream.of([0, 0], [1, 2], [2, 4]);
				const flatMappedStream = stream.flatMap();
				flatMappedStream.next();
				flatMappedStream.next();
				flatMappedStream.next();
				expect([...stream]).deep.ordered.members([[2, 4]]);
			});
		});

		describe("'take'", () => {
			it("should only stream the number of items requested", () => {
				expect([...Stream.range(5).take(3)]).ordered.members([0, 1, 2]);
			});

			it("should error when given a negative number", () => {
				expect(() => Stream.range(5).take(-3)).throw();
			});

			it("should error when given a decimal number", () => {
				expect(() => Stream.range(5).take(1.5)).throw();
			});

			it("should only return the items in the stream when given a number than the count", () => {
				expect([...Stream.range(3).take(5)]).ordered.members([0, 1, 2]);
			});

			it("should not end the current stream", () => {
				const stream = Stream.range(5);
				[...stream.take(2)];
				expect([...stream]).ordered.members([2, 3, 4]);
			});
		});

		describe("'takeWhile'", () => {
			it("should stream all items until a condition is false", () => {
				expect([...Stream.range(5).takeWhile(val => val !== 3)]).ordered.members([0, 1, 2]);
			});

			it("should stream all items from the stream if the predicate never returns false", () => {
				expect([...Stream.range(5).takeWhile(() => true)]).ordered.members([0, 1, 2, 3, 4]);
			});

			it("should stream no items from the stream if the predicate instantly returns false", () => {
				expect([...Stream.range(5).takeWhile(() => false)]).members([]);
			});

			it("should not end the current stream", () => {
				const stream = Stream.range(5);
				[...stream.takeWhile(val => val !== 3)];
				expect([...stream]).ordered.members([3, 4]);
			});
		});

		describe("'takeUntil'", () => {
			it("should stream all items until a condition is true", () => {
				expect([...Stream.range(5).takeUntil(val => val === 3)]).ordered.members([0, 1, 2]);
			});

			it("should stream all items from the stream if the predicate never returns true", () => {
				expect([...Stream.range(5).takeUntil(() => false)]).ordered.members([0, 1, 2, 3, 4]);
			});

			it("should stream no items from the stream if the predicate instantly returns true", () => {
				expect([...Stream.range(5).takeUntil(() => true)]).members([]);
			});

			it("should not end the current stream", () => {
				const stream = Stream.range(5);
				[...stream.takeUntil(val => val === 3)];
				expect([...stream]).ordered.members([3, 4]);
			});
		});

		describe("'drop'", () => {
			it("should skip the number of items requested", () => {
				expect([...Stream.range(5).drop(3)]).ordered.members([3, 4]);
			});

			it("should error when given a negative number", () => {
				expect(() => Stream.range(5).drop(-3)).throw();
			});

			it("should error when given a decimal number", () => {
				expect(() => Stream.range(5).drop(1.5)).throw();
			});

			it("should stream no items when given a number bigger than the stream count", () => {
				expect([...Stream.range(3).drop(5)]).ordered.members([]);
			});
		});

		describe("'dropWhile'", () => {
			it("should skip all items until a condition is false", () => {
				expect([...Stream.range(5).dropWhile(val => val !== 3)]).ordered.members([3, 4]);
			});

			it("should skip all items from the stream if the predicate never returns false", () => {
				expect([...Stream.range(5).dropWhile(() => true)]).ordered.members([]);
			});

			it("should skip no items from the stream if the predicate instantly returns false", () => {
				expect([...Stream.range(5).dropWhile(() => false)]).members([0, 1, 2, 3, 4]);
			});
		});

		describe("'dropUntil'", () => {
			it("should skip all items until a condition is true", () => {
				expect([...Stream.range(5).dropUntil(val => val === 3)]).ordered.members([3, 4]);
			});

			it("should skip all items from the stream if the predicate never returns true", () => {
				expect([...Stream.range(5).dropUntil(() => false)]).ordered.members([]);
			});

			it("should skip no items from the stream if the predicate instantly returns true", () => {
				expect([...Stream.range(5).dropUntil(() => true)]).members([0, 1, 2, 3, 4]);
			});
		});

		describe("'step'", () => {
			it("should error when given zero or a decimal number", () => {
				expect(() => Stream.range(5).step(0)).throw();
				expect(() => Stream.range(5).step(1.5)).throw();
			});

			it("should skip values when given a positive integer", () => {
				expect([...Stream.range(5).step(2)]).ordered.members([1, 3]);
			});

			it("should skip values in reverse when given a negative integer", () => {
				expect([...Stream.range(5).step(-2)]).ordered.members([3, 1]);
			});

			it("should not affect the current stream", () => {
				const stream = Stream.range(8);
				const steppedStream = stream.step(2);
				steppedStream.next();
				steppedStream.next();
				expect([...stream]).ordered.members([4, 5, 6, 7]);
			});
		});

		describe("'sorted'", () => {
			it("should sort the entries in the stream", () => {
				expect([...Stream.range(50).sorted()]).ordered.members([...Stream.range(50)].sort());
			});

			it("should sort the entries in the stream with a custom comparator", () => {
				expect([...Stream.range(50).sorted((a, b) => a - b)]).ordered.members([...Stream.range(50)].sort((a, b) => a - b));
			});
		});

		describe("'reverse'", () => {
			it("should reverse the entries in the stream", () => {
				expect([...Stream.range(50).reverse()]).ordered.members([...Stream.range(50)].reverse());
			});
		});

		describe("'distinct'", () => {
			it("should remove duplicate entries", () => {
				expect([...Stream.of(1, 2, 2, 2, 2, 3, 4, 4, 5, 5, 2, 5).distinct()]).ordered.members([1, 2, 3, 4, 5]);
			});
		});

		describe("'shuffle'", () => {
			it("should reorganise the items in the stream", () => {
				// technically this isn't a perfect test because it's random,
				// but the odds of this failing are astronomically low so it's probably okay right?
				expect([...Stream.range(10000).shuffle()])
					.members([...Stream.range(10000)])
					.and.not.ordered.members([...Stream.range(10000)]);
			});
		});

		describe("'partition'", () => {
			it("should produce a 'partitions' object containing streams of items, each stream having its own 'key' which was decided by a sorting function", () => {
				const partitions = Stream.range(10).partition(n => n % 2);
				expect([...partitions.partitions().map(([partitionKey, values]) => [partitionKey, [...values]])])
					.deep.ordered.members([[0, [0, 2, 4, 6, 8]], [1, [1, 3, 5, 7, 9]]]);
			});

			it("should allow retrieving one of the partitions before streaming the rest", () => {
				let partitions = Stream.range(10).partition(n => n % 3);
				expect([...partitions.get(0)]).ordered.members([0, 3, 6, 9]);
				expect([...partitions.partitions().map(([partitionKey, values]) => [partitionKey, [...values]])])
					.deep.ordered.members([
						// this first partition is empty because it exists but has already been streamed to completion
						[0, []],
						[1, [1, 4, 7]],
						[2, [2, 5, 8]],
					]);

				partitions = Stream.range(10).partition(n => n % 3);
				expect([...partitions.get(0).take(2)]).ordered.members([0, 3]); // let's not stream it to completion this time
				expect([...partitions.partitions().map(([partitionKey, values]) => [partitionKey, [...values]])])
					.deep.ordered.members([
						[0, [6, 9]],
						[1, [1, 4, 7]],
						[2, [2, 5, 8]],
					]);
			});

			it("should allow retrieving partitions after streaming them all", () => {
				const partitions = Stream.range(10).partition(n => n % 3);
				[...partitions.partitions()];
				expect([...partitions.get(0)]).ordered.members([0, 3, 6, 9]);
			});
		});

		describe("'unzip'", () => {
			it("should separate the keys and values into two streams", () => {
				const unzipped = Stream.of(tuple(0, 1), tuple(2, 3), tuple(4, 5)).unzip();
				expect([...unzipped.partitions().map(([key]) => key)]).members(["key", "value"]);
				expect([...unzipped.get("key")]).ordered.members([0, 2, 4]);
				expect([...unzipped.get("value")]).ordered.members([1, 3, 5]);
			});

			it("should work with an empty input", () => {
				const unzipped = Stream.empty().unzip();
				expect([...unzipped.partitions().map(([key]) => key)]).members(["key", "value"]);
			});
		});

		describe("'add'", () => {
			it("should add new items to the end of the stream", () => {
				expect([...Stream.range(3).add()]).ordered.members([0, 1, 2]);
				expect([...Stream.empty().add(3, 4, 5)]).ordered.members([3, 4, 5]);
				expect([...Stream.range(3).add(3, 4, 5)]).ordered.members([0, 1, 2, 3, 4, 5]);
			});
		});

		describe("'insert'", () => {
			it("should insert new items to the beginning of the stream", () => {
				expect([...Stream.range(3).insert()]).ordered.members([0, 1, 2]);
				expect([...Stream.empty().insert(3, 4, 5)]).ordered.members([3, 4, 5]);
				expect([...Stream.range(3).insert(3, 4, 5)]).ordered.members([3, 4, 5, 0, 1, 2]);
			});
		});

		describe("'insertAt'", () => {
			it("should insert new items into the stream", () => {
				expect([...Stream.range(3).insertAt(1)]).ordered.members([0, 1, 2]);
				expect([...Stream.range(3).insertAt(1, 3, 4, 5)]).ordered.members([0, 3, 4, 5, 1, 2]);
			});

			it("should add to the end of the stream when the position is after the stream's other contents", () => {
				expect([...Stream.empty().insertAt(1, 3, 4, 5)]).ordered.members([3, 4, 5]);
				expect([...Stream.range(3).insertAt(5, 3, 4, 5)]).ordered.members([0, 1, 2, 3, 4, 5]);
			});
		});

		describe("'merge'", () => {
			it("should add the items from the given iterables to the end of the stream", () => {
				expect([...Stream.range(3).merge(Stream.range(3), Stream.range(3))]).ordered.members([0, 1, 2, 0, 1, 2, 0, 1, 2]);
				expect([...Stream.range(3).merge()]).ordered.members([0, 1, 2]);
				expect([...Stream.empty().merge(Stream.range(3))]).ordered.members([0, 1, 2]);
			});
		});

		describe("'collectStream'", () => {
			it("should iterate through the entire stream, then create a new stream from the beginning", () => {
				const values = [1, 2, 3, 4];
				const collectedStream = Stream.from(values).collectStream();
				values.splice(0, Infinity);
				expect([...collectedStream]).ordered.members([1, 2, 3, 4]);
			});
		});

		describe("'entries'", () => {
			it("should return a stream containing tuples representing the stream index and current value", () => {
				expect([...Stream.of("foo", "bar", "bazz").entries()]).deep.ordered.members([[0, "foo"], [1, "bar"], [2, "bazz"]]);
			});
		});
	});

	describe("collection method", () => {

		describe("'any'", () => {
			it("should return whether any values match the predicate", () => {
				expect(Stream.range(3).any(val => val === 2)).equal(true);
				expect(Stream.range(3).any(val => val === 3)).equal(false);
			});

			it("should return false with an empty stream", () => {
				expect(Stream.of().any(() => true)).equal(false);
				expect(Stream.of().any(() => false)).equal(false);
			});
		});

		describe("'some'", () => {
			it("should return whether any values match the predicate", () => {
				expect(Stream.range(3).some(val => val === 2)).equal(true);
				expect(Stream.range(3).some(val => val === 3)).equal(false);
			});

			it("should return false with an empty stream", () => {
				expect(Stream.of().some(() => true)).equal(false);
				expect(Stream.of().some(() => false)).equal(false);
			});
		});

		describe("'every'", () => {
			it("should return whether all values match the predicate", () => {
				expect(Stream.range(3).every(val => val < 2)).equal(false);
				expect(Stream.range(3).every(val => val < 3)).equal(true);
			});

			it("should return true with an empty stream", () => {
				expect(Stream.of().every(() => true)).equal(true);
				expect(Stream.of().every(() => false)).equal(true);
			});
		});

		describe("'all'", () => {
			it("should return whether all values match the predicate", () => {
				expect(Stream.range(3).all(val => val < 2)).equal(false);
				expect(Stream.range(3).all(val => val < 3)).equal(true);
			});

			it("should return true with an empty stream", () => {
				expect(Stream.of().all(() => true)).equal(true);
				expect(Stream.of().all(() => false)).equal(true);
			});
		});

		describe("'none'", () => {
			it("should return whether no values match the predicate", () => {
				expect(Stream.range(3).none(val => val === 2)).equal(false);
				expect(Stream.range(3).none(val => val === 3)).equal(true);
			});

			it("should return true with an empty stream", () => {
				expect(Stream.of().none(() => true)).equal(true);
				expect(Stream.of().none(() => false)).equal(true);
			});
		});

		describe("'includes'", () => {
			it("should return whether the stream contains any of the given values", () => {
				expect(Stream.range(3).includes(0)).equal(true);
				expect(Stream.range(3).includes(4)).equal(false);
				expect(Stream.range(3).includes(0, 4)).equal(true);
				expect(Stream.range(3).includes(4, 0)).equal(true);
				expect(Stream.range(3).includes(4, 5)).equal(false);
				expect(Stream.range(3).includes(5, 4)).equal(false);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().includes()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().includes(1)).equal(false);
			});
		});

		describe("'contains'", () => {
			it("should return whether the stream contains any of the given values", () => {
				expect(Stream.range(3).contains(0)).equal(true);
				expect(Stream.range(3).contains(4)).equal(false);
				expect(Stream.range(3).contains(0, 4)).equal(true);
				expect(Stream.range(3).contains(4, 0)).equal(true);
				expect(Stream.range(3).contains(4, 5)).equal(false);
				expect(Stream.range(3).contains(5, 4)).equal(false);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().contains()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().contains(1)).equal(false);
			});
		});

		describe("'has'", () => {
			it("should return whether the stream contains any of the given values", () => {
				expect(Stream.range(3).has(0)).equal(true);
				expect(Stream.range(3).has(4)).equal(false);
				expect(Stream.range(3).has(0, 4)).equal(true);
				expect(Stream.range(3).has(4, 0)).equal(true);
				expect(Stream.range(3).has(4, 5)).equal(false);
				expect(Stream.range(3).has(5, 4)).equal(false);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().has()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().has(1)).equal(false);
			});
		});

		describe("'includesAll'", () => {
			it("should return whether the stream contains all of the given values", () => {
				expect(Stream.range(3).includesAll(0)).equal(true);
				expect(Stream.range(3).includesAll(4)).equal(false);
				expect(Stream.range(3).includesAll(0, 4)).equal(false);
				expect(Stream.range(3).includesAll(4, 0)).equal(false);
				expect(Stream.range(3).includesAll(5, 4)).equal(false);
				expect(Stream.range(3).includesAll(1, 2)).equal(true);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().includesAll()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().includesAll(1)).equal(false);
			});
		});

		describe("'containsAll'", () => {
			it("should return whether the stream contains all of the given values", () => {
				expect(Stream.range(3).containsAll(0)).equal(true);
				expect(Stream.range(3).containsAll(4)).equal(false);
				expect(Stream.range(3).containsAll(0, 4)).equal(false);
				expect(Stream.range(3).containsAll(4, 0)).equal(false);
				expect(Stream.range(3).containsAll(5, 4)).equal(false);
				expect(Stream.range(3).containsAll(1, 2)).equal(true);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().containsAll()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().containsAll(1)).equal(false);
			});
		});

		describe("'hasAll'", () => {
			it("should return whether the stream contains all of the given values", () => {
				expect(Stream.range(3).hasAll(0)).equal(true);
				expect(Stream.range(3).hasAll(4)).equal(false);
				expect(Stream.range(3).hasAll(0, 4)).equal(false);
				expect(Stream.range(3).hasAll(4, 0)).equal(false);
				expect(Stream.range(3).hasAll(5, 4)).equal(false);
				expect(Stream.range(3).hasAll(1, 2)).equal(true);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().hasAll()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of<number[]>().hasAll(1)).equal(false);
			});
		});

		describe("'intersects'", () => {
			it("should return whether any of the given iterables contain values in this stream", () => {
				expect(Stream.range(3).intersects(Stream.range(3))).equal(true);
				expect(Stream.range(3).intersects(Stream.range(3, 6))).equal(false);
				expect(Stream.range(3).intersects(Stream.range(3, 6), [0])).equal(true);
				expect(Stream.range(3).intersects(Stream.range(3, 6), new Set([2]))).equal(true);
			});

			it("should return true with an empty stream if no values are given", () => {
				expect(Stream.of().intersects()).equal(true);
			});

			it("should return false with an empty stream if values are given", () => {
				expect(Stream.of().intersects(Stream.of(1))).equal(false);
				expect(Stream.of().intersects([1])).equal(false);
				expect(Stream.of().intersects(new Set([1]))).equal(false);
				expect(Stream.of().intersects([1][Symbol.iterator]())).equal(false);
			});

			it("should return false with an empty stream if the iterables being compared against are also empty", () => {
				expect(Stream.of().intersects(Stream.of())).equal(false);
				expect(Stream.of().intersects([])).equal(false);
				expect(Stream.of().intersects(new Set())).equal(false);
				expect(Stream.of().intersects([][Symbol.iterator]())).equal(false);
				expect(Stream.of().intersects(Stream.of(), [], [][Symbol.iterator](), new Set())).equal(false);
			});
		});

		describe("'count'", () => {
			it("should return the number of items in the stream", () => {
				expect(Stream.range(3).count()).equal(3);
				expect(Stream.range(5).count()).equal(5);
				expect(Stream.of().count()).equal(0);
			});

			it("should accept a predicate and only count the items that match the predicate", () => {
				expect(Stream.range(5).count(val => val % 2)).equal(2);
			});
		});

		describe("'length'", () => {
			it("should return the number of items in the stream", () => {
				expect(Stream.range(3).length()).equal(3);
				expect(Stream.range(5).length()).equal(5);
				expect(Stream.of().length()).equal(0);
			});
		});

		describe("'size'", () => {
			it("should return the number of items in the stream", () => {
				expect(Stream.range(3).size()).equal(3);
				expect(Stream.range(5).size()).equal(5);
				expect(Stream.of().size()).equal(0);
			});
		});

		describe("'at'", () => {
			it("should return the value at the given index", () => {
				expect(Stream.range(3).at(2)).equal(2);
				expect(Stream.range(3).at(1)).equal(1);
				expect(Stream.range(3).at(0)).equal(0);
			});

			it("should accept negative indices", () => {
				expect(Stream.range(3).at(-1)).equal(2);
				expect(Stream.range(3).at(-2)).equal(1);
				expect(Stream.range(3).at(-3)).equal(0);
			});

			it("should return undefined if the index doesn't exist", () => {
				expect(Stream.range(3).at(3)).equal(undefined);
				expect(Stream.range(3).at(-4)).equal(undefined);
			});

			it("should error if given a non-integer", () => {
				expect(() => Stream.range(3).at(0.1)).throw();
			});

			it("should allow providing an 'orElse' method for generating replacement values", () => {
				expect(Stream.range(3).at(0, () => 10)).equal(0);
				expect(Stream.range(3).at(2, () => 11)).equal(2);
				expect(Stream.range(3).at(5, () => 12)).equal(12);
				expect(Stream.range(3).at(-1, () => 13)).equal(2);
				expect(Stream.range(3).at(-3, () => 14)).equal(0);
				expect(Stream.range(3).at(-5, () => 15)).equal(15);
			});

			it("should not use the 'orElse' method when the value in the stream is 'undefined'", () => {
				expect(Stream.of(undefined, undefined, undefined).at(0, () => 10)).equal(undefined);
				expect(Stream.of(undefined, undefined, undefined).at(1, () => 10)).equal(undefined);
				expect(Stream.of(undefined, undefined, undefined).at(-2, () => 10)).equal(undefined);
			});
		});
	});
});