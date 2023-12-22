/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the BSD-3 License. See License.txt in the project root for license information.
 */

/**
 * The Stack class represents a last-in-first-out (LIFO) stack of objects.
 */
export class Stack<T> {
    #data: T[] = [];

    /**
     * Tests if this stack is empty.
     *
     * @returns true if and only if this stack contains no items; false otherwise.
     */
    public empty(): boolean {
        return this.#data.length === 0;
    }

    /**
     * Looks at the object at the top of this stack without removing it from the stack.
     *
     * @returns the object at the top of this stack.
     */
    public peek(): T {
        if (this.empty()) {
            throw new Error("Stack is empty");
        }

        return this.#data[this.#data.length - 1];
    }

    /**
     * Removes the object at the top of this stack and returns that object as the value of this function.
     *
     * @returns The object at the top of this stack.
     */
    public pop(): T {
        if (this.empty()) {
            throw new Error("Stack is empty");
        }

        return this.#data.pop()!;
    }

    /**
     * Pushes an item onto the top of this stack.
     *
     * @param item - the item to be pushed onto this stack.
     *
     * @returns the item argument.
     */
    public push(item: T): T {
        this.#data.push(item);

        return item;
    }

    public size(): number {
        return this.#data.length;
    }
}
