/*
 * [The "BSD license"]
 *  Copyright (c) 2011 Terence Parr
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



import { java, JavaObject, type int } from "jree";

type Iterator<E> = java.util.Iterator<E>;
type Array = java.lang.reflect.Array;
const Array = java.lang.reflect.Array;
type NoSuchElementException = java.util.NoSuchElementException;
const NoSuchElementException = java.util.NoSuchElementException;
type UnsupportedOperationException = java.lang.UnsupportedOperationException;
const UnsupportedOperationException = java.lang.UnsupportedOperationException;



/** Iterator for an array so I don't have to copy the array to a {@link List}
 *  just to make it implement {@link Iterator}.
 */
export  class ArrayIterator extends JavaObject implements Iterator<java.lang.Object> {
    /** Index into the data array */
    protected  i = -1;
    protected  array = null;
    /** Arrays are fixed size; precompute. */
    protected  n:  int;

    public  constructor(array: java.lang.Object) {
        super();
this.array = array;
        this.n = Array.getLength(array);
    }

    @Override
public  hasNext():  boolean {
        return (this.i+1)<this.n && this.n>0;
    }

    @Override
public  next():  java.lang.Object {
        this.i++; // move to next element
        if ( this.i >= this.n ) {
            throw new  NoSuchElementException();
        }
        return Array.get(this.array, this.i);
    }

    @Override
public  remove():  void {
        throw new  UnsupportedOperationException();
    }
}
