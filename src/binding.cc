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
#include <node_version.h>
#include <snappy.h>

#include <string.h>  // memcpy

#include <string>

namespace nodesnappy {
    template<class S> template<class T> SnappyRequest<S>::SnappyRequest(const v8::FunctionCallbackInfo<T>& info) {
    v8::Isolate* isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    v8::Handle<v8::Object> object = info[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = std::string(data, length);
    v8::Local<v8::Function> local = v8::Local<v8::Function>::Cast(info[1]);

    callback.Reset(isolate, local);
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
void CompressUncompressBase::After(uv_work_t *req) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  if (snappy_req->err != NULL) {
    CallErrCallback(v8::Local<v8::Function>::New(isolate, snappy_req->callback), *snappy_req->err);
  } else {
    CallOkCallback(v8::Local<v8::Function>::New(isolate, snappy_req->callback), snappy_req->result);
  }

  uv_unref((uv_handle_t*) req);
  snappy_req->callback.Dispose();
  delete snappy_req;
  delete req;
}

inline void
CompressUncompressBase::CallOkCallback(const v8::Handle<v8::Function>& callback,
                                       const std::string& str) {
  v8::Handle<v8::Value> err = v8::Local<v8::Value>::New(v8::Null());
  #if NODE_VERSION_AT_LEAST(0, 11, 3)
    v8::Local<v8::Object> res = node::Buffer::New(str.length());
  #else
    node::Buffer* res = node::Buffer::New(str.length());
  #endif
  memcpy(node::Buffer::Data(res), str.c_str(), str.length());
  #if NODE_VERSION_AT_LEAST(0, 11, 3)
    CallCallback(callback, err, res);
  #else
    CallCallback(callback, err, res->handle_);
  #endif
}

// CompressBinding
// PUBLIC
template<class T> void CompressBinding::Async(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(info);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);

  info.GetReturnValue().Set(v8::Undefined());
}

template<class T> void CompressBinding::Sync(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  v8::Local<v8::Object> input = info[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  std::string dst;
  snappy::Compress(data, length, &dst);
  CallOkCallback(v8::Local<v8::Function>::Cast(info[1]), dst);
  info.GetReturnValue().Set(v8::Undefined());
}

// PRIVATE
void CompressBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_req->input;
  snappy::Compress(input->data(), input->length(), &dst);
  snappy_req->result = dst;
}

// UncompressBinding
// PUBLIC
template<class T> void UncompressBinding::Async(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(info);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);
  info.GetReturnValue().Set(v8::Undefined());
}

template<class T> void UncompressBinding::Sync(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  std::string dst;
  v8::Local<v8::Object> input = info[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  v8::Handle<v8::Function> callback = v8::Local<v8::Function>::Cast(info[1]);
  if (snappy::Uncompress(data, length, &dst)) {
    CallOkCallback(callback, dst);
  } else {
    CallErrCallback(callback, SnappyErrors::kInvalidInput);
  }
  info.GetReturnValue().Set(v8::Undefined());
}

// PRIVATE
void UncompressBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  std::string dst;
  std::string* input = &snappy_req->input;
  if (snappy::Uncompress(input->data(), input->length(), &dst)) {
    snappy_req->result = dst;
  } else {
    snappy_req->err = &SnappyErrors::kInvalidInput;
  }
}

// IsValidCompressedBinding
// PUBLIC
template<class T> void
IsValidCompressedBinding::Async(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  std::string dst;
  v8::String::Utf8Value data(info[0]->ToString());
  SnappyRequest<bool>* snappy_req = new SnappyRequest<bool>(info);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);
  info.GetReturnValue().Set(v8::Undefined());
}

template<class T> void
IsValidCompressedBinding::Sync(const v8::FunctionCallbackInfo<T>& info) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  std::string dst;
  v8::Local<v8::Object> input = info[0]->ToObject();
  size_t length = node::Buffer::Length(input);
  char *data = node::Buffer::Data(input);
  bool valid = snappy::IsValidCompressedBuffer(data, length);
  CallOkCallback(v8::Local<v8::Function>::Cast(info[1]), valid);
  info.GetReturnValue().Set(v8::Undefined());
}

// PRIVATE
void IsValidCompressedBinding::After(uv_work_t *req) {
  v8::Isolate *isolate = v8::Isolate::GetCurrent();
  v8::HandleScope scope(isolate);
  SnappyRequest<bool>* snappy_req =
    static_cast<SnappyRequest<bool>*>(req->data);
  CallOkCallback(v8::Local<v8::Function>::New(isolate, snappy_req->callback), snappy_req->result);
  uv_unref((uv_handle_t*) req);
  snappy_req->callback.Dispose();
  delete snappy_req;
  delete req;
}

void IsValidCompressedBinding::AsyncOperation(uv_work_t *req) {
  SnappyRequest<bool>* snappy_req = (SnappyRequest<bool>*) req->data;
  std::string* input = &snappy_req->input;
  snappy_req->result =
    snappy::IsValidCompressedBuffer(input->data(), input->length());
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
init(v8::Handle<v8::Object> exports) {
  exports->Set(v8::String::NewSymbol("compress"),
    v8::FunctionTemplate::New(CompressBinding::Async)->GetFunction());
  exports->Set(v8::String::NewSymbol("compressSync"),
    v8::FunctionTemplate::New(CompressBinding::Sync)->GetFunction());
  exports->Set(v8::String::NewSymbol("uncompress"),
    v8::FunctionTemplate::New(UncompressBinding::Async)->GetFunction());
  exports->Set(v8::String::NewSymbol("uncompressSync"),
    v8::FunctionTemplate::New(UncompressBinding::Sync)->GetFunction());
  exports->Set(v8::String::NewSymbol("isValidCompressed"),
    v8::FunctionTemplate::New(IsValidCompressedBinding::Async)->GetFunction());
  exports->Set(v8::String::NewSymbol("isValidCompressedSync"),
    v8::FunctionTemplate::New(IsValidCompressedBinding::Sync)->GetFunction());
}

NODE_MODULE(binding, init)
}  // namespace nodesnappy
