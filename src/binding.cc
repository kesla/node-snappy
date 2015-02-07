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

class CompressWorker : public NanAsyncWorker {
  public:
    CompressWorker(std::string* input, NanCallback *callback)
      : NanAsyncWorker(callback), input(input) {}

    ~CompressWorker() {
      delete input;
    }

    void Execute() {
      snappy::Compress(input->data(), input->length(), &dst);
    }

    void HandleOKCallback() {
      NanScope();

      v8::Local<v8::Object> res = NanNewBufferHandle(dst.length());
      memcpy(node::Buffer::Data(res), dst.c_str(), dst.length());

      v8::Local<v8::Value> argv[] = {
          NanNull()
        , res
      };

      callback->Call(2, argv);
    }

  private:
    std::string* input;
    std::string dst;
};

class IsValidCompressedWorker : public NanAsyncWorker {
  public: IsValidCompressedWorker(std::string* input, NanCallback * callback)
    : NanAsyncWorker(callback), input(input) {}

  ~IsValidCompressedWorker() {
    delete input;
  }

  void Execute() {
    res = snappy::IsValidCompressedBuffer(input->data(), input->length());
  }

  void HandleOKCallback() {
    NanScope();

    v8::Local<v8::Value> argv[] = {
        NanNull()
      , res ? NanTrue() : NanFalse()
    };

    callback->Call(2, argv);
  }

  private:
    std::string* input;
    bool res;
};

class UncompressWorker : public NanAsyncWorker {
  public:
    UncompressWorker(std::string* input, bool asBuffer, NanCallback *callback)
      : NanAsyncWorker(callback), input(input), asBuffer(asBuffer) {}

    ~UncompressWorker() {
      delete input;
    }

    void Execute() {
      if (!snappy::Uncompress(input->data(), input->length(), &dst))
        SetErrorMessage("Invalid input");
    }

    void HandleOKCallback() {
      NanScope();

      v8::Local<v8::Value> res;
      if (asBuffer) {
        res = NanNewBufferHandle(dst.length());
        memcpy(node::Buffer::Data(res.As<v8::Object>()), dst.c_str(), dst.length());
      } else {
        res = NanNew<v8::String>(dst.c_str(), dst.length());
      }

      v8::Local<v8::Value> argv[] = {
          NanNull()
        , res
      };

      callback->Call(2, argv);
    }

  private:
    std::string* input;
    std::string dst;
    bool asBuffer;
};

NAN_METHOD(Compress) {
  NanScope();

  std::string *input;

  if (node::Buffer::HasInstance(args[0]->ToObject())) {
    v8::Handle<v8::Object> object = args[0]->ToObject();
    size_t length = node::Buffer::Length(object);
    const char *data = node::Buffer::Data(object);
    input = new std::string(data, length);
  } else {
    v8::String::Utf8Value param1(args[0]->ToString());
    input = new std::string(*param1);
  }

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[1])
  );

  CompressWorker* worker = new CompressWorker(
      input, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(IsValidCompressed) {
  NanScope();

  v8::Handle<v8::Object> object = args[0]->ToObject();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[1])
  );

  IsValidCompressedWorker* worker = new IsValidCompressedWorker(
      input, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

NAN_METHOD(Uncompress) {
  NanScope();

  v8::Handle<v8::Object> object = args[0].As<v8::Object>();
  v8::Local<v8::Object> optionsObj = args[1].As<v8::Object>();
  size_t length = node::Buffer::Length(object);
  const char *data = node::Buffer::Data(object);
  std::string *input = new std::string(data, length);
  bool asBuffer = NanBooleanOptionValue(optionsObj, NanNew("asBuffer"));

  NanCallback* callback = new NanCallback(
    v8::Local<v8::Function>::Cast(args[2])
  );

  UncompressWorker* worker = new UncompressWorker(
      input, asBuffer, callback
  );

  NanAsyncQueueWorker(worker);

  NanReturnUndefined();
}

extern "C" void
init(v8::Handle<v8::Object> exports) {
  NODE_SET_METHOD(exports, "compress", Compress);
  NODE_SET_METHOD(exports, "isValidCompressed", IsValidCompressed);
  NODE_SET_METHOD(exports, "uncompress", Uncompress);
}

NODE_MODULE(binding, init)
}  // namespace nodesnappy
