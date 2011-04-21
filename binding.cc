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

#include "./binding.h"

#include <node_buffer.h>
#include <snappy.h>

#include <string.h>  // memcpy

namespace nodesnappy {

const std::string SnappyErrors::kInvalidInput = "Invalid input";

// Base
// PROTECTED
inline void Base::CallCallback(const v8::Handle<v8::Function>& callback,
                                  const v8::Handle<v8::Value>& err,
                                  const v8::Handle<v8::Value>& res) {
  v8::Handle<v8::Value> argv[2] = {err, res};
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
}

inline void Base::CallErrCallback(const v8::Handle<v8::Function>& callback,
                                  const std::string& str) {
  v8::Handle<v8::Value> err =
    v8::Exception::Error(v8::String::New(str.data(), str.length()));
  v8::Handle<v8::Value> res = v8::Local<v8::Value>::New(v8::Null());
  CallCallback(callback, err, res);
}

// CompressUncompressBase
// PROTECTED
int CompressUncompressBase::After(eio_req *req) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_request =
    static_cast<SnappyRequest<std::string>*>(req->data);
  if (snappy_request->err != NULL) {
    CallErrCallback(snappy_request->callback, *snappy_request->err);
  } else {
    CallOkCallback(snappy_request->callback, snappy_request->result);
  }

  ev_unref(EV_DEFAULT_UC);
  snappy_request->callback.Dispose();
  delete snappy_request;
  return 0;
}

inline void
CompressUncompressBase::CallOkCallback(const v8::Handle<v8::Function>& callback,
                                       const std::string& str) {
  v8::Handle<v8::Value> err = v8::Local<v8::Value>::New(v8::Null());
  v8::Handle<v8::Value> res =
                   node::Buffer::New(v8::String::New(str.data(), str.length()));
  CallCallback(callback, err, res);
}

// CompressBinding
// PUBLIC
v8::Handle<v8::Value> CompressBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_request =
    new SnappyRequest<std::string>(args);
  eio_custom(AsyncOperation, EIO_PRI_DEFAULT, After, snappy_request);
  ev_ref(EV_DEFAULT_UC);
  return v8::Undefined();
}

v8::Handle<v8::Value> CompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  v8::String::Utf8Value data(args[0]->ToString());
  std::string dst;
  snappy::Compress(*data, data.length(), &dst);
  CallOkCallback(v8::Local<v8::Function>::Cast(args[1]), dst);
  return scope.Close(v8::Undefined());
}

// PRIVATE
int CompressBinding::AsyncOperation(eio_req *req) {
  SnappyRequest<std::string>* snappy_request =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_request->input;
  snappy::Compress(input->data(), input->length(), &dst);
  snappy_request->result = dst;
  return 0;
}

// UncompressBinding
// PUBLIC
v8::Handle<v8::Value> UncompressBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_request =
    new SnappyRequest<std::string>(args);
  eio_custom(AsyncOperation, EIO_PRI_DEFAULT, After, snappy_request);
  ev_ref(EV_DEFAULT_UC);
  return v8::Undefined();
}

v8::Handle<v8::Value> UncompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  bool ok = snappy::Uncompress(*data, data.length(), &dst);
  if (ok) {
    CallOkCallback(v8::Local<v8::Function>::Cast(args[1]), dst);
  } else {
    CallErrCallback(v8::Local<v8::Function>::Cast(args[1]),
                    SnappyErrors::kInvalidInput);
  }
  return scope.Close(v8::Undefined());
}

// PRIVATE
int UncompressBinding::AsyncOperation(eio_req *req) {
  SnappyRequest<std::string>* snappy_request =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_request->input;
  bool ok = snappy::Uncompress(input->data(), input->length(), &dst);
  if (ok) {
    snappy_request->result = dst;
  } else {
    snappy_request->err = &SnappyErrors::kInvalidInput;
  }
  return 0;
}

// IsValidCompressedBinding
// PUBLIC
v8::Handle<v8::Value>
IsValidCompressedBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  SnappyRequest<bool>* snappy_request = new SnappyRequest<bool>(args);
  eio_custom(AsyncOperation, EIO_PRI_DEFAULT, After, snappy_request);
  ev_ref(EV_DEFAULT_UC);
  return v8::Undefined();
}

v8::Handle<v8::Value>
IsValidCompressedBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  bool valid = snappy::IsValidCompressedBuffer(*data, data.length());
  CallOkCallback(v8::Local<v8::Function>::Cast(args[1]), valid);
  return scope.Close(v8::Undefined());
}

// PRIVATE
int IsValidCompressedBinding::After(eio_req *req) {
  v8::HandleScope scope;
  SnappyRequest<bool>* snappy_request =
    static_cast<SnappyRequest<bool>*>(req->data);
  CallOkCallback(snappy_request->callback, snappy_request->result);
  ev_unref(EV_DEFAULT_UC);
  snappy_request->callback.Dispose();
  delete snappy_request;
  return 0;
}

int IsValidCompressedBinding::AsyncOperation(eio_req *req) {
  SnappyRequest<bool>* snappy_request = (SnappyRequest<bool>*) req->data;
  std::string* input = &snappy_request->input;
  snappy_request->result =
    snappy::IsValidCompressedBuffer(input->data(), input->length());
  return 0;
}

inline void
IsValidCompressedBinding::CallOkCallback(
    const v8::Handle<v8::Function>& callback,
    const bool data) {
  v8::Handle<v8::Value> argv[2] = {v8::Local<v8::Value>::New(v8::Null()),
                             v8::Local<v8::Value>::New(v8::Boolean::New(data))};
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
}

extern "C" void
init(v8::Handle<v8::Object> target) {
  v8::HandleScope scope;
  NODE_SET_METHOD(target, "compress", CompressBinding::Async);
  NODE_SET_METHOD(target, "compressSync", CompressBinding::Sync);
  NODE_SET_METHOD(target, "uncompress", UncompressBinding::Async);
  NODE_SET_METHOD(target, "uncompressSync", UncompressBinding::Sync);
  NODE_SET_METHOD(target, "isValidCompressed", IsValidCompressedBinding::Async);
  NODE_SET_METHOD(target, "isValidCompressedSync",
    IsValidCompressedBinding::Sync);
}
}  // namespace nodesnappy
