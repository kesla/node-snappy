// Copyright (c) 2011 David Björklund
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

#ifndef __NODE_SNAPPY_BINDING_H__
#define __NODE_SNAPPY_BINDING_H__
#include <node.h>
#include <v8.h>
#include <string>

namespace nodesnappy {

// Base class for both compress and uncompress including shared methods
class CompressUncompressBase {
 protected:
  static int After(eio_req *req);
  static v8::Local<v8::Object> CreateBuffer(const std::string&);
};

// Bindings to the snappy::Compress-method. Includes both asynchronous
// and synchronous bindings
class CompressBinding : CompressUncompressBase {
 public:
  // Asynchronous binding
  static v8::Handle<v8::Value> Async(const v8::Arguments& args);
  // Synchronous binding
  static v8::Handle<v8::Value> Sync(const v8::Arguments& args);

 private:
  static int AsyncOperation(eio_req *req);
};

// Bindings to the snappy::Uncompress-method. Includes both asynchronous
// and synchronous bindings
class UncompressBinding : CompressUncompressBase {
 public:
  // Asynchronous binding
  static v8::Handle<v8::Value> Async(const v8::Arguments& args);
  // Synchronous binding
  static v8::Handle<v8::Value> Sync(const v8::Arguments& args);

 private:
  static int AsyncOperation(eio_req *req);
};

// Bindings to the snappy::IsValidCompressedBuffer-method. Includes both
// asynchronous and synchronous bindings
class IsValidCompressedBinding {
 public:
  // Asynchronous binding
  static v8::Handle<v8::Value> Async(const v8::Arguments& args);
  // Synchronous binding
  static v8::Handle<v8::Value> Sync(const v8::Arguments& args);

 private:
  static int After(eio_req *req);
  static int AsyncOperation(eio_req *req);
};

}  // namespace nodesnappy

#endif /* __NODE_SNAPPY_BINDING_H__ */
