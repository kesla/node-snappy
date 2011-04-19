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
// Request used in the async versions, used to store the data
template<class T> struct SnappyRequest {
  std::string input;
  T result;
  v8::Persistent<v8::Function> callback;
};

// CompressUncompressBinding
// PROTECTED
int CompressUncompressBase::After(eio_req *req) {
  v8::HandleScope scope;
  SnappyRequest<std::string>* snappy_request =
    static_cast<SnappyRequest<std::string>*>(req->data);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = CreateBuffer(snappy_request->result);
  snappy_request->callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
  ev_unref(EV_DEFAULT_UC);
  snappy_request->callback.Dispose();
  delete snappy_request;
  return 0;
}

// Create a node-buffer, as described in
// http://sambro.is-super-awesome.com/2011/03/03/creating-a-proper-buffer-in-a-node-c-addon/
inline v8::Local<v8::Object>
CompressUncompressBase::CreateBuffer(const std::string& str) {
  size_t length = str.length();
  node::Buffer *slowBuffer = node::Buffer::New(length);
  memcpy(node::Buffer::Data(slowBuffer), str.data(), length);
  v8::Local<v8::Object> obj = v8::Context::GetCurrent()->Global();
  v8::Local<v8::Function> bufferConstructor =
    v8::Local<v8::Function>::Cast(obj->Get(v8::String::New("Buffer")));
  v8::Handle<v8::Value> constructorArgs[3] =
    { slowBuffer->handle_, v8::Integer::New(length), v8::Integer::New(0) };
  return bufferConstructor->NewInstance(3, constructorArgs);
}

// CompressBinding
// PUBLIC
v8::Handle<v8::Value> CompressBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  SnappyRequest<std::string>* snappy_request = new SnappyRequest<std::string>();
  v8::String::Utf8Value data(args[0]->ToString());
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  snappy_request->callback = v8::Persistent<v8::Function>::New(callback);
  snappy_request->input = std::string(*data, data.length());
  eio_custom(AsyncOperation, EIO_PRI_DEFAULT, After, snappy_request);
  ev_ref(EV_DEFAULT_UC);
  return v8::Undefined();
}

v8::Handle<v8::Value> CompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  v8::String::Utf8Value data(args[0]->ToString());
  std::string dst;
  snappy::Compress(*data, data.length(), &dst);
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = CreateBuffer(dst);
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
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
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  SnappyRequest<std::string>* snappy_request = new SnappyRequest<std::string>();
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  snappy_request->callback = v8::Persistent<v8::Function>::New(callback);
  snappy_request->input = std::string(*data, data.length());
  eio_custom(AsyncOperation, EIO_PRI_DEFAULT, After, snappy_request);
  ev_ref(EV_DEFAULT_UC);
  return v8::Undefined();
}

v8::Handle<v8::Value> UncompressBinding::Sync(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Uncompress(*data, data.length(), &dst);
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = CreateBuffer(dst);
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
  return scope.Close(v8::Undefined());
}

// PRIVATE
int UncompressBinding::AsyncOperation(eio_req *req) {
  SnappyRequest<std::string>* snappy_request =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_request->input;
  snappy::Uncompress(input->data(), input->length(), &dst);
  snappy_request->result = dst;
  return 0;
}

// IsValidCompressedBinding
// PUBLIC
v8::Handle<v8::Value>
IsValidCompressedBinding::Async(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  SnappyRequest<bool>* snappy_request = new SnappyRequest<bool>();
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  snappy_request->callback = v8::Persistent<v8::Function>::New(callback);
  snappy_request->input = std::string(*data, data.length());
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
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = v8::Local<v8::Value>::New(v8::Boolean::New(valid));
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
  return scope.Close(v8::Undefined());
}

// PRIVATE
int IsValidCompressedBinding::After(eio_req *req) {
  v8::HandleScope scope;
  SnappyRequest<bool>* snappy_request =
    static_cast<SnappyRequest<bool>*>(req->data);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = v8::Local<v8::Value>::New(v8::Boolean::New(snappy_request->result));
  snappy_request->callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
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
