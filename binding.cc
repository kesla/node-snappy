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


#include <string>

#include <node.h>
#include <node_buffer.h>
#include <snappy.h>
#include <v8.h>

namespace {
// Create a node-buffer, as described in
// http://sambro.is-super-awesome.com/2011/03/03/creating-a-proper-buffer-in-a-node-c-addon/
inline v8::Local<v8::Object> CreateBuffer(std::string str) {
  size_t length = str.length();
  char* ptr = &*str.begin();
  node::Buffer *slowBuffer = node::Buffer::New(ptr, length);
  v8::Local<v8::Object> obj = v8::Context::GetCurrent()->Global();
  v8::Local<v8::Function> bufferConstructor =
    v8::Local<v8::Function>::Cast(obj->Get(v8::String::New("Buffer")));
  v8::Handle<v8::Value> constructorArgs[3] =
    { slowBuffer->handle_, v8::Integer::New(length), v8::Integer::New(0) };
  return bufferConstructor->NewInstance(3, constructorArgs);
}

// Use snappy::Compress method, compress a buffer or a string and use callback
// with the response
v8::Handle<v8::Value> DoCompress(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Compress(*data, data.length(), &dst);
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = CreateBuffer(dst);
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
  return scope.Close(v8::Undefined());
}

// Use snappy::IsValidCompressedBuffer method and use callback with response.
// return true if a buffer or a string is valid compressed
v8::Handle<v8::Value> DoIsValidCompressed(const v8::Arguments& args) {
  v8::HandleScope scope;
  v8::String::Utf8Value data(args[0]->ToString());
  bool valid = snappy::IsValidCompressedBuffer(*data, data.length());
  v8::Local<v8::Function> callback = v8::Local<v8::Function>::Cast(args[1]);
  v8::Local<v8::Value> argv[2];
  argv[0] = v8::Local<v8::Value>::New(v8::Null());
  argv[1] = v8::Local<v8::Boolean>::New(v8::Boolean::New(valid));
  callback->Call(v8::Context::GetCurrent()->Global(), 2, argv);
  return scope.Close(v8::Undefined());
}

// Use snappy::Uncompress method, uncompress a buffer or a string and use
// callback with the response
v8::Handle<v8::Value> DoUncompress(const v8::Arguments& args) {
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

extern "C" void
init(v8::Handle<v8::Object> target) {
  v8::HandleScope scope;
  NODE_SET_METHOD(target, "compress", DoCompress);
  NODE_SET_METHOD(target, "uncompress", DoUncompress);
  NODE_SET_METHOD(target, "isValidCompressed", DoIsValidCompressed);
}
}  // namespace
