// Copyright 2011 David Björklund
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

// Wrapper around the snappy::compress method
// compresses a buffer or a string and returns a buffer
v8::Handle<v8::Value> CompressWrapper(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Compress(*data, data.length(), &dst);
  return scope.Close(CreateBuffer(dst));
}

// Wrapper around the snappy::uncompress method
// uncompresses a buffer or a string and returns a buffer
v8::Handle<v8::Value> UncompressWrapper(const v8::Arguments& args) {
  v8::HandleScope scope;
  std::string dst;
  v8::String::Utf8Value data(args[0]->ToString());
  snappy::Uncompress(*data, data.length(), &dst);
  return scope.Close(CreateBuffer(dst));
}

extern "C" void
init(v8::Handle<v8::Object> target) {
  v8::HandleScope scope;
  v8::Local<v8::Function> compress_fun =
    v8::FunctionTemplate::New(CompressWrapper)->GetFunction();
  v8::Local<v8::Function> uncompress_fun =
    v8::FunctionTemplate::New(UncompressWrapper)->GetFunction();

  target->Set(v8::String::New("compress"), compress_fun);
  target->Set(v8::String::New("uncompress"), uncompress_fun);
}
}  // namespace
