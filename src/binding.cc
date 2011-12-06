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

#include <string>

namespace nodesnappy {
  template<class T> SnappyRequest<T>::SnappyRequest(const v8::Arguments& args){
    v8::Local<v8::Object> object = args[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = std::string(data, length);
    v8::Local<v8::Function> local = v8::Local<v8::Function>::Cast(args[1]);
    callback = v8::Persistent<v8::Function>::New(local);
    err = NULL;
  }

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
async_rtn CompressUncompressBase::After(uv_work_t *req) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  if (snappy_req->err != NULL) {
    CallErrCallback(snappy_req->callback, *snappy_req->err);
  } else {
    CallOkCallback(snappy_req->callback, snappy_req->result);
  }

  ev_unref(EV_DEFAULT_UC);
  snappy_req->callback.Dispose();
  delete snappy_req;
  RETURN_ASYNC_AFTER;
}

inline void
CompressUncompressBase::CallOkCallback(const v8::Handle<v8::Function>& callback,
                                       const std::string& str) {
  v8::Handle<v8::Value> err = v8::Local<v8::Value>::New(v8::Null());
  node::Buffer* res = node::Buffer::New(str.length());
  memcpy(node::Buffer::Data(res), str.c_str(), str.length());
  CallCallback(callback, err, res->handle_);
}

// CompressBinding
// PUBLIC
v8::Handle<v8::Value> CompressBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(args);
  BEGIN_ASYNC(snappy_req, AsyncOperation, After);
  return v8::Undefined();
}

v8::Handle<v8::Value> CompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  v8::Local<v8::Object> input = args[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  std::string dst;
  snappy::Compress(data, length, &dst);
  CallOkCallback(v8::Local<v8::Function>::Cast(args[1]), dst);
  return scope.Close(v8::Undefined());
}

// PRIVATE
async_rtn CompressBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_req->input;
  snappy::Compress(input->data(), input->length(), &dst);
  snappy_req->result = dst;
  RETURN_ASYNC;
}

// UncompressBinding
// PUBLIC
v8::Handle<v8::Value> UncompressBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(args);
  BEGIN_ASYNC(snappy_req, AsyncOperation, After);
  return v8::Undefined();
}

v8::Handle<v8::Value> UncompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::Local<v8::Object> input = args[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  v8::Handle<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  if (snappy::Uncompress(data, length, &dst)) {
    CallOkCallback(callback, dst);
  } else {
    CallErrCallback(callback, SnappyErrors::kInvalidInput);
  }
  return scope.Close(v8::Undefined());
}

// PRIVATE
async_rtn UncompressBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_req->input;
  if (snappy::Uncompress(input->data(), input->length(), &dst)) {
    snappy_req->result = dst;
  } else {
    snappy_req->err = &SnappyErrors::kInvalidInput;
  }
  RETURN_ASYNC;
}

// IsValidCompressedBinding
// PUBLIC
v8::Handle<v8::Value>
IsValidCompressedBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  SnappyRequest<bool>* snappy_req = new SnappyRequest<bool>(args);
  BEGIN_ASYNC(snappy_req, AsyncOperation, After);
  return v8::Undefined();
}

v8::Handle<v8::Value>
IsValidCompressedBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::Local<v8::Object> input = args[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  bool valid = snappy::IsValidCompressedBuffer(data, length);
  CallOkCallback(v8::Local<v8::Function>::Cast(args[1]), valid);
  return scope.Close(v8::Undefined());
}

// PRIVATE
async_rtn IsValidCompressedBinding::After(uv_work_t *req) {
  v8::HandleScope scope;
  SnappyRequest<bool>* snappy_req =
    static_cast<SnappyRequest<bool>*>(req->data);
  CallOkCallback(snappy_req->callback, snappy_req->result);
  ev_unref(EV_DEFAULT_UC);
  snappy_req->callback.Dispose();
  delete snappy_req;
  RETURN_ASYNC_AFTER;
}

async_rtn IsValidCompressedBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<bool>* snappy_req = (SnappyRequest<bool>*) req->data;
  std::string* input = &snappy_req->input;
  snappy_req->result =
    snappy::IsValidCompressedBuffer(input->data(), input->length());
  RETURN_ASYNC;
}

inline void
IsValidCompressedBinding::CallOkCallback(
    const v8::Handle<v8::Function>& callback,
    const bool data) {
  v8::Local<v8::Value> err = v8::Local<v8::Value>::New(v8::Null());
  v8::Local<v8::Value> res = v8::Local<v8::Value>::New(v8::Boolean::New(data));
  CallCallback(callback, err, res);
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
