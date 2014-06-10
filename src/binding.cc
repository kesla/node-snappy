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
  template<class T> SnappyRequest<T>::SnappyRequest(_NAN_METHOD_ARGS) {
    NanScope();

    v8::Handle<v8::Object> object = args[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = std::string(data, length);
    callback = new NanCallback(v8::Local<v8::Function>::Cast(args[1]));
    err = NULL;
  }

const std::string SnappyErrors::kInvalidInput = "Invalid input";

// Base
// PROTECTED
inline void Base::CallCallback(const v8::Handle<v8::Function>& callback,
                                  const v8::Handle<v8::Value>& err,
                                  const v8::Handle<v8::Value>& res) {
  v8::Handle<v8::Value> argv[2] = {err, res};
  NanMakeCallback(NanGetCurrentContext()->Global(), callback, 2, argv);
}

inline void Base::CallErrCallback(const v8::Handle<v8::Function>& callback,
                                  const std::string& str) {
  v8::Handle<v8::Value> err =
    v8::Exception::Error(NanNew<v8::String>(str.data(), str.length()));
  v8::Handle<v8::Value> res = NanNull();
  CallCallback(callback, err, res);
}

// CompressUncompressBase
// PROTECTED
void CompressUncompressBase::After(uv_work_t *req) {
  NanScope();
  SnappyRequest<std::string>* snappy_req =
    static_cast<SnappyRequest<std::string>*>(req->data);
  if (snappy_req->err != NULL) {
    CallErrCallback(snappy_req->callback->GetFunction(), *snappy_req->err);
  } else {
    CallOkCallback(snappy_req->callback->GetFunction(), snappy_req->result);
  }

  uv_unref((uv_handle_t*) req);
  delete snappy_req->callback;
  delete snappy_req;
  delete req;
}

inline void
CompressUncompressBase::CallOkCallback(const v8::Handle<v8::Function>& callback,
                                       const std::string& str) {
  v8::Handle<v8::Value> err = NanNull();
  v8::Local<v8::Object> res = NanNewBufferHandle(str.length());
  memcpy(node::Buffer::Data(res), str.c_str(), str.length());
  CallCallback(callback, err, res);
}

// CompressBinding
// PUBLIC
NAN_METHOD(CompressBinding::Async) {
  NanScope();
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(args);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);
  NanReturnUndefined();
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
NAN_METHOD(UncompressBinding::Async) {
  NanScope();
  SnappyRequest<std::string>* snappy_req = new SnappyRequest<std::string>(args);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);
  NanReturnUndefined();
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
NAN_METHOD(IsValidCompressedBinding::Async) {
  NanScope();
  v8::String::Utf8Value data(args[0]->ToString());
  SnappyRequest<bool>* snappy_req = new SnappyRequest<bool>(args);
  uv_work_t* _req = new uv_work_t;
  _req->data = snappy_req;
  uv_queue_work(uv_default_loop(), _req, AsyncOperation, (uv_after_work_cb)After);
  NanReturnUndefined();
}

// PRIVATE
void IsValidCompressedBinding::After(uv_work_t *req) {
  NanScope();
  SnappyRequest<bool>* snappy_req =
    static_cast<SnappyRequest<bool>*>(req->data);
  CallOkCallback(snappy_req->callback->GetFunction(), snappy_req->result);
  uv_unref((uv_handle_t*) req);
  delete snappy_req->callback;
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
  v8::Handle<v8::Value> err = NanNull();
  v8::Local<v8::Value> res = NanNew<v8::Boolean>(data);
  CallCallback(callback, err, res);
}

extern "C" void
init(v8::Handle<v8::Object> exports) {
  NODE_SET_METHOD(exports, "compress", CompressBinding::Async);
  NODE_SET_METHOD(exports, "uncompress", UncompressBinding::Async);
  NODE_SET_METHOD(exports, "isValidCompressed", IsValidCompressedBinding::Async);
}

NODE_MODULE(binding, init)
}  // namespace nodesnappy
