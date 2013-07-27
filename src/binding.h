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
#include "nan.h"

namespace nodesnappy {

/*
 * struct used in the async versions, used to store data.
 */
template<class T> struct SnappyRequest {
  SnappyRequest(_NAN_METHOD_ARGS);
  std::string input;
  T result;
  NanCallback *callback;
  const std::string* err;
};

/*
 * Error messages.
 */
struct SnappyErrors {
  static const std::string kInvalidInput;
};

/*
 * Base class for all bindings.
 */
class Base {
 protected:
  /*
   * Calls the specifed callback when something has gone wrong.
   * Converts the specifed string to an Error as first argument and use null as
   * the second argument.
   */
  static void CallErrCallback(const v8::Handle<v8::Function>&,
                              const std::string&);
  /*
   * Call the specifed callback with err and res as arguments.
   */
  static void CallCallback(const v8::Handle<v8::Function>&,
                           const v8::Handle<v8::Value>&,
                           const v8::Handle<v8::Value>&);
};

/*
 * Base class for both compress and uncompress including shared methods
 */
class CompressUncompressBase : protected Base {
 protected:
  /* Method run after the async operation */
  static void After(uv_work_t*);
  /*
   * Call the specifed callback when everything has gone well.
   * Use null as first argument and use the specifed string (converted to a
   * Buffer) as second argument.
   */
  static void CallOkCallback(const v8::Handle<v8::Function>&,
                             const std::string&);
};

/*
 * Bindings to the snappy::Compress-method. Includes both asynchronous
 * and synchronous bindings
 */
class CompressBinding : CompressUncompressBase {
 public:
  /* Asynchronous binding */
  static NAN_METHOD(Async);
  /* Synchronous binding */
  static NAN_METHOD(Sync);

 private:
  static void AsyncOperation(uv_work_t*);
};

/*
 * Bindings to the snappy::Uncompress-method. Includes both asynchronous
 * and synchronous bindings
 */
class UncompressBinding : CompressUncompressBase {
 public:
  /* Asynchronous binding */
  static NAN_METHOD(Async);
  /* Synchronous binding */
  static NAN_METHOD(Sync);

 private:
  static void AsyncOperation(uv_work_t*);
};

/*
 * Bindings to the snappy::IsValidCompressedBuffer-method. Includes both
 * asynchronous and synchronous bindings
 */
class IsValidCompressedBinding : protected Base {
 public:
  /* Asynchronous binding */
  static NAN_METHOD(Async);
  /* Synchronous binding */
  static NAN_METHOD(Sync);

 private:
  static void After(uv_work_t*);
  static void AsyncOperation(uv_work_t*);
  /*
   * Call the specifed callback when everything has gone well.
   * Use null as first argument and use the specifed bool (converted to a
   * Boolean) as second argument.
   */
  static void CallOkCallback(const v8::Handle<v8::Function>&, const bool);
};

}  // namespace nodesnappy

#endif /* __NODE_SNAPPY_BINDING_H__ */
